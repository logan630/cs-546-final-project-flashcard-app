const express=require('express')
const { ObjectId } = require('mongodb')
const router=express.Router()
const path=require('path')
const users=require('../data/users')
const decks=require('../data/decks')
const folders=require('../data/folders')
const validation=require('../validation')
const xss=require('xss')

// /protected/folders

router
    .route('/')
    .get(async (req,res) => {           //getting folders
        if(!req.body){
            res.sendStatus(400)
            return
        }
        let userId=undefined
        let u=validation.checkUsername(req.session.user.username)
        let yourFolders=undefined 
        try{
            userId=await users.getUserIdFromName(u)
            yourFolders=await folders.getUsersFolders(userId)    
        }
        catch(e){console.log(e)
            if(!yourFolders){
                res.sendStatus(500)
                return
            }
        }
        res.render(path.resolve('views/folders.handlebars'),{
            userName:u,
            folder:yourFolders,
            title:"Your folders"
        })

    })
    .post(async (req,res) => {          //creating a folder
        if(!req.body){                 
            res.status(400)
            return
        }
        let name=undefined
        try{name=xss(validation.checkFolderName(req.body.name))}
        catch(e){console.log(e)}
        let u=xss(req.session.user.username)
        let userId=await users.getUserIdFromName(u)
        let yourFolders=undefined
        try{yourFolders=await folders.getUsersFolders(userId)}
        catch(e){console.log(e)}
        let newFolder=undefined
        try{
            newFolder=await folders.createFolder(name,userId)
        }
        catch(e){
            console.log(e)
            res.status(400)
            res.json({
                title:"Error making folder",
                success:false,
                error:e.toString()
            })
            return
        }
        let newFolderId=newFolder._id
        console.log(yourFolders)
        res.json({
            title:name,
            id:newFolderId,
            success:true,
            folder:yourFolders,
        })

    })

router
    .route('/:id')
    .get(async (req,res) => {           //getting contents in a folder
        if(!req.body){
            res.status(400)
            return
        }
        let folder=undefined
        let id=undefined
        let userName=validation.checkUsername(req.session.user.username)
        let userId=undefined
        try{
            userId=await users.getUserIdFromName(userName)
            id=validation.checkId(req.params.id)
            folder=await folders.getFolderById(userId,id)
        }
        catch(e){
            console.log(e)
            res.sendStatus(500)
            return
        }
        let folderDecks=[]
        //console.log(folder)
        try{
            for(deckId of folder.decks){
                folderDecks.push(await decks.getDeckById(deckId))
            }
        }
        catch(e){console.log(e)}
        res.render(path.resolve('views/singleFolder.handlebars'),{
            title:folder.name,
            deck:folderDecks,
            folderName:folder.name,
            id:id,
            success:true
        })
    })
    .patch(async (req,res) => {             //renaming a folder
        let id=validation.checkId(req.params.id)
        let newFolderName=req.body.name;
        try{
            newFolderName=validation.checkFolderName(newFolderName)
            await folders.renameFolder(id.toString(),newFolderName)
        }
        catch(e){
            console.log(e)
            res.json({
                title:"Error renaming folder",
                id:undefined,
                folderName:newFolderName,
                success:false,
                error:e.toString()
            })
            return
        }
        
        res.json({
            title:newFolderName,
            id:id,
            folderName:newFolderName,
            success:true,
            error:undefined
        })
    })
    .delete(async (req,res) => {
        let id=validation.checkId(req.params.id)
        try{
            await folders.removeFolder(id)
        }
        catch(e){
            console.log(e)
            res.json({
                success:false,
                error:e.toString()
            })
            return
        }
        res.json({
            success:true,
            error:undefined
        })
    })

module.exports = router