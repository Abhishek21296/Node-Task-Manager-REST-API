const express = require('express');
const User = require('../models/user')
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp')
const {SendWelcome, SendThankYou } = require('../mailer/mailer.js');

const router = express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try{
        await user.save()
        SendWelcome(user.email, user.name);
        const token = await user.GenerateAuthToken();

        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login', async(req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.GenerateAuthToken();
        res.send({user, token})
    } catch(e) {
        res.status(400).send(e);
    }
})

router.post('/users/logout', auth, async(req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((item) => {
            return item.token !== req.token 
        })
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send();
    }
})

router.post('/users/logoutAll', auth, async(req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send();
    }
})


//returns self users
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File must be an Image!'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth,  upload.single('profile'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width : 250, height : 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

router.patch('/users/me', auth, async(req, res) => {
    const _id = req.user._id;
    
    const allowed = ['name', 'email', 'password', 'age']
    const updates = Object.keys(req.body);
    const isValid = updates.every((item) => {
        return allowed.includes(item)
    })
    if(!isValid){
        return res.status(400).send({error : 'Invalid updates'});
    }
    try{
        updates.forEach((item) => req.user[item] = req.body[item])
        await req.user.save();
        res.send(req.user)
    }catch(e){
        res.status(400).send(e);
    }
})

router.delete('/users/me', auth, async(req, res) => {
    const _id = req.user._id;
    try{
        await req.user.remove()
        SendThankYou(req.user.email, req.user.name);
        res.send(req.user)
    }catch (e){
        res.status(500).send()
    }
})

module.exports = router