const mongoose = require('mongoose');
const Logs = require('./sessionLog').sessionLogs;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  log: [Logs]

});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // returnedObject._id = returnedObject._id.toString()
    // delete returnedObject._id
    delete returnedObject.__v
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;