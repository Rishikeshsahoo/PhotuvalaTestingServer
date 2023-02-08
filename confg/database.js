const mongoose = require('mongoose')

const options={
useNewUrlParser:true,
useUnifiedTopology:true
}
mongoose.connect("mongodb+srv://root:root@cluster0.tujj06w.mongodb.net/photuvala?retryWrites=true&w=majority")
mongoose.connection.on("connected",()=>{console.log("database connected")})