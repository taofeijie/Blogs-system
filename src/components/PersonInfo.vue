<template>
  <div id="personInfo_box">
    <div id="personInfo_classifi">
      <router-link class="pInfo_a" to="/personInfo/info"><div class="pInfo_item">个人信息</div></router-link>
      <router-link class="pInfo_a" to="/personInfo/account"><div class="pInfo_item">账号设置</div></router-link>
      <router-link class="pInfo_a" to="/personInfo/privecy"><div class="pInfo_item">隐私设置</div></router-link>
      <router-link class="pInfo_a" to="/personInfo/favorite"><div class="pInfo_item">我的收藏</div></router-link>
<!--      8.140.35.196-->
    </div>
    <div id="personInfo_view">
      <router-view name="personInfo"></router-view>
    </div>
  </div>
</template>

<script>

</script>

<style>
  #personInfo_box{
    position: relative;
    width: 100%;
    height: 100%;
    /*background-color: #ebccd1;*/
  }
  #personInfo_classifi{
    position: relative;
    width: 15%;
    height: 50%;
    border-radius: 2rem;
    background-color: white;
    overflow: hidden;
    float: left;
    /*margin-top: 2rem;*/
    /*margin-left: 2rem;*/
    left: 5%;
    top: 5%;
  }
  #personInfo_classifi ul{
    list-style: none;
  }
  .pInfo_item{
    width: 100%;
    height: 20%;
    text-align: center;
    border-radius: 1rem;
    line-height: 4rem;
  }
  .pInfo_item:hover{
    background-color: rgba(224,226,224,0.97);
    color: black;
  }
  .pInfo_a{
    text-decoration: none;
    color: #586e75;
  }
  #personInfo_view{
    /*float: left;*/
    width: 78%;
    height: 98%;
    /*background-color: white;*/
    position: relative;
    left: 22%;
    border-radius: 1rem;
    top:2%;
    /*margin-left: 1%;*/
  }
</style>
