//This file is for handling routes with decks, cards, and possibly folders
const express=require('express')
const { MongoGridFSChunkError } = require('mongodb')
const router=express.Router()
const path=require('path')
const users=require('../data/users')
const decks=require('../data/decks')
const validation=require('../validation')

router      //all the decks
    .route('/decks')
    .get(async (req, res) => {
        let userInfo=req.body;
        if(!userInfo) throw "Error getting userInfo"
        let u=req.session.user.username
        let userId=undefined
        let yourDecks=undefined
        try {
            userId=await users.getUserIdFromName(u)
            yourDecks=await decks.getUsersDecks(userId)
        }
        catch(e){
            console.log(e)
            if(!yourDecks){
                res.status(500)
                return;
            }
        }     
        if(req.session.user){
            res.render(path.resolve('views/decks.handlebars'),{title:u,deck:yourDecks,userName:u})
        }
    })
    .post(async (req,res) => {
        let deckInfo=req.body
        if(!deckInfo){
            res.status(500)
            return
        }
        u=req.session.user.username
        const yourDecks=await decks.getAllDecks()
        if(!yourDecks){
            res.status(500)
            return;
        }
        let newDeck=undefined;
        let error=undefined;
        try {
            newDeck = await decks.createDeck(u,req.body.name,"<subject here>", false)
        }
        catch(e){
            console.log(e)
            error=e;
            res.json({
                handlebars:path.resolve('views/decks.handlebars'),
                title:u,
                deck:yourDecks,
                error:error
            })
            res.status(400)
            return
        }
        let newDeckId=newDeck.insertedId.toString()
        if(req.session.user){
            res.json({
                handlebars:path.resolve('views/decks.handlebars'),
                title:u,
                deck:yourDecks,
                id:newDeckId,
                error:error
            })
            //res.render(path.resolve('views/decks.handlebars'),{title:u,deck:yourDecks,userName:u,id:newDeckId})
        }
    })

router      //just one deck
    .route('/decks/:id')
    .get(async (req, res) => {
        //console.log("Get id: "+req.params.id)
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
        
        const front=validation.checkCard(req.body.cardFrontInput,'front',frontLen)
        const back=validation.checkCard(req.body.cardBackInput,'back',backLen)
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