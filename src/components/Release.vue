<template>
  <div id="issue_box">
    <div id="md_edit_box">
      <div id="md_edit_title">编辑区
        <div id="md_return" @click="back">返回</div>
      </div>
      <textarea name="" id="md_edit" cols="30" rows="10" @keyup="show" @click="cancleShow" v-model="edit_data"></textarea>
    </div>
    <div id="md_show_box">
      <div id="md_show_title">预览区
        <div id="md_issue" @click="getCategory">发布</div>
        <div id="md_revocation" @click="clear">撤销</div>
      </div>
      <div id="md_show" @click="cancleShow">
        <div id="write" @click="cancleShow" v-html="show_data"></div>
      </div>
    </div>
    <div id="md_attach" v-if="visble">
      <div id="main_title"><span>主标题：</span><input type="text" v-model="title"></div>
      <div id="sub_title"><span>副标题：</span><input type="text" v-model="sub_title"></div>
      <div id="classification">
        <span>&nbsp;&nbsp;类&nbsp;别：</span>
        <select name="" id="classification_select" @change="change">
          <option v-for="(value,key) in classifications" :key="key" value="key">{{key}}</option>
        </select>
      </div>
      <button id="ok" @click="issue">确认</button>
    </div>
  </div>
</template>

<script type="module">
import {ajax} from '../javascripts/ajax'
import {toLogin} from '../javascripts/assist'
// import {markdown} from '../javascripts/markdown'
export default {
  name: 'release',
  data () {
    return {
      classifications: {},
      visble: false,
      edit_data: '',
      show_data: '',
      title: '',
      sub_title: '',
      selectedClassi: '软件工程'
    }
  },
  mounted () {
    ajax({
      url: '/api/getBlogNoIssue',
      type: 'POST'
    }, (response) => {
      if (response === 'toLogin') {
        toLogin()
      } else {
        this.edit_data = response
        this.show()
      }
    })
    var mdEdit = document.getElementById('md_edit')
    mdEdit.addEventListener('dragover', function (e) {
      e.preventDefault()
    })
    mdEdit.addEventListener('drop', (e) => {
      e.preventDefault()
      // console.log(e.dataTransfer.files[0])
      if (e.dataTransfer.files[0].size < 1048576) {
        if (e.dataTransfer.files[0].type === 'image/jpeg' || e.dataTransfer.files[0].type === 'image/png') {
          var formData = new FormData()
          formData.append('test', e.dataTransfer.files[0])
          ajax({
            url: '/api/img',
            type: 'POST',
            file: true,
            dataNoParse: true,
            data: formData
          }, (response) => {
            this.edit_data += '![alt 本地图片](http://8.140.35.196:3030/' + response + ')'
            this.show()
          })
          // 根据拖放图片信息创建图片
          // let fr = new FileReader()
          // fr.readAsDataURL(e.dataTransfer.files[0])
          // fr.addEventListener('load', (e) => {
          //   // var result = this.result
          //   // console.log(e)
          //   let img = document.createElement('img')
          //   img.src = this.result
          //   // document.getElementById('md_show').appendChild(img)
          //   // 上传图片至服务器，返回图片路径
          //   mdEdit.innerText += '![alt 本地图片](图片地址)'
          // })
        } else {
          alert('图片格式不正确')
        }
      } else {
        alert('尺寸过大')
      }
    })
  },
  methods: {
    show: function (e) {
      // var html = markdown.toHTML(this.edit_data)
      // this.show_data = html
      ajax({
        url: '/api/generateMarkdown',
        type: 'POST',
        data: {
          data: this.edit_data
        }
      }, (response) => {
        // console.log(response)
        this.show_data = response
        // console.log(html)
      })
      // console.log(html)
    },
    getCategory: function (e) {
      ajax({
        url: '/api/getCategory',
        type: 'GET'
      }, (res) => {
        if (res === 'toLogin') {
          toLogin()
        } else {
          this.classifications = JSON.parse(res)
          this.visble = true
        }
      })
    },
    cancleShow: function (e) {
      this.visble = false
    },
    clear: function (e) {
      this.edit_data = ''
      this.show_data = ''
    },
    issue: function (e) {
      ajax({
        url: '/api/issue',
        type: 'POST',
        data: {
          content: this.edit_data,
          title: this.title,
          sub_title: this.sub_title,
          imgs: [],
          category: this.selectedClassi
        }
      }, (res) => {
        if (res === 'successful') {
          alert('发布成功!')
          this.visble = false
        }
      })
    },
    change: function (e) {
      this.selectedClassi = e.target.options[e.target.selectedIndex].innerText
    },
    back: function (e) {
      // this.$router.push({name: 'home'})
      this.$router.back()
    }
  }
}
</script>

<!--<style src="../styles/cobalt.css"></style>-->
<style src="../styles/gitlab.css"></style>
<style>
  .markdown-body {
    box-sizing: border-box;
    min-width: 200px;
    max-width: 980px;
    margin: 0 auto;
    padding: 45px;
  }

  @media (max-width: 767px) {
    .markdown-body {
      padding: 15px;
    }
  }
  #issue_box{
    width: 100%;
    height: 100%;
    /*border: 1px solid black;*/
    text-align: center;
  }
  #md_edit_box{
    width: 50%;
    height: 100%;
    float: left;
    border: #6952b6 1px solid;
    /*background-color: #009689;*/
    position: relative;
  }
  #md_edit_title{
    width: 100%;
    height: 10%;
    color: white;
    color: #586e75;
    font-weight: bolder;
    font-size: 1.3rem;
    line-height: 4rem;
    position: relative;
    /*border-right: #009689 1px solid;*/
  }
  #md_show_title{
    width: 100%;
    height: 10%;
    color: deeppink;
    font-weight: bolder;
    font-size: 1.3rem;
    line-height: 4rem;
    position: relative;
    /*transform: translateX(40%);*/
    /*float: left;*/
    /*border-left: #009689 1px solid;*/

  }
  #md_show_box{
    width: 50%;
    height: 100%;
    float: left;
    /*background-color: yellow;*/
    position: relative;
    text-align: center;
  }
  #md_edit{
    width: 98%;
    height: 89%;
    outline: 0;
    font-weight: bold;
    font-size: 1rem;
    overflow-y: scroll;
    border: none;
  }
  #md_show{
    width: 98%;
    height: 89%;
    /*border: 1px solid green;*/
    /*float: right;*/
    margin: 0 auto;
    overflow-y: scroll;
    background: none;
    background-color: white;
    /*background-color: #131b29;*/
    position: relative;
  }
  #md_show img{
    max-width: 100%;
  }
  #md_return{
    position: absolute;
    /*float: right;*/
    width: 13%;
    height: 60%;
    background-color: green;
    top: 20%;
    left: 5%;
    line-height: 2.5rem;
    border-radius: 10%;
    color: white;
    margin-right: 3%;
    font-size: 1.2rem;
  }
  #md_return:hover{
    cursor: pointer;
  }
  #md_issue{
    position: absolute;
    float: right;
    width: 13%;
    height: 60%;
    background-color: green;
    top: 20%;
    right: 0%;
    line-height: 2.5rem;
    border-radius: 10%;
    color: white;
    margin-right: 3%;
    font-size: 1.2rem;
  }
  #md_issue:hover{
    cursor: pointer;
  }
  #md_revocation{
    /*float: right;*/
    position: absolute;
    width: 13%;
    height: 60%;
    background-color: #268bd2;
    top: 20%;
    right: 16%;
    margin-right: 5%;
    line-height: 2.5rem;
    border-radius: 10%;
    color: white;
    font-size: 1.2rem;
  }
  #md_revocation:hover{
    cursor: pointer;
  }
  #md_attach{
    width: 50%;
    height: 50%;
    position: absolute;
    left: 25%;
    top: 25%;
    border: #268bd2 1px solid;
    background-color: #009688;
    transition: all 500ms;
    text-align: center;
    /*display: none;*/
    /*visibility: hidden;*/
  }
  #main_title{
    width: 80%;
    height: 15%;

    margin: 5% auto;
  }
  #sub_title{
    width: 80%;
    height: 15%;

    margin: 5% auto;
  }
  #md_attach input{
    width: 80%;
    height: 100%;
    outline: 0;
    font-size: 1.2rem;
    font-weight: bold;
    transition: all 200ms;
    border: none;
    border-radius: 1rem;
    padding-left: 1rem;
  }
  #classification{
    width: 80%;
    height: 15%;
    margin: 5% auto;
  }
  #ok{
    width: 15%;
    height: 12%;
    border: none;
    border-radius: 0.7rem;
    font-size: 1.3rem;
    outline: 0;
  }
  #ok:hover{
    cursor: pointer;
  }
  #classification_select{
    width: 80%;
    height: 100%;
    outline: 0;
    font-size: 1rem;
    font-weight: bold;
    transition: all 200ms;
    border: none;
    border-radius: 1rem;
    text-align: center;
    /*padding-left: 1rem;*/
  }
</style>
