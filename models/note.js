var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NoteSchema = new Schema(
  {
    client: {type: Schema.Types.ObjectId, ref: 'Client', required: true},
    note: {type: String, required: true},
    date: {type: String},
  }
);

// Virtual for book's URL
NoteSchema
.virtual('url')
.get(function () {
  return '/catalog/note/' + this._id;
});

NoteSchema
.virtual('client_url')
.get(function () {
  return '/catalog/client/' + this.client._id;
});


//Export model
module.exports = mongoose.model('Note', NoteSchema);
