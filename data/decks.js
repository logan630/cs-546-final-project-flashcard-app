const mongoCollections = require('../config/mongoCollections');
const decks = mongoCollections.decks
const userFunctions = require('./users')
const validation=require('../validation')
const {ObjectId} = require('mongodb');
const { use } = require('../routes/userRoutes');

const createDeck = async (creator,deckName,subject,isPublic) => {
    deckName = validation.checkDeckName(deckName);
    creator  = validation.checkUsername(creator);
    subject  = validation.checkSubject(subject);
    
    const deckCollection=await decks();
    const tempDeck=await deckCollection.findOne({name: deckName.toLocaleLowerCase()})           //if the deck already exists
    if(tempDeck) {
        throw (`A deck named ${deckName} already exists`)
    }
    let user=undefined;
    try {
        user = await userFunctions.getUserIdFromName(creator)
    }
    catch(e) {
        console.dir(e)
    }
    let d=new Date()
    let newDeck = {         //creating deck object  
        name:deckName,
        dateCreated:`${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`,
        subject:subject,
        creatorId:user,
        public:isPublic,
        cards: []
    }
    const insertDeck=await deckCollection.insertOne(newDeck)        //insert that deck object
    if(!insertDeck.acknowledged || !insertDeck.insertedId) 
        throw "Could not add deck"
    return insertDeck
}

const removeDeck = async (id) => {      //deletes deck by id
    id=validation.checkId(id)
    const deckCollection=await decks();
    let deckName=undefined
    try{
        deckName=(await getDeckById(id)).name
    }
    catch(e){
        console.log(e)
    }
    const deletionInfo=await deckCollection.deleteOne({_id:ObjectId(id)})

    if(deletionInfo.deletedCount===0) throw "Could not delete deck"
    return deckName+" has been successfully deleted"
}

const renameDeck = async (id, newName, newPublicity) => {         //updates deck of id with name newName
    id=validation.checkId(id)
    newName=validation.checkDeckName(newName)
    let deckCollection=await decks()
    let updatedDeck = {
        name:newName
    }
    if(typeof newPublicity!='undefined'){
        updatedDeck.public=newPublicity
    }
    const updatedInfo = await deckCollection.updateOne(
        {_id:ObjectId(id)},
        {$set: updatedDeck}
    )
    if(updatedInfo.modifiedCount===0) throw "Could not successfully rename deck"
    return await getDeckById(id);
}

const getDeckById = async (deckId) => {         //finds a deck object given a deck id
    deckId=validation.checkId(deckId.toString())
    const deckCollection=await decks();
    const deck=await deckCollection.findOne({_id: ObjectId(deckId)});
    if(!deck){
        throw new Error(`Could not find deck with id of ${deckId}`)
    }
    return deck;
}

const getAllDecks = async () => {               //returns an array of all the decks
    const deckCollection=await decks()
    const deckList=await deckCollection.find({}).toArray();
    if(!deckList) throw "Could not get all decks"
    for(d of deckList){
        d._id=d._id.toString()
    }
    return deckList
}

const getUsersDecks = async(userId) => {            //gets the decks for a specific user
    userId=validation.checkId(userId)
    const allDecks = await getAllDecks();
    let userDecks = allDecks.filter(deck => {
        return deck.creatorId.toString()===userId.toString()
    })
    return userDecks
}

const doesUserOwnThisDeck = async(userName,deckId) => {     //returns whether or not a given deck (by id) is owned by the user (userName)
    userName=validation.checkUsername(userName)
    deckId=validation.checkId(deckId)
    let userId=undefined
    try{
        userId=await userFunctions.getUserIdFromName(userName)
    }
    catch(e){
        console.log(e)
    }
    let deckFromId=undefined;
    try{
        deckFromId=await getDeckById(deckId)
    }
    catch(e){
        console.log(e)
    }
    if(deckFromId.creatorId===userId.toString())
        return true
    return false
}

const createCard = async (front,back,deckName) => {
    front=validation.checkCard(front,'front')
    back=validation.checkCard(back,'back')
    const deckCollection=await decks();
    const deck=await deckCollection.findOne({name:deckName})
    if(!deck) throw "Deck not found"
    const deckId=deck._id
    if(deck.cards.length>0)             //checks if that card (front) is already present in the deck
        for(i of deck.cards){
            if(i.front.toLowerCase()===front.toLowerCase()){
                throw `A card named ${front} already exists`
            }
        }
    let tempObject=deck
    let newCard={
        front:front,
        back:back
    }
    tempObject.cards.push(newCard)
    return deckCollection
        .updateOne({_id: ObjectId(deck._id)},{$set:tempObject})
        .then(function() {
            return getDeckById(deckId)
        })
}

const removeCard = async (id,frontToRemove) => {            //takes a deckId and the front of a card. Removes card with that front from deck with that id
    id=validation.checkId(id)
    const deckFromId=getDeckById(id)
    const cards=deckFromId.cards
    let cards2=cards.filter(card => {
        return card.front.toLowerCase()!==frontToRemove.toLowerCase()
    })
    const deckCollection=await decks()
    const updatedDeckCards={
        cards:cards2
    }
    const updatedInfo=await deckCollection.updateOne(
        {_id:ObjectId(id)},
        {$set: updatedDeckCards}
    )
    if(updatedInfo.modifiedCount===0) throw `Unable to remove card ${frontToRemove}`
    return await getDeckById(id)
}

const updateCard = async (id,oldFront,newFront,newBack) => {   //takes a deck id and the front of a card to change. Updates the card front and back with new info
    id=validation.checkId(id)
    newFront=validation.checkCard(newFront,'front')
    newBack=validation.checkCard(newBack,'back')
    const updatedCard = {
        front:newFront,
        back:newBack
    }
    const deckCollection=await decks()
    const deckToUpdate=await getDeckById(id)
    let found=false
    deckCards=deckToUpdate.cards
    let i=0
    for(i in deckCards){            //searches for the card with that front
        if(deckCards[i].front.toLowerCase()===oldFront.toLowerCase()){
            found=true
            break;
        }
    }
    deckCards[i]=updatedCard
    if(!found) throw `Cannot find card with front ${oldFront}`
    const updatedDeck={
        cards:deckCards
    }
    const updatedInfo=await deckCollection.updateOne(
        {_id: ObjectId(id)},
        {$set: updatedDeck}
    )
    if(updatedInfo.modifiedCount===0) throw "Could not successfully update card"
    return await getDeckById(id);

}

const getCardBack = async (id,front) => {       //takes a deck id and the front of a card. Returns the back of a card
    id=validation.checkId(id)
    front=validation.checkCard(front,'front')
    let deck=undefined;
    try{
        deck=await getDeckById(id)
    }
    catch(e){
        console.log(e)
    }
    for(item of deck.cards){
        if(item.front.toLowerCase()===front.toLowerCase()){
            return item.back
        }
    }
    //throw `Card named ${front} not found`
}

module.exports = {
    createDeck,
    getDeckById,
    getAllDecks,
    getUsersDecks,
    doesUserOwnThisDeck,
    renameDeck,
    removeDeck,
    createCard,
    removeCard,
    updateCard,
    getCardBack
}