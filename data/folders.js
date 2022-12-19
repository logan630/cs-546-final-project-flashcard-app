const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users
const userFunctions = require('./users');
const validation = require('../validation');
const {ObjectId} = require('mongodb');
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
    newName = validation.checkFolderName(newName);

    let userCollection = await users();
    let updatedFolder = {
        name:newName
    }
    let userFolders=await getUsersFolders(userID)
    
    let i=0
    let found=false
    for(i in userFolders){
        if(userFolders[i]._id.toString()===folderID.toString()){
            found=true
            break
        }
    }
    if(!found) throw `Cannot find card with that name`
    userFolders[i].name=newName

    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(userID)},
        {$set: userFolders}
    )

    if (updatedInfo.modifiedCount === 0) throw "Could not successfully rename folder";

    return await getFolderById(folderID);
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

    userID = validation.checkId(userID).toString();

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
    const folder = await getFolderById(userID, folderID);
    const deck = await folder.findOne({decks: {$elemMatch: {$eq: ObjectId(deckID)}}})

    if (deck) throw "Deck is already in folder";

    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(userID), "folders._id": ObjectId(folderId)},
        {$push: {"folders.$.decks": deckID}}
    )

    if (updatedInfo.modifiedCount === 0) throw "Could not successfully add deck to folder";

    return deckID;

}

module.exports = {
    createFolder,
    removeFolder,
    renameFolder,
    getFolderById,
    getUserIdByFolderId,
    getUsersFolders,
    addDecktoFolder
}
