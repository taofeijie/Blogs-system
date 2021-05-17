<template>
  <div id="blogDetail">
    <div id="detailLeft">
      <div id="blogTitle">
        <h3>文章标题：{{blog.title}}</h3>
<!--        <h3>{{blog.sub_title}}</h3>-->
          <span>访问次数:{{blog.visits}}</span> <span>发布时间:{{new Date(blog.date).toLocaleDateString()}}</span> <span>文章分类:{{blog.category}}</span> <span>评论数量:{{blog.comments?blog.comments.length:0}}</span>
      </div>
      <div id="content">
        <div id="write" v-html="show_data"></div>

      </div>
      <div id="writeComment">
        <textarea name="" id="commentArea" cols="30" rows="10" v-model="comment" placeholder="写下你的评论："></textarea>
        <button class="btn-issue" @click="issueComment">发布</button>
        <button class="btn-cancel" @click="cancelComment">取消</button>
      </div>
      <div id="comment">
        <div class="article">
          <h2><span>{{blog.comments?blog.comments.length:0}}</span> Responses</h2>
          <div class="clr"></div>
          <div class="comment" v-for="(value) in comments" :key="value.authorId">
            <a href="#"><img v-bind:src="value.portrait?value.portrait:'../imgs/userpic.gif'" width="40" height="40" alt="" class="userpic" /></a>
<!--            <a href="#"><img v-bind:src="'http://8.140.35.196:3030/' + comments.portrait" width="40" height="40" alt="" class="userpic" /></a>-->
            <p><a href="#">{{value.authorName}}</a> Says:<br />
              {{new Date(value.commentDate).toLocaleDateString()}},  at {{new Date(value.commentDate).toLocaleTimeString()}}</p>
            <p>{{value.content}}</p>
          </div>
        </div>
      </div>
    </div>
    <div id="authorContainer">
        <div class="personBrief">
          <div class="profile">
<!--            <img v-bind:src="'http://8.140.35.196:3030/' + user.portrait" alt=" " />-->
            <img src="../imgs/userpic.gif" id="authorPortrait" alt=" " />
            <h2>{{user.general.nickname}}</h2>
            <p>学校：{{user.general.school}}</p>
          </div>
          <div class="favourites">
            <ul>
              <li><a class="eye" href="#">{{this.blog.visits}}</a></li>
              <li><a class="video" href="#">331</a></li>
              <li><a  class="favou" href="#">{{this.user.blogs.praises}}</a></li>
              <div class="clear"></div>
            </ul>
          </div>
          <br><br>
          <div class="main-grid3">
<!--            <div class="bar" v-for="blog in recentBlog" :key="blog._id">-->
<!--              <router-link v-bind:to="'/detail/'+value._id" tag="p">{{blog.title}}</router-link>-->
<!--            </div>-->
<!--            <router-link v-for="value in recentBlog" :key="value._id" v-bind:to="'/detail/'+value._id" tag="div"><div class="bar">{{value.title}}</div></router-link>-->
            <div class="bar">
              <p>性别：{{user.general.gender?user.general.gender:'男'}}</p>
            </div>
<!--            <div class="bar">-->
<!--              <p>等级：{{user.account.level?user.account.level:0}}</p>-->
<!--            </div>-->
            <div class="bar">
              <p>学院：{{user.general.college}}</p>
            </div>
            <div class="bar">
              <p>专业：{{user.general.major}}</p>
            </div>
            <div class="bar">
              <p>年级：{{user.general.grade}}</p>
            </div>
          </div>
<!--          <div class="facebook">-->
<!--            <ul>-->
<!--              <li><a class="icon1" href="#"></a></li>-->
<!--              <li><a class="icon2" href="#"></a></li>-->
<!--              <li><a class="icon3" href="#"></a></li>-->
<!--              <li><a class="icon4" href="#"></a></li>-->
<!--              <li><a class="icon5" href="#"></a></li>-->
<!--            </ul>-->
<!--          </div>-->
          <div class="follow">
            <a href="#">follow</a>
          </div>
          <br>
          最近发布：
          <div class="bar" v-for="blog in recentBlog" :key="blog._id">
            <p>{{blog.title}}  <img src="../assets/readCountWhite.png" class="visit_img" alt="">{{blog.visits}}</p>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import {ajax} from '../javascripts/ajax'
// import {markdown} from '../javascripts/markdown'
import {toLogin, stringToJson} from '../javascripts/assist'

export default {
  name: 'blogDetail',
  data () {
    return {
      blogId: '',
      show_data: '',
      comment: '',
      comments: [],
      blog: {},
      recentBlog: [],
      user: {
        general: {},
        blogs: {}
      },
      author: {}
    }
  },
  created () {
    this.blogId = this.$route.params.id
  },
  mounted () {
    window.scrollTo(0, 0)
    this.getBlog()
  },
  methods: {
    getBlog: function () {
      ajax({
        url: '/api/getBlog',
        type: 'get',
        data: {
          blogId: this.blogId
        }
      }, (response) => {
        var blog = JSON.parse(response)
        this.blog = blog
        // this.user.general.nickname = '陶飞杰'
        this.user = blog.author
        console.log(this.user)
        ajax({
          url: '/api/getBlogsByUser',
          type: 'POST',
          data: {
            userId: this.user._id
          }
        }, (response) => {
          if (response) {
            this.recentBlog = stringToJson(response)
            // console.log(this.recentBlog)
          }
        })
        this.show_data = blog.content
        this.comments = blog.comments
        document.getElementById('authorPortrait').src = 'http://8.140.35.196:3030/' + this.user.general.portrait
        for (let i in this.comments) {
          ajax({
            url: '/api/userPortrait',
            type: 'POST',
            data: {userId: this.comments[i].authorID}
          }, (response) => {
            document.getElementsByClassName('userpic')[i].src = 'http://8.140.35.196:3030/' + response
          })
        }
      })
    },
    cancelComment: function () {
      this.comment = ''
    },
    issueComment: function () {
      if (this.comment) {
        var date = new Date()
        ajax({
          url: '/api/issueComment',
          type: 'POST',
          data: {
            blogId: this.blogId,
            content: this.comment,
            date: date.toLocaleString()
          }
        }, (response) => {
          if (response === 'toLogin') {
            toLogin()
          } else if (response === 'successful') {
            ajax({
              url: 'api/getUser',
              type: 'POST',
              data: {
                filter: JSON.stringify({general: 1})
              }
            }, (response) => {
              if (response && response !== 'toLogin') {
                this.author = JSON.parse(response)
                var comment = {
                  date: new Date().toLocaleString(),
                  authorName: this.author.general.nickname,
                  content: this.comment,
                  portrait: 'http://8.140.35.196:3030/' + this.author.general.portrait
                }
                this.comments.push(comment)
              }
            })
          }
        })
      }
    }
  }
}
</script>

<!--<style src="../styles/cobalt.css"></style>-->
<style src="../styles/gitlab.css"></style>
<style>
  #blogDetail{
    width: 100%;
    height: 100%;
    /*background-color: #ff8e09;*/
  }
  #detailLeft{
    width: 60%;
    /*height: 100%;*/
    margin-left: 5%;
    /*border: 1px solid black;*/
  }
  #blogTitle{
    color:black;
    background-color: rgba(244,244,244,1);
    margin-bottom: 10px;
    margin-top: 10px;
    border-radius: 0.7rem;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  }
  #content{
    text-align: center;
    width: 100%;
    /*height: 100%;*/
    /*margin-left: 5%;*/
    /*border: 1px solid black;*/
    /*background-color: white;*/
    /*background-color: #ff8e09;*/
    border-radius: 1.5rem;
    position: relative;
    z-index: 3;
  }
  #writeComment{
    /*border: 1px solid black;*/
    width: 100%;
    height: 150px;
    text-align: right;
    /*margin-left: -5%;*/
  }
  #commentArea{
    outline: 0;
    margin-top: 5px;
    font-size: 120%;
    z-index: 6;
    width: 99%;
    height: 100px;
    border-radius: 0.5rem;
    background-color: rgba(249,249,249,1);
  }
  .btn-issue{
    background: none;
    border: 1px solid orange;
    width: 60px;
    height: 30px;
    background-color: rgba(229,92,71,1);
    color: white;
    font-weight: bold;
    position: relative;
    /*right: 0px;*/
    margin-right: 20px;
    border-radius: 1rem;
    outline: 0;
  }
  .btn-cancel{
    background: none;
    background-color: rgba(255,255,255,1);
    color: rgba(149,149,149,1);
    width: 60px;
    height: 30px;
    font-weight: bold;
    margin-right: 15px;
    outline: 0;
    /*position: absolute;*/
    /*right: 105px;*/
    /*bottom: 5px;*/
    border: 1px solid darkgrey;
    border-radius: 1rem;
  }
  .btn-issue:hover{
    cursor: pointer;
  }
  .btn-cancel:hover{
    cursor: pointer;
  }
  #comment{
    width: 100%;
    /*border: 1px solid black;*/
    border-radius: 1.5rem;
    background-color: rgba(240,240,240,1);
  }
  #authorContainer{
    width: 25%;
    /*background-color: white;*/
    /*border: 1px solid red;*/
    position: absolute;
    right: 1%;
    top: 1%;
  }
  #author{
    width: 100%;
    background-color: white;
    border-radius: 1rem;
  }
  #portrait_container{
    display: block;
    width: 100%;
    height: 6.2rem;
    border: #42b983 1px solid;
  }
  #portrait_aur{
    width: 6rem;
    height: 6rem;
    border: 1px solid black;
    border-radius: 50%;
    display: inline-block;
    float: left;
  }
  #nickname{
    line-height: 4rem;
  }
  #block_container{
    width: 100%;
    margin-top: 1rem;
    text-align: center;
  }
  .block{
    width: 4rem;
    height: 4rem;
    border: #ff8e09 1px solid ;
    /*float: left;*/
    display: inline-block;
    /*margin-left: 1rem;*/
  }
  #btn_container{
    width: 100%;
    text-align: center;
    margin-top: 1rem;
  }
  #chat{
    width: 40%;
    height: 2rem;
    background-color: green;
    display: inline-block;
    border-radius: 1rem;
    text-align: center;
    margin-bottom: 1rem;
    /*line-height: 1rem;*/
  }
  #chat:hover{
    cursor: pointer;
  }
  #attention{
    width: 40%;
    height: 2rem;
    background-color: green;
    display: inline-block;
    border-radius: 1rem;
    text-align: center;
    margin-left: 1rem;
  }
  #attention:hover{
    cursor: pointer;
  }
  #recent{
    width: 100%;
    border-radius: 1rem;
    margin-top: 1rem;
    background-color: white;
  }
  .title{

  }
  .title:hover{
    color: #ff8e09;
  }
  .visit_img{
    width: 1rem;
    height: 0.8rem;
  }

  .recent_li{
    list-style: none;
    margin-left: -2rem;
  }
  .visit_count{
    color: #586e75;
  }

  .article {
    margin:0px 0 8px;
    padding:0 20px 16px;
    background:no-repeat 20px top;
    font:normal 12px/1.5em "Liberation sans", Arial, Helvetica, sans-serif;
    /*border: #ebccd1 1px solid;*/
  }
  .clr {
    clear:both;
    padding:0;
    margin:0;
    width:100%;
    font-size:0;
    line-height:0;
  }
  .comment {
    margin:0;
    padding:10px 0 0 0;
    font-size: 0.9rem;
    border-bottom: #ebccd1 1px solid;
  }
  .comment img.userpic {
    border:1px solid #dedede;
    margin:10px 16px 0 0;
    padding:0;
    float:left;
  }
  .article h2 {
    margin:8px 0;
    padding:8px 0;
    font-size:26px;
    font-weight:normal;
    line-height:1.2em;
    color:#494848;
    text-transform:none;
  }
  .article p {
    margin:8px 0;
    padding:0 0 8px 60px;
  }

  /*personBrief*/
  /*a{text-decoration:none;}*/
  /*.clear{clear:both;}!* clear float *!*/
  /*h1,h2,h3,h4,h5,h6{*/
  /*  margin:0;*/
  /*}*/
  /*p{*/
  /*  margin:0;*/
  /*}*/
  /*ul{*/
  /*  margin:0;*/
  /*  padding:0;*/
  /*}*/
  /*label{*/
  /*  margin:0;*/
  /*}*/

  .personBrief h1{
    font-size:28px;
    text-align:center;
    text-transform:uppercase;
    font-family: 'Fugaz One', cursive;
    color:#fff;
    margin-bottom: 25px;
    letter-spacing:1px;
    font-weight:100;
  }
  .personBrief{
    width: 80%;
    /*margin: 0 0 0 15em;*/
    /*background:#9b59b6;*/
    background-color: rgb(216, 229, 239);
    padding: 30px 30px;
    height:auto;
  }
  .profile{
    text-align: center;
    /*border-bottom: 1px solid #CF9EE0;*/
    padding-bottom: 0px;
  }
  .profile img {
    width: 22%;
  }
  .profile h2{
    margin: 7px 0;
    color: #fff;
    font-size: 17px;
  }
  .profile p{
    font-size:14px;
    /*color:#D39EE8;*/
  }
  .skills {
    width: 85%;
    margin: 0 0 15px 0;
    height: 10px;
    background:#B57BCC;
    border-radius: 3px;
  }
  .main-grid3{
    margin:23px 0;
  }
  .bar p{
    /*color: #CF9EE0;*/
    font-size: 14px;
    margin: 0px 0 6px 0;
  }
  .skill1,.skill2 ,.skill3{
    height: 100%;
    display: block;
    background-color: #fff;
    border-radius: 3px;
  }
  .favourites ul{
    margin: 0;
    padding: 0;
  }
  .favourites ul li{
    display: inline-block;
    list-style-type: none;
    /*background: #fff;*/
    width: 31%;
    float: left;
    padding: 3px 0;
    /*border-right:1px solid #D6D2D2;*/
  }

  .favourites ul li a{
    text-decoration: none;
    /*color: #CF9ED9;*/
    font-size: 14px;
    text-align: center;
    padding-top: 32px;
    display: block;
    height: 23px;
  }
  .favourites ul li a.eye{
    background: url(../imgs/image-sprite.png) no-repeat 25px 8px;
  }

  .favourites ul li a.video{
    background: url(../imgs/image-sprite.png) no-repeat -80px 8px;
  }

  .favourites ul li a.favou{
    background: url(../imgs/image-sprite.png) no-repeat -185px 8px;
  }
  .favourites p{
    font-size:13px;
    color: #CF9ED9;
    text-align:center;
    margin: 19px 0;
    line-height:1.8em;
  }
  .facebook ul {
    margin:0;
    padding:0;
    text-align:center;
  }
  .facebook ul li {
    list-style-type:none;
    display:inline-block;
    margin:0 1px;
  }
  .facebook ul li a{
    width:30px;
    height:30px;
    display:block;
  }
  .facebook ul li a.icon1{
    /*background:url(../images/social.png) no-repeat 0px 0px;*/
  }
  .facebook ul li a.icon2{
    /*background:url(../images/social.png) no-repeat -30px 0px;*/
  }
  .facebook ul li a.icon3{
    /*background:url(../images/social.png) no-repeat -60px 0px;*/
  }
  .facebook ul li a.icon4{
    /*background:url(../images/social.png) no-repeat -90px 0px;*/
  }
  .facebook ul li a.icon5{
    /*background:url(../images/social.png) no-repeat -120px 0px;*/
  }
  .facebook ul li a:hover{
    opacity: .5;
  }
  .follow{
    text-align:center;
    width: 38%;
    margin:0 auto;
  }
  .follow a{
    padding: 10px 0px;
    font-size: 14px;
    color: #fff;
    text-decoration: none;
    background-color: #83bed6;
    /*border-bottom: 3px solid #B55BD8;*/
    display: block;
    text-transform: uppercase;
    transition: 0.5s all;
    -webkit-transition: 0.5s all;
    -moz-transition: 0.5s all;
    -o-transition: 0.5s all;
    -ms-transition: 0.5s all;
  }
  .follow a:hover{
    background-color: #73afc7;
    /*border-bottom: 3px solid #8438A2;*/
    transition: 0.5s all;
    -webkit-transition: 0.5s all;
    -moz-transition: 0.5s all;
    -o-transition: 0.5s all;
    -ms-transition: 0.5s all;
  }
  .facebook {
    margin-bottom: 18px;
  }
</style>
