const User = require('../models/user')
const jwt = require('jsonwebtoken')


const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.JWT_SECRET)
    
        const user = await User.findOne({ _id: decode.id, 'tokens.token': token })
          
        if (!user) {
            throw new Error()
        }
        req.token=token
        req.user = user
        
        next()
    } catch (e) {
        res.status(401).send('please authenticate')

    }
}


module.exports = auth













// app.use((req,res,next)=>{
//     if(req.method==='GET'||'POST'||'PATCH'||'DELETE'){
//         res.status(503).send('server is in maintainance mode, we will back soon')

//     }
//     else{
//         next()
//     }

// })

// app.use((req,res,next)=>{
//     res.status(503).send('server is in maintainance mode, we will back soon')
// })