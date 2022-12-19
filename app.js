const express=require('express')
const app=express()
const static=express.static(__dirname+'/public')
const session=require('express-session')
const configRoutes=require('./routes')
const path=require('path')
const decks=require('./data/decks')
const exphbs=require('express-handlebars')
const connection=require('./config/mongoConnection')
const Handlebars = require('handlebars');

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === 'number')
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    }
  },
  dir:['views/']
});

app.use('/public',static)
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

app.use(            //authentication middleware
    session({
        name:'AuthCookie',
        secret: "Oh the middleware, everybody wants to be my checkId",
        resave: false,
        saveUninitialized: true,
        cookie: {maxAge: 800000}
    })
)

app.use('/protected', (req, res, next) => {     //redirect to home if not authenticated
    if (!req.session.user) {
        return res.redirect('/')
    } else {
      next();
    }
  });
app.use('/protected/decks/:id/cards/:front', async (req,res,next) => {
  if(!req.session.user){
    res.redirect('/')
  }
  let id=req.params.id
  let doesOwn=undefined
  try{
    doesOwn=await decks.doesUserOwnThisDeck(req.session.user.username,id)
  }
  catch(e){
    console.log("Checking ownership threw an error")
    return res.redirect('/protected/decks')
  }
  if(!doesOwn){
    console.log("You do not own that deck!!!")
    res.redirect('/protected/decks')
  }
  else{
    res.ignore=true     //if they own the deck, we can ignore the next middleware.
    next()
  }
})
app.use('/protected/decks/:id', async (req,res,next) => {     //if the id in the url does not belong to the user's decks (the deck was made by another user, or the deck is invalid)
  if (!req.session.user) {
    return res.redirect('/')
  }
  let id=req.params.id
  let doesOwn=undefined
  if(!res.ignore) {   
    try{
      doesOwn=await decks.doesUserOwnThisDeck(req.session.user.username,id)
    }
    catch(e){
      console.log("checking ownership failed")
      return res.redirect('/protected/decks')
    }
    if(!doesOwn){
      console.log("You do not own that deck")
      res.redirect('/protected/decks')
    }
    else {
      next();
    }
  }
  else{
    next()
  }
})
app.use('/login', (req, res, next) => {
    if (req.session.user) {
      return res.redirect('/protected');
    } else {
      next();
    }
  });
app.use('/register', (req, res, next) => {
    if (req.session.user) {
      return res.redirect('/protected');
    } else {
      next();
    }
  });

app.use( async (req,res,next) => {          //logging middleware, runs on every route
    //log method it is, URL, and if the user is authenticated
    let start=(new Date().toUTCString()+" "+req.method+" "+req.originalUrl)
    if(req.session.user){
        console.log(start+" (Authenticated User)")
    }
    else {
        console.log(start+" (Non authenticated user)")
    }
    next()
})

configRoutes(app);
const main=async() => {
    const db = await connection.dbConnection();
}

app.listen(3000, () => {
    console.log("Your routes are running on http://localhost:3000");
})
main()