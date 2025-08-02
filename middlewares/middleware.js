const express = require('express')
const milddleware = express();
const path = require('path');
const bcrypt = require('bcrypt')

milddleware.set('view engine','ejs') //to use the ejs
milddleware.use(express.static(path.join(__dirname,'public'))); // to join the public directory
milddleware.use(express.json()); //Middleware to parse JSON bodies
milddleware.use(express.urlencoded({extended:true}));// to get data from the the form data encoded
milddleware.use(flash());
