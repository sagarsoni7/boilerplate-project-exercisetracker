const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const urlencodedParser=bodyParser.urlencoded({extended: false});

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://sagarsoni:nopassword123@cluster0-onc9h.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser: true});
const excerciseSchema=mongoose.Schema({
  username:String,
  exercises:[{
    description:String,
    duration:Number,
    date:Date
  }]
});
const exerciseModel=new mongoose.model("Exercise",excerciseSchema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/exercise/new-user",urlencodedParser,(req,res)=>{
  let addUser=new exerciseModel({username: req.body.username})
  addUser.save((err,data)=>{
    if(err) throw err;
    res.json({
      username:data.username,
      _id:data._id
    })
  });
  
})

app.post("/api/exercise/add",urlencodedParser,(req,res)=>{
  let objectToPush={
    description:req.body.description,
    duration:req.body.duration,
    date:req.body.date
  }
  exerciseModel.findById(req.body.userId,(err,data)=>{
    // console.log(data);
    data.exercises.push(objectToPush);
    data.save((err,data)=>{
      if(err) throw err;
      res.json({
        username:data.username,
        description:objectToPush.description,
        duration: objectToPush.duration,
        id: data.id,
        date:objectToPush.date
      });
    });
    
  })
  // res.send("Hor byi")
})
// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
