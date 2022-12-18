const bcrypt=require('bcryptjs')
const saltRounds=11
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users
const validation=require('../validation')
const {ObjectId} = require('mongodb');
const xss=require('xss')

const createUser = async (      //checks if user submitted valid credentials when registering
    username, password
  ) => { 
    username=validation.checkUsername(username);
    const userCollection=await users(); 
    if(await userCollection.findOne({username:username})) {
      throw "That user already exists"
    }
    password=validation.checkPassword(password);
    const hashed_pw=await bcrypt.hash(password.toString(),saltRounds)
    let newUser= {
      username: username,
      password: hashed_pw
    }
    const insertUser=await userCollection.insertOne(newUser);
    if(!insertUser.acknowledged || !insertUser.insertedId)
      throw new Error("Could not add user")
    return {insertedUser: true}
  };

const checkUser = async (username, password) => {   //checks if user login is valid
    username=xss(validation.checkUsername(username))
    password=xss(validation.checkPassword(password))
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

const getUserFromId = async(id) => {    //given an id of a user, return the user object
  id=validation.checkId(id)
  const userCollection=await users()
  const userFromId=await userCollection.findOne({_id:ObjectId(id)});
  if(!userFromId) throw "Error, no user found with that id"
  userFromId._id=userFromId._id.toString()
  return userFromId
}

const getUserFromName = async (userName) => {       //given a username, return the object that corresponds to it
  userName=validation.checkUsername(userName)
  const userCollection = await users();
  const userFromName = await userCollection.findOne({username:userName})
  if(!userFromName) throw "Error: no user with name" +userName+" found"
  return userFromName
}

const getUserIdFromName = async (userName) => {     //given a username, return the id of that user
  const user=await getUserFromName(userName)
  return user._id.toString()
}
  
module.exports = {
  createUser,
  checkUser,
  getAllUsers,
  getUserFromId,
  getUserFromName,
  getUserIdFromName
};