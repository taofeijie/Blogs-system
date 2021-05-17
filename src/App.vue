<template>
  <div id="app">
    <div id="right" v-on:mouseenter="show" v-on:mouseleave="hidden"></div>
    <div id="left"></div>
    <div id="center"></div>
  </div>
</template>

<script type="module">
export default {
  name: 'sub_app',
  data () {
    return {}
  },
  methods: {
    show: function (e) {
      // e.target.style.left = '5%'
      // // e.target.style.transform = 'translateX(50%)'
      document.getElementById('app').removeChild(document.getElementById('left'))
      // console.log(e.target)
    },
    hidden: function (e) {
      // e.target.style.left = '0%'
      var left = document.createElement('div')
      left.id = 'left'
      document.getElementById('app').insertBefore(left, document.getElementById('center'))
      // e.target.style.transform = 'translateX(0%)'
    }
  }
}
</script>

<style>
  #app{
    width: 100%;
    height: 100%;
  }
  #left{
    width: 398px;
    height: 500px;
    background-color:cadetblue;
    position: relative;
    z-index: 3;
    transition: all 500ms;
    top: 0%;
    left: 0%;
    display: inline-block;
  }
  #center{
    width: 200px;
    transition: all 500ms ease-out;
    height: 550px;
    position: relative;
    top:0;
    background-color: #ff8e09;
    display: inline-block;
  }
  #right{
    position: absolute;
    right: 50px;
    top: 50px;
    background-color: #ff8e09;
    width: 100px;
    height: 100px;
  }
</style>
