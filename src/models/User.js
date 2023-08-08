const { unwatchFile } = require('fs')
const mongoose = require('mongoose')

const { Schema } = mongoose

const userSchema = new Schema({ // 스키마 정의
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true    // unique: 색인(primary key), email은 중복불가(고유 값)
    },
    userId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('User', userSchema) // User => users, 이름 설정을 위함이라면 세번째 인자에 '**' 추가
module.exports = User

// user 데이터 생성 테스트
const user = new User({
    name: '태양',
    email: 'ngsb@gmail.com',
    userId: 'NGSB',
    password: '1234567890',
    isAdmin: true
})
user.save()
.then(() => console.log('user created !'))