//This is the file for a non logged in user browsing public decks
const express=require('express')
const { ObjectId } = require('mongodb')
const router=express.Router()
const path=require('path')
const users=require('../data/users')
const decks=require('../data/decks')
const validation=require('../validation')
const xss=require('xss')

router
    .route('/')
    .get(async(req,res) => {
        if(!req.body){
            res.sendStatus(400)
            return
        }
        let allDecks=undefined
        try{
            allDecks=await decks.getAllDecks()
        }
        catch(e){
            console.log(e)
            res.sendStatus(500)
            return
        }
        let publicDecks=allDecks.filter((deck) => {         //filters for just public decks
            return deck.public===true
        })
        res.render(path.resolve('views/publicDecks.handlebars'),{
            loggedIn:false,
            publicDeck:publicDecks,
            title: "Browsing public decks"
        })
    })

router
    .route('/:id')
    .get(async(req,res) => {
        if(!req.body){
            res.sendStatus(400)
            return
        }
        let allDecks=undefined
        try{allDecks=await decks.getAllDecks()}
        catch(e){
            console.log(e)
            res.sendStatus(500)
            return
        }
        let publicDecks=allDecks.filter((deck) => {         //filters for just public decks
            return deck.public===true
        })
        let id=validation.checkId(req.params.id)
        let publicDeck=undefined
        try{publicDeck=await decks.getDeckById(id)} catch(e){console.log(e)}
        let creator=undefined;
        try{creator=await users.getUserFromId(publicDeck.creatorId)} catch(e) {console.log(e)}
        res.render(path.resolve('views/singlePublicDeck.handlebars'),{
            loggedIn:false,
            publicDeck:publicDecks,
            title: "Browsing public decks",
            deckName:publicDeck.name,
            subject:publicDeck.subject,
            card:publicDeck.cards,
            creatorName:creator.username,
            creationDate:publicDeck.dateCreated,
            id:publicDeck._id,
            loggedIn:false
        })
    })
    .post(async(req,res) => {              //when browsing a specific deck when not logged in
        if(!req.body){
            res.sendStatus(400)
            return
        }
        let id=validation.checkId(req.params.id)
        let publicDeck=undefined
        try{publicDeck=await decks.getDeckById(id)}
        catch(e){console.log(e)}
        let creator=undefined
        try{creator=await users.getUserFromId(publicDeck.creatorId)}
        catch(e){console.log(e)}
        res.render(path.resolve('views/singlePublicDeck.handlebars'),{
            title:publicDeck.name,
            deckName:publicDeck.name,
            subject:publicDeck.subject,
            card:publicDeck.cards,
            creatorName:creator.username,
            creationDate:publicDeck.dateCreated,
            id:publicDeck._id,
            loggedIn:false
        })

    })

module.exports = router