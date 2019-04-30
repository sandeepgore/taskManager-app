const express = require('express')
require('./db/mongoose')
const app = express()
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const auth = require('./middlewares/auth')

const port = process.env.PORT 

const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        fieldSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('please upload document file'))
        }
        cb('', true)
    }
})


app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()

},(error,req,res,next)=>{
    res.status(400).send({error:error.message})

})



app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log('Listening from port: ', port)
})

