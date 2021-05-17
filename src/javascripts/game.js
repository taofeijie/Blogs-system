// eslint-disable-next-line no-unused-vars
var game = {

}
function Sprite (x, y, width, height) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
}
function Game () {
  this.init = function (box) {
    var canvas = document.createElement('canvas')
    canvas.id = 'canvas'
    canvas.style.borderColor = 'black'
    canvas.style.borderWidth = '1px'
    canvas.width = box.clientWidth
    canvas.height = box.clientHeight
    box.appendChild(canvas)
  }
  // 可设置为私有变量
  var update = function (lastTime) {
    var thisTime = new Date().getTime()
    // 获取时间戳
    if (thisTime - lastTime >= 16) {
    //  调用更新当前坐标函数
    //  调用渲染函数
    }
    requestAnimationFrame(update)
    // setTimeout(() => {
    //   window.requestAnimationFrame()
    // })
  }
}

export default Game
