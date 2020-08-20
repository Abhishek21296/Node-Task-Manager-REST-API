const express = require('express');
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({...req.body, creator : req.user._id})
    try{
        await task.save()
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})

//filter, pagination, sorting
//GET /tasks?completed=true
//GET /tasks?limit=10&skip=0
//GET /tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }

    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        await req.user.populate({
            path : 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort : sort
            }
        }).execPopulate()
        res.send(req.user.tasks);
    }catch(e){
        res.status(500).send();
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try{
        const task = await Task.findOne({_id, creator : req.user._id})
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch(e){
        res.status(500).send();
    }
})

router.patch('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id;
    
    const allowed = ['description', 'completed']
    const updates = Object.keys(req.body);
    const isValid = updates.every((item) => {
        return allowed.includes(item)
    })
    if(!isValid){
        return res.status(400).send({error : 'Invalid updates'});
    }
    try{
        const task = await Task.findOne({ _id : _id, creator : req.user._id})
        if(!task){
            return res.status(404).send()
        }
        updates.forEach((item) => task[item] = req.body[item])
        await task.save();
        res.send(task)
    }catch(e){
        res.status(400).send(e);
    }
})

router.delete('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id;
    try{
        const user = await Task.findOneAndDelete({_id : _id, creator : req.user._id})
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch (e){
        res.status(500).send()
    }
})

module.exports = router;