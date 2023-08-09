const express = require('express')
const Todo = require('../models/Todo')
const expressAsyncHandler = require('express-async-handler')
const {isAuth} = require('../../auth')

const router = express.Router()

router.get('/', isAuth, expressAsyncHandler(async (req, res, next) => {
    const todos = await Todo.find({author: req.user._id})   // 해당 사용자의 할일목록 조회 , req.user는 isAuth에서 전달된 값
    if(todos.length === 0){
        res.status(404).json({code: 404, message: 'Fail to find todos !'})
    }else{
        res.json({code: 200, todos})
    }
}))

router.get('/:id', (req, res, next) => {   // /api/todos/{id}
    res.json("특정 할일 조회")
})

router.post('/', isAuth, expressAsyncHandler(async (req, res, next) => {
    // 중복체크 (현재 사용자가 생성하려는 TODO의 타이틀이 이미 DB에 있는지 검사)
    const searchedTodo = await Todo.findOne({
        author: req.user._id,
        title: req.body.title,
    })
    if(searchedTodo){   // 중복이 확인됐을때
        res.status(204).json({code: 204, message: 'Todo you want to create already exists in DB !'})
    }else{
        const todo = new Todo({
            author: req.user._id,   // 사용자 id
            title: req.body.title,
            description: req.body.description,
        })
        const newTodo = await todo.save()
        if(!newTodo){   // 만약 저장이 제대로 되지않았다면
            res.status(401).json({code: 401, message: 'Failed to save todo'})
        }else{
            res.status(201).json({
                code: 201,
                message: 'New Todo Created',
                newTodo     // DB에 저장된 할일
            })
        }
    }
}))

router.put('/:id', (req, res, next) => {    // /api/todos/{id}
    res.json("특정 할일 변경")
})

router.delete('/:id', (req, res, next) => {     // /api/todos/{id}
    res.json("특정 할일 삭제")
})

module.exports = router