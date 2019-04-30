const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false

}, (error) => {
    if (error) {
        return console.log("Error!", error)
    }
})


