function toLogin () {
  document.getElementById('login').style.transform = 'translateX(100%)'
  document.getElementById('theme').style.transform = 'translateX(13%)'
  document.getElementById('theme').addEventListener('click', function () {
    document.getElementById('login').style.transform = 'translateX(0%)'
    document.getElementById('theme').style.transform = 'translateX(0%)'
  })
}
function stringToJson (string) {
  var arr = string.split('|')
  if (arr.length < 1) {
    return
  }
  arr.length -= 1
  for (var i = 0; i < arr.length; ++i) {
    arr[i] = JSON.parse(arr[i])
  }
  return arr
}
export {
  toLogin,
  stringToJson
}
