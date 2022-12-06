const express=require('express')
const app=express()
const static=express.static(__dirname+'/public')
const session=require('express-session')
const configRoutes=require('./routes')
const path=require('path')
const exphbs=require('express-handlebars')
const connection=require('./config/mongoConnection')
const {ObjectId}=require('mongodb')

app.use('/public',static)
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutes(app);
const main=async() => {
    //const db = await connection.dbConnection();
    //console.log("here2")
}

app.listen(3000, () => {
    console.log("Your routes are running on http://localhost:3000");
})
main()