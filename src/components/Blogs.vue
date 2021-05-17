<template>
  <div id="blogs">
<!--    <div id="classification">-->
<!--      <ul>-->
<!--        <li><div id="issue" class="classify_item" @click="issue">发帖</div></li>-->
<!--        <li><div class="classify_item">软件工程</div></li>-->
<!--        <li><div class="classify_item">计算机科学与技术</div></li>-->
<!--        <li><div class="classify_item">电子工程</div></li>-->
<!--        <li><div class="classify_item">信息工程</div></li>-->
<!--      </ul>-->
<!--    </div>-->
    <div id="blogs_items_box">
      <div class="blogs_item" v-for="(value) in blogs" :key="value._id" @click="toDetai" v-bind:title="value._id">
        <a class="blogs_portrait" href="#"><div class="blogs_item_portrait"></div></a>
        <div class="blogs_item_title" v-bind:title="value._id">{{value.title}}</div>
        <div class="blogs_item_title_assistent" v-bind:title="value._id">{{value.sub_title}}</div>
        <div class="blogs_item_date"><span class="blogs_date">{{new Date(value.date).toLocaleDateString()}}</span></div>
      </div>
    </div>
    <div id="recommendation">
      <div id="reco">
        <div id="hot_search">
          <div id="hot_search_title_box">热搜榜:</div>
          <div id="hot_search_box">
            <router-view name="hot_search"></router-view>
            <router-view name="hot_search"></router-view>
            <ol>
<!--              <router-link v-for="value in hotBlogs" :key="value._id" v-bind:to="'/detail/'+value._id" active-class="hot_search_li" tag="li"><div class="hot_search_item"><a href="#">{{value.title}}</a></div></router-link>-->
              <router-link v-for="value in hotBlogs" :key="value._id" v-bind:to="'/detail/'+value._id" active-class="hot_search_li" tag="li"><div class="hot_search_item">{{value.title}}</div></router-link>
            </ol>
          </div>
        </div>
        <div id="recentness">
          <div id="recentness_title_box">近期发布:</div>
          <div id="recentness_box">
            <router-view name="recent"></router-view>
            <ul>
              <router-link v-for="value in newBlogs" :key="value._id" v-bind:to="'/detail/'+value._id" active-class="recentness_li" tag="li"><div class="recentness_item">{{value.title}}</div></router-link>
            </ul>
          </div>
        </div>
        <div id="advertisement"><span style="color: #586e75;position: absolute;left: 10%;">广告推荐</span>
          <img src="../imgs/meizu1.jpg" alt="" height="90%" width="90%" style="border-radius: 1rem">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ajax} from '../javascripts/ajax'

export default {
  name: 'Blogs',
  data () {
    return {
      blogs: [],
      hotBlogs: [],
      newBlogs: [],
      params: this.$route.params.title
    }
  },
  created () {
  },
  mounted () {
    console.log('开始加载')
    console.log('参数params：', this.$route.params)
    console.log('参数query：', this.$route.query)
    if (this.$route.params.title === 'all') {
      this.params = ''
    }
    this.getBlogs()
    this.getHotBlogs()
    this.getNewBlogs()
  },
  beforeRouteUpdate (to, from, next) {
    this.params = to.params.title
    if (to.params.title === 'all') {
      this.params = ''
    }
    this.getBlogs()
    next()
  },
  methods:
    {
      stringToJson: function (string) {
        var arr = string.split('|')
        if (arr.length < 1) {
          return
        }
        arr.length -= 1
        for (var i = 0; i < arr.length; ++i) {
          arr[i] = JSON.parse(arr[i])
        }
        return arr
      },
      issue: function (e) {
      },
      getBlogs: function () {
        window.scrollTo(0, 0)
        if (this.params) {
          ajax({
            url: '/api/findBlogs',
            type: 'GET',
            data: {
              params: this.params
            }
          }, (response) => {
            // var arr = response.split('|')
            // arr.length -= 1
            // for (var i = 0; i < arr.length; ++i) {
            //   arr[i] = JSON.parse(arr[i])
            // }
            this.blogs = this.stringToJson(response)
            // this.blogs = arr
          })
        } else {
          ajax({
            url: '/api/blogs',
            type: 'get'
          }, (response) => {
            // var arr = response.split('|')
            // arr.length -= 1
            // for (var i = 0; i < arr.length; ++i) {
            //   arr[i] = JSON.parse(arr[i])
            // }
            // this.blogs = arr
            this.blogs = this.stringToJson(response)
          })
        }
      },
      getHotBlogs: function () {
        ajax({
          url: '/api/hotBlogs',
          type: 'GET'
        }, (response) => {
          // console.log(response)
          this.hotBlogs = this.stringToJson(response)
        })
      },
      getNewBlogs: function () {
        ajax({
          url: '/api/newBlogs',
          type: 'GET'
        }, (response) => {
          // console.log(response)
          this.newBlogs = this.stringToJson(response)
        })
      },
      toDetai: function (e) {
        // this.$router.push({path: `detail`, query: {blogId: e.target.title}})
        this.$router.push({path: `/detail/${e.target.title}`, params: {blogId: e.target.title}})
        // this.$router.push({name: 'blogDetail', params: {blogId: e.target.title}})
      }
    }
}
</script>

<style>
  #classification{
    /*border-top: 1px solid black;*/
    /*float: left;*/
    width: 100%;
    /*height: 50px;*/
    position: relative;
    margin-top: 1%;
    /*margin-bottom: -0.5rem;*/
  }
  #classification ul{
    /*border: 2px solid red;*/
    border-radius: 0.5rem;
    margin-top: 0%;
    position: relative;
    /*top: 10%;*/
    list-style: none;
    width: 96%;
    /*height: 100%;*/
    height: 40px;
    background-color: white;
  }
  #classification ul li{
    float: left;
    margin-top: 0;
    /*margin-left: 2rem;*/
    width: 15%;
    height: 100%;
    line-height: 2rem;
    /*border: 1px solid black;*/
    border-left: 1px dotted black;

    background-color: rgb(250,250,250);
  }
  #classification ul li:last-child{
    border-right: 1px dotted black;
  }
  #classification ul li:nth-child(2){
    background-color: rgb(240,240,240);
  }
  #classification ul li:nth-child(4){
    background-color: rgb(240,240,240);
  }
  #classification ul li:hover{
    cursor: pointer;
  }
  .classify_item{
    width: 100%;
    height: 100%;
    /*border: 1px solid green;*/
    text-align: center;
    color: #555555;
    /*border-radius: 0.5rem;*/
    /*line-height: 100%;*/
    font-weight: bold;
  }
  .classify_item:hover{
    background-color: white;
    font-size: 120%;
  }

  #blogs{
    /*border: aqua 1px solid;*/
    position: relative;
    width: 100%;
    /*可以将此处最小高度用js来获取当前浏览器界面的高度来自动设置，设置最小高度为保证推荐栏不会因为博客数量减少而压缩*/
    min-height: 620px;
    /*height: 100%;*/
    float: left;
    /*background-color: #ff8e09;*/
    /*display: none;*/
    /*margin-top: -0.5rem;*/
  }
  #blogs_items_box{
    width: 78%;
    /*height: 90%;*/
    /*margin-top: -0.8rem;*/
    float: left;
    /*background-color: black;*/
  }
  .blogs_item{
    /*border: black 1px solid;*/
    box-shadow: #b4deef 0px 0px 5px 1px;
    position: relative;
    width: 100%;
    height: 100px;
    float: left;
    border-radius: 1rem;
    margin-top: 0.5rem;
    background-color: white;
  }
  .blogs_item:hover{
    background-color: rgb(240,240,240);
    cursor: pointer;
    color: #BF360C;
  }
  .blogs_portrait{
    text-decoration: none;
  }
  .blogs_item_portrait{
    width: 3.5rem;
    height: 3.5rem;
    /*border: #00B7FF 1px solid;*/
    border-radius: 0.5rem;
    float: left;
    margin-top: 2%;
    margin-left: 1%;
    margin-right: 1%;
  }
  .blogs_item_title{
    font-size: 1.5rem;
    line-height: 2.2rem;
    width: 80%;
    /*border: aqua 1px solid;*/
    height: 30%;
    position: relative;
    top: 10%;
    overflow: hidden;
  }
  .blogs_item_title_assistent{
    font-size: 1.1rem;
    color: darkgrey;
    line-height: 1rem;
    position: relative;
    top: 20%;
    overflow: hidden;
    /*border: 1px solid black;*/
    width: 80%;
    height: 30%;
  }
  .blogs_item_date{
    position: absolute;
    right: 1%;
    top:40%;
    color: rgb(80,80,80);
  }
  #recommendation{
    position: absolute;
    right: 1%;
    top: 1%;
    /*display: inline-block;*/
    /*width: 15%;*/
    z-index: 2;
    width: 20%;
    height: 680px;
    float: left;
    /*border: yellow 1px solid;*/
    /*background-color: #ebccd1;*/
    margin-left: 0;
    transition: all 200ms;
  }
  #reco{
     position: absolute;
     top: 0%;
     width: 100%;
     height: 100%;
     /*margin-left: 3%;*/
     /*background-color: white;*/
     transition-duration: 500ms;
   }
  #hot_search{
    position: relative;
    /*left: 0;*/
    float: left;
    width: 100%;
    height: 30%;
    /*border:1px solid black;*/
    overflow: hidden;
    margin-top: 5%;
    border-radius: 5%;
    background-color: white;
    margin-left: 0;
  }
  #hot_search_title_box{
    margin-left: 5%;
    margin-top: 2%;
    font-size: 1.1rem;
    color: rgb(45,101,109);
    /*border: 1px solid yellow;*/
    height: 10%;
    float: left;

  }
  #hot_search_box{
    float: left;
    /*border: 1px solid yellow;*/
    width: 100%;
    height: 90%;
    overflow: hidden;
    overflow-y: scroll;
  }
  #hot_search_box ol{
    /*height: 95%;*/
    /*margin:0;*/
    /*border: 1px solid black;*/
    /*float: left;*/
  }
  .hot_search_item{
    overflow: hidden;
    width: 90%;
    /*height: 1rem;*/
    height: auto;
    font-size: 1rem;
    color: coral;
    /*color:coral;*/
  }
  .hot_search_item:hover{
    cursor: pointer;
    color: red;
  }
  .hot_search_li{
    margin-bottom: 3%;
    color: red;
  }

  #recentness{
    float: left;
    /*border: 1px solid yellow;*/
    width: 100%;
    height: 30%;
    margin-top: 5%;
    overflow: hidden;
    /*overflow-y: scroll;*/
    border-radius: 5%;
    background-color: white;
  }
  #recentness_title_box{
    margin-left: 5%;
    margin-top: 2%;
    font-size: 1.1rem;
    color: green;
    /*border: 1px solid yellow;*/
    height: 10%;
    float: left;
  }
  #recentness_box{
    float: left;
    /*border: 1px solid yellow;*/
    width: 100%;
    height: 90%;
    overflow: hidden;
    overflow-y: scroll;
  }
  #recentness ul{
    /*height: 75%;*/
    /*border: 1px solid black;*/

    /*overflow: hidden;*/
  }
  #recentness p{
    margin-left: 3%;
    font-size: 1.1rem;
    line-height: 0.4rem;
    color: green;
  }
  .recentness_item{
    overflow: hidden;
    width: 90%;
    color: green;
    /*height: 1rem;*/
    /*font-size: 1rem;*/
  }
  .recentness_item:hover{
    cursor: pointer;
    color: #ff8e09;
  }
  .recentness_li{
    margin-bottom: 3%;
  }

  #advertisement{
    /*border: brown 1px solid;*/
    float: left;
    width: 100%;
    height: 32%;
    position: relative;
    bottom: 0%;
    right: 0%;
    margin-top: 5%;
    border-radius: 5%;
    background-color: white;
  }
</style>
