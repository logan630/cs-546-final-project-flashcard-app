const {ObjectId} = require('mongodb')

const frontLenMax=50
const backLenMax=200
const deckNameLenMax=30

function checkDeckName(deckName){
    if(!deckName) throw new Error("Deck name is not defined")
    if(typeof deckName!=='string') throw "Deck name must be a string"
    if(deckName.trim().length===0) throw "Deck name cannot be empty spaces"
    deckName=deckName.trim()
    if(deckName.length>deckNameLenMax) throw `Deck name cannot be longer than ${deckNameLenMax} characters`
    if(deckName.length<=1) throw "Deck name must be at least 2 characters"
    if((/[/\\]/).test(deckName)) throw "Deck name contains an illegal character"
    return deckName
}

const checkUsername = (username) => {
    if(!username) throw new Error("You must supply a username")
    if(typeof username!=='string') throw "Username must be a string"
    //username length and spaces
    if((/[ \s]/).test(username)) throw "Username cannot include spaces"
    if((/[^a-z0-9]/i).test(username)) throw "Username must only consist of alphanumeric characters"
    username=username.trim().toLowerCase()
    if(username.length < 4) throw "Username must be at least 4 characters long"
    return username
}
  
const checkPassword = (password) => {
    if(!password) throw new Error("You must supply a password")
    if(typeof password!=='string') throw "Password must be a string"
    //password length and spaces
    if((/[ \s]/).test(password)) throw "Password cannot include spaces"
    
    if(password.length<6) throw "Password must be at least 6 characters long"
    //password criteria
    if(password.toLowerCase()===password) throw "Password must include at least one uppercase character"
    if(!(/[0-9]/).test(password)) throw ("Password must include at least one number")
    if(!(/[^a-z0-9]/i).test(password)) throw "Password must include at least one special character"
    return password
}  

function checkSubject(subject){
    if(!subject) throw new Error("You must supply a subject")
    //console.log(subject);
    if(typeof subject!=='string') throw new Error('Subject is not a string')
    subject=subject.trim()
    if(subject.length>50) throw "Subject cannot be longer than 50 characters"
    if((/[/\\]/).test(subject)) throw "Subject name contains an illegal character"
    if(subject.length===0) subject="(No subject)"
    return subject
}

function checkId(id){
    if(!id) throw new Error("id is not defined")
    if(typeof id!=='string') throw new Error('id is not a string')
    if(id.trim().length===0) throw new Error("id cannot be an empty string or just spaces")
    id=id.trim();
    if(!ObjectId.isValid(id)) throw new Error("Invalid object id")
    return id
}

function checkCard(contents,forb){          //it's forbin time
    if(!contents) throw new Error(`Card ${forb} is not defined`)
    if(typeof contents!=='string') throw `Card ${forb} contents is not a string`
    if(contents.trim().length<2) throw `Card ${forb} must be at least two characters`
    contents=contents.trim()
    let maxLen=0
    if(forb==='front') maxLen=frontLenMax
    else if(forb==='back') maxLen=backLenMax
    if((/[/\\]/).test(contents)) throw `${forb} contains an illegal character`
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