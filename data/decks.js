const mongoCollections = require('../config/mongoCollections');
const decks = mongoCollections.decks
const users = mongoCollections.users
const userFunctions = require('./users')
const validation=require('../validation')
const {ObjectId} = require('mongodb');

const createDeck = async (creator,deckName,subject,isPublic) => {
    deckName=validation.checkDeckName(deckName);
    creator=validation.checkUsername(creator)
    const deckCollection=await decks();
    const tempDeck=await deckCollection.findOne({name: deckName})
    if(tempDeck) {
        throw `A deck named ${deckName} already exists`
    }
    let user=undefined;
    try {
        user = await userFunctions.getUserIdFromName(creator)
    }
    catch(e) {
        console.dir(e)
    }
    let d=new Date()
    let newDeck = {
        name:deckName,
        dateCreated:`${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`,
        subject:subject,
        creatorId:user,
        public:isPublic,
        cards: []
    }
    const insertDeck=await deckCollection.insertOne(newDeck)
    if(!insertDeck.acknowledged || !insertDeck.insertedId) 
        throw "Could not add deck"
    return insertDeck
}

const removeDeck = async (id) => {
    id=validation.checkId(id)
    const deckCollection=await decks();
    let deckName=(await getDeckById(id)).name
    const deletionInfo=await deckCollection.deleteOne({_id:ObjectId(id)})

    if(deletionInfo.deletedCount===0) throw "Could not delete deck"
    return deckName+" has been successfully deleted"
}

const renameDeck = async (id, newName) => {
    id=validation.checkId(id)
    newName=validation.checkDeckName(newName)
    let deckCollection=await decks()
    const updatedDeck = {
        name:newName
    }
    const updatedInfo = await deckCollection.updateOne(
        {_id:ObjectId(id)},
        {$set: updatedDeck}
    )
    if(updatedInfo.modifiedCount===0) throw "Could not successfully rename deck"
    return await getDeckById(id);
}

const getDeckById = async (deckId) => {
    deckId=validation.checkId(deckId.toString())
    const deckCollection=await decks();
    const deck=await deckCollection.findOne({_id: ObjectId(deckId)});
    if(!deck) throw `Could not find deck with id of ${deckId}`
    return deck;
}

const getAllDecks = async () => {
    const deckCollection=await decks()
    const deckList=await deckCollection.find({}).toArray();
    if(!deckList) throw "Could not get all decks"
    for(d of deckList){
        d._id=d._id.toString()
    }
    return deckList
}

const getUsersDecks = async(userId) => {
    userId=validation.checkId(userId)
    const allDecks = await getAllDecks();
    let userDecks = allDecks.filter(deck => {
        return deck.creatorId.toString()===userId.toString()
    })
    return userDecks
}

const createCard = async (front,back,deckName) => {
    front=validation.checkCard(front,'front')
    back=validation.checkCard(back,'back')
    const deckCollection=await decks();
    const deck=await deckCollection.findOne({name:deckName})
    const deckId=deck._id
    if(!deck) throw "Deck not found"
    /*if(deck.cards.length>0)
        for(i in deck.cards){
            
            if(i.front.toLowerCase()===front.toLowerCase()){
                throw `A card named ${front} already exists`
            }
        }*/
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

const removeCard = async (id,frontToRemove) => {
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

const updateCard = async (id,oldFront,newFront,newBack) => {
    id=validation.checkId(id)
    newFront=validation.checkCard(newFront,'front')
    newBack=validation.checkCard(newBack,'back')
    const deckCollection=await decks()
    const updatedCard = {
        front:newFront,
        back:newBack
    }
    const deckToUpdate=getDeckById(id)
    let found=false
    for(card in deckToUpdate){
        if(card[front].toLowerCase()===oldFront.toLowerCase()){
            //card[front]=newFront
            found=true
            break;
        }
    }
    if(!found) throw `Cannot find card with front ${oldFront}`
    const updatedInfo=await deckCollection.updateOne(
        {_id: ObjectId(id)},
        {$set: updatedCard}
    )
    if(updatedInfo.modifiedCount===0) throw "Could not successfully update card"
    return await getDeckById(id);

}

module.exports = {
    createDeck,
    getDeckById,
    getAllDecks,
    getUsersDecks,
    renameDeck,
    removeDeck,
    createCard,
    removeCard,
    updateCard
}