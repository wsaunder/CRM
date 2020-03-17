var Note = require('../models/note');
var Client = require('../models/client');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
var moment = require('moment')


// Display list of all Notes.
exports.note_list = function(req, res, next) {

  Note.find({}, 'note client')
    .populate('client')
    .exec(function (err, list_notes) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('note_list', { title: 'Note List', note_list: list_notes });
    });

};


// Display detail page for a specific note.
exports.note_detail = function(req, res, next) {

    async.parallel({
        note: function(callback) {

            Note.findById(req.params.id)
              .populate('client')
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.note==null) { // No results.
            var err = new Error('Note not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('note_detail', { note: results.note } );
    });

};

// Display note create form on GET.
exports.note_create_get = function(req, res, next) {

    // Get all clients, which we can use for adding to our note.
    async.parallel({
        clients: function(callback) {
            Client.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('note_form', { title: 'Create Note', clients: results.clients });
    });

};

// Handle note create on POST.
exports.note_create_post = [

    // Validate fields.
    body('client', 'Client must not be empty.').isLength({ min: 1 }).trim(),
    body('note', 'Note must not be empty.').isLength({ min: 1 }).trim(),
    // body('date').trim(),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        const currentDate = moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Note object with escaped and trimmed data.
        var note = new Note(
          {
            client: req.body.client,
            note: req.body.note,
            date: currentDate,
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all clients and genres for form.
            async.parallel({
                clients: function(callback) {
                    Client.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('note_form', { title: 'Create Note',clients:results.clients, note: note, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save note.
            note.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new note record.
                   res.redirect(note.client_url);
                });
        }
    }
];

// Display note delete form on GET.
exports.note_delete_get = function(req, res, next) {

    async.parallel({
        note: function(callback) {
            Note.findById(req.params.id).exec(callback)
        },
        note_client: function(callback) {
          Note.find({ 'client': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.note==null) { // No results.
            res.redirect('/catalog/notes');
        }
        // Successful, so render.
        res.render('note_delete', { title: 'Delete Note', client: results.note_client, note: results.note } );
    });

};

// Handle note delete on POST.
exports.note_delete_post = function(req, res, next) {

    async.parallel({
        note: function(callback) {
          Note.findById(req.body.noteid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        else {
            // Delete object and redirect to the list of clients.
            Note.findByIdAndRemove(req.body.noteid, function deleteNote(err) {
                if (err) { return next(err); }
                // Success - go to client list
                res.redirect('/catalog/clients')
            })
        }
    });
};

// Display note update form on GET.
exports.note_update_get = function(req, res, next) {

    // Get note, clients and genres for form.
    async.parallel({
        note: function(callback) {
            Note.findById(req.params.id).populate('client').exec(callback);
        },
        clients: function(callback) {
            Client.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.note==null) { // No results.
                var err = new Error('Note not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('note_form', { title: 'Update Note', clients: results.clients, note: results.note });
        });

};

// Handle note update on POST.
exports.note_update_post = [


    // Validate fields.
    body('client', 'Client must not be empty.').isLength({ min: 1 }).trim(),
    body('note', 'Note must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Note object with escaped/trimmed data and old id.
        var note = new Note(
          {
            client: req.body.client,
            note: req.body.note,
            date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all clients and genres for form.
            async.parallel({
                clients: function(callback) {
                    Client.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('note_form', { title: 'Update Note',clients: results.clients, note: note, errors: errors.array() });
            });
            return;
        }
        else {

            // Data from form is valid. Update the record.
            Note.findByIdAndUpdate(req.params.id, note, {}, function (err,thenote) {
                if (err) { return next(err); }
                   // Successful - redirect to note detail page.


                   res.redirect(note.client_url);
                });
        }
    }
];
