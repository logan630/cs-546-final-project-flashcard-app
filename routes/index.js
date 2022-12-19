//Here you will require route files and export the constructor method as shown in lecture code and worked in previous labs.
const userRoutes=require('./userRoutes')
const deckRoutes=require('./deckRoutes')
const publicDeckRoutes=require('./publicDeckRoutes')
const folderRoutes=require('./folderRoutes')
const path=require('path')

const constructorMethod = (app) => {
    /*app.get('/', (req, res) => {
        res.sendFile(path.resolve('static/homepage.html'));
      });*/
    app.use('/',userRoutes);
    app.use('/protected/folders',folderRoutes)
    app.use('/protected',deckRoutes)
    app.use('/browsepublicdecks',publicDeckRoutes)
    app.use('*',(req,res) => {
        res.status(404).json({error: "Not Found!"})
    })
}

module.exports=constructorMethod;