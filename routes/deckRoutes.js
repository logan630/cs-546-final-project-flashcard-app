//This file is for handling routes with decks, cards, and possibly folders
const express=require('express')
const { ObjectId } = require('mongodb')
const router=express.Router()
const path=require('path')
const users=require('../data/users')
const decks=require('../data/decks')
const validation=require('../validation')
const { off } = require('process')

router      
    .route('/decks')
    .get(async (req, res) => { // /decks get route (when you go to the decks page)
        let userInfo=req.body;
        if(!userInfo){                  //if user info request fails 
            res.sendStatus(400)
            return
        }
        let u=req.session.user.username
        let userId=undefined
        let yourDecks=undefined
        try {           
            userId=await users.getUserIdFromName(u) //gets user id from that user's username
            yourDecks=await decks.getUsersDecks(userId) //gets that user's decks
        }
        catch(e){                       //if cannot get users decks
            console.log(e)
            if(!yourDecks){
                res.sendStatus(500)
            }
            return
        }     
        if(req.session.user){           //render decks if logged in
            res.render(path.resolve('views/decks.handlebars'),{title:u,deck:yourDecks,userName:u})
        }
    })
    .post(async (req,res) => {  // /decks post route (when you create a deck)
        let deckInfo=req.body
        if(!deckInfo){                  //if deck info request fails
            res.status(400)
            return
        }
        let u=req.session.user.username
        let yourDecks=undefined
        try{
            yourDecks=await decks.getAllDecks()
        }
        catch(e){               //if getting all the decks fails
            console.log(e)
            res.sendStatus(500)
            return
        }
        let newDeck=undefined;
        let error=undefined;
        try {                                       //req.body.name is the name of the deck
            newDeck = await decks.createDeck(u, deckInfo.name, deckInfo.subject, false)
        }
        catch(e){           //if creating a deck fails, send handlebars page with thrown error
            console.log(e)
            error=e;
            res.json({
                handlebars:path.resolve('views/decks.handlebars'),
                title:u,
                deck:yourDecks,
                success:false,
                error:e.toString()
            })
            res.status(400)
            return
        }
        let newDeckId=newDeck.insertedId.toString()
        if(req.session.user){       //if it passes, create a deck with undefined error and a new deck id
            res.json({
                handlebars:path.resolve('views/decks.handlebars'),
                subject: deckInfo.subject,
                title:u,
                deck:yourDecks,
                id:newDeckId,
                success:true,
                error:error
            })
            //res.render(path.resolve('views/decks.handlebars'),{title:u,deck:yourDecks,userName:u,id:newDeckId})
        }
    })

router      //just one deck
    .route('/decks/:id')
    .get(async (req, res) => {      // /decks/:id /get route (when you go to that page)
        //console.log("Get id: "+req.params.id)
        let userInfo=req.body;          //same idea as above
        if(!userInfo){
            res.status(400)
            return
        }
        let deck=undefined
        let id=undefined
        try{
            id=validation.checkId(req.params.id)
            deck=await decks.getDeckById(id)
        }
        catch(e){               //if getting all the decks fails
            console.log("\n\ncould not get deck\n\n")
            console.log(e)
            res.sendStatus(500)
            return;
        }
        //console.log("deck cards",deck.cards)
        if(req.session.user){       //if they are logged in, render the page for that deck
            //console.log(deck.cards)
            res.render(path.resolve('views/singleDeck.handlebars'),
            {
                title:deck.name, 
                card:deck.cards, 
                deckName:deck.name, 
                subject: deck.subject,
                id:id
            })
        }
    })
    .post(async (req,res) => {      // /decks/:id /post route (when you create a new cards)
        let id=undefined;
        let deck=undefined; 
        let front=undefined;
        let back=undefined;
        try {       //try to check id and get the decks
            id=validation.checkId(req.params.id)
            deck=await decks.getDeckById(id)
        }
        catch(e){
            console.log(e)
            res.sendStatus(400)
            return
        }
        let card=undefined  //variable for the created card
        try{            //validate front and back. Check creating card
            front=validation.checkCard(req.body.front,'front')
            back=validation.checkCard(req.body.back,'back')
            card=await decks.createCard(front,back,deck.name)
        }
        catch(e){           //if any of those fail, render the appropriate error
            console.log(e)
            res.json({
                handlebars:path.resolve('views/singleDeck.handlebars'),
                title:deck.name,
                id:id,
                front: card ? front : undefined,            //if createCard return a valid card, send front and back back to ajax
                back: card ? back : undefined,
                deckName:deck.name,
                success:false,
                error:e.toString()
            })
            return
        }
        if(req.session.user){                   //if logged in, send correct data
            res.json({
                handlebars:path.resolve('views/singleDeck.handlebars'),
                title:deck.name,
                id:id,
                front:front,                //sending valid data for front and back
                back:back,
                deckName:deck.name,
                success:true,
                
            })
        }
    })
    .patch( async(req, res) => {            // /decks/:id patch route. updating deck name
        let id=validation.checkId(req.params.id)
        let newDeckName=req.body.name
        if(!newDeckName){
            res.sendStatus(400)
            return
        }
        try{    
            newDeckName=validation.checkDeckName(newDeckName)
            await decks.renameDeck(id,newDeckName)
        }
        catch(e){
            console.log(e)
            res.json({
                handlebars:path.resolve('views/singleDeck.handlebars'),
                title:newDeckName,
                id:undefined,
                deckName:newDeckName,
                success:false,
                error:e.toString()
            })
            return
        }
        if(req.session.user){
            res.json({
                handlebars:path.resolve('views/singleDeck.handlebars'),
                title:newDeckName,
                id:id,
                deckName:newDeckName,
                success:true,
                error:undefined
            })
        }
    })
    .delete( async(req, res) => {       // /decks/:id   delete route. Delete a deck
        let id=validation.checkId(req.params.id)
        let result=undefined
        try{
            result=await decks.removeDeck(id)
        }
        catch(e){
            console.log(e)
            res.json({
                handlebars:path.resolve('views/singleDeck.handlebars'),
                success:false,
                error:e
            })
        }
        if(req.session.user){   
            res.json({
                handlebars:path.resolve('views/decks.handlebars'),
                success:true,
                error:undefined
            })
        }
        else{
            console.log("Not logged in :(")

        }
    })  

router
    .route('/decks/:id/cards/:front')
    .get(async (req,res) => {         // /decks/:id/cards/:front    get route      for getting a specific card
        let cardInfo=req.body
        if(!cardInfo){
            res.sendStatus(500)
            return
        }
        let deck=undefined
        let id=undefined
        try{
            id=validation.checkId(req.params.id)
            deck=await decks.getDeckById(id)
        }
        catch(e){
            console.log(e)
        }
        let oldFront=req.params.front
        let back=await decks.getCardBack(id,oldFront)
        try{
            oldFront=validation.checkCard(oldFront,'front')
        }
        catch(e){
            console.log(e)
                res.json({
                    handlebars:path.resolve('views/card.handlebars'),
                    title:oldFront,
                    id:id,
                    cardFront:oldFront,
                    cardBack:back,
                    errorMessage:e.toString(),
                    success:false
                })
                return
            }
        if(req.session.user){
            res.render(path.resolve('views/card.handlebars'),{cardFront:oldFront,cardBack:back,id:id,title:oldFront,deckName:deck.name})
        }
    })
    .patch(async (req,res) => {             // /decks/:id/cards/:front      patch route     (changing a card front and back)
        let id=validation.checkId(req.params.id)
        let front=req.body.front
        let back=req.body.back
        let deck=undefined
        let oldFront=req.params.front
        try{
            front=validation.checkCard(front,'front')
            oldFront=validation.checkCard(oldFront,'front')
            back=validation.checkCard(back,'back')
            deck=await decks.getDeckById(id)
        }
        catch(e){
            console.log(e)
                res.json({
                    handlebars:path.resolve('views/card.handlebars'),
                    title:front,
                    id:id,
                    cardFront:front,
                    cardBack:back,
                    errorMessage:e.toString(),
                    success:false
                    //deckName:deck.name
                })
                return
            }
        let a=undefined
        try{
            a=await decks.updateCard(id,oldFront,front,back)
        }
        catch(e){
            console.log(e)
        }
        if(req.session.user){
            //console.log(front,back)
            res.json({
                handlebars:path.resolve('views/card.handlebars'),
                title:front,
                id:id,
                cardFront:front,
                cardBack:back,
                success:true,
                error:undefined,
                deckName:deck.name
            })
        }
    })

module.exports = router;