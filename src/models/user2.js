const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("Password can not be 'password'")
            }
        }
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must be a positive number")
            }
        }
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

//validating credentials
userSchema.statics.matchCredentials = async (email, password) => {

    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('login email failed')
    }
         
    
    const isMatch = await bcrypt.compare(password, user.password)
    console.log(isMatch)

    if (!isMatch) {
        throw new Error('login failed')
    }
    return user
}


// userSchema.methods.settoken = async function () {
//     const user = this
//     const token = jwt.sign({ id: user._id.toString() }, "this is personal", { expiresIn: "2 days" })
//     user.token=user.token.concat({token})
//     await user.save()
//     return token
// }

//seting token to login user
userSchema.methods.authCredentials = async function () {
    const user = this
    const token = jwt.sign({ id: user._id.toString() }, 'this is personal', { expiresIn: '2 days' })
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

//match credentials

// userSchema.statics.matchCredentials = async (email, password) => {
//     const user = await User.findOne({ email })

//     if (!user) {
//         throw new Error('login failed')
//     }

//     const ismatch =  bcrypt.compare(password, user.password)

//     if (!ismatch) {
//         throw new Error('login failed')
//     }

//     return user
// }
// hide private data

userSchema.methods.toJSON = function () {
    const user = this

    const allowedObjects = user.toObject()
    delete allowedObjects.password
    delete allowedObjects.tokens
    return allowedObjects
}



//incrypt the password
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified) {
        //console.log('this is before modified file')
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User