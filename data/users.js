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
    let checked_password=validation.checkPassword(password);
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

const getUserFromId = async(id) => {
  id=validation.checkId(id)
  const userCollection=await users()
  const userFromId=await userCollection.findOne({_id:ObjectId(id)});
  if(!userFromId) throw "Error, no user found with that id"
  userFromId._id=userFromId._id.toString()
  return userFromId
}

const getUsernameFromId = async(user) => {
  userName=validation.checkUsername(userName)
  const userCollection = await users();
  const userFromName = await userCollection.findOne({username:userName})
  if(!userFromName) throw "Error: no user with name" +userName+" found"
  return userFromName._id.toString()
}

const getUserFromName = async (userName) => {
  userName=validation.checkUsername(userName)
  const userCollection = await users();
  const userFromName = await userCollection.findOne({username:userName})
  if(!userFromName) throw "Error: no user with name" +userName+" found"
  return userFromName
}

const getUserIdFromName = async (userName) => {
  const user=await getUserFromName(userName)
  return user._id.toString()
}
  
module.exports = {
  createUser,
  checkUser,
  getAllUsers,
  getUserFromId,
  getUsernameFromId,
  getUserFromName,
  getUserIdFromName
};