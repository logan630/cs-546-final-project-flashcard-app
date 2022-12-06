//require express, express router and bcrypt as shown in lecture code
const express=require('express')
const router=express.Router()
const bcrypt=require('bcryptjs')
const path=require('path')
const saltRounds=11;

router
  .route('/page1')
  .get(async (req, res) => {  
      try {
        res.render(path.resolve('views/page1.handlebars'),{title: "Page 1"})
      }
      catch(e){
        res.status(404).json(e)
      }
  })

router
  .route('/')
  .get(async (req,res) => {
    try {
      res.render(path.resolve('views/page1.handlebars'),{title: "Page 1"})
    }
    catch(e){
      res.status(500).json(e)
    }
  })
module.exports=router;