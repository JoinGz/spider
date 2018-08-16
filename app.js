var cheerio = require('cheerio'); //可以像jquer一样操作界面
var charset = require('superagent-charset'); //解决乱码问题:
var superagent = require('superagent'); //发起请求 
charset(superagent);
var async = require('async'); //异步抓取
var express = require('express');
var eventproxy = require('eventproxy'); //流程控制
var ep = eventproxy();
var app = express();
let http = require('http')
let path = require('path')

var baseUrl = 'http://www.dytt8.net'; //迅雷首页链接
var newMovieLinkArr = []; //存放新电影的url
var errLength = []; //统计出错的链接数
var highScoreMovieArr = [] //高评分电影

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
let highMove
let hightMove = ($) => {
  let url = baseUrl + $('.co_content2').eq(1).children('ul').eq(0).children('a').eq(0).attr('href');
  console.log(url)
  superagent.get(url).charset('gb2312').end((err, res) => {
    if (err) {
      console.log('抓取' + page + '这条信息的时候出错了')
      return next(err)
    }
    let $ = cheerio.load(res.text)
    // 直接把里面的html全部拿过来了
    let p = $("#Zoom span font").html()
    // console.log('----');
    // highScoreMovieArr.length = 20
    // console.log(typeof p)
    highMove = p
  })
}
let move = ($) => {
  // 所有左边栏目的链接
  let a = $('.co_content2').eq(1).children('ul').eq(0).children('a');
  // 我们就抓4个，嘿嘿，要抓完就是 a.length-1
  for (let i = 2, l = 5; i <= l; i++) {
    // 获取每一个的url
    let url = baseUrl + a.eq(i).attr('href');
    if (newMovieLinkArr.indexOf(url) == -1) {
      // 存入数组
      newMovieLinkArr.push(url)
    }
  }
}
// 进入go就是打印的highMove
app.use('/go', (request, response) => {
  (function (page) {
    superagent.get(page).charset('gb2312').end((err, res) => {
      if (err) {
        console.log('抓取' + page + '这条信息的时候出错了')
        return next(err)
      }
      let $ = cheerio.load(res.text)
      hightMove($)
    })
  }(baseUrl))
  // 编下码，顺便返回的是html
  response.writeHead(200, {
    'Content-Type': 'text/html;charset=utf-8'
  })
  response.end(highMove)
})
let str = '<br />'
let arr = []
// two打印的最新发布的电影 
app.use('/two', (request, response) => {
  (function (page) {
    // 拿一下主页
    superagent.get(page).charset('gb2312').end((err, res) => {
      if (err) {
        console.log('抓取' + page + '这条信息的时候出错了')
        return next(err)
      }
      let $ = cheerio.load(res.text)
      move($)
      let letgo = () => {
        let fetchUrl = (myurl, callback) => {
          console.log('11111');
          console.log(myurl);
      
      
          superagent.get(myurl).charset('gb2312').end((err, res) => {
            if (err) {
              callback(err, myurl + ' error happened!');
              errLength.push(myurl);
              console.log('fuck');
              return next(err)
            }
            var $ = cheerio.load(res.text);
            // console.log('-----');
      
            // console.log($('.title_all h1 font').text());
      
            str = $('.title_all h1 font').text()
            let download = $('#Zoom table a').eq(0).text()
            let img = $('#Zoom span p img').eq(0).attr('src')
            let obj = {}
            obj.title = str
            obj.down = download
            obj.img = img
            arr.push(obj)
            // response.write(str);
            // response.write('<br/>');
            var result = {
              movieLink: myurl
            };
            // 第一个null是默认的,后面是你要传的参数，传给async的第四个参数的result,
            // 最后是一个数组，里面放着你传的每一项
            callback(null, result);
          })
        }
        // 执行异步操作，一次执行2个,把第一个参数(数组)里面的每一项传给第三个参数
        // 这里就是把存放url的数组newMovieLinkArr里的url传给了myurl
        async.mapLimit(newMovieLinkArr, 2, function (myurl, callback) {
          // 这里的每一次callback的东西,会保存在第四个参数result里面，组成的数组
          fetchUrl(myurl, callback);
        }, function (err, result) {
          console.log(result);
          
          // 爬虫结束后的回调，可以做一些统计结果
          console.log('抓包结束，一共抓取了-->' + newMovieLinkArr.length + '条数据');
          console.log('出错-->' + errLength.length + '条数据');
          console.log('高评分电影：==》' + highScoreMovieArr.length + '部');
          // response.end('str')
          response.render('index',{
            result:arr
          })
          return false;
        });
      }
      letgo()
    })
  }(baseUrl))
  // response.writeHead(200, {
  //   'Content-Type': 'text/plain;charset=utf-8'
  // })
  // response.end('str')
})
app.use((request, response) => {
  response.end('ok')
})
http.createServer(app).listen(3000)