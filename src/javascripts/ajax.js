function ajax (options, callback) {
  var xhr = new XMLHttpRequest()
  options.type = (options.type || 'GET').toUpperCase()
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(xhr.responseText, xhr.responseXML)
    }
  }
  if (options.type === 'GET') {
    xhr.open('GET', options.url + '?' + formatParams(options.data), true)
    // xhr.open("GET",options.url,true)
    xhr.send(null)
  } else {
    xhr.open('POST', options.url, true)
    if (options.file) {
      // xhr.setRequestHeader('Content-Type', 'multipart/form-data')
    } else {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    }
    if (options.dataNoParse) {
      xhr.send(options.data)
    } else {
      xhr.send(formatParams(options.data))
    }
  }
}
function formatParams (data) {
  var arr = []
  for (var name in data) {
    arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]))
  }
  // arr.push(('v='+Math.random()).replace('.',''))
  return arr.join('&')
}
export {
  ajax
}
