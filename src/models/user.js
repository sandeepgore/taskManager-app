const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    age: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must be a positive number")
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid.")
            }
        }
    },
    password: {
        type: String,
        minlength: 7,
        required: true,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("Password cannot contain 'password' ")
            }
        }
    }, 
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
        timestamps: true
    })

userSchema.virtual('task', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})


userSchema.methods.toJSON = function () {
    const user = this

    const allowedObjects = user.toObject()
    delete allowedObjects.password
    delete allowedObjects.tokens
    delete allowedObjects.avatar
    return allowedObjects
}



userSchema.methods.authCredentials = async function () {
    const user = this

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })

    await user.save()
    return token
}

userSchema.statics.matchCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error("No user with  given email.")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("Password doesn't match.")
    }

    return user
}

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove', async function (next) {

    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User