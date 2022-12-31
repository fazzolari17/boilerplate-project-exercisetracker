const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// mongoose models
const User = require('./models/user');
const { request, response } = require('express');
const Log = require('./models/sessionLog').Log;

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

const mongoUrl = process.env.MONGODB_URI

console.log('connecting to ', mongoUrl);


mongoose
.connect(mongoUrl)
.then(() => console.log('connected to MongoDB'))
.catch(error => console.log('error connecting to MongoDB:', error.message));

mongoose.set('debug', true);


app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users/:_id/logs/', async (request, response, next) => {
  const id = request.params._id;
  let fromDate = request.query.from;
  let toDate = request.query.to;
  const limit = request.query.limit;

  const userToDisplay = await User.findById(id);

  const count = userToDisplay.log.length !== null ? userToDisplay.log.length : 0;
  let logsToDisplay = userToDisplay.log.map(log => {
    const { description, duration, date, _id } = log;
    
      return {
          description,
          duration,
          date: new Date(date).toDateString(),
          _id
        }
  })

  if (fromDate || fromDate && toDate) {
    fromDate = new Date(fromDate).getTime();
    toDate = new Date(toDate).getTime();

    logsToDisplay = logsToDisplay.filter(log => {
      const logDate = new Date(log.date).getTime();
      return logDate >= fromDate && logDate <= toDate
    })
  }
 
  if (limit) {
    logsToDisplay = logsToDisplay.slice(0, limit);
  }

  const objectToReturn = {
    _id: userToDisplay._id,
    username: userToDisplay.username,
    count: count, 
    log: logsToDisplay
  }


  response.status(200).send(objectToReturn);
});

app.post('/api/users/:_id/exercises', async (request, response) => {
  const id = request.params._id;
  const { description, duration } = request.body;
  const userSuppliedDate = request.body.date;
  let date;

  const time = 'T00:00';

  if (userSuppliedDate) {
    date = new Date(userSuppliedDate + time).toDateString();
  } else {
    date = Date.now();
    date = new Date(date).toDateString();
  };
  
  const exerciseToAdd = new Log({
    description,
    duration: Number(duration),
    date
  });
  
  try {
    let userWithAddedExercise = await User.findByIdAndUpdate(id, { $push: { log: exerciseToAdd }}, {returnDocument: 'after'});

    const objectToSend = {
      username: userWithAddedExercise.username,
      _id: userWithAddedExercise._id.toString(),
      description: exerciseToAdd.description,
      duration: exerciseToAdd.duration,
      date: exerciseToAdd.date
    }

    response.status(200).send(objectToSend);
  } catch (error) {
    console.log(error)
  }

});

app.get('/api/users', async (request, response) => {
  const usersInDatabase = await User.find();
  try {
    response.status(200).send(usersInDatabase);
  } catch (error) {
    console.error(error)
  }
});

app.post('/api/users', async (request, response, next) => {
  const { username } = request.body;

  const userToAdd = new User({
    username: username
  });
try {
  const newUser = await userToAdd.save()
  response.status(200).send(newUser)
  
} catch (error) {
  console.error(error);
}
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
