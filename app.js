const express=require('express')
const app=express()
const static=express.static(__dirname+'/public')
const session=require('express-session')
const configRoutes=require('./routes')
const path=require('path')
const exphbs=require('express-handlebars')
const connection=require('./config/mongoConnection')
const {ObjectId}=require('mongodb')
const constructorMethod = require('./routes')

app.use('/public',static)
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(            //authentication middleware
    session({
        name:'AuthCookie',
        secret: "Some secret string",
        resave: false,
        saveUninitialized: true,
        cookie: {maxAge: 600000}
    })
)

app.use('/protected', (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/')
    } else {
      next();
    }
  });
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

app.use( async (req,res,next) => {          //logging middleware
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
    //console.log("here2")
}

app.listen(3000, () => {
    console.log("Your routes are running on http://localhost:3000");
})
main()