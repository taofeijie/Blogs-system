<template>
  <div id="personInfo_info" class="container">
    <form action="#" role="form" id="form_info">
      <div id="personInfo_portrait"><img v-bind:src="portrait" class="portrait_img" alt=""><input type="file" @change="selectImg" id="file_input"></div>
      <div class="form-group">
        <label for="info_nickname">昵称:</label>
        <input type="text" id="info_nickname" aria-placeholder="" v-model="user.nickname" class="form-control">
      </div>
      <div class="form-group input-group-sm">
        <label for="info_name">真实姓名:</label>
        <input type="text" id="info_name" aria-placeholder="" v-model="user.name" class="form-control">
      </div>
      <div class="form-group">
        <label for="info_gender">性别：</label>
        <input type="text" id="info_gender" aria-placeholder="" v-model="user.gender" class="form-control">
      </div>
      <div class="form-group">
        <label for="info_birthday">出生日期：</label>
        <input type="date" id="info_birthday" aria-placeholder="" v-model="user.birthday" class="form-control">
      </div>
      <div class="form-group">
        <label for="info_age">年龄：</label>
        <input type="text" id="info_age" aria-placeholder="" v-model="user.age" class="form-control">
      </div>
      <div class="form-group">
        <label for="info_school">学校：</label>
        <input type="text" id="info_school" aria-placeholder="" v-model="user.school" class="form-control">
      </div>
      <div class="form-group">
        <label for="info_college">学院：</label>
        <input type="text" id="info_college" aria-placeholder="" v-model="user.college" class="form-control">
      </div>
      <div class="form-group">
        <label for="info_major">专业：</label>
        <input type="text" id="info_major" aria-placeholder="" v-model="user.major" class="form-control">
      </div>
      <div class="form-group">
        <label for="info_grade">年级：</label>
        <input type="text" id="info_grade" aria-placeholder="" v-model="user.grade" class="form-control">
      </div>
      <div class="form-group">
        <label for="info_class">班级：</label>
        <input type="text" id="info_class" aria-placeholder="" v-model="user.class" class="form-control">
      </div>
      <div style="text-align: center">
        <button class="btn btn-success" @click="submit">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import {ajax} from '../../javascripts/ajax'
import {toLogin} from '../../javascripts/assist'
// import 'bootstrap/dist/css/bootstrap.css'

export default {
  name: 'personInfo_Info',
  data () {
    return {
      user: {
        nickname: '',
        name: '',
        gender: '',
        birthday: '',
        age: '',
        school: '',
        college: '',
        major: '',
        grade: '',
        class: '',
        portrait: ''
      },
      portrait: ''
    }
  },
  mounted () {
    ajax({
      url: '/api/getUser',
      type: 'POST',
      data: {
        filter: JSON.stringify({general: 1})
      }
    }, (response) => {
      if (response === 'toLogin') {
        toLogin()
      } else {
        // console.log(response)
        this.user = JSON.parse(response).general
        // this.user.portrait = 'http://8.140.35.196:3030/' + this.user.portrait
        this.portrait = 'http://8.140.35.196:3030/' + this.user.portrait
        console.log(this.user)
        // this.user = JSON.parse(response)
        // this.user.portrait = 'http://8.140.35.196:3030/' + this.user.portrait
        // document.getElementsByClassName('portrait_img')[0].src = 'http://8.140.35.196:3030/' + this.user.portrait
      }
    })
  },
  methods: {
    submit: function (e) {
      e.preventDefault()
      console.log(document.getElementById('file_input').files[0])
      if (document.getElementById('file_input').files[0]) {
        var fileReader = new FileReader()
        fileReader.readAsDataURL(document.getElementById('file_input').files[0])
        fileReader.addEventListener('load', function () {
          document.getElementById('userPortrait').src = this.result
        })
      }
      var formData = new FormData()
      formData.append('photo', document.getElementById('file_input').files[0])
      formData.append('user', JSON.stringify(this.user))
      formData.append('filter', 'general')
      ajax({
        url: '/api/setUser',
        type: 'POST',
        file: true,
        dataNoParse: true,
        data: formData
      }, (response) => {
        console.log(response)
        // ajax({
        //   url: '/api/getUser',
        //   type: 'POST'
        // }, (response) => {
        //   if (response) {
        //     this.user = JSON.parse(response)
        //   }
        // })
      })
    },
    selectImg: function () {
      console.log(document.getElementById('file_input').files[0])
      var fileReader = new FileReader()
      fileReader.readAsDataURL(document.getElementById('file_input').files[0])
      fileReader.addEventListener('load', function () {
        document.getElementsByClassName('portrait_img')[1].src = this.result
      })
    }
  }
}
</script>

<!--<style src="./src/styles/bootstrap.min.css"></style>-->
<style>
  #personInfo_info{
    width: 50%;
    height: 100%;
    /*text-align: center;*/
    overflow-y: scroll;
    /*position: relative;*/
    position: absolute;
    margin-top: 0;
    background-color: #83bed6;
    padding: 30px;
  }
  #personInfo_portrait{
    position: relative;
    top: 2%;
    width: 4.5rem;
    height: 4.5rem;
    border: #183d2d 1px solid;
    border-radius: 50%;
    margin: 0 auto;
    overflow: hidden;
    /*float: left;*/
  }
  #personInfo_portrait:hover{
    /*border: #ebccd1 1px solid;*/
    /*border: rgba(153, 118, 124, 1) 1px solid;*/
    box-shadow: #586e75 0px 0px 3px 2px;
  }
  #file_input{
    width: 100%;
    height: 100%;
    opacity: 0;
  }
  #file_input:hover{
    cursor: pointer;
  }
  .portrait_img{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
</style>
