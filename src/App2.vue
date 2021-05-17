<template>
  <div id="app">
    <div id="navigation">
      <div id="sub_navigation">
        <router-link to="/"><div class="flag">Hello Blogs</div></router-link>
        <div id="search">
          <input id="search_input" @keydown="search" v-model="searchText" type="text">
          <router-link id="search_btn" tag="input" value="search" type="button" v-bind:to="(searchText==''?'/':'/blogs/'+searchText)">search</router-link>
        </div>
        <div id="navi_ul_box">
          <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/release">Release</router-link></li>
<!--            <li><a href="#">Login</a></li>-->
          </ul>
        </div>
      </div>
    </div>
    <div id="login" v-on:mouseleave="loginHidden">
      <div id="init_login" v-if="isLogin">
        <p>Welcome</p>
        <div id="login_input_box">
          <input type="text" id="name_input" name = ""  v-model="name" autocomplete="off" placeholder="user name">
          <input type="password" id="pwd_input" name = "" v-model="password" placeholder="password" >
          <span id="register"><router-link to="/register">点击注册</router-link></span>
          <button id="login_btn" @click="login">登录</button>
        </div>
      </div>
      <div id="tips"  v-on:mouseover="loginShow"></div>
      <div id='sub_login' v-if="!isLogin">
        <div id='portrait' style='overflow: hidden'>
          <img v-bind:src="user.account.portrait" id="userPortrait" class="portrait_img" alt="">
          <!--      portrait-->
          <!--      <img src="../imgs/clever.jpg" style="" width="100%" height="100%" alt="">-->
        </div>
        <p id="nickname">{{info.nickname}}</p>
        <div id="level">等级：{{info.level}}</div>
        <div id="social">
          <div id="fans">
            {{info.fans.length}}
            <p>粉丝</p>
          </div>
          <div id="favorites">
            {{info.favorites.length}}
            <p>关注</p>
          </div>
          <div id="praises">
            {{info.praises}}
            <p>获得的赞</p>
          </div>
        </div>
        <div id="temp1">
          <ul id="list_login">
            <li><router-link to="/personInfo/info">个人中心</router-link></li>
            <li><router-link to="/blogsManager">内容管理</router-link></li>
            <li><a href="#">浏览记录</a></li>
            <li><a href="#">我的消息</a></li>
            <li><a id="login_exit" @click="login_exit" href="#">退出</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div id="theme"><router-view name="theme"></router-view></div>
  </div>
</template>

<script type="module">
import {ajax} from './javascripts/ajax'
export default {
  name: 'App',
  data () {
    return {
      user: {},
      name: '',
      password: '',
      searchText: '',
      info:
        {
          fans: [],
          favorites: [],
          praises: 0,
          level: 1
        },
      isLogin: true
    }
  },
  mounted () {
    document.body.style.backgroundColor = 'rgba(243, 244, 245, 1)'
    this.init()
  },
  methods: {
    login: function (e) {
      if (this.name !== '' && this.password !== '') {
        ajax({
          url: '/api/login',
          type: 'POST',
          data: {
            username: this.name,
            password: this.password
          }
        }, (res) => {
          if (res) {
            this.user = JSON.parse(res)
            this.info = this.user.blogs
            // console.log(this.user)
            // console.log(this.info)
            // this.info.portrait = 'http://8.140.35.196:3030/' + this.user.general.portrait
            this.user.account.portrait = 'http://8.140.35.196:3030/' + this.user.general.portrait
            this.isLogin = false
          }
        })
      }
    },
    loginShow: function (e) {
      document.getElementById('login').style.transform = 'translateX(100%)'
      document.getElementById('theme').style.transform = 'translateX(13%)'
    },
    loginHidden: function (e) {
      document.getElementById('login').style.transform = 'translateX(0%)'
      document.getElementById('theme').style.transform = 'translateX(0%)'
    },
    login_exit: function (e) {
      ajax({
        url: '/api/exit',
        type: 'get'
      }, () => {
        this.isLogin = true
      })
    },
    init: function () {
      ajax({
        url: '/api/login',
        type: 'POST'
      }, (res) => {
        if (res) {
          this.user = JSON.parse(res)
          this.info = this.user.blogs
          // console.log(this.user)
          // console.log(this.user)
          // console.log(this.info)
          this.user.account.portrait = 'http://8.140.35.196:3030/' + this.user.general.portrait
          this.isLogin = false
        }
      })
      document.getElementById('pwd_input').addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
          this.login()
        }
      })
    },
    search: function (e) {
      if (e.keyCode === 13) {
        document.getElementById('search_btn').click()
      }
    }
  }
}
</script>

<!--<style src="./styles/cobalt.css"></style>-->
<!--<style src="./styles/gitlab.css"></style>-->
<style>
  #app{
    /*-moz-osx-font-smoothing: grayscale;*/
    /*-webkit-font-smoothing: antialiased;*/
    position: absolute;
    left: 0;
    top: 0;
    margin: 0 0;
    padding: 0 0;
    width: 100%;
    height: 100%;
    /*overflow-y: visible;*/
    /*float: left;*/
    /*overflow: hidden;*/
    /*border: #42b983 1px solid;*/

  }
  #navigation{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 6;
    height: 10%;
    /*border: 1px solid black;*/
  }
  #login{
    position: fixed;
    top: 0%;
    left: -15%;
    float: left;
    display: inline-block;
    width: 15%;
    height: 100%;
    margin-left: -0%;
    /*border: 1px solid rebeccapurple;*/
    /*background-color: #00B7FF;*/
    background-color: rgba(82, 116, 166, 1);
    /*overflow-y: hidden;*/
    /*transform: translateX(-100%);*/
    transition: all 200ms;
    z-index: 3;
  }
  #theme{
    position: absolute;
    left: 2%;
    top: 10%;
    float: left;
    display: inline-block;
    width: 98%;
    height: 90%;
    /*border: 1px solid red;*/
    margin-left: 0;
    transition: all 200ms;
    /*background-color: #ff8e09;*/
    /*transform: translateX(0%);*/
  }
  #sub_navigation{
    position: relative;
    width: 100%;
    height: 100%;
    float: left;
    background-color: #586e75;
    z-index: 3;
  }
  .flag{
    color: white;
    font-weight: bold;
    font-weight: bolder;
    font-family: "Arial Black";
    font-size: 2rem;
    position: absolute;
    left: 0;
    line-height: 2.5rem;
  }
  #search{
    position: relative;
    float: left;
    /*border: white 1px solid;*/
    width: 60%;
    height: 100%;
    /*text-align: center;*/
  }
  #search_input{
    position: relative;
    border-radius: 1rem;
    width: 30%;
    height: 50%;
    /*margin-left: 20%;*/
    display: inline-block;
    float: left;
    top:20%;
    left: 40%;
    border: none;
    outline: 0;
    padding-left: 1rem;
  }

  #search_btn:hover{
    cursor: pointer;
  }
  #search_btn{
    position: relative;
    border-radius: 1rem;
    width: 10%;
    height: 60%;
    top: 20%;
    left: 40%;
    font-size: 1rem;
    display: inline-block;
    border: none;
    margin-left: 1%;
    outline: 0;
    /*float: left;*/
  }
  #navi_ul_box{
    float: left;
    height: 100%;
    margin-left: -3%;
  }
  #navi_ul_box ul{
    list-style: none;
    /*margin: 0;*/
  }
  #navi_ul_box ul li{
    float: left;
    margin-right: 2rem;
    /*控制导航栏文字上下剧中*/
    margin-top: 10%;
  }
  #navi_ul_box ul li a{
    text-decoration: none;
    color: rgb(230,230,230);
    font-weight: bold;
  }
  #navi_ul_box ul li a:hover{
    color: white;
  }
  #init_login{
    text-align: center;
    width: 100%;
    height: 90%;
    position: relative;
    top: 10%;
    /*在此有一疑问，为何加上边框之后页面下方便没有多处的区域。不加上边框，便具有多出的区域。*/
    border: rgba(0,0,0,0) 1px solid;
    /*left: -50%;*/
    /*margin-top: 16%;*/
    /*margin-top: 0;*/
    /*overflow: hidden;*/
  }
  #init_login p{
    color: white;
    font-weight: bold;
    font-size: 2.5rem;
    height: 15%;
    /*border: #2c3e50 1px solid;*/
    margin-top: 20%;
  }
  #login_input_box{
    width: 100%;
    height: 67%;
    position: relative;
    /*border: #ff8e09 1px solid;*/
    /*margin-top: 0;*/
  }
  .portrait_img{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  #name_input{
    border-radius: 1rem;
    width: 80%;
    height: 10%;
    border: none;
    outline: 0;
    padding-left: 1rem;
    /*font-weight: bold;*/
    font-size: 1rem;
  }
  #pwd_input{
    margin-top: 10%;
    border-radius: 1rem;
    width: 80%;
    height: 10%;
    border: none;
    outline: 0;
    padding-left: 1rem;
    /*font-weight: bold;*/
    font-size: 0.9rem;
  }
  #register{
    display: block;
    position: relative;
    text-align: right;
    margin-right: 10%;
  }
  #register a{
    text-decoration: none;
    color: white;
    font-size: 0.9rem;
    transition: all 300ms;
  }
  #register a:hover{
    color: #00B7FF;
  }
  #login_btn{
    border: none;
    width: 50%;
    height: 10%;
    margin-top: 5%;
    border-radius: 2rem;
    background-color: #ff8e09;
    font-size: 1rem;
    outline: 0;
    transition: all 300ms;
  }
  #login_btn:hover{
    background-color: white;
    cursor: pointer;
  }
  #tips{
    width: 12%;
    height: 12%;
    /*border: 1px solid black;*/
    border-radius: 2rem;
    position: absolute;
    right: -13%;
    /*left: 0;*/
    z-index: 3;
    top:33%;
    text-align: center;
    /*text-shadow: 1px 1px 2px 5px black;*/
    overflow: hidden;
    box-shadow: 0px 0px 10px 3px purple;
    transition: all 200ms;
  }
  #tips:hover{
    cursor: default;
  }
  #sub_login{
    text-align: center;
    position: relative;
    width: 100%;
    height: 100%;
    /*background-color: green;*/
    margin-top: 0;
    float: left;
    color: white;
    z-index: 10;
    transition-duration: 500ms;
    /*display: none;*/
    /*visibility: hidden;*/
  }
  #portrait{
    border: aqua 1px solid;
    position: relative;
    border-radius: 3rem;
    width: 6rem;
    height: 6rem;
    margin: 0 auto;
    margin-top: 6rem;
    /*top: 30%;*/
  }
  #social{
    position: relative;
    width: 100%;
    height: 4rem;
    margin-top: 1rem;
    /*border: 1px solid yellow;*/
  }
  #social p{
    margin-top: -5%;
  }
  #fans{
    position: relative;
    float: left;
    width: 33%;
  }
  #favorites{
    position: relative;
    float: left;
    width: 33%;
  }
  #praises{
    position: relative;
    float: left;
    width: 33%;
  }
  #temp1{
    /*border: blue 1px solid;*/
    width: 100%;
    /*height: 50%;*/
    position: relative;
  }
  #list_login{
    margin: 0 auto;
    margin-top: 12%;
    list-style: none;
  }
  #list_login li{
    /*font-size: 1.5rem;*/
    /*margin-bottom: 1.7rem;*/
    margin-left: -2.5rem;
  }
  #list_login li:hover{
    transform: scale(1.5);
    transition-duration: 200ms;
  }
  #list_login li a{
    text-decoration: none;
    color: white;
  }
  #list_login li a:hover{
    /*margin-left: 2rem;*/
    /*font-size: 2rem;*/
  }
  #tips{
    width: 12%;
    height: 12%;
    /*border: 1px solid black;*/
    border-radius: 2rem;
    position: absolute;
    right: -13%;
    /*left: 0;*/
    top:40%;
    text-align: center;
    /*text-shadow: 1px 1px 2px 5px black;*/
    overflow: hidden;
    box-shadow: 0px 0px 10px 3px purple;
  }
  #tips:hover{
    cursor: default;
  }
</style>
