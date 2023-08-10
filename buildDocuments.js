var mongoose = require('mongoose')
const User = require('./src/models/User')
const Todo = require('./src/models/Todo')
const config = require('./config')

const category = ['오락', '공부', '음식', '자기계발', '업무', '패션', '여행']
const done = [true, false]
let users = []  // 사용자들의 배열

mongoose.connect(config.MONGODB_URL)
.then(() => console.log("mongodb connected ..."))
.catch(e => console.log(`failed to connect mongodb: ${e}`))

// from.getTime() : 1970년도에서 현재의 날짜까지를 밀리세컨드 초로 값을 반환
// 랜덤 날짜 생성
const generateRandomDate = (from, to) => {
    return new Date(
        from.getTime() + Math.random() * (to.getTime() - from.getTime())
    )
}

// 배열에서 랜덤값 선택
const selectRandomValue = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)]
}

// 랜덤 문자열 생성
const generateRandomString = n => {
    const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    const str = new Array(n).fill('a')  // 초기값이 'a'인 n개의 문자 배열
    return str.map(s => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
}

// user 데이터 생성
const createUsers = async(n, users) => {
    console.log('creating users now ... ')
    for(let i = 0; i < n; i++){
        const user = new User({
            name: generateRandomString(5),
            email: `${generateRandomString(7)}@gmail.com`,
            userId: generateRandomString(10),
            password: generateRandomString(13),
        })
        users.push(await user.save())
    }
    return users
}

// todo 데이터 생성
const createTodos = async(n, user) => {
    console.log(`creating todos by ${user.name} now ... `)
    for(let i = 0; i < n; i++){
        const todo = new Todo({
            author: user._id,
            title: generateRandomString(10),
            description: generateRandomString(19),
            imgUrl: `http://www.${generateRandomString(10)}.com/${generateRandomString(10)}.png`,
            category: selectRandomValue(category),
            isDone: selectRandomValue(done),
            createdAt: generateRandomDate(new Date(2023, 5, 1), new Date()),    // 2023.05.01 부터 오늘까지의 범위
            lastModifiedAt: generateRandomDate(new Date(2023, 5, 1), new Date()),
            finishedAt: generateRandomDate(new Date(2023, 5, 1), new Date()),
        })
        await todo.save()
    }
}

// 사용자와 해당 사용자의 할일목록을 순서대로 생성함
const buildData = async(users) => {
    users = await createUsers(7, users)
    users.forEach(user => createTodos(30, user))
}

// 데이터 생성
buildData(users)