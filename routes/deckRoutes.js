//This file is for handling routes with decks, cards, and possibly folders
const express=require('express')
const { ObjectId } = require('mongodb')
const router=express.Router()
const path=require('path')
const users=require('../data/users')
const decks=require('../data/decks')
const validation=require('../validation')
const xss=require('xss')
const { url } = require('inspector')

router      
    .route('/decks')
    .get(async (req, res) => { // /decks get route (when you go to the decks page)
        if(!req.body){                  //if user info request fails 
            res.sendStatus(400)
            return
        }
        let u=xss(req.session.user.username)
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
    .post(async (req,res) => {  //          /decks post route (when you create a deck)
        if(!req.body){                  //if deck info request fails
            res.status(400)
            return
        }
        let name=undefined
        let subject=undefined
        try{
            name=xss(validation.checkDeckName(req.body.name))
            subject=xss(validation.checkSubject(req.body.subject))
        }
        catch(e){
            console.log(e)
        }
        let u=xss(req.session.user.username)

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
        try {                                     
            newDeck = await decks.createDeck(u, name, subject, false)
        }
        catch(e){           //if creating a deck fails, send handlebars page with thrown error
            console.log(e)
            error=e;
            res.json({
                //handlebars:path.resolve('views/decks.handlebars'),
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
                //handlebars:path.resolve('views/decks.handlebars'),
                subject: req.body.subject,
                title:u,
                deck:yourDecks,
                id:newDeckId,
                success:true
            })
            //res.render(path.resolve('views/decks.handlebars'),{title:u,deck:yourDecks,userName:u,id:newDeckId})
        }
    })

router      //just one deck
    .route('/decks/:id')
    .get(async (req, res) => {      // /decks/:id /get route (when you go to that page)
        //console.log("Get id: "+req.params.id)
        if(!req.body){
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
                id:id,
                public:deck.public,
                dateCreated:deck.dateCreated
            })
        }
    })
    .post(async (req,res) => {      // /decks/:id /post route (when you create new cards)
        let id=undefined;
        let deck=undefined; 
        let front=undefined;
        let back=req.body.back;
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
            front=xss(validation.checkCard(req.body.front,'front'))
            back=xss(validation.checkCard(req.body.back,'back'))
            card=await decks.createCard(front,back,deck._id)
        }
        catch(e){           //if any of those fail, render the appropriate error
            console.log(e)
            res.json({
                //handlebars:path.resolve('views/singleDeck.handlebars'),
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
                //handlebars:path.resolve('views/singleDeck.handlebars'),
                title:deck.name,
                id:id,
                front:front,                //sending valid data for front and back
                back:back,
                deckName:deck.name,
                success:true
                
            })
        }
    })
    .patch( async(req, res) => {            // /decks/:id patch route. updating deck name and subject
        let id=validation.checkId(req.params.id)
        let newDeckName=req.body.name
        let newDeckSubject=req.body.subject
        let deckOldPublicity=undefined
        try {
            deckOldPublicity = await decks.getDeckById(id).public
        }
        catch(e){
            deckOldPublicity=false
            console.log(e)
        }
        if(req.body.public!==true && req.body.public!==false) console.log("Incorrect value for publicity")
        try{    
            newDeckName=validation.checkDeckName(newDeckName)
            newDeckSubject=validation.checkSubject(newDeckSubject)
            await decks.renameDeck(id,newDeckName,newDeckSubject,req.body.public)
        }
        catch(e){
            console.log(e)
            res.json({
                //handlebars:path.resolve('views/singleDeck.handlebars'),
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
                //handlebars:path.resolve('views/singleDeck.handlebars'),
                title:newDeckName,
                id:id,
                deckName:newDeckName,
                oldPublicity:deckOldPublicity,
                public:req.body.public,
                success:true,
                error:undefined
            })
        }
    })
    .delete( async(req, res) => {       // /decks/:id   delete route. Delete a deck
        let id=validation.checkId(req.params.id)
        try{
            await decks.removeDeck(id)
        }
        catch(e){
            console.log(e)
            res.json({
                //handlebars:path.resolve('views/singleDeck.handlebars'),
                success:false,
                error:e
            })
        }
        if(req.session.user){   
            res.json({
                //handlebars:path.resolve('views/decks.handlebars'),
                success:true,
                error:undefined
            })
        }
        else{
            console.log("Not logged in :(")

        }
    })  
router
    .route('/decks/:id/send')           //sending a deck to another user
    .post(async (req,res) => {
        if(!req.body){
            res.status(400)
            return
        }
        let id=validation.checkId(req.params.id)
        let recipient=undefined
        try{recipient=validation.checkUsername(req.body.sendToAnotherUser)}
        catch(e) {console.log(e)}
        let allUsers=await users.getAllUsers()
        if( (allUsers.filter((user) => {return user.username.toLowerCase()==recipient.toLowerCase()})).length<=0 ){         //if user doesn't exist
            console.log("That user does not exist")
            res.redirect('/protected/decks')
            return
        }
        else{
            let recpientDecks=undefined
            try{
                recipientDecks=await decks.getUsersDecks(await users.getUserIdFromName(recipient))
            }
            catch(e){console.log(e)}
            let deckFromId=undefined; try{deckFromId=await decks.getDeckById(id)} catch(e){console.log(e)}
            let recipientUser=await users.getUserFromName(recipient)                        //if the user already has the deck
            if( (recipientDecks.filter((recdec) => {return recdec.name.toLowerCase()==deckFromId.name.toLowerCase()})).length==1 ){
                console.log(`${recipient} already has this deck`)
            }
            else{
                receivedDeck={
                    name:deckFromId.name,
                    dateCreated:deckFromId.dateCreated,
                    subject:deckFromId.subject,
                    creatorId:recipientUser._id.toString(),
                    public:false,
                    cards:deckFromId.cards
                }
                await decks.insertThisDeck(receivedDeck)                //copy the deck into the deck collection again
            }
        }
        res.redirect('/protected/decks')

    })
router
    .route('/decks/:id/cards/:front')
    .get(async (req,res) => {         // /decks/:id/cards/:front        get route      for getting a specific card
        if(!req.body){
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
        let oldFront=req.url.substring(req.url.indexOf("/cards/")+7).replace(/%20/g," ")
        let back=undefined
        try{ back=await decks.getCardBack(id,oldFront)} catch(e) {console.log(e)}
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
        let front=xss(req.body.front)
        let back=xss(req.body.back)
        let deck=undefined
        let oldFront=req.url.substring(req.url.indexOf("/cards/")+7).replace(/%20/g," ")
        try{
            front=validation.checkCard(front,'front')
            oldFront=validation.checkCard(oldFront,'front')
            back=validation.checkCard(back,'back')
            deck=await decks.getDeckById(id)
        }
        catch(e){
            console.log(e)
                res.json({
                    //handlebars:path.resolve('views/card.handlebars'),
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
        try{
            await decks.updateCard(id,oldFront,front,back)
        }
        catch(e){
            console.log(e)
        }
        if(req.session.user){
            res.json({
                handlebars:path.resolve('views/card.handlebars'),
                title:front,
                id:id,
                cardFront:front,
                cardBack:"bad boy",
                success:true,
                error:undefined,
                deckName:xss(deck.name)
            })
        }
    })
    .delete(async(req,res) => {             //  /decks/:id/cards/:front     delete route    (delete a card)
        let id=(validation.checkId(req.params.id))
        let front=req.url.substring(req.url.indexOf("/cards/")+7).replace(/%20/g," ")
        let back=undefined
        try{back=await decks.getCardBack(id,front)} catch(e){console.log(e)}
        try{await decks.removeCard(id,front)}
        catch(e){
            console.log(e)
            res.json({
                success:true,
                error:e
            })
            return
        }
        if(req.session.user){
            res.json({
                success:true
            })
        }
    })


let correctFlashcards = undefined

router
    .route('/decks/:id/flashcards')
    .get(async(req, res) => {
        //  First check that the id is valid, and that there actually is a deck with that id
        let id   = undefined
        let deck = undefined
        try {
            id   = validation.checkId(req.params.id)
            deck = await decks.getDeckById(id)
        }
        catch(errorMessage) {
            console.log("\n\ncould not get deck for flashcards\n\n")
            console.log(errorMessage)
            res.sendStatus(500)
            return;
        }
        
        let thisUser = undefined
        try{thisUser = await users.getUserFromName(req.session.user.username)}
        catch(errorMessage){console.log(errorMessage)}
        let non_whitelisted_cards = []
        let hasWhitelist = false

        for(let i in (W = thisUser.cards_whitelist)) {
            if(W[i].deckID) {
                for(let j in deck.cards) {
                    if(!(W[i].deckID.includes(j)))
                        non_whitelisted_cards.push(deck.cards[j]);
                }
                hasWhitelist = true
                break
            }
        }

        if(!hasWhitelist) {
            for(let i in deck.cards)
                non_whitelisted_cards.push(deck.cards[i])
        }

        if(!req.session.user)   //  if the user is not logged in, redirect to the homepage
            res.redirect("/")
        else if(non_whitelisted_cards.length === 0)   //  if the non-whitelisted deck has no cards, display a page that tells the user this
            res.render(path.resolve('views/flashcards_empty.handlebars'), {id: id})
        else {    //  an authenticated user will initially see the front of the first flashcard of a non-empty deck
            correctFlashcards = 0
            res.redirect(`/protected/decks/${id}/flashcards/${req.params.cardNumber = 0}/front`)
        }
    })



router
    .route('/decks/:id/flashcards/:cardNumber/front')
    .get(async(req, res) => {
        //  First check that the id is valid, and that there actually is a deck with that id
        let deckID = undefined
        let deck   = undefined
        try {
            deckID = validation.checkId(req.params.id)
            deck   = await decks.getDeckById(deckID)
        }
        catch(errorMessage) {
            console.log("\n\ncould not get deck for flashcards\n\n")
            console.log(errorMessage)
            res.sendStatus(500)
            return;
        }

        let thisUser = undefined
        try{thisUser = await users.getUserFromName(req.session.user.username)}
        catch(errorMessage){console.log(errorMessage)}
        let cardNumber = +(req.params.cardNumber)
        let non_whitelisted_cards = []
        let hasWhitelist = false

        for(let i in (W = thisUser.cards_whitelist)) {
            if(W[i].deckID) {
                for(let j in deck.cards) {
                    if(!(W[i].deckID.includes(j)))
                        non_whitelisted_cards.push(deck.cards[j]);
                }
                hasWhitelist = true
                break
            }
        }

        if(!hasWhitelist) {
            for(let i in deck.cards)
                non_whitelisted_cards.push(deck.cards[i])
        }

        if((cardNumber < 0) || (cardNumber % 1 !== 0) || cardNumber.toString().includes(".") || (cardNumber >= non_whitelisted_cards.length)) {
            console.log("\n\ninvalid flashcard number\n\n")
            res.json({errorMessage: "Invalid flashcard number"})
            return;
        }
        else if(!req.session.user)   //  if the user is not logged in, redirect to the homepage
            res.redirect("/")
        else {  //  otherwise, display the back of the cardNumber-th card
            res.render(path.resolve('views/flashcard_front.handlebars'),
                       {deckID    : deckID,
                        deckName  : deck.name,
                        frontText : non_whitelisted_cards[cardNumber].front,
                        cardNumber: cardNumber
                       }
                      )
        }
    })


router
    .route('/decks/:id/flashcards/:cardNumber/back')
    .get(async(req, res) => {
        //  First check that the deckID is valid, and that there actually is a deck with that id
        let deckID = undefined
        let deck   = undefined
        try {
            deckID = validation.checkId(req.params.id)
            deck   = await decks.getDeckById(deckID)
        }
        catch(errorMessage) {
            console.log("\n\ncould not get deck for flashcards\n\n")
            console.log(errorMessage)
            res.sendStatus(500)
            return;
        }

        let thisUser = undefined
        try{thisUser = await users.getUserFromName(req.session.user.username)}
        catch(errorMessage){console.log(errorMessage)}
        let cardNumber = +(req.params.cardNumber)
        let non_whitelisted_cards = []
        let hasWhitelist = false

        for(let i in (W = thisUser.cards_whitelist)) {
            if(W[i].deckID) {
                for(let j in deck.cards) {
                    if(!(W[i].deckID.includes(j)))
                        non_whitelisted_cards.push(deck.cards[j]);
                }
                hasWhitelist = true
                break
            }
        }

        if(!hasWhitelist) {
            for(let i in deck.cards)
                non_whitelisted_cards.push(deck.cards[i])
        }

        if((cardNumber < 0) || (cardNumber % 1 !== 0) || cardNumber.toString().includes(".") || (cardNumber >= non_whitelisted_cards.length)) {
            console.log("\n\ninvalid flashcard number\n\n")
            res.json({errorMessage: "Invalid flashcard number"})
            return;
        }
        else if(!req.session.user)   //  if the user is not logged in, redirect to the homepage
            res.redirect("/")
        else  //  otherwise, display the back of the cardNumber-th card
            res.render(path.resolve('views/flashcard_back.handlebars'),
                       {deckID            : deckID,
                        deckName          : deck.name,
                        backText          : non_whitelisted_cards[cardNumber].back,
                        cardNumber        : cardNumber,
                        nextCardNumber    : cardNumber + 1,
                        isLastCard        : (cardNumber === non_whitelisted_cards.length - 1)
                       }
                      )
    })
    .post(async(req, res) => {
        //  req.body will have up to two of these keys in this format:
        //      {isCorrect   : "Yes",
        //       markedAsDone: "on"
        //      }
        const {isCorrect, markedAsDone} = req.body

        let deckID = undefined
        let deck   = undefined
        try {
            deckID = validation.checkId(req.params.id)
            deck   = await decks.getDeckById(deckID)
        }
        catch(errorMessage) {
            console.log("\n\ncould not get deck for flashcards\n\n")
            console.log(errorMessage)
            res.sendStatus(500)
            return;
        }

        let thisUser = undefined
        try{thisUser = await users.getUserFromName(req.session.user.username)}
        catch(errorMessage){console.log(errorMessage)}

        let   cardNumber             = +(req.params.cardNumber)
        let   non_whitelisted_cards  = []
        let   hasWhitelist           = false
        let   whitelist_object_index = undefined
        const W                      = thisUser.cards_whitelist

        console.log(thisUser)

        for(let i in W) {
            if(W[i][deckID]) {
                hasWhitelist = true
                whitelist_object_index = i
                for(let j in deck.cards) {
                    if(!(W[i].deckID.includes(j)))
                        non_whitelisted_cards.push(deck.cards[j]);
                }
                break
            }
        }

        if(!hasWhitelist) {
            for(let i in deck.cards)
                non_whitelisted_cards.push(deck.cards[i])
        }

        if((cardNumber < 0) || (cardNumber % 1 !== 0) || cardNumber.toString().includes(".") || (cardNumber >= non_whitelisted_cards.length)) {
            console.log("\n\ninvalid flashcard number\n\n")
            res.json({errorMessage: "Invalid flashcard number"})
            return;
        }
        else if(!req.session.user)   //  if the user is not logged in, redirect to the homepage
            res.redirect("/")
        else if(!isCorrect) {
            cardNumber--
            res.render(path.resolve('views/flashcard_back.handlebars'),
                       {deckID            : deckID,
                        deckName          : deck.name,
                        backText          : non_whitelisted_cards[cardNumber].back,
                        cardNumber        : cardNumber,
                        nextCardNumber    : ++cardNumber,
                        isLastCard        : (cardNumber === non_whitelisted_cards.length - 1),
                        error             : true
                       }
                      )
        }
        else {
            if(isCorrect === "Yes")
                correctFlashcards++
                                        
            // if(markedAsDone) {
            //     if(hasWhitelist) {
            //         console.log("here")
            //         console.log(W[whitelist_object_index][deckID])
            //         thisUser.cards_whitelist[whitelist_object_index][deckID].push(cardNumber - 1)
            //         console.log(W[whitelist_object_index])
            //     }
            //     else {
            //         const newObject = {}
            //         newObject[deckID] = [cardNumber - 1]
            //         thisUser.cards_whitelist.push(newObject)
            //     }
            // }

            console.log(thisUser.cards_whitelist[0])

            res.render(path.resolve('views/flashcard_front.handlebars'),
                       {deckID            : deckID,
                        deckName          : deck.name,
                        frontText         : non_whitelisted_cards[cardNumber].front,
                        cardNumber        : cardNumber,
                        nextCardNumber    : ++cardNumber,
                        isLastCard        : (cardNumber === non_whitelisted_cards.length - 1),
                       }
                      )
        }
    })

router
    .route('/publicdecks')
    .get(async(req,res) => {            //      /publicdecks get route.     For browsing public decks.
        if(!req.body){
            res.status(400)
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
        if(req.session.user){
            res.render(path.resolve('views/publicDecks.handlebars'),{
                title:"Public decks",
                loggedIn:1,
                publicDeck:publicDecks
            })
        }
    })
router
    .route('/publicdecks/:id')
    .get(async(req,res) => {            //      /publicdecks/:id    get route.      For viewing the cards of a public deck.
        if(!req.body){
            res.status(400)
            return
        }
        let id=xss(validation.checkId(req.params.id))
        let publicDeck=undefined
        try{publicDeck=await decks.getDeckById(id)}
        catch(e){console.log(e)}
        let creator=undefined
        try{creator=await users.getUserFromId(publicDeck.creatorId)}
        catch(e){console.log(e)}
        if(req.session.user){
            res.render(path.resolve('views/singlePublicDeck.handlebars'),
            {
                title:publicDeck.name,
                deckName:publicDeck.name,
                subject:publicDeck.subject,
                card:publicDeck.cards,
                creatorName:creator.username,
                creationDate:publicDeck.dateCreated,
                id:publicDeck._id,
                loggedIn:1
            })
        }
    })
    .post(async(req,res) => {           //      /publicdecks/:id        post route.     For when a user saves a public deck
        if(!req.body){
            res.status(400)
            return
        }
        let deckToSave=undefined
        let id=undefined
        try{id=await validation.checkId(req.params.id)}
        catch(e){console.log(e)}
        try{deckToSave=await decks.getDeckById(id)}
        catch(e){console.log(e)}
        let ID=undefined
        try {ID=await users.getUserIdFromName(req.session.user.username)}
        catch(e) {console.log(e)}
        let copyDeck = {                    //makes a deep copy of the deck to insert
            name:deckToSave.name,
            dateCreated:deckToSave.dateCreated,
            subject:deckToSave.subject,
            creatorId:ID,
            public:false,
            cards:deckToSave.cards
        }
        const userDecks=await decks.getUsersDecks(ID);
        for(deck of userDecks){
            if(deck.name===deckToSave.name){
                console.log(`You already have a deck named ${deck.name} in your decks`)
                res.redirect('/protected/publicdecks')
                return
            }
        }
        try{
            await decks.insertThisDeck(copyDeck)
        }
        catch(e){
            console.log(e)
        }
        res.redirect('/protected/publicdecks')
    })

    let shuffledCards = undefined

    router
        .route('/decks/:id/matchingGame')
        .get(async(req, res) => {
            //  First check that the id is valid, and that there actually is a deck with that id
            let id   = undefined
            let deck = undefined
            try {
                id   = validation.checkId(req.params.id)
                deck = await decks.getDeckById(id)
            }
            catch(errorMessage) {
                console.log("\n\ncould not get deck for matching game\n\n")
                console.log(e)
                res.sendStatus(500)
                return;
            }

            if(!req.session.user)   //  if the user is not logged in, redirect to the homepage
                res.redirect("/")
            else if(deck.cards.length === 0)   //  if the deck has no cards, display a page that tells the user this
                res.render(path.resolve('views/matchingGame_empty.handlebars'), {id: id})
            else {  //  an authenticated user will play the matching game on a non-empty deck
                shuffledCards = decks.shuffleArray(deck.cards)
                res.render(path.resolve('views/matchingGame.handlebars'),
                                        {id            : id,
                                         deckName      : deck.name,
                                         sortedCards   : deck.cards,
                                         shuffledCards : shuffledCards,
                                         userInputError: true
                                        }
                                       )
            }

        })
        .post(async(req, res) => {
            //  First check that the id is valid, and that there actually is a deck with that id
            let id   = undefined
            let deck = undefined
            try {
                id   = validation.checkId(req.params.id)
                deck = await decks.getDeckById(id)
            }
            catch(errorMessage) {
                console.log("\n\ncould not get deck for matching game\n\n")
                console.log(e)
                res.sendStatus(500)
                return;
            }

            const userInput = req.body.guessMatches
            let error   = true
            let correct = false

            try {
                validation.checkMatchingGameUserInput(userInput)
                if(Math.ceil((tokens = userInput.replace(/,/g, " , ").trim().split(/\s+/)).length / 2) < deck.cards.length)
                    throw "Not enough cards entered, try again."
                else if(Math.ceil(tokens.length / 2) > deck.cards.length)
                    throw "Too many cards entered, try again."
                else {
                    for(let i in deck.cards) {
                        if(tokens[2 * i] > shuffledCards.length)
                            throw `"${tokens[2 * i]}" is too large of a number for this deck, try again.`
                    }
                    
                    for(let i in deck.cards) {
                        if((deck.cards[i]).back !== (shuffledCards[tokens[2 * i] - 1]).back)
                            throw "Incorrect order, try again."
                    }

                    error   = false
                    correct = true
                    throw "Correct!"
                }
            }
            catch(message) {
                res.render(path.resolve('views/matchingGame.handlebars'),
                            {id            : id,
                             deckName      : deck.name,
                             sortedCards   : deck.cards,
                             shuffledCards : shuffledCards,
                             userInputError: error,
                             success       : correct,
                             message       : message,
                             userInput     : userInput
                            }
                          )
            }
        })

module.exports = router;
