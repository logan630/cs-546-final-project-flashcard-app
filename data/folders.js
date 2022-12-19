const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users
const userFunctions = require('./users');
const validation = require('../validation');
const {ObjectId, UnorderedBulkOperation, ObjectID} = require('mongodb');
const { folders } = require('.');

// Makes a new folder with name folderName for user with ID userID
const createFolder = async (folderName, userID) => {

    folderName = validation.checkFolderName(folderName);
    userID = validation.checkId(userID.toString());

    // Check if the folder already exists

    const userCollection = await users();
    const tempUser = await userCollection.findOne({_id: ObjectId(userID)}); 

    for (let n of tempUser.folders) {
        if (n.name === folderName) throw (`A folder named ${folderName} already exists`);
    }

    // Create a new folder

    let newFolder = {         
        _id: ObjectId().toString(), 
        name: folderName,
        decks: []
    }

    // Insert the new folder

    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(userID)},
        {$push: {"folders": newFolder}}
    )

    if (updatedInfo.modifiedCount === 0) throw "Could not successfully create folder";

    return newFolder;
}

// Deletes folder by folderID and userID
const removeFolder = async (folderID) => {      

    folderID = validation.checkId(folderID.toString());
    const userCollection = await users();
    const userID=await getUserIdByFolderId(folderID)
    //const user=await userFunctions.getUserFromId(userID)
    const folders=await getUsersFolders(userID.toString())
    let folders2=folders.filter((folder) => {return folder._id.toString()!==folderID.toString()})
    const updatedFolders = {
        folders:folders2
    }
    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(userID)},
        {$set:updatedFolders}
    )

    if (updatedInfo.modifiedCount === 0) throw "Could not delete folder";

    return "Folder has been successfully deleted";
}

// Updates folder of folderID (belonging to user with ID userID) with name newName
const renameFolder = async (folderID, newName) => {       
    folderID = validation.checkId(folderID.toString());
    let userID = await getUserIdByFolderId(folderID)
    //userID=userID.toString()
    console.log(userID.toString())
    newName = validation.checkFolderName(newName);
    let user=await userFunctions.getUserFromId(userID.toString())
    let userCollection = await users();
    let userFolders=await getUsersFolders(userID.toString())
    let folder = await getFolderById(userID, folderID)
    let i=0
    for(i in userFolders){
        if(userFolders[i]._id.toString()===folderID.toString()){
            found=true
            break
        }
    }
    let newFolder={
        _id: folder._id,
        name:newName,
        decks:folder.decks
    }
    let userFolders2=userFolders
    userFolders2[i]=newFolder
    let updatedUser = {
        password:user.password,
        folders:userFolders2
    }

    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(userID)},
        {$set: updatedUser}
    )

    if (updatedInfo.modifiedCount === 0) throw "Could not successfully rename folder";

    return await getFolderById(userID, folderID);
}

// Retrieves a folder object (given a folderID) that belongs to user with ID userID
const getFolderById = async (userID, folderID) => {   

    userID = validation.checkId(userID.toString());
    folderID = validation.checkId(folderID.toString());

    const userCollection = await users();
    const thatUser=await userFunctions.getUserFromId(userID)

    for(folder of thatUser.folders){
        if(folder._id.toString()===folderID.toString()){
            return folder
        }
    }
    throw new Error(`Could not find folder with ID of ${folderID}`);
    /*const folder = await userCollection.aggregate([

        {"$match": {_id: ObjectId(userID)}},

        {"$undwind": "$folders"},

        {"$match": {"folders._id": ObjectId(folderID)}},

        {"$replaceRoot": {"newRoot": "$folders"}}
    ]);

    if (!folder) throw new Error(`Could not find folder with ID of ${folderID}`);

    return folder;*/
}

const getFolderIdFromName = async(userId, folderName) => {
    userId=validation.checkId(userId)
    folderName=validation.checkFolderName(folderName)
    userFolders=await getUsersFolders(userId)
    for(f of userFolders){
        if(f.name.toLowerCase()===folderName.toLowerCase()){
            return f._id.toString()
        }
    }
    throw "That user does not have that folder"
}

// Retrieves a userID given a folderID
const getUserIdByFolderId = async (folderID) => {   

    folderID = validation.checkId(folderID.toString());

    const userCollection = await users();

    let allUsers=await userFunctions.getAllUsers()
    for(user of allUsers){
        for(folder of user.folders){
            
            if(folder._id.toString()===folderID.toString()){
                return user._id;
            }
        }
    }
    throw new Error(`Could not find user with folder of ID ${folderID}`)
    /*const userFound = await userCollection.find(
        {"_id": {
            "$in": userCollection.distinct("folders._id", {"_id": ObjectId(folderID)})
        }}
    )
    //console.dir({data: userFound}, {depth:null})

    if (!userFound) throw new Error(`Could not find user with folder of ID ${folderID}`);

    userID = userFound._id;

    return userID;*/
}

// Retrieves an array of all the folders belonging to user with ID userID
const getUsersFolders = async(userID) => {  

    userID = validation.checkId(userID.toString());

    const userCollection = await users();
    const tempUser = await userCollection.findOne({_id: ObjectId(userID)}); 

    let userFolders = tempUser.folders;

    return userFolders;
}

// Adds the deckID to folder with ID folderID belonging to user with ID userID
const addDecktoFolder = async (userID, folderID, deckID) => {

    userID = validation.checkId(userID.toString());
    folderID = validation.checkId(folderID.toString());
    deckID = validation.checkId(deckID.toString());

    const userCollection = await users();
    const user = await userCollection.findOne({_id:ObjectId(userID)})/*getFolderById(userID, folderID);*/
    const folder = user.folders.filter((folder) => {
        return folder._id.toString()===folderID.toString()
    })[0]
    if(folder.decks.includes(deckID.toString())) throw "Deck is already in folder";
    let newDeck=folder.decks
    newDeck.push(deckID)
    let newFolders = user.folders
    for(n in newFolders){
        if(newFolders[n]._id.toString()===folderID.toString()){
            newFolders[n] = {
                _id:newFolders[n]._id,
                name:newFolders[n].name,
                decks:newDeck
            }
            break
        }
    }

    let newUser = {
        folders:newFolders
    }

    //const deck = await folder.findOne({_id:ObjectId(deckID)})/*folder.findOne({decks: {$elemMatch: {$eq: ObjectId(deckID)}}})*/

    //if (deck) throw "Deck is already in folder";

    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(userID)},
        {$set: newUser}
        /*{_id: ObjectId(userID), "folders._id": ObjectId(folderID)},
        {$push: {"folders.$.decks": deckID}}*/
    )

    if (updatedInfo.modifiedCount === 0) throw "Could not successfully add deck to folder";

    return deckID;

}

const removeDeckFromFolder = async(userID, folderID, deckID) => {
    userID = validation.checkId(userID.toString());
    folderID = validation.checkId(folderID.toString());
    deckID = validation.checkId(deckID.toString());

    const userCollection = await users();
    const user = await userCollection.findOne({_id:ObjectId(userID)})/*getFolderById(userID, folderID);*/
    const folder = user.folders.filter((folder) => {
        return folder._id.toString()===folderID.toString()
    })[0]
    if(!folder.decks.includes(deckID.toString())) throw "Deck is not in folder";
    let newDeck=folder.decks
    
    let newFolders = user.folders
    for(n in newFolders){
        if(newFolders[n]._id.toString()===folderID.toString()){
            newFolders[n] = {
                _id:newFolders[n]._id,
                name:newFolders[n].name,
                decks:newDeck.filter((deck) => {return deck.toString()!==deckID.toString()})
            }
            break
        }
    }
    let newUser = {
        folders:newFolders
    }

    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(userID)},
        {$set: newUser}

    )

    if (updatedInfo.modifiedCount === 0) throw "Could not successfully remove deck from folder";

    return deckID;
}

module.exports = {
    createFolder,
    removeFolder,
    renameFolder,
    getFolderById,
    getUserIdByFolderId,
    getFolderIdFromName,
    getUsersFolders,
    addDecktoFolder,
    removeDeckFromFolder
}
