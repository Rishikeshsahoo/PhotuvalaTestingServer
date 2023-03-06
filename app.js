const express=require("express")
const cors= require('cors')
const passport = require('passport');

/*____GENERAL SETUP____*/

const app=express()
const port =process.env.PORT || 4000;

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(passport.initialize())
app.use(cors())
require('./confg/database')
require('./confg/s3')
const userRouter= require('./routes/user')
const adminRouter=require('./routes/admin')
require('./confg/passport')(passport)

app.use('/users',userRouter)
app.use('/admin',adminRouter)


/* _______ Routes ______ */



app.listen(4000, ()=>{console.log(`server started at port ${port}`)})