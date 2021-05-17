// Released under MIT license
// Copyright (c) 2009-2010 Dominic Baggott
// Copyright (c) 2009-2010 Ash Berlin
// Copyright (c) 2011 Christoph Dorn <christoph@christophdorn.com> (http://www.christophdorn.com)

// /*jshint browser:true, devel:true */

function markdownFactory (expose) {
/**
 *  class Markdown
 *
 *  Markdown processing in Javascript done right. We have very particular views
 *  on what constitutes 'right' which include:
 *
 *  - produces well-formed HTML (this means that em and strong nesting is
 *    important)
 *
 *  - has an intermediate representation to allow processing of parsed data (We
 *    in fact have two, both as [JsonML]: a markdown tree and an HTML tree).
 *
 *  - is easily extensible to add new dialects without having to rewrite the
 *    entire parsing mechanics
 *
 *  - has a good test suite
 *
 *  This implementation fulfills all of these (except that the test suite could
 *  do with expanding to automatically run all the fixtures from other Markdown
 *  implementations.)
 *
 *  ##### Intermediate Representation
 *
 *  *TODO* Talk about this :) Its JsonML, but document the node names we use.
 *
 *  [JsonML]: http://jsonml.org/ "JSON Markup Language"
 **/
  var Markdown = expose.Markdown = function (dialect) {
    switch (typeof dialect) {
      case 'undefined':
        this.dialect = Markdown.dialects.Gruber
        break
      case 'object':
        this.dialect = dialect
        break
      default:
        if (dialect in Markdown.dialects) {
          this.dialect = Markdown.dialects[dialect]
        } else {
          throw new Error("Unknown Markdown dialect '" + String(dialect) + "'")
        }
        break
    }
    this.em_state = []
    this.strong_state = []
    this.debug_indent = ''
  }

  /**
   *  parse( markdown, [dialect] ) -> JsonML
   *  - markdown (String): markdown string to parse
   *  - dialect (String | Dialect): the dialect to use, defaults to gruber
   *
   *  Parse `markdown` and return a markdown document as a Markdown.JsonML tree.
   **/
  expose.parse = function (source, dialect) {
    // dialect will default if undefined
    var md = new Markdown(dialect)
    return md.toTree(source)
  }

  /**
   *  toHTML( markdown, [dialect]  ) -> String
   *  toHTML( md_tree ) -> String
   *  - markdown (String): markdown string to parse
   *  - md_tree (Markdown.JsonML): parsed markdown tree
   *
   *  Take markdown (either as a string or as a JsonML tree) and run it through
   *  [[toHTMLTree]] then turn it into a well-formated HTML fragment.
   **/
  expose.toHTML = function toHTML (source, dialect, options) {
    var input = expose.toHTMLTree(source, dialect, options)

    return expose.renderJsonML(input)
  }

  /**
   *  toHTMLTree( markdown, [dialect] ) -> JsonML
   *  toHTMLTree( md_tree ) -> JsonML
   *  - markdown (String): markdown string to parse
   *  - dialect (String | Dialect): the dialect to use, defaults to gruber
   *  - md_tree (Markdown.JsonML): parsed markdown tree
   *
   *  Turn markdown into HTML, represented as a JsonML tree. If a string is given
   *  to this function, it is first parsed into a markdown tree by calling
   *  [[parse]].
   **/
  expose.toHTMLTree = function toHTMLTree (input, dialect, options) {
    // convert string input to an MD tree
    if (typeof input === 'string') input = this.parse(input, dialect)

    // Now convert the MD tree to an HTML tree

    // remove references from the tree
    var attrs = extractAttr(input)
    var refs = {}

    if (attrs && attrs.references) {
      refs = attrs.references
    }

    var html = convertTreeToHtml(input, refs, options)
    mergeTextNodes(html)
    return html
  }

  // For Spidermonkey based engines

  function mkBlockToSource () {
    return 'Markdown.mkBlock( ' + // eslint-disable-next-line no-undef
            uneval(this.toString()) +
            ', ' + // eslint-disable-next-line no-undef
            uneval(this.trailing) +
            ', ' + // eslint-disable-next-line no-undef
            uneval(this.lineNumber) +
            ' )'
  }

  // node
  function mkBlockInspect () {
    var util = require('util')
    return 'Markdown.mkBlock( ' +
            util.inspect(this.toString()) +
            ', ' +
            util.inspect(this.trailing) +
            ', ' +
            util.inspect(this.lineNumber) +
            ' )'
  }

  var mkBlock = Markdown.mkBlock = function (block, trail, line) {
    // Be helpful for default case in tests.
    if (arguments.length === 1) trail = '\n\n'

    // eslint-disable-next-line no-new-wrappers
    var s = new String(block)
    s.trailing = trail
    // To make it clear its not just a string
    s.inspect = mkBlockInspect
    s.toSource = mkBlockToSource

    if (line !== undefined) s.lineNumber = line
    return s
  }

  function countLines (str) {
    var n = 0
    var i = -1
    while ((i = str.indexOf('\n', i + 1)) !== -1) n++
    return n
  }

  // Internal - split source into rough blocks
  Markdown.prototype.split_blocks = function splitBlocks (input, startLine) {
    input = input.replace(/(\r\n|\n|\r)/g, '\n')
    // [\s\S] matches _anything_ (newline or space)
    // [^] is equivalent but doesn't work in IEs.
    var re = /([\s\S]+?)($|\n#|\n(?:\s*\n|$)+)/g
    var blocks = []
    var m

    var lineNo = 1

    if ((m = /^(\s*\n)/.exec(input)) != null) {
      // skip (but count) leading blank lines
      lineNo += countLines(m[0])
      re.lastIndex = m[0].length
    }

    while ((m = re.exec(input)) !== null) {
      if (m[2] === '\n#') {
        m[2] = '\n'
        re.lastIndex--
      }
      blocks.push(mkBlock(m[1], m[2], lineNo))
      lineNo += countLines(m[0])
    }

    return blocks
  }

  /**
   *  Markdown#processBlock( block, next ) -> undefined | [ JsonML, ... ]
   *  - block (String): the block to process
   *  - next (Array): the following blocks
   *
   * Process `block` and return an array of JsonML nodes representing `block`.
   *
   * It does this by asking each block level function in the dialect to process
   * the block until one can. Succesful handling is indicated by returning an
   * array (with zero or more JsonML nodes), failure by a false value.
   *
   * Blocks handlers are responsible for calling [[Markdown#processInline]]
   * themselves as appropriate.
   *
   * If the blocks were split incorrectly or adjacent blocks need collapsing you
   * can adjust `next` in place using shift/splice etc.
   *
   * If any of this default behaviour is not right for the dialect, you can
   * define a `__call__` method on the dialect that will get invoked to handle
   * the block processing.
   */
  Markdown.prototype.processBlock = function processBlock (block, next) {
    var cbs = this.dialect.block
    var ord = cbs.__order__

    if ('__call__' in cbs) {
      return cbs.__call__.call(this, block, next)
    }

    for (var i = 0; i < ord.length; i++) {
      // D:this.debug( 'Testing', ord[i] );
      var res = cbs[ ord[i] ].call(this, block, next)
      if (res) {
        // D:this.debug("  matched");
        if (!isArray(res) || (res.length > 0 && !(isArray(res[0])))) this.debug(ord[i], "didn't return a proper array")
        // D:this.debug( "" );
        return res
      }
    }

    // Uhoh! no match! Should we throw an error?
    return []
  }

  Markdown.prototype.processInline = function processInline (block) {
    return this.dialect.inline.__call__.call(this, String(block))
  }

  /**
   *  Markdown#toTree( source ) -> JsonML
   *  - source (String): markdown source to parse
   *
   *  Parse `source` into a JsonML tree representing the markdown document.
   **/
  // custom_tree means set this.tree to `custom_tree` and restore old value on return
  Markdown.prototype.toTree = function toTree (source, customRoot) {
    var blocks = source instanceof Array ? source : this.split_blocks(source)

    // Make tree a member variable so its easier to mess with in extensions
    var oldTree = this.tree
    try {
      this.tree = customRoot || this.tree || [ 'markdown' ]

      // eslint-disable-next-line no-label-var,no-labels
      blocks:
      while (blocks.length) {
        var b = this.processBlock(blocks.shift(), blocks)

        // Reference blocks and the like won't return any content
        // eslint-disable-next-line no-labels
        if (!b.length) continue blocks

        this.tree.push.apply(this.tree, b)
      }
      return this.tree
    } finally {
      // eslint-disable-next-line camelcase
      if (customRoot) {
        this.tree = oldTree
      }
    }
  }

  // Noop by default
  Markdown.prototype.debug = function () {
    var args = Array.prototype.slice.call(arguments)
    args.unshift(this.debug_indent)
    if (typeof print !== 'undefined') print.apply(print, args)
    if (typeof console !== 'undefined' && typeof console.log !== 'undefined') console.log.apply(null, args)
  }

  Markdown.prototype.loop_re_over_block = function (re, block, cb) {
    // Dont use /g regexps with this
    var m
    var b = block.valueOf()

    while (b.length && (m = re.exec(b)) != null) {
      b = b.substr(m[0].length)
      cb.call(this, m)
    }
    return b
  }

  /**
   * Markdown.dialects
   *
   * Namespace of built-in dialects.
   **/
  Markdown.dialects = {}

  /**
   * Markdown.dialects.Gruber
   *
   * The default dialect that follows the rules set out by John Gruber's
   * markdown.pl as closely as possible. Well actually we follow the behaviour of
   * that script which in some places is not exactly what the syntax web page
   * says.
   **/
  Markdown.dialects.Gruber = {
    block: {
      atxHeader: function atxHeader (block, next) {
        var m = block.match(/^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/)

        if (!m) return undefined

        var header = [ 'header', { level: m[ 1 ].length } ]
        Array.prototype.push.apply(header, this.processInline(m[ 2 ]))

        if (m[0].length < block.length) next.unshift(mkBlock(block.substr(m[0].length), block.trailing, block.lineNumber + 2))

        return [ header ]
      },

      setextHeader: function setextHeader (block, next) {
        var m = block.match(/^(.*)\n([-=])\2\2+(?:\n|$)/)

        if (!m) return undefined

        var level = (m[2] === '=') ? 1 : 2
        var header = [ 'header', { level: level }, m[ 1 ] ]

        if (m[0].length < block.length) next.unshift(mkBlock(block.substr(m[0].length), block.trailing, block.lineNumber + 2))

        return [header]
      },

      code: function code (block, next) {
        // |    Foo
        // |bar
        // should be a code block followed by a paragraph. Fun
        //
        // There might also be adjacent code block to merge.

        // eslint-disable-next-line one-var
        var ret = [], re = /^(?: {0,3}\t| {4})(.*)\n?/
        // eslint-disable-next-line no-unused-vars
        var lines

        // 4 spaces + content
        if (!block.match(re)) return undefined
        // eslint-disable-next-line no-labels
        blockSearch:
        do {
          // Now pull out the rest of the lines
          var b = this.loop_re_over_block(
            re, block.valueOf(), function (m) { ret.push(m[1]) })

          if (b.length) {
            // Case alluded to in first comment. push it back on as a new block
            next.unshift(mkBlock(b, block.trailing))
            // eslint-disable-next-line no-labels
            break blockSearch
          } else if (next.length) {
            // Check the next block - it might be code too
            // eslint-disable-next-line no-labels
            if (!next[0].match(re)) break blockSearch

            // Pull how how many blanks lines follow - minus two to account for .join
            ret.push(block.trailing.replace(/[^\n]/g, '').substring(2))

            block = next.shift()
          } else {
            // eslint-disable-next-line no-labels
            break blockSearch
          }
        } while (true)

        return [['code_block', ret.join('\n')]]
      },

      horizRule: function horizRule (block, next) {
        // this needs to find any hr in the block to handle abutting blocks
        var m = block.match(/^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/)

        if (!m) {
          return undefined
        }

        var jsonml = [ [ 'hr' ] ]

        // if there's a leading abutting block, process it
        if (m[ 1 ]) {
          jsonml.unshift.apply(jsonml, this.processBlock(m[ 1 ], []))
        }

        // if there's a trailing abutting block, stick it into next
        if (m[ 3 ]) {
          next.unshift(mkBlock(m[ 3 ]))
        }
        return jsonml
      },

      // There are two types of lists. Tight and loose. Tight lists have no whitespace
      // between the items (and result in text just in the <li>) and loose lists,
      // which have an empty line between list items, resulting in (one or more)
      // paragraphs inside the <li>.
      //
      // There are all sorts weird edge cases about the original markdown.pl's
      // handling of lists:
      //
      // * Nested lists are supposed to be indented by four chars per level. But
      //   if they aren't, you can get a nested list by indenting by less than
      //   four so long as the indent doesn't match an indent of an existing list
      //   item in the 'nest stack'.
      //
      // * The type of the list (bullet or number) is controlled just by the
      //    first item at the indent. Subsequent changes are ignored unless they
      //    are for nested lists
      //
      lists: (function () {
        // Use a closure to hide a few variables.
        var anyList = '[*+-]|\\d+\\.'
        var bulletList = /[*+-]/
        // var numberList = /\d+\./
        // Capture leading indent as it matters for determining nested lists.
        var isListRe = new RegExp('^( {0,3})(' + anyList + ')[ \t]+')
        var indentRe = '(?: {0,3}\\t| {4})'

        // TODO: Cache this regexp for certain depths.
        // Create a regexp suitable for matching an li for a given stack depth
        function regexForDepth (depth) {
          return new RegExp(
            // m[1] = indent, m[2] = list_type
            '(?:^(' + indentRe + '{0,' + depth + '} {0,3})(' + anyList + ')\\s+)|' +
            // m[3] = cont
            '(^' + indentRe + '{0,' + (depth - 1) + '}[ ]{0,4})'
          )
        }
        function expandTab (input) {
          return input.replace(/ {0,3}\t/g, '    ')
        }

        // Add inline content `inline` to `li`. inline comes from processInline
        // so is an array of content
        function add (li, loose, inline, nl) {
          if (loose) {
            li.push([ 'para' ].concat(inline))
            return
          }
          // Hmmm, should this be any block level element or just paras?
          var addTo = li[li.length - 1] instanceof Array && li[li.length - 1][0] === 'para' ? li[li.length - 1] : li

          // If there is already some content in this list, add the new line in
          if (nl && li.length > 1) inline.unshift(nl)

          for (var i = 0; i < inline.length; i++) {
            var what = inline[i]
            var isStr = typeof what === 'string'
            if (isStr && addTo.length > 1 && typeof addTo[addTo.length - 1] === 'string') {
              addTo[ addTo.length - 1 ] += what
            } else {
              addTo.push(what)
            }
          }
        }

        // contained means have an indent greater than the current one. On
        // *every* line in the block
        function getContainedBlocks (depth, blocks) {
          var re = new RegExp('^(' + indentRe + '{' + depth + '}.*?\\n?)*$')
          var replace = new RegExp('^' + indentRe + '{' + depth + '}', 'gm')
          var ret = []

          while (blocks.length > 0) {
            if (re.exec(blocks[0])) {
              var b = blocks.shift()
              // Now remove that indent
              var x = b.replace(replace, '')

              ret.push(mkBlock(x, b.trailing, b.lineNumber))
            } else {
              break
            }
          }
          return ret
        }

        // passed to stack.forEach to turn list items up the stack into paras
        function paragraphify (s, i, stack) {
          var list = s.list
          var lastLi = list[list.length - 1]

          if (lastLi[1] instanceof Array && lastLi[1][0] === 'para') {
            return
          }
          if (i + 1 === stack.length) {
            // Last stack frame
            // Keep the same array, but replace the contents
            lastLi.push(['para'].concat(lastLi.splice(1, lastLi.length - 1)))
          } else {
            var sublist = lastLi.pop()
            lastLi.push(['para'].concat(lastLi.splice(1, lastLi.length - 1)), sublist)
          }
        }

        // The matcher function
        return function (block, next) {
          var m = block.match(isListRe)
          if (!m) return undefined

          function makeList (m) {
            var list = bulletList.exec(m[2])
              ? ['bulletlist']
              : ['numberlist']

            stack.push({ list: list, indent: m[1] })
            return list
          }

          var stack = [] // Stack of lists for nesting.
          var list = makeList(m)
          var lastLi
          var loose = false
          var ret = [ stack[0].list ]
          var i

          // Loop to search over block looking for inner block elements and loose lists
          // eslint-disable-next-line no-labels
          looseSearch:
          while (true) {
            // Split into lines preserving new lines at end of line
            var lines = block.split(/(?=\n)/)

            // We have to grab all lines for a li and call processInline on them
            // once as there are some inline things that can span lines.
            var liAccumulate = ''

            // Loop over the lines in this block looking for tight lists.
            // eslint-disable-next-line no-labels
            tightSearch:
            for (var lineNo = 0; lineNo < lines.length; lineNo++) {
              var nl = ''
              var l = lines[lineNo].replace(/^\n/, function (n) { nl = n; return '' })

              // TODO: really should cache this
              var lineRe = regexForDepth(stack.length)

              m = l.match(lineRe)
              // print( "line:", uneval(l), "\nline match:", uneval(m) );

              // We have a list item
              if (m[1] !== undefined) {
                // Process the previous list item, if any
                if (liAccumulate.length) {
                  add(lastLi, loose, this.processInline(liAccumulate), nl)
                  // Loose mode will have been dealt with. Reset it
                  loose = false
                  liAccumulate = ''
                }

                m[1] = expandTab(m[1])
                var wantedDepth = Math.floor(m[1].length / 4) + 1
                // print( "want:", wantedDepth, "stack:", stack.length);
                if (wantedDepth > stack.length) {
                  // Deep enough for a nested list outright
                  // print ( "new nested list" );
                  list = makeList(m)
                  lastLi.push(list)
                  lastLi = list[1] = [ 'listitem' ]
                } else {
                  // We aren't deep enough to be strictly a new level. This is
                  // where Md.pl goes nuts. If the indent matches a level in the
                  // stack, put it there, else put it one deeper then the
                  // wantedDepth deserves.
                  var found = false
                  for (i = 0; i < stack.length; i++) {
                    if (stack[ i ].indent !== m[1]) continue
                    list = stack[ i ].list
                    stack.splice(i + 1, stack.length - (i + 1))
                    found = true
                    break
                  }

                  if (!found) {
                    // print("not found. l:", uneval(l));
                    wantedDepth++
                    if (wantedDepth <= stack.length) {
                      stack.splice(wantedDepth, stack.length - wantedDepth)
                      // print("Desired depth now", wantedDepth, "stack:", stack.length);
                      list = stack[wantedDepth - 1].list
                      // print("list:", uneval(list) );
                    } else {
                      // print ("made new stack for messy indent");
                      list = makeList(m)
                      lastLi.push(list)
                    }
                  }

                  // print( uneval(list), "last", list === stack[stack.length-1].list );
                  lastLi = [ 'listitem' ]
                  list.push(lastLi)
                } // end depth of shenegains
                nl = ''
              }

              // Add content
              if (l.length > m[0].length) {
                liAccumulate += nl + l.substr(m[0].length)
              }
            } // tightSearch

            if (liAccumulate.length) {
              add(lastLi, loose, this.processInline(liAccumulate), nl)
              // Loose mode will have been dealt with. Reset it
              loose = false
              liAccumulate = ''
            }

            // Look at the next block - we might have a loose list. Or an extra
            // paragraph for the current li
            var contained = getContainedBlocks(stack.length, next)

            // Deal with code blocks or properly nested lists
            if (contained.length > 0) {
              // Make sure all listitems up the stack are paragraphs
              forEach(stack, paragraphify, this)

              lastLi.push.apply(lastLi, this.toTree(contained, []))
            }

            // eslint-disable-next-line no-mixed-operators
            var nextBlock = next[0] && next[0].valueOf() || ''

            if (nextBlock.match(isListRe) || nextBlock.match(/^ /)) {
              block = next.shift()

              // Check for an HR following a list: features/lists/hr_abutting
              var hr = this.dialect.block.horizRule(block, next)

              if (hr) {
                ret.push.apply(ret, hr)
                break
              }

              // Make sure all listitems up the stack are paragraphs
              forEach(stack, paragraphify, this)

              loose = true
              // eslint-disable-next-line no-labels
              continue looseSearch
            }
            break
          } // looseSearch

          return ret
        }
      })(),

      blockquote: function blockquote (block, next) {
        if (!block.match(/^>/m)) { return undefined }

        var jsonml = []

        // separate out the leading abutting block, if any. I.e. in this case:
        //
        //  a
        //  > b
        //
        if (block[ 0 ] !== '>') {
          var lines = block.split(/\n/)
          var prev = []
          var lineNo = block.lineNumber

          // keep shifting lines until you find a crotchet
          while (lines.length && lines[ 0 ][ 0 ] !== '>') {
            prev.push(lines.shift())
            lineNo++
          }

          var abutting = mkBlock(prev.join('\n'), '\n', block.lineNumber)
          jsonml.push.apply(jsonml, this.processBlock(abutting, []))
          // reassemble new block of just block quotes!
          block = mkBlock(lines.join('\n'), block.trailing, lineNo)
        }

        // if the next block is also a blockquote merge it in
        while (next.length && next[ 0 ][ 0 ] === '>') {
          var b = next.shift()
          block = mkBlock(block + block.trailing + b, b.trailing, block.lineNumber)
        }

        // Strip off the leading "> " and re-process as a block.
        var input = block.replace(/^> ?/gm, '')
        // var oldTree = this.tree
        var processedBlock = this.toTree(input, [ 'blockquote' ])
        var attr = extractAttr(processedBlock)

        // If any link references were found get rid of them
        if (attr && attr.references) {
          delete attr.references
          // And then remove the attribute object if it's empty
          if (isEmpty(attr)) {
            processedBlock.splice(1, 1)
          }
        }

        jsonml.push(processedBlock)
        return jsonml
      },

      referenceDefn: function referenceDefn (block, next) {
        var re = /^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*?)\3|\((.*?)\)))?\n?/
        // interesting matches are [ , ref_id, url, , title, title ]

        if (!block.match(re)) { return undefined }

        // make an attribute node if it doesn't exist
        if (!extractAttr(this.tree)) {
          this.tree.splice(1, 0, {})
        }

        var attrs = extractAttr(this.tree)

        // make a references hash if it doesn't exist
        if (attrs.references === undefined) {
          attrs.references = {}
        }

        var b = this.loop_re_over_block(re, block, function (m) {
          if (m[2] && m[2][0] === '<' && m[2][m[2].length - 1] === '>') { m[2] = m[2].substring(1, m[2].length - 1) }

          var ref = attrs.references[ m[1].toLowerCase() ] = {
            href: m[2]
          }

          if (m[4] !== undefined) { ref.title = m[4] } else if (m[5] !== undefined) { ref.title = m[5] }
        })

        if (b.length) { next.unshift(mkBlock(b, block.trailing)) }

        return []
      },

      para: function para (block, next) {
        // everything's a para!
        return [ ['para'].concat(this.processInline(block)) ]
      }
    }
  }

  Markdown.dialects.Gruber.inline = {

    __oneElement__: function oneElement (text, patternsOrRe, previousNodes) {
      var m
      var res
      // var lastIndex = 0

      patternsOrRe = patternsOrRe || this.dialect.inline.__patterns__
      var re = new RegExp('([\\s\\S]*?)(' + (patternsOrRe.source || patternsOrRe) + ')')

      m = re.exec(text)
      if (!m) {
        // Just boring text
        return [ text.length, text ]
      } else if (m[1]) {
        // Some un-interesting text matched. Return that first
        return [ m[1].length, m[1] ]
      }

      // eslint-disable-next-line no-redeclare
      var res
      if (m[2] in this.dialect.inline) {
        res = this.dialect.inline[ m[2] ].call(
          this,
          text.substr(m.index), m, previousNodes || [])
      }
      // Default for now to make dev easier. just slurp special and output it.
      res = res || [ m[2].length, m[2] ]
      return res
    },

    __call__: function inline (text, patterns) {
      var out = []
      var res

      function add (x) {
        // D:self.debug("  adding output", uneval(x));
        if (typeof x === 'string' && typeof out[out.length - 1] === 'string') { out[ out.length - 1 ] += x } else { out.push(x) }
      }

      while (text.length > 0) {
        res = this.dialect.inline.__oneElement__.call(this, text, patterns, out)
        text = text.substr(res.shift())
        forEach(res, add)
      }

      return out
    },

    // These characters are intersting elsewhere, so have rules for them so that
    // chunks of plain text blocks don't include them
    ']': function () {},
    '}': function () {},

    // eslint-disable-next-line no-useless-escape
    __escape__: /^\\[\\`\*_{}\[\]()#\+.!\-]/,

    '\\': function escaped (text) {
      // [ length of input processed, node/children to add... ]
      // Only esacape: \ ` * _ { } [ ] ( ) # * + - . !
      if (this.dialect.inline.__escape__.exec(text)) {
        return [ 2, text.charAt(1) ]
      } else {
        return [ 1, '\\' ]
      }
    },

    '![': function image (text) {
      // Unlike images, alt text is plain text only. no other elements are
      // allowed in there

      // ![Alt text](/path/to/img.jpg "Optional title")
      //      1          2            3       4         <--- captures
      var m = text.match(/^!\[(.*?)\][ \t]*\([ \t]*([^")]*?)(?:[ \t]+(["'])(.*?)\3)?[ \t]*\)/)

      if (m) {
        if (m[2] && m[2][0] === '<' && m[2][m[2].length - 1] === '>') { m[2] = m[2].substring(1, m[2].length - 1) }

        m[2] = this.dialect.inline.__call__.call(this, m[2], /\\/)[0]

        var attrs = { alt: m[1], href: m[2] || '' }
        if (m[4] !== undefined) { attrs.title = m[4] }

        return [ m[0].length, [ 'img', attrs ] ]
      }

      // ![Alt text][id]
      m = text.match(/^!\[(.*?)\][ \t]*\[(.*?)\]/)

      if (m) {
        // We can't check if the reference is known here as it likely wont be
        // found till after. Check it in md tree->hmtl tree conversion
        return [ m[0].length, [ 'img_ref', { alt: m[1], ref: m[2].toLowerCase(), original: m[0] } ] ]
      }

      // Just consume the '!['
      return [ 2, '![' ]
    },

    '[': function link (text) {
      var orig = String(text)
      // Inline content is possible inside `link text`
      var res = Markdown.DialectHelpers.inline_until_char.call(this, text.substr(1), ']')

      // No closing ']' found. Just consume the [
      if (!res) return [ 1, '[' ]

      var consumed = 1 + res[ 0 ]
      var children = res[ 1 ]
      var link
      var attrs

      // At this point the first [...] has been parsed. See what follows to find
      // out which kind of link we are (reference or direct url)
      text = text.substr(consumed)

      // [link text](/path/to/img.jpg "Optional title")
      //                 1            2       3         <--- captures
      // This will capture up to the last paren in the block. We then pull
      // back based on if there a matching ones in the url
      //    ([here](/url/(test))
      // The parens have to be balanced
      var m = text.match(/^\s*\([ \t]*([^"']*)(?:[ \t]+(["'])(.*?)\2)?[ \t]*\)/)
      if (m) {
        var url = m[1]
        consumed += m[0].length

        if (url && url[0] === '<' && url[url.length - 1] === '>') { url = url.substring(1, url.length - 1) }

        // If there is a title we don't have to worry about parens in the url
        if (!m[3]) {
          var openParens = 1 // One open that isn't in the capture
          for (var len = 0; len < url.length; len++) {
            switch (url[len]) {
              case '(':
                openParens++
                break
              case ')':
                if (--openParens === 0) {
                  consumed -= url.length - len
                  url = url.substring(0, len)
                }
                break
            }
          }
        }

        // Process escapes only
        url = this.dialect.inline.__call__.call(this, url, /\\/)[0]

        attrs = { href: url || '' }
        if (m[3] !== undefined) { attrs.title = m[3] }

        link = [ 'link', attrs ].concat(children)
        return [ consumed, link ]
      }

      // [Alt text][id]
      // [Alt text] [id]
      m = text.match(/^\s*\[(.*?)\]/)

      if (m) {
        consumed += m[ 0 ].length

        // [links][] uses links as its reference
        attrs = { ref: (m[ 1 ] || String(children)).toLowerCase(), original: orig.substr(0, consumed) }

        link = [ 'link_ref', attrs ].concat(children)

        // We can't check if the reference is known here as it likely wont be
        // found till after. Check it in md tree->hmtl tree conversion.
        // Store the original so that conversion can revert if the ref isn't found.
        return [ consumed, link ]
      }

      // [id]
      // Only if id is plain (no formatting.)
      if (children.length === 1 && typeof children[0] === 'string') {
        attrs = { ref: children[0].toLowerCase(), original: orig.substr(0, consumed) }
        link = [ 'link_ref', attrs, children[0] ]
        return [ consumed, link ]
      }

      // Just consume the "["
      return [ 1, '[' ]
    },

    '<': function autoLink (text) {
      var m

      if ((m = text.match(/^<(?:((https?|ftp|mailto):[^>]+)|(.*?@.*?\.[a-zA-Z]+))>/)) != null) {
        if (m[3]) {
          return [ m[0].length, [ 'link', { href: 'mailto:' + m[3] }, m[3] ] ]
        } else if (m[2] === 'mailto') {
          return [ m[0].length, [ 'link', { href: m[1] }, m[1].substr('mailto:'.length) ] ]
        } else { return [ m[0].length, [ 'link', { href: m[1] }, m[1] ] ] }
      }

      return [ 1, '<' ]
    },

    '`': function inlineCode (text) {
      // Inline code block. as many backticks as you like to start it
      // Always skip over the opening ticks.
      var m = text.match(/(`+)(([\s\S]*?)\1)/)

      if (m && m[2]) { return [ m[1].length + m[2].length, [ 'inlinecode', m[3] ] ] } else {
        // TODO: No matching end code found - warn!
        return [ 1, '`' ]
      }
    },

    '  \n': function lineBreak (text) {
      return [ 3, [ 'linebreak' ] ]
    }

  }

  // Meta Helper/generator method for em and strong handling
  function strongEm (tag, md) {
    var stateSlot = tag + '_state'
    var otherSlot = tag === 'strong' ? 'em_state' : 'strong_state'

    function CloseTag (len) {
      this.len_after = len
      this.name = 'close_' + md
    }

    return function (text, origMatch) {
      if (this[stateSlot][0] === md) {
        // Most recent em is of this type
        // D:this.debug("closing", md);
        this[stateSlot].shift()

        // "Consume" everything to go back to the recrusion in the else-block below
        return [ text.length, new CloseTag(text.length - md.length) ]
      } else {
        // Store a clone of the em/strong states
        var other = this[otherSlot].slice()
        var state = this[stateSlot].slice()

        this[stateSlot].unshift(md)

        // D:this.debug_indent += "  ";

        // Recurse
        var res = this.processInline(text.substr(md.length))
        // D:this.debug_indent = this.debug_indent.substr(2);

        var last = res[res.length - 1]

        // D:this.debug("processInline from", tag + ": ", uneval( res ) );

        // var check = this[stateSlot].shift()
        if (last instanceof CloseTag) {
          res.pop()
          // We matched! Huzzah.
          var consumed = text.length - last.len_after
          return [ consumed, [ tag ].concat(res) ]
        } else {
          // Restore the state of the other kind. We might have mistakenly closed it.
          this[otherSlot] = other
          this[stateSlot] = state

          // We can't reuse the processed result as it could have wrong parsing contexts in it.
          return [ md.length, md ]
        }
      }
    } // End returned function
  }

  Markdown.dialects.Gruber.inline['**'] = strongEm('strong', '**')
  Markdown.dialects.Gruber.inline['__'] = strongEm('strong', '__')
  Markdown.dialects.Gruber.inline['*'] = strongEm('em', '*')
  Markdown.dialects.Gruber.inline['_'] = strongEm('em', '_')

  // Build default order from insertion order.
  Markdown.buildBlockOrder = function (d) {
    var ord = []
    for (var i in d) {
      if (i === '__order__' || i === '__call__') continue
      ord.push(i)
    }
    d.__order__ = ord
  }

  // Build patterns for inline matcher
  Markdown.buildInlinePatterns = function (d) {
    var patterns = []

    for (var i in d) {
      // __foo__ is reserved and not a pattern
      if (i.match(/^__.*__$/)) continue
      // eslint-disable-next-line no-useless-escape
      var l = i.replace(/([\\.*+?|()\[\]{}])/g, '\\$1')
        .replace(/\n/, '\\n')
      patterns.push(i.length === 1 ? l : '(?:' + l + ')')
    }

    patterns = patterns.join('|')
    d.__patterns__ = patterns
    // print("patterns:", uneval( patterns ) );

    var fn = d.__call__
    d.__call__ = function (text, pattern) {
      if (pattern !== undefined) {
        return fn.call(this, text, pattern)
      } else {
        return fn.call(this, text, patterns)
      }
    }
  }

  Markdown.DialectHelpers = {}
  Markdown.DialectHelpers.inline_until_char = function (text, want) {
    var consumed = 0
    var nodes = []

    while (true) {
      if (text.charAt(consumed) === want) {
        // Found the character we were looking for
        consumed++
        return [ consumed, nodes ]
      }

      if (consumed >= text.length) {
        // No closing char found. Abort.
        return null
      }

      var res = this.dialect.inline.__oneElement__.call(this, text.substr(consumed))
      consumed += res[ 0 ]
      // Add any returned nodes.
      nodes.push.apply(nodes, res.slice(1))
    }
  }

  // Helper function to make sub-classing a dialect easier
  Markdown.subclassDialect = function (d) {
    function Block () {}
    Block.prototype = d.block
    function Inline () {}
    Inline.prototype = d.inline

    return { block: new Block(), inline: new Inline() }
  }

  Markdown.buildBlockOrder(Markdown.dialects.Gruber.block)
  Markdown.buildInlinePatterns(Markdown.dialects.Gruber.inline)

  Markdown.dialects.Maruku = Markdown.subclassDialect(Markdown.dialects.Gruber)

  Markdown.dialects.Maruku.processMetaHash = function processMetaHash (metaString) {
    var meta = splitMetaHash(metaString)
    var attr = {}

    for (var i = 0; i < meta.length; ++i) {
      // id: #foo
      if (/^#/.test(meta[ i ])) {
        attr.id = meta[ i ].substring(1)
      } else if (/^\./.test(meta[ i ])) {
        // if class already exists, append the new one
        if (attr['class']) {
          attr['class'] = attr['class'] + meta[ i ].replace(/./, ' ')
        } else {
          attr['class'] = meta[ i ].substring(1)
        }
        // eslint-disable-next-line brace-style
      }
      // attribute: foo=bar
      // eslint-disable-next-line no-useless-escape
      else if (/\=/.test(meta[ i ])) {
        // eslint-disable-next-line no-useless-escape
        var s = meta[ i ].split(/\=/)
        attr[ s[ 0 ] ] = s[ 1 ]
      }
    }

    return attr
  }

  function splitMetaHash (metaString) {
    var meta = metaString.split('')
    var parts = [ '' ]
    var inQuotes = false

    while (meta.length) {
      var letter = meta.shift()
      switch (letter) {
        case ' ' :
          // if we're in a quoted section, keep it
          if (inQuotes) parts[ parts.length - 1 ] += letter
          // otherwise make a new part
          else {
            parts.push('')
          }
          break
        case "'" :
        case '"' :
          // reverse the quotes and move straight on
          inQuotes = !inQuotes
          break
        case '\\' :
          // shift off the next letter to be used straight away.
          // it was escaped so we'll keep it whatever it is
          letter = meta.shift()
        // eslint-disable-next-line no-fallthrough
        default :
          parts[ parts.length - 1 ] += letter
          break
      }
    }

    return parts
  }

  Markdown.dialects.Maruku.block.documentMeta = function documentMeta (block, next) {
    // we're only interested in the first block
    if (block.lineNumber > 1) return undefined

    // documentMeta blocks consist of one or more lines of `Key: Value\n`
    if (!block.match(/^(?:\w+:.*\n)*\w+:.*$/)) return undefined

    // make an attribute node if it doesn't exist
    if (!extractAttr(this.tree)) {
      this.tree.splice(1, 0, {})
    }

    var pairs = block.split(/\n/)
    for (var p in pairs) {
      var m = pairs[ p ].match(/(\w+):\s*(.*)$/)
      var key = m[ 1 ].toLowerCase()
      var value = m[ 2 ]

      this.tree[ 1 ][ key ] = value
    }

    // documentMeta produces no content!
    return []
  }

  Markdown.dialects.Maruku.block.blockMeta = function blockMeta (block, next) {
    // check if the last line of the block is an meta hash
    // eslint-disable-next-line no-useless-escape
    var m = block.match(/(^|\n) {0,3}\{:\s*((?:\\\}|[^\}])*)\s*\}$/)
    if (!m) return undefined

    // process the meta hash
    var attr = this.dialect.processMetaHash(m[ 2 ])

    var hash

    // if we matched ^ then we need to apply meta to the previous block
    if (m[ 1 ] === '') {
      var node = this.tree[ this.tree.length - 1 ]
      hash = extractAttr(node)

      // if the node is a string (rather than JsonML), bail
      if (typeof node === 'string') return undefined

      // create the attribute hash if it doesn't exist
      if (!hash) {
        hash = {}
        node.splice(1, 0, hash)
      }

      // add the attributes in
      for (var a in attr) {
        hash[ a ] = attr[ a ]
      }

      // return nothing so the meta hash is removed
      return []
    }

    // pull the meta hash off the block and process what's left
    var b = block.replace(/\n.*$/, '')
    var result = this.processBlock(b, [])

    // get or make the attributes hash
    hash = extractAttr(result[ 0 ])
    if (!hash) {
      hash = {}
      result[ 0 ].splice(1, 0, hash)
    }

    // attach the attributes to the block
    for (a in attr) {
      hash[ a ] = attr[ a ]
    }

    return result
  }

  Markdown.dialects.Maruku.block.definitionList = function definitionList (block, next) {
    // one or more terms followed by one or more definitions, in a single block
    var tight = /^((?:[^\s:].*\n)+):\s+([\s\S]+)$/
    var list = [ 'dl' ]
    var i
    var m

    // see if we're dealing with a tight or loose block
    if ((m = block.match(tight))) {
      // pull subsequent tight DL blocks out of `next`
      var blocks = [ block ]
      while (next.length && tight.exec(next[ 0 ])) {
        blocks.push(next.shift())
      }

      for (var b = 0; b < blocks.length; ++b) {
        // eslint-disable-next-line no-redeclare
        var m = blocks[ b ].match(tight)
        var terms = m[ 1 ].replace(/\n$/, '').split(/\n/)
        var defns = m[ 2 ].split(/\n:\s+/)

        // print( uneval( m ) );

        for (i = 0; i < terms.length; ++i) {
          list.push([ 'dt', terms[ i ] ])
        }

        for (i = 0; i < defns.length; ++i) {
          // run inline processing over the definition
          list.push([ 'dd' ].concat(this.processInline(defns[ i ].replace(/(\n)\s+/, '$1'))))
        }
      }
    } else {
      return undefined
    }

    return [ list ]
  }

  // splits on unescaped instances of @ch. If @ch is not a character the result
  // can be unpredictable

  Markdown.dialects.Maruku.block.table = function table (block, next) {
    var _splitOnUnescaped = function (s, ch) {
      ch = ch || '\\s'
      // eslint-disable-next-line no-useless-escape
      if (ch.match(/^[\\|\[\]{}?*.+^$]$/)) { ch = '\\' + ch }
      var res = [ ]
      var r = new RegExp('^((?:\\\\.|[^\\\\' + ch + '])*)' + ch + '(.*)')
      var m
      // eslint-disable-next-line no-cond-assign
      while (m = s.match(r)) {
        res.push(m[1])
        s = m[2]
      }
      res.push(s)
      return res
    }

    // eslint-disable-next-line no-useless-escape
    var leadingPipe = /^ {0,3}\|(.+)\n {0,3}\|\s*([\-:]+[\-| :]*)\n((?:\s*\|.*(?:\n|$))*)(?=\n|$)/
    // find at least an unescaped pipe in each line
    // eslint-disable-next-line no-useless-escape
    var noLeadingPipe = /^ {0,3}(\S(?:\\.|[^\\|])*\|.*)\n {0,3}([\-:]+\s*\|[\-| :]*)\n((?:(?:\\.|[^\\|])*\|.*(?:\n|$))*)(?=\n|$)/
    var i
    var m
    // eslint-disable-next-line no-cond-assign
    if (m = block.match(leadingPipe)) {
      // remove leading pipes in contents
      // (header and horizontal rule already have the leading pipe left out)
      m[3] = m[3].replace(/^\s*\|/gm, '')
    } else if (!(m = block.match(noLeadingPipe))) {
      return undefined
    }

    var table = [ 'table', [ 'thead', [ 'tr' ] ], [ 'tbody' ] ]

    // remove trailing pipes, then split on pipes
    // (no escaped pipes are allowed in horizontal rule)
    m[2] = m[2].replace(/\|\s*$/, '').split('|')

    // process alignment
    var htmlAttrs = [ ]
    forEach(m[2], function (s) {
      if (s.match(/^\s*-+:\s*$/)) htmlAttrs.push({align: 'right'})
      else if (s.match(/^\s*:-+\s*$/)) htmlAttrs.push({align: 'left'})
      else if (s.match(/^\s*:-+:\s*$/)) htmlAttrs.push({align: 'center'})
      else htmlAttrs.push({})
    })

    // now for the header, avoid escaped pipes
    m[1] = _splitOnUnescaped(m[1].replace(/\|\s*$/, ''), '|')
    for (i = 0; i < m[1].length; i++) {
      table[1][1].push(['th', htmlAttrs[i] || {}].concat(
        this.processInline(m[1][i].trim())))
    }

    // now for body contents
    forEach(m[3].replace(/\|\s*$/mg, '').split('\n'), function (row) {
      var htmlRow = ['tr']
      row = _splitOnUnescaped(row, '|')
      for (i = 0; i < row.length; i++) {
        htmlRow.push(['td', htmlAttrs[i] || {}].concat(this.processInline(row[i].trim())))
      }
      table[2].push(htmlRow)
    }, this)

    return [table]
  }

  Markdown.dialects.Maruku.inline[ '{:' ] = function inlineMeta (text, matches, out) {
    if (!out.length) {
      return [ 2, '{:' ]
    }

    // get the preceeding element
    var before = out[ out.length - 1 ]

    if (typeof before === 'string') {
      return [ 2, '{:' ]
    }

    // match a meta hash
    // eslint-disable-next-line no-useless-escape
    var m = text.match(/^\{:\s*((?:\\\}|[^\}])*)\s*\}/)

    // no match, false alarm
    if (!m) {
      return [ 2, '{:' ]
    }

    // attach the attributes to the preceeding element
    var meta = this.dialect.processMetaHash(m[ 1 ])
    var attr = extractAttr(before)

    if (!attr) {
      attr = {}
      before.splice(1, 0, attr)
    }

    for (var k in meta) {
      attr[ k ] = meta[ k ]
    }

    // cut out the string and replace it with nothing
    return [ m[ 0 ].length, '' ]
  }

  // eslint-disable-next-line no-useless-escape
  Markdown.dialects.Maruku.inline.__escape__ = /^\\[\\`\*_{}\[\]()#\+.!\-|:]/

  Markdown.buildBlockOrder(Markdown.dialects.Maruku.block)
  Markdown.buildInlinePatterns(Markdown.dialects.Maruku.inline)

  var isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
  }

  var forEach
  // Don't mess with Array.prototype. Its not friendly
  if (Array.prototype.forEach) {
    forEach = function (arr, cb, thisp) {
      return arr.forEach(cb, thisp)
    }
  } else {
    forEach = function (arr, cb, thisp) {
      for (var i = 0; i < arr.length; i++) {
        cb.call(thisp || arr, arr[i], i, arr)
      }
    }
  }

  var isEmpty = function (obj) {
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        return false
      }
    }

    return true
  }

  function extractAttr (jsonml) {
    return isArray(jsonml) &&
        jsonml.length > 1 &&
        typeof jsonml[ 1 ] === 'object' &&
        !(isArray(jsonml[ 1 ]))
      ? jsonml[ 1 ]
      : undefined
  }

  /**
   *  renderJsonML( jsonml[, options] ) -> String
   *  - jsonml (Array): JsonML array to render to XML
   *  - options (Object): options
   *
   *  Converts the given JsonML into well-formed XML.
   *
   *  The options currently understood are:
   *
   *  - root (Boolean): wether or not the root node should be included in the
   *    output, or just its children. The default `false` is to not include the
   *    root itself.
   */
  expose.renderJsonML = function (jsonml, options) {
    options = options || {}
    // include the root element in the rendered output?
    options.root = options.root || false

    var content = []

    if (options.root) {
      content.push(renderTree(jsonml))
    } else {
      jsonml.shift() // get rid of the tag
      if (jsonml.length && typeof jsonml[ 0 ] === 'object' && !(jsonml[ 0 ] instanceof Array)) {
        jsonml.shift() // get rid of the attributes
      }

      while (jsonml.length) {
        content.push(renderTree(jsonml.shift()))
      }
    }

    return content.join('\n\n')
  }

  function escapeHTML (text) {
    return text.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function renderTree (jsonml) {
    // basic case
    if (typeof jsonml === 'string') {
      return escapeHTML(jsonml)
    }

    var tag = jsonml.shift()
    var attributes = {}
    var content = []

    if (jsonml.length && typeof jsonml[ 0 ] === 'object' && !(jsonml[ 0 ] instanceof Array)) {
      attributes = jsonml.shift()
    }

    while (jsonml.length) {
      content.push(renderTree(jsonml.shift()))
    }

    var tagAttrs = ''
    for (var a in attributes) {
      tagAttrs += ' ' + a + '="' + escapeHTML(attributes[ a ]) + '"'
    }

    // be careful about adding whitespace here for inline elements
    if (tag === 'img' || tag === 'br' || tag === 'hr') {
      return '<' + tag + tagAttrs + '/>'
    } else {
      return '<' + tag + tagAttrs + '>' + content.join('') + '</' + tag + '>'
    }
  }

  function convertTreeToHtml (tree, references, options) {
    var i
    options = options || {}

    // shallow clone
    var jsonml = tree.slice(0)

    if (typeof options.preprocessTreeNode === 'function') {
      jsonml = options.preprocessTreeNode(jsonml, references)
    }

    // Clone attributes if they exist
    var attrs = extractAttr(jsonml)
    if (attrs) {
      jsonml[ 1 ] = {}
      for (i in attrs) {
        jsonml[ 1 ][ i ] = attrs[ i ]
      }
      attrs = jsonml[ 1 ]
    }

    // basic case
    if (typeof jsonml === 'string') {
      return jsonml
    }

    // convert this node
    switch (jsonml[ 0 ]) {
      case 'header':
        jsonml[ 0 ] = 'h' + jsonml[ 1 ].level
        delete jsonml[ 1 ].level
        break
      case 'bulletlist':
        jsonml[ 0 ] = 'ul'
        break
      case 'numberlist':
        jsonml[ 0 ] = 'ol'
        break
      case 'listitem':
        jsonml[ 0 ] = 'li'
        break
      case 'para':
        jsonml[ 0 ] = 'p'
        break
      case 'markdown':
        jsonml[ 0 ] = 'html'
        if (attrs) delete attrs.references
        break
      case 'code_block':
        jsonml[ 0 ] = 'pre'
        i = attrs ? 2 : 1
        var code = [ 'code' ]
        code.push.apply(code, jsonml.splice(i, jsonml.length - i))
        jsonml[ i ] = code
        break
      case 'inlinecode':
        jsonml[ 0 ] = 'code'
        break
      case 'img':
        jsonml[ 1 ].src = jsonml[ 1 ].href
        delete jsonml[ 1 ].href
        break
      case 'linebreak':
        jsonml[ 0 ] = 'br'
        break
      case 'link':
        jsonml[ 0 ] = 'a'
        break
      case 'link_ref':
        jsonml[ 0 ] = 'a'

        // grab this ref and clean up the attribute node
        var ref = references[ attrs.ref ]

        // if the reference exists, make the link
        if (ref) {
          delete attrs.ref

          // add in the href and title, if present
          attrs.href = ref.href
          if (ref.title) {
            attrs.title = ref.title
          }
          // get rid of the unneeded original text
          delete attrs.original
        } else {
          return attrs.original
        }
        break
      case 'img_ref':
        jsonml[ 0 ] = 'img'

        // grab this ref and clean up the attribute node
        // eslint-disable-next-line no-redeclare
        var ref = references[ attrs.ref ]

        // if the reference exists, make the link
        if (ref) {
          delete attrs.ref

          // add in the href and title, if present
          attrs.src = ref.href
          if (ref.title) {
            attrs.title = ref.title
          }

          // get rid of the unneeded original text
          delete attrs.original
        } else {
          return attrs.original
        }
        break
    }

    // convert all the children
    i = 1

    // deal with the attribute node, if it exists
    if (attrs) {
      // if there are keys, skip over it
      // eslint-disable-next-line no-unused-vars
      for (var key in jsonml[ 1 ]) {
        i = 2
        break
      }
      // if there aren't, remove it
      if (i === 1) {
        jsonml.splice(i, 1)
      }
    }

    for (; i < jsonml.length; ++i) {
      jsonml[ i ] = convertTreeToHtml(jsonml[ i ], references, options)
    }

    return jsonml
  }

  // merges adjacent text nodes into a single node
  function mergeTextNodes (jsonml) {
    // skip the tag name and attribute hash
    var i = extractAttr(jsonml) ? 2 : 1

    while (i < jsonml.length) {
      // if it's a string check the next item too
      if (typeof jsonml[ i ] === 'string') {
        if (i + 1 < jsonml.length && typeof jsonml[ i + 1 ] === 'string') {
          // merge the second string into the first and remove it
          jsonml[ i ] += jsonml.splice(i + 1, 1)[ 0 ]
        } else {
          ++i
        }
      } else {
        mergeTextNodes(jsonml[ i ])
        ++i
      }
    }
  }
  return expose
}
var markdown = markdownFactory({})
console.log(markdown)
export {
  markdown
}
// )( (function() {
//   if ( typeof exports === "undefined" ) {
//   window.markdown = {};
//     return window.markdown;
//   }
//   else {
//     return exports;
//   }
// } )() );
