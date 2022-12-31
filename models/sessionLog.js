const mongoose = require('mongoose');

const sessionLogs = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String, required: true }
});

sessionLogs.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.__v
  }
});

const Log = mongoose.model('Log', sessionLogs);

module.exports = {
  sessionLogs,
  Log
};