var express = require('express')    // node_modules 내 express 관련 코드를 가져옴
var app = express()
var cors = require('cors')
var logger = require('morgan')
var mongoose = require('mongoose')
var axios = require('axios')
// var todo = require('./src/models/Todo')
var user = require('./src/models/User')

var corsOptions = { // CORS 옵션
    origin: 'http://127.0.0.1:5500',    // 해당 URL 주소만 요청을 허락함 (화이트리스트)
    credentials: true // 사용자 인증이 필요한 리소스를 요청할 수 있도록 허용함
}

var CONNECT_URL = 'mongodb://127.0.0.1:27017/SeongBinBin'
mongoose.connect(CONNECT_URL)
.then(() => console.log('mongodb connected ... '))
.catch(e => console.log(`failed to connect mongodb: ${e}`))

app.use(cors(corsOptions))  // CORS 설정
app.use(express.json()) // request body 파싱
app.use(logger('tiny')) // Logger 설정

app.get('/hello', (req, res) => {   // URL 응답 테스트
    res.json('hello world!')
})
app.post('/hello', (req, res) => {  // POST 요청 테스트
    console.log(req.body)
    res.json({userId: req.body.userId, email: req.body.email})
})
app.get('/error', (req, res) => {
    throw new Error('서버에 치명적인 오류가 발생했습니다.') // 에러 발생 가정
})

app.get('/fetch', async(req, res) => {
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos')
    res.send(response.data)
})

// HTTP 코드 (200, 401, 404 ... )
// 폴백 핸들러 (fallback handler)
app.use((req, res, next) => {   // 사용자가 요청한 페이지가 없는 경우 에러처리 (순서 중요)
    res.status(404).send("Page Not Found")
})
app.use((err, req, res, next) => {  // 서버 내부 오류 처리
    console.error(err.stack)
    res.status(500).send("Internal Server Error")
})

app.listen(5000, () => {    // 5000 포트로 서버 오픈
    console.log('server is running on port 5000 ... ')
})