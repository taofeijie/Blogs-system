<template>
  <div id="personInfo_account">
    <form role="form" id="form_account">
      <div v-if="!this.account.usernameAvai" class="alert alert-danger">用户名重复，请更换用户名!</div>
      <div class="form-group">
        <label for="account_username">用户名</label>
        <input type="text" id="account_username" aria-placeholder="用户名" @change="usernameVerify" v-model="account.username" class="form-control">
      </div>
      <div class="form-group">
        <label for="account_userId">用户ID</label>
        <input type="text" id="account_userId" disabled="disabled" aria-placeholder="用户id" v-model="account._id" class="form-control">
      </div>
      <div class="form-group input-group-sm">
        <label for="account_password">密码</label>
        <input type="password" id="account_password" aria-placeholder="密码" v-model="account.password" class="form-control">
      </div>
      <div v-if="!this.account.passwordAvai" class="alert alert-danger">两次密码不一致!</div>
      <div class="form-group">
        <label for="account_password_repeat">确认密码</label>
        <input type="password" id="account_password_repeat" @change="passwordVerify" v-model="account.passwordRepeat" aria-placeholder="" class="form-control">
      </div>
      <div class="form-group">
        <label for="account_phone">手机号</label>
        <input type="phone" id="account_phone" aria-placeholder="用户名" v-model="account.phone" class="form-control">
      </div>
      <div class="form-group">
        <label for="account_email">邮箱</label>
        <input type="email" id="account_email" aria-placeholder="用户名" v-model="account.email" class="form-control">
      </div>
      <div style="text-align: center">
        <input type="reset" class="btn btn-warning" aria-valuetext="重制">
        <button class="btn btn-success" @click="submit">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import {ajax} from '../../javascripts/ajax'
import {toLogin} from '../../javascripts/assist'

export default {
  name: 'register',
  data () {
    return {
      account: {
        username: '',
        _id: '',
        password: '',
        passwordRepeat: '',
        phone: '',
        email: '',
        usernameAvai: true,
        passwordAvai: true
      },
      usernameOri: ''
    }
  },
  mounted () {
    ajax({
      url: '/api/getUser',
      type: 'POST',
      data: {
        filter: JSON.stringify({account: 1})
      }
    }, (response) => {
      if (response === 'toLogin') {
        toLogin()
      } else {
        var account2 = JSON.parse(response).account
        // this.account = JSON.parse(response).account
        this.account.username = account2.username
        this.usernameOri = account2.username
        this.account._id = JSON.parse(response)._id
        this.account.phone = account2.phone
        this.account.email = account2.email
        this.account.password = ''
        this.account.passwordRepeat = ''
      }
    })
  },
  methods: {
    usernameVerify: function (e) {
      if (e.target.value !== this.usernameOri) {
        ajax({
          url: '/api/usernameVerify',
          type: 'POST',
          data: {
            username: this.account.username
          }
        }, (response) => {
          if (response === 'successful') {
            this.account.usernameAvai = true
          } else {
            this.account.usernameAvai = false
          }
        })
      } else {
        this.account.usernameAvai = true
      }
    },
    passwordVerify: function (e) {
      if (this.account.password !== this.account.passwordRepeat) {
        this.account.passwordAvai = false
        this.account.passwordRepeat = ''
        document.getElementById('account_password_repeat').focus()
      } else {
        this.account.passwordAvai = true
      }
    },
    submit: function (e) {
      e.preventDefault()
      if (this.account.passwordAvai && this.account.usernameAvai) {
        var accountObj = JSON.stringify({
          username: this.account.username,
          password: this.account.password,
          phone: this.account.phone,
          email: this.account.email
        })
        if (this.account.password === '') {
          accountObj = JSON.stringify({
            username: this.account.username,
            phone: this.account.phone,
            email: this.account.email
          })
        }
        ajax({
          url: '/api/setUser',
          type: 'POST',
          data: {
            account: accountObj,
            filter: 'account'
          }
        }, (response) => {
          console.log(response)
        })
      }
    }
  }
}
</script>

<style>
  #personInfo_account{
    width: 50%;
    height: 100%;
    position: absolute;
    overflow-y: scroll;
    /*border-radius: 2rem;*/
    background-color: #83bed6;
    padding: 30px;
  }
  #userId:hover{
    cursor: no-drop;
  }
  /*#info_input_box{*/
  /*  position: relative;*/
  /*  width: 100%;*/
  /*  height: 100%;*/
  /*  margin-top: 2%;*/
  /*  margin-left: 10%;*/
  /*  !*background-color: #00B7FF;*!*/
  /*}*/
  /*.input_container{*/
  /*  width: 100%;*/
  /*  height: 10%;*/
  /*  margin-top: 1%;*/
  /*  margin-left: 5%;*/
  /*  float: left;*/
  /*}*/
  /*.input_text{*/
  /*  border: none;*/
  /*  border-radius: 2rem;*/
  /*  outline: 0;*/
  /*  padding-left: 1rem;*/
  /*  width: 20%;*/
  /*  height: 60%;*/
  /*  border: #00B7FF 1px solid;*/
  /*}*/
  /*.input_text:hover{*/
  /*  box-shadow: blueviolet 0px 0px 1px 1px;*/
  /*}*/
  /*.personInfo_account_btn{*/
  /*  border: none;*/
  /*  border-radius: 1rem;*/
  /*  width: 7%;*/
  /*  height: 6%;*/
  /*  outline: 0;*/
  /*  margin-left: 15%;*/
  /*  position: relative;*/
  /*  !*top:-35%;*!*/
  /*  !*left:-10%;*!*/
  /*}*/
  /*.personInfo_account_btn:hover{*/
  /*  cursor: pointer;*/
  /*  box-shadow: blue 0px 0px 1px 1px;*/
  /*}*/
  /*#input_userId:hover{*/
  /*  cursor: no-drop;*/
  /*}*/
</style>
