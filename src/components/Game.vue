<template>
  <div id="game">
<!--    <img src="http://8.140.35.196:3030/static/img/clever.5d82b3e.jpg" alt="">-->
    <canvas id="canvas"></canvas>
    <form action="/api/img" method="post" enctype="multipart/form-data">
      <input type="file" name="test">
      <input type="submit" @click="submit">
    </form>
  </div>
</template>

<script>
// import Game from '../javascripts/game'
export default {
  name: 'game',
  data () {
    return {}
  },
  mounted: function () {
    // var game = new Game()
    // game.update()
    // console.log(Game)
    // var canvas = document.getElementById('canvas')
    // canvas.width = document.getElementById('game').clientWidth
    // canvas.height = document.getElementById('game').clientHeight
    // var ctx = canvas.getContext('2d')
    // ctx.moveTo(0, 0)
    // ctx.beginPath()
    // ctx.strokeStyle = 'white'
    // ctx.lineTo(200, 0)
    // ctx.lineTo(0, 200)
    // ctx.lineTo(200, 200)
    // ctx.stroke()
    // ctx.beginPath()
    // ctx.moveTo(0, 0)
    // ctx.strokeStyle = 'red'
    // ctx.bezierCurveTo(200, 0, 0, 200, 200, 200)
    // ctx.stroke()
  },
  methods: {
    submit: function (e) {
      // e.preventDefault()
      // // console.log(document.forms[0])
      // var formData = new FormData(document.forms[0])
      // console.log(formData.get('test'))
    }
  }
}
</script>

<style>
#game{
  width: 100%;
  height: 100%;
  border: #ff8e09 1px solid;
}
</style>
