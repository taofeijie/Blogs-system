<template>
  <div id="blogsManagerBox">
    <div id="blogs_items_box1">
      <div class="blogs_item1" v-for="(value) in blogs" :key="value._id" @click="toDetai" v-bind:title="value._id">
        <button class="btn btn-danger blogs_delete" @click="toDetailElse" v-bind:title="value._id">删除</button>
        <button v-if="value.isIssue === 'true'" class="btn btn-success blogs_isIssue" @click="toDetailElse">已发布</button>
        <button v-else class="btn btn-warning blogs_isIssue" @click="toDetailElse">未发布</button>
        <div class="sign_span" @click="toDetailElse">分类：{{value.category}}  访问量： <span class="label label-default">{{value.visits}}</span>  评论数量：{{value.comments.length}}</div>
        <a class="blogs_portrait" href="#"><div class="blogs_item_portrait"></div></a>
        <div class="blogs_item_title" v-bind:title="value._id">{{value.title}}</div>
        <div class="blogs_item_title_assistent" v-bind:title="value._id">{{value.sub_title}}</div>
        <div class="blogs_item_date"><span class="blogs_date">{{new Date(value.date).toLocaleDateString()}}</span></div>
      </div>
    </div>
  </div>
</template>

<script>
import {ajax} from '../javascripts/ajax'

export default {
  name: 'blogsManager',
  data () {
    return {
      blogs: []
    }
  },
  mounted () {
    this.getBlogs()
  },
  methods: {
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
    getBlogs: function () {
      window.scrollTo(0, 0)
      ajax({
        url: '/api/getUserBlogs',
        type: 'POST',
        data: {
          params: this.params
        }
      }, (response) => {
        if (response) {
          this.blogs = this.stringToJson(response)
        }
      })
    },
    toDetai: function (e) {
      // this.$router.push({path: `detail`, query: {blogId: e.target.title}})
      this.$router.push({path: `/detail/${e.target.title}`, params: {blogId: e.target.title}})
      // this.$router.push({name: 'blogDetail', params: {blogId: e.target.title}})
    },
    toDetailElse: function (e) {
      e.stopPropagation()
      if (e.target.innerText === '删除') {
        console.log(e.target.title)
        ajax({
          url: '/api/deleteBlog',
          type: 'POST',
          data: {
            blogId: e.target.title
          }
        }, (response) => {
          if (response === 'successful') {
            this.getBlogs()
          }
        })
      }
    }
  }
}
</script>

<style>
  #blogsManagerBox{
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
  #blogs_items_box1{
    width: 70%;
    /*height: 90%;*/
    /*margin-top: -0.8rem;*/
    float: left;
    /*background-color: black;*/
  }
  .blogs_delete{
    position: absolute;
    right: -10%;
    top: 30%;
  }
  .blogs_isIssue{
    position: absolute;
    right: -20%;
    top: 30%;
  }
  .sign_span{
    /*border: #83bed6 2px solid;*/
    position: absolute;
    width: 400px;
    left: 125%;
    top: 39%;
  }
  .blogs_item1{
    /*border: black 1px solid;*/
    position: relative;
    width: 80%;
    box-shadow: #b4deef 0px 0px 5px 1px;
    height: 100px;
    float: left;
    border-radius: 1rem;
    margin-top: 0.5rem;
    background-color: white;
  }
  .blogs_item1:hover{
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
