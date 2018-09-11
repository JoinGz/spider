var charset = require('superagent-charset'); //解决乱码问题:
var superagent = require('superagent'); //发起请求 
charset(superagent);
var express = require('express');
var app = express();
let http = require('http')
let path = require('path')
app.use(/^\/api\/(.+)$/, function(req, res) {
  console.log(req.params['0']);
  // 判断req.query有木有参数有确定get还是post应该就ok
  superagent.get(`http://127.0.0.1:80/${req.params['0']}`).end((err, res2) => {
    console.log(res2.text)
    let json = JSON.parse(res2.text)
    res.json(json)
  })
});
app.use('/js',(req, res)=>{
  res.writeHead(200, {
    'Content-Type': 'application/x-javascript'
  })
  res.end("alert('NB')")
})
app.listen(3000,()=>{
  console.log("it's begining")
})