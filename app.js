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

var baseUrl = 'http://www.dytt8.net'; //迅雷首页链接
var newMovieLinkArr = []; //存放新电影的url
var errLength = []; //统计出错的链接数
var highScoreMovieArr = [] //高评分电影
let x
let hightMove = ($) => {
  let url = baseUrl + $('.co_content2').eq(1).children('ul').eq(0).children('a').eq(0).attr('href');
  console.log(url)
  superagent.get(url).charset('gb2312').end((err, res) => {
    if (err) {
      console.log('抓取' + page + '这条信息的时候出错了')
      return next(err)
    }
    let $ = cheerio.load(res.text)
    let p = $("#Zoom p").text()
    console.log('----');
    highScoreMovieArr.length = 20
    console.log(typeof p)
    x = p
  })
}
let move = ($) => {
  let a = $('.co_content2').eq(1).children('ul').eq(0).children('a');
  for (let i = 2, l = 10; i <= l; i++) {
    let url = baseUrl + a.eq(i).attr('href');
    if (newMovieLinkArr.indexOf(url) == -1) {
      newMovieLinkArr.push(url)
    }
  }
}
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
  response.writeHead(200, {
    'Content-Type': 'text/plain;charset=utf-8'
  })
  response.end(x)
})
let str = '<br />'

app.use('/two', (request, response) => {
  (function (page) {
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
            
            response.write(str);
            response.write('<br/>');
            var result = {
              movieLink: myurl
            };
            callback(null, result);
          })
        }
        async.mapLimit(newMovieLinkArr, 2, function (myurl, callback) {
          fetchUrl(myurl, callback);
        }, function (err, result) {
          // 爬虫结束后的回调，可以做一些统计结果
          console.log('抓包结束，一共抓取了-->' + newMovieLinkArr.length + '条数据');
          console.log('出错-->' + errLength.length + '条数据');
          console.log('高评分电影：==》' + highScoreMovieArr.length + '部');
          response.end('str')
          return false;
        });
      }
      letgo()
    })
  }(baseUrl))
  response.writeHead(200, {
    'Content-Type': 'text/plain;charset=utf-8'
  })
  // response.end('str')
})
app.use((request, response) => {
  response.end('ok')
})
http.createServer(app).listen(3000)