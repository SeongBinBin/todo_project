const express = require('express')
const Todo = require('../models/Todo')
const expressAsyncHandler = require('express-async-handler')
const {isAuth} = require('../../auth')

const mongoose = require('mongoose')
const { Types: { ObjectId } } = mongoose

const router = express.Router()

router.get('/', isAuth, expressAsyncHandler(async (req, res, next) => {
    const todos = await Todo.find({author: req.user._id}).populate('author')   // 해당 사용자의 할일목록 조회 , req.user는 isAuth에서 전달된 값
    if(todos.length === 0){
        res.status(404).json({code: 404, message: 'Fail to find todos !'})
    }else{
        res.json({code: 200, todos})
    }
}))

router.get('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
    const todo = await Todo.findOne({
        author: req.user._id,   // req.user는 isAuth에서 전달된 값
        _id: req.params.id      // TODO id
    })
    if(!todo){
        res.status(404).json({code: 404, message: 'Todo Not Found'})
    }else{
        res.json({code: 200, todo})
    }
}))

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
            category: req.body.category,
            imgUrl: req.body.imgUrl,
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

router.put('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
    const todo = await Todo.findOne({
        author: req.user._id,
        _id: req.params.id
    })
    if(!todo){
        res.status(404).json({code: 404, message: 'Todo Not Found'})
    }else{
        todo.title = req.body.title || todo.title
        todo.description = req.body.description || todo.description
        todo.isDone = req.body.isDone || todo.isDone
        todo.category = req.body.category || todo.category
        todo.imgUrl = req.body.imgUrl || todo.imgUrl
        todo.lastModifiedAt = new Date()    // 수정시각 업데이트
        todo.finishedAt = todo.isDone ? todo.lastModifiedAt : todo.finishedAt

        const updatedTodo = await todo.save()   // 실제 DB에 업데이트
        res.json({
            code: 200,
            message: 'TODO Updated',
            updatedTodo
        })
    }
}))

router.delete('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
    const todo = await Todo.findOne({
        author: req.user._id,
        _id: req.params.id
    })
    if(!todo){
        res.status(404).json({code: 404, message: 'Todo Not Found'})
    }else{
        await Todo.deleteOne({
            author: req.user._id,
            _id: req.params.id
        })
        res.status(204).json({code: 204, message: 'TODO deleted successfully !'})
    }
}))

router.get('/group/:field', isAuth, expressAsyncHandler(async (req, res, next) => { // 어드민 페이지
    if(!req.user.isAdmin){
        res.status(401).json({code: 401, message: 'You are not authorized to use this service !'})
    }else{
        const docs = await Todo.aggregate([
            {
                $group: {
                    _id: `$${req.params.field}`,
                    count: { $sum: 1 }
                }
            }
        ])

        console.log(`Number Of Group: ${docs.length}`) // 그룹 갯수
        docs.sort((d1, d2) => d1._id - d2._id)
        res.json({code: 200, docs})
    }
}))

router.get('/group/mine/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
    const docs = await Todo.aggregate([
        {
            $match: { author: new ObjectId(req.user._id) }  // 나의 할일목록 필터링
        },
        {
            $group: {
                _id: `$${req.params.field}`,
                count: { $sum: 1 }
            }
        }
    ])

    console.log(`Number Of Group: ${docs.length}`) // 그룹 갯수
    docs.sort((d1, d2) => d1._id - d2._id)
    res.json({code: 200, docs})
}))

router.get('/group/date/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
    if(!req.user.isAdmin){
        res.status.apply(401).json({code: 401, message: '관리자가 아닙니다.'})
    }else{
        if(req.params.field === 'createdAt' || req.params.field === 'lastModifiedAt' || req.params.field === 'finishedAt'){
            const docs = await Todo.aggregate([
                {
                    $group: {
                        _id: {year: {$year: `$${req.params.field}`}, month: {$month: `$${req.params.field}`}},
                        count: {$sum: 1}
                    }
                },
                { $sort : { _id : 1 } } // 날짜 오름차순 정렬
            ])

            console.log(`Number Of Group: ${docs.length}`)  // 그룹 갯수
            docs.sort((d1, d2) => d1._id - d2._id)
            res.json({code: 200, docs})
        }else{
            res.status(204).json({code: 204, message: 'No Content'})
        }
    }
}))

router.get('/group/mine/date/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
    if(req.params.field === 'createdAt' || req.params.field === 'lastModifiedAt' || req.params.field === 'finishedAt'){
        const docs = await Todo.aggregate([
            {
                $match: { author: new ObjectId(req.user._id) }
            },
            {
                $group: {
                  _id: { year: { $year: `$${req.params.field}` }, month: { $month: `$${req.params.field}` } },
                  count: { $sum: 1 }
                }
            },
            { $sort : { _id : 1 } } // 날짜 오름차순 정렬
        ])

        console.log(`Number Of Group: ${docs.length}`) // 그룹 갯수
        docs.sort((d1, d2) => d1._id - d2._id)
        res.json({ code: 200, docs})
    }else{
        res.status(204).json({ code: 204, message: 'No Content'})
    }
}))

module.exports = router