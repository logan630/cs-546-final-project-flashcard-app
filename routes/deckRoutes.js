//This file is for handling routes with decks, cards, and possibly folders
const express=require('express')
const { MongoGridFSChunkError } = require('mongodb')
const router=express.Router()
const path=require('path')
const users=require('../data/users')
const decks=require('../data/decks')
const validation=require('../validation')

const frontLen=20
const backLen=200

router      //all the decks
    .route('/decks')
    .get(async (req, res) => {
        let userInfo=req.body;
        if(!userInfo) throw "Error getting userInfo"
        const yourDecks=await decks.getAllDecks()
        if(!yourDecks){
            res.status(500)
            return;
        }
        let u=req.session.user.username
        if(req.session.user){
            res.render(path.resolve('views/decks.handlebars'),{title:u+"'s Decks",deck:yourDecks,userName:u})
        }
    })
    .post(async (req,res) => {
        let deckInfo=req.body
        if(!deckInfo){
            res.status(500)
            return
        }
        //console.dir(req.body)
        u=req.session.user.username
        console.log(req.body.decknameInput)
        try {
            await decks.createDeck(u,req.body.decknameInput,"<subject here>", false)
        }
        catch(e){
            console.log(e)
        }
        const yourDecks=await decks.getAllDecks()
        if(!yourDecks){
            res.status(500)
            return;
        }
        //console.dir(yourDecks)
        if(req.session.user){
            res.render(path.resolve('views/decks.handlebars'),{title:u+"'s Decks",deck:JSON.stringify(yourDecks),userName:u})
        }
    })

router      //just one deck
    .route('/deckDetails/:id')
    .get(async (req, res) => {
        console.log("Get id: "+req.params.id)
        let userInfo=req.body;
        if(!userInfo) throw "Error getting userInfo"
        const yourDecks=await decks.getAllDecks()
        if(!yourDecks){
            res.status(500)
            return;
        }
        if(req.session.user){
            res.render(path.resolve('views/singleDeck.handlebars'),{title:"test"})
        }
    })
    .post(async (req,res) => {
        
        console.log("id: "+req.params.id)
        let id=null;
        let deck=null; 
        try {
            id=validation.checkId(req.params.id)
            deck=await decks.getDeckById(id)

        }
        catch(e){
            console.log(e)
        }
        
        //const front=validation.checkCard(req.body.cardFrontInput,'front',frontLen)
        //const back=validation.checkCard(req.body.cardBackInput,'back',backLen)
        u=req.session.user.username
        try{
            await decks.createCard(front,back,deckTitle.name)
        }
        catch(e){
            console.log(e)
        }
        console.log("This is the id: "+id)
        res.render(path.resolve('views/singleDeck.handlebars'),{title:deck.name,id:id})
    })

module.exports = router;