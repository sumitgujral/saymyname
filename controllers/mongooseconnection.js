const mongoose = require('mongoose');
require('dotenv').config();

async function connectdb(){
    try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connnected Successfully")
}
catch (error) {
    console.error('MongoDB Connection Error : ', error);
}
} 

connectdb();