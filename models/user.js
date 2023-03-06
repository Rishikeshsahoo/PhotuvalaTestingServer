const mongoose=require('mongoose')

const fileSchema= new mongoose.Schema({
    url:{
        type:String
    },
    fileName:{
        type:String
    },
    sudoId:String
})




const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    hash:{
        type:String,
        required:true,
    },
    files:[fileSchema],
    edited:[fileSchema],
    shortlisted:[fileSchema],
    activeStatus:{
        type:Number,
        default:1
    },
    lastLogin:{
        type:String,
        default:Date.now().toString()
    }
})



module.exports=mongoose.model("User",userSchema)