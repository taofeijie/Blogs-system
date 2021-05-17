<template>
  <div id="register_box">
        <form role="form">
          Portrait
          <div id="personInfo_portrait">
            <img src="" class="portrait_img" id="portrait_userEdit" alt="">
            <input type="file" @change="selectImg" id="file_input">
          </div>
          <div v-if="!user.usernameAvai" class="alert alert-danger">用户名重复，请更换用户名!</div>
          <div class="form-group">
            <label for="register_input_username">用户名</label>
            <input type="text" id="register_input_username" v-on:change="usernameVerify" v-model="user.username" aria-placeholder="用户名" class="form-control">
          </div>
          <div class="form-group input-group-sm">
            <label for="register_input_password">密码</label>
            <input type="password" id="register_input_password" v-model="user.password" aria-placeholder="密码" class="form-control">
          </div>
          <div v-if="!user.passwordAvai" class="alert alert-danger">两次密码不一致!</div>
          <div class="form-group">
            <label for="register_input_password_repeat">确认密码</label>
            <input type="password" v-on:change="passwordVerify" id="register_input_password_repeat" v-model="user.passwordRepeat" aria-placeholder="" class="form-control">
          </div>
          <div style="text-align: center">
            <input type="reset" class="btn btn-warning" aria-valuetext="重制">
            <button class="btn btn-success" @click="submit">Submit</button>
          </div>
        </form>
  </div>
</template>

<script>
import {ajax} from '../javascripts/ajax'
import 'bootstrap/dist/css/bootstrap.css'
export default {
  name: 'register',
  data () {
    return {
      user: {
        usernameAvai: true,
        passwordAvai: true,
        username: '',
        password: '',
        passwordRepeat: '',
        portrait: ''
      }
    }
  },
  mounted () {
    this.user.passwordAvai = true
    this.user.usernameAvai = true
  },
  methods: {
    usernameVerify: function (e) {
      ajax({
        url: '/api/usernameVerify',
        type: 'POST',
        data: {
          username: this.user.username
        }
      }, (response) => {
        if (response === 'successful') {
          this.user.usernameAvai = true
        } else {
          this.user.usernameAvai = false
        }
      })
    },
    passwordVerify: function (e) {
      if (this.user.password !== this.user.passwordRepeat) {
        this.user.passwordAvai = false
        this.user.passwordRepeat = ''
        document.getElementById('register_input_password_repeat').focus()
      } else {
        this.user.passwordAvai = true
      }
    },
    selectImg: function () {
      console.log(document.getElementById('file_input').files[0])
      var fileReader = new FileReader()
      fileReader.readAsDataURL(document.getElementById('file_input').files[0])
      fileReader.addEventListener('load', function () {
        // document.getElementsByClassName('portrait_img')[1].src = this.result
        document.getElementById('portrait_userEdit').src = this.result
      })
    },
    submit: function (e) {
      e.preventDefault()
      if (this.user.passwordAvai) {
        var formData = new FormData()
        formData.append('photo', document.getElementById('file_input').files[0])
        formData.append('username', this.user.username)
        formData.append('password', this.user.password)
        ajax({
          url: '/api/register',
          type: 'POST',
          dataNoParse: true,
          file: true,
          data: formData
        }, (response) => {
          if (response) {
            alert('注册成功')
          }
          // console.log(response)
        })
      }
      // console.log(document.getElementById('file_input').files[0])
      // ajax({
      //   url: '/api/setUser',
      //   type: 'POST',
      //   file: true,
      //   dataNoParse: true,
      //   data: formData
      // }, (response) => {
      //   ajax({
      //     url: '/api/getUser',
      //     type: 'POST'
      //   }, (response) => {
      //     if (response) {
      //       this.user = JSON.parse(response)
      //     }
      //   })
      // })
    }
  }
}
</script>

<style>
  #register_box{
    width: 35%;
    /*height: 100%;*/
    margin: 0 auto;
    border :1px solid red;
    padding: 30px;
    /*text-align: center;*/
    /*background-color: white;*/
    /*overflow-y: scroll;*/
  }
  #personInfo_portrait{
    margin: 0 auto;
    position: relative;
    top: 2%;
    width: 4.5rem;
    height: 4.5rem;
    border: gainsboro 1px solid;
    border-radius: 50%;
    transition: all 300ms;
    /*margin-left: 25%;*/
    overflow: hidden;
    /*float: left;*/
  }
  #personInfo_portrait:hover{
    /*border: #ebccd1 1px solid;*/
    /*border: rgba(153, 118, 124, 1) 1px solid;*/
    box-shadow: #586e75 0px 0px 3px 2px;
  }
  .portrait_img{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    /*height: 100%;*/
    /*z-index: 3;*/
  }
  #file_input{
    width: 100%;
    height: 100%;
    opacity: 0;
  }
  #file_input:hover{
    cursor: pointer;
  }
</style>
