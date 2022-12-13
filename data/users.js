const bcrypt=require('bcryptjs')
const saltRounds=11
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users
const validation=require('../validation')
const {ObjectId} = require('mongodb');

const createUser = async (
    username, password
  ) => { 
    let checked_username=validation.checkUsername(username);
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
    username=validation.checkUsername(username)
    password=validation.checkPassword(password)
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
  
  module.exports = {createUser,checkUser,getAllUsers};