var mongoose = require('mongoose');
var moment = require('moment')

var Schema = mongoose.Schema;

var ClientSchema = new Schema(
  {
    name: {type: String, required: true, max: 100},
    company: {type: String, required: true, max: 100},
    email: {type: String},
    paid_amount: {type: Number},
    due_amount: {type: Number},
    hours_used: {type: Number},
    hours_available: {type: Number},
    deliverables: {type: String},


  }
);



// Virtual for client's lifespan
ClientSchema
.virtual('domain')
.get(function () {
  if (this.email != null){
  return ( this.email.slice(this.email.indexOf('@') + 1))}
});

// Virtual for client's URL
ClientSchema
.virtual('url')
.get(function () {
  return '/catalog/client/' + this._id;
});

//Export model
module.exports = mongoose.model('Client', ClientSchema);
