const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO)
    .then(()=>{
        console.log("connected to database successfully");
    }).catch((e)=>{
        console.log("some error occurred",e.message);
    })