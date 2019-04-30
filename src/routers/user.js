const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middlewares/auth')
const multer = require('multer')
const sharp = require('sharp')
const { welcomeEmail, exitEmail } = require('../emails/accounts')




// creating new users
router.post('/Users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        welcomeEmail(user.email, user.name)
        const token = await user.authCredentials()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e.message)
    }
})
// login to user

router.post('/Users/login', async (req, res) => {
    try {
        const user = await User.matchCredentials(req.body.email, req.body.password)
        const token = await user.authCredentials()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e.message)
    }
})


// logout user

router.post('/Users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send('please try again')
    }

})

//logout from all sessions

router.post('/Users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            token.token === req.token
        })

        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send('please try again')
    }
})

// router.post('/Users/logoutAll', auth, async (req, res) => {
//     try {
//         req.user.tokens = []
//         await req.user.save()
//         res.send()
//     } catch (e) {
//         res.status(500).send()

//     }

// })

//reading users

router.get('/Users/me', auth, async (req, res) => {
    try {
        // const users = await User.find({})
        // if (!users) {
        //     return res.status(400).send('no users')
        // }
        // res.status(200).send(users)

        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})


// reading specific user

// router.get('/User/:id', async (req, res) => {
//     const _id = req.params.id
//     try {
//         const user = await User.findById(_id)
//         res.send(user)
//     } catch (e) {
//         res.status(404).send(e)
//     }
// })

//updating user

router.patch('/Users/me', auth, async (req, res) => {

    const update = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password', 'email']
    const Updates = update.every((update) => allowedUpdates.includes(update))

    if (!Updates) {
        return res.status(400).send('unavailable updates')
    }


    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    try {
        //const user = await User.findById(req.params.id)
        update.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()


        // if (!user) {
        //     return res.status(400).send()
        // }
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})
//deleting user

router.delete('/Users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)
        // if (!user) {
        //     res.status(400).send()
        // }

        await req.user.remove()
        exitEmail(user.email, user.name)

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }

})

const upload = multer({

    limits: {
        fieldSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('please upload image file'))
        }
        cb('', true)
    }

})

router.post('/User/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {

        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()
        res.send()
        console.log(req.file)

    } catch (error) {
        res.send({ error: error.message })
        console.log(error)
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })

})

router.delete('/User/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/User/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})



module.exports = router