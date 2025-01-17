const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        unique : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid email.')
            }
        }       
    },
    password : {
        required : true,
        type : String,
        minlength : 7,
        trim : true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Passworn cannot conatain "password"')
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value) {
            if(value<0){
                throw new Error('Age must be positive!')
            }
        }
    },
    avatar : {
        type : Buffer
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
}, {
    timestamps : true
})

//kinda inner join
userSchema.virtual('tasks', {
    ref : 'Task',
    localField : '_id',
    foreignField : 'creator'
})

//called automatically when send() called
userSchema.methods.toJSON = function() {
    const user = this;
    const userObj = user.toObject()

    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;

    return userObj
}

userSchema.methods.GenerateAuthToken = async function () {
    const user = this
    var t = jwt.sign( {_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token : t })
    await user.save()
    return t
}

//custom function fo login
userSchema.statics.findByCredentials = async (email, pwd) => {
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to Login')
    }
    const isMatch = await bcrypt.compare(pwd, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

//Hashes the plain text pwd before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({creator : user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User;