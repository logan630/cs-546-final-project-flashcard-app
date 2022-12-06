//Here you will require route files and export the constructor method as shown in lecture code and worked in previous labs.
const quackRoutes=require('./quackroutes')
const path=require('path')

const constructorMethod = (app) => {
    app.get('/', (req, res) => {
        res.sendFile(path.resolve('static/homepage.html'));
      });
    app.use('/',quackRoutes);
    app.use('*',(req,res) => {
        res.status(404).json({error: "Not Found!"})
    })
}

module.exports=constructorMethod;