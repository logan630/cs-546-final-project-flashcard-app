const mongoCollections = require('../config/mongoCollections');
const decks = mongoCollections.decks
const userFunctions = require('./users')
const validation=require('../validation')
const {ObjectId} = require('mongodb');
const { use } = require('../routes/userRoutes');

const createDeck = async (creator,deckName,subject,isPublic,cardsArray,dateCreated) => {
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
        console.log(e)
    }
    if(Array.isArray(cardsArray)){
        cards=cardsArray
    }
    else{
        cards=[]
    }
    let d=new Date()
    let newDeck = {         //creating deck object  
        name:deckName,
        dateCreated:`${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`,
        subject:subject,
        creatorId:user,
        public:isPublic,
        cards:cards
    }
    if(typeof dateCreated!='undefined'){
        newDeck.dateCreated=dateCreated
    }
    const insertDeck=await deckCollection.insertOne(newDeck)        //insert that deck object
    if(!insertDeck.acknowledged || !insertDeck.insertedId) 
        throw "Could not add deck"
    return insertDeck
}

const insertThisDeck = async (deck) => {
    const deckCollection=await decks();
    const insertDeck=await deckCollection.insertOne(deck)
    if(!insertDeck.acknowledged || !insertDeck.insertedId) 
        throw "Could not add deck"
    return deck
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

const renameDeck = async (id, newName, newSubject, newPublicity) => {         //updates deck of id with name newName
    id=validation.checkId(id)
    newName=validation.checkDeckName(newName)
    newSubject=validation.checkSubject(newSubject)
    let deckCollection=await decks()
    let updatedDeck = {
        name:newName,
        subject:newSubject
    }
    if(typeof newPublicity!='undefined'){
        updatedDeck.public=newPublicity
    }
    const updatedInfo = await deckCollection.updateOne(
        {_id:ObjectId(id)},
        {$set: updatedDeck}
    )
    if(updatedInfo.modifiedCount===0) throw "Could not successfully update deck"
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

const getDecksBySubject = async (deckSubject) => {
    deckSubject = validation.checkSubject(deckSubject.toString());

    const deckCollection = await decks();
    const deck = await deckCollection.find({subject: {$eq: deckSubject}}).toArray();

    if(!deck.length) {
        throw new Error(`Could not find decks with the subject ${deckSubject}`);
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
    let userDecks=[]
    for(deck of allDecks){
        if(deck.creatorId!=null)
            if(deck.creatorId.toString()===userId.toString())
                userDecks.push(deck)
    }
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

const createCard = async (front,back,deckId) => {
    front=validation.checkCard(front,'front')
    back=validation.checkCard(back,'back')
    deckId=validation.checkId(deckId.toString())
    const deckCollection=await decks();
    const deck=await deckCollection.findOne({_id:ObjectId(deckId)})
    if(!deck) throw "Deck not found"
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
        .updateOne({_id: ObjectId(deckId)},{$set:tempObject})
        .then(function() {
            return getDeckById(deckId)
        })
}

const removeCard = async (id,frontToRemove) => {            //takes a deckId and the front of a card. Removes card with that front from deck with that id
    id=validation.checkId(id)
    const deckFromId=await getDeckById(id)
    const cards=deckFromId.cards
    let cards2=cards.filter((card) => {return card.front.toLowerCase()!==frontToRemove.toLowerCase()})
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
    //front=validation.checkCard(front,'front')
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


//  Performs a Durstenfeld shuffle on a deep copy of an array, then returns the shuffled copied array.
//  Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    if(!(Array.isArray(array)))
        throw "shuffleArray: parameter \"array\" must be of type array, obviously"
        
    let A = []
    for(let i in array)
        A.push(array[i])

    for(let i = A.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [A[i], A[j]] = [A[j], A[i]];
    }

    return A
}


module.exports = {
    createDeck,
    insertThisDeck,
    getDeckById,
    getAllDecks,
    getDecksBySubject,
    getUsersDecks,
    doesUserOwnThisDeck,
    renameDeck,
    removeDeck,
    createCard,
    removeCard,
    updateCard,
    getCardBack,
    shuffleArray
}