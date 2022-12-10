const bcrypt=require('bcryptjs')
const saltRounds=11
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users
const {ObjectId} = require('mongodb');

const createUser = async (
    username, password
  ) => { 
    let checked_username=checkUsername(username);
    const userCollection=await users(); 
    if(await userCollection.findOne({username:checked_username})) {
      throw "That user already exists"
    }
    let checked_password=checkPassword(password);
    const hashed_pw=await bcrypt.hash(checked_password.toString(),saltRounds)
    let newUser= {
      username: checked_username,
      password: hashed_pw
    }
    const insertUser=await userCollection.insertOne(newUser);
    if(!insertUser.acknowledged || !insertUser.insertedId)
      throw new Error("Could not add user")
    return {insertedUser: true}
  };

const checkUser = async (username, password) => { 
    username=checkUsername(username)
    password=checkPassword(password)
    const userCollection=await users();
    const user=await userCollection.findOne({username:username})
    if(!user) throw "Either the username or password is invalid"
    let user_hashed_password=user.password
    let comparison=await bcrypt.compare(password,user_hashed_password)
    if(comparison) return {authenticatedUser: true}
    throw "Either the username or password is invalid"
};

const getAllUsers = async () => {
    const userCollection=await users();
    const userList=await userCollection.find({}).toArray();
    if(!userList) throw new Error("Could not get all users")
    return userList
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
  
  module.exports = {createUser,checkUser,getAllUsers};