const {ObjectId} = require('mongodb')

function checkDeckName(deckName){
    if(!deckName) throw new Error("Error: Deck name is not defined")
    if(typeof deckName!=='string') throw "Deck name must be a string"
    if(deckName.trim().length===0) throw "Deck name cannot be empty spaces"
    deckName=deckName.trim()
    if(deckName.length>30) throw "Deck name cannot be longer than 30 characters"
    if(deckName.length<=1) throw "Deck name must be at least 2 characters"
    if((/[/\\]/).test(deckName)) throw "Deck name contains an illegal character"
    return deckName
}

const checkUsername = (username) => {
    if(!username) throw ("You must supply a username")
    if(typeof username!=='string') throw "Username must be a string"
    //username length and spaces
    if(username.includes(" ")) throw "Username cannot include spaces"
    if((/[^a-z0-9]/i).test(username)) throw "Username must only consist of alphanumeric characters"
    username=username.trim().toLowerCase()
    if(username.length<4) throw "Username must be at least 4 characters long"
    return username
}
  
const checkPassword = (password) => {
    if(!password) throw ("You must supply a password")
    if(typeof password!=='string') throw "Password must be a string"
    //password length and spaces
    if(password.includes(" ")) throw "Password cannot include spaces"
    
    if(password.length<6) throw "Password must be at least 6 characters long"
    //password criteria
    if(password.toLowerCase()===password) throw "Password must include at least one uppercase character"
    if(!(/[0-9]/).test(password)) throw ("Password must include at least one number")
    if(!(/[^a-z0-9]/i).test(password)) throw "Password must include at least one special character"
    return password
}  

function checkSubject(sub){
    if(typeof sub!=='string') throw "Subject must be a string"
    sub=sub.trim()
    if(sub.length>50) throw "Subject cannot be longer than 50 characters"
    if((/[/\\]/).test(sub)) throw "Subject name contains an illegal character"
    if(sub.length===0) sub="(No subject)"
    return sub
}

function checkId(id){
    if(!id) throw "id is not defined"
    if(typeof id!=='string') throw 'id is not a string'
    if(id.trim().length===0) throw new Error("id cannot be an empty string or just spaces")
    id=id.trim();
    if(!ObjectId.isValid(id)) throw new Error("Invalid object id")
    return id
}

function checkCard(contents,forb,maxLen){
    if(!contents) throw `Card ${forb} is not defined`
    if(typeof contents!=='string') throw `Card ${forb} contents is not a string`
    if(contents.trim().length<=1) throw `Card ${forb} must be at least one character`
    contents=contents.trim()
    if(contents.length>maxLen) throw `Card ${forb} contents is longer than ${maxLen}`
    return contents
}

module.exports = {
    checkUsername,
    checkPassword,
    checkDeckName,
    checkSubject,
    checkId,
    checkCard
}