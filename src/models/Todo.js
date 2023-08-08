const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: {ObjectId} } = Schema

const todoSchema = new Schema({ // 스키마 정의
    author: {
        type: ObjectId, // 사용자의 ID
        required: true,
        ref: 'User' // 사용자 모델을 참조
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isDone: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    },
    finishedAt: {
        type: Date,
        default: Date.now
    }
})

const Todo = mongoose.model('Todo', todoSchema) // Todo => todos (컬렉션 이름)
module.exports = Todo   // 외부에서 해당 파일을 사용할 수 있도록 허용

// todo 데이터 생성 테스트
// const todo = new Todo({ // 메모리에 존재
//     author: '111111111111111111111111', // 24자리 Mongodb 고유 ID값
//     title: '주말에 공원 산책하기',
//     description: '주말에 집 주변에 있는 공원에 가서 1시간동안 산책하기'
// })

// // 데이터베이스 접속 => 비동기
// todo.save() // insert, insertMany
// .then(() => console.log('todo created !'))
// .catch(e => console.log(`Failed to create todo: ${e}`))