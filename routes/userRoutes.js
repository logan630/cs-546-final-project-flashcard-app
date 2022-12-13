//This file is for handling user register and login
const express=require('express')
const router=express.Router()
const bcrypt=require('bcryptjs')
const path=require('path')
const users=require('../data/users')
const validation=require('../validation')
const saltRounds=11;

router
  .route('/')
  .get(async (req, res) => {
    let isLoggedIn=false
    if(req.session.user){
      isLoggedIn=true
    }
    res.render(path.resolve('views/startPage.handlebars'),{title:"QuackDown Study",loggedIn:isLoggedIn})
  })

router
  .route('/register')
  .get(async (req, res) => {  
     /* if(req.session.user){       //when the user tries to go to the register page if they are already logged in.
        res.redirect('/protected')
      }
      else {*/
        res.render(path.resolve('views/register.handlebars'),{title: "Register"})
      //}
  })
  .post(async (req,res) => {
    //when the user submits data from the registration form 
    let check={};
    try{
      validation.checkUsername(req.body.usernameInput)
      validation.checkPassword(req.body.passwordInput)
      check=await users.createUser(req.body.usernameInput,req.body.passwordInput)
    }
    catch(e){
      res.render(path.resolve('views/register.handlebars'),{errorMessage:e,title:"Registration error"})
      res.status(400)
      console.log(e)
      return
    }
    if(!check.insertedUser) {
      res.status(500).send("Internal Server Error")
      return
    }
    if(check.insertedUser==true){
      res.redirect('/')
    }

  })

router
  .route('/login')
  .get(async (req,res) => {
    /*try {
      res.render(path.resolve('views/login.handlebars'),{title: "Login"})
    }
    catch(e){*/
    res.render(path.resolve('views/login.handlebars'),{title: "Login"})
    //}
  })
  .post(async (req,res) => {
    let check={}
    try {
      validation.checkUsername(req.body.usernameInput)
      validation.checkPassword(req.body.passwordInput)
      check=await users.checkUser(req.body.usernameInput,req.body.passwordInput) 
    }
    catch(e){
        res.render(path.resolve('views/login.handlebars'),{errorMessage:e,title:"Login error"})
        res.status(400)
        console.log(e)
        return
    }
    if(!check.authenticatedUser){
      res.status(500).send("Internal Server Error")
      return
    }
    if(check.authenticatedUser==true){
      
      //req.session.cookie.name="AuthCookie"
      req.session.user={username: req.body.usernameInput}
      res.redirect('/protected')
    }
  })
function fn(num) {    //format number. Adds a leading 0. "0" becomes "00"
  if(num.toString().length===1){
    num="0"+num
  }
  return num.toString()
}
router
  .route('/protected')
  .get(async (req,res) => {
    let currentDate=new Date();
    let date=`${fn(currentDate.getMonth()+1)}/${fn(currentDate.getDate())}/${fn(currentDate.getFullYear())}`;
    let time=`${fn(currentDate.getHours())}:${fn(currentDate.getMinutes())}:${fn(currentDate.getSeconds())}`;
    if(req.session.user){
      let u=req.session.user.username;
      res.render(path.resolve('views/private.handlebars'),{
        username:u,
        date:date,
        time:time,
        full:new Date().toUTCString(),
        title:u
      })
    }
    else{

    }
  })

router
  .route('/logout')       
  .get(async (req, res) => {
    if(!req.session.user){
      res.redirect('/')
    }
    else {
      req.session.destroy()
      res.render(path.resolve('views/logout.handlebars'),{title:"Logged out"});
    }
  })

module.exports=router;