var Client = require('../models/client')
var async = require('async');
var Note = require('../models/note');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


exports.index = function(req, res) {

    async.parallel({
        client_count: function(callback) {
          Client.countDocuments({}, callback)
        },
        note_count: function(callback) {
          Note.countDocuments({}, callback)
        },
    }, function(err, results) {
        res.render('index', { title: 'CRM', error: err, data: results });
    });
};
// Display list of all Clients.
exports.client_list = function(req, res, next) {

  Client.find()
    .sort([['company', 'ascending']])
    .exec(function (err, list_clients) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('client_list', { title: 'Client List', client_list: list_clients });
    });

};

// Display detail page for a specific Client.
exports.client_detail = function(req, res, next) {

    async.parallel({
        client: function(callback) {
            Client.findById(req.params.id)
              .exec(callback)
        },
        clients_notes: function(callback) {
          Note.find({'client': req.params.id}, 'note date url')
          .sort([['date', 'descending']])
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.client==null) { // No results.
            var err = new Error('Client not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('client_detail', { title: 'Client Detail', client: results.client, client_notes: results.clients_notes } );
    });

};

// Display Client create form on GET.
exports.client_create_get = function(req, res, next) {
    res.render('client_form', { title: 'Create Client'});
};

// Handle Client create on POST.
exports.client_create_post = [

    // Validate fields.
    body('name').isLength({ min: 1 }).trim().withMessage('Name must be specified.'),
    body('company').isLength({ min: 1 }).trim().withMessage('Company name must be specified.'),
    body('email').trim(),
    body('paid_amount').trim().isAlphanumeric().withMessage('Amount has non-alphanumeric characters.'),
    body('due_amount').trim().isAlphanumeric().withMessage('Amount has non-alphanumeric characters.'),
    body('hours_used').trim().isAlphanumeric().withMessage('Hours used has non-alphanumeric characters.'),
    body('hours_available').trim().isAlphanumeric().withMessage('Hours available has non-alphanumeric characters.'),
    body('deliverables').trim(),


    // Sanitize fields.
    sanitizeBody('name').escape(),
    sanitizeBody('company').escape(),
    sanitizeBody('email').escape(),
    sanitizeBody('paid_amount').escape(),
    sanitizeBody('due_amount').escape(),
    sanitizeBody('hours_used').escape(),
    sanitizeBody('hours_available').escape(),
    sanitizeBody('deliverables').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('client_form', { title: 'Create Client', client: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Client object with escaped and trimmed data.
            var client = new Client(
                {
                    name: req.body.name,
                    company: req.body.company,
                    email: req.body.email,
                    paid_amount: req.body.paid_amount,
                    due_amount: req.body.due_amount,
                    hours_used: req.body.hours_used,
                    hours_available: req.body.hours_available,
                    deliverables: req.body.deliverables
                });
            client.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new client record.
                res.redirect(client.url);
            });
        }
    }
];

// Display Client delete form on GET.
exports.client_delete_get = function(req, res, next) {

    async.parallel({
        client: function(callback) {
            Client.findById(req.params.id).exec(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.client==null) { // No results.
            res.redirect('/catalog/clients');
        }
        // Successful, so render.
        res.render('client_delete', { title: 'Delete Client', client: results.client} );
    });

};

// Handle Client delete on POST.
exports.client_delete_post = function(req, res, next) {

    async.parallel({
        client: function(callback) {
          Client.findById(req.body.clientid).exec(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }
        // Success

        else {
            // Client has no notes. Delete object and redirect to the list of clients.
            Client.findByIdAndRemove(req.body.clientid, function deleteClient(err) {
                if (err) { return next(err); }
                // Success - go to client list
                res.redirect('/catalog/clients')
            })
        }
    });
};

// Display Client update form on GET.
exports.client_update_get = function(req, res, next) {
   async.parallel({
     client: function(callback) {
       Client.findById(req.params.id).exec(callback);
     },
   }, function(err, results) {
     if (err) { return next(err);}
     if (results.client==null) {
       var err = new Error('Client not found');
       err.status = 404;
       return next(err);
     }
     res.render('client_form', {title: 'Update Client', client: results.client});
   })
};

// Handle Client update on POST.
exports.client_update_post = [

    // Validate fields.
    body('name').isLength({ min: 1 }).trim().withMessage('Name must be specified.'),
    body('company').isLength({ min: 1 }).trim().withMessage('Company name must be specified.'),
    body('email').trim(),
    body('paid_amount').trim().isAlphanumeric().withMessage('Amount has non-alphanumeric characters.'),
    body('due_amount').trim().isAlphanumeric().withMessage('Amount has non-alphanumeric characters.'),
    body('hours_used').trim().isAlphanumeric().withMessage('Hours used has non-alphanumeric characters.'),
    body('hours_available').trim().isAlphanumeric().withMessage('Hours available has non-alphanumeric characters.'),
    body('deliverables').trim(),


    // Sanitize fields.
    sanitizeBody('name').escape(),
    sanitizeBody('company').escape(),
    sanitizeBody('email').escape(),
    sanitizeBody('paid_amount').escape(),
    sanitizeBody('due_amount').escape(),
    sanitizeBody('hours_used').escape(),
    sanitizeBody('hours_available').escape(),
    sanitizeBody('deliverables').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Client object with escaped and trimmed data (and the old id!)
        var client = new Client(
            {
              name: req.body.name,
              company: req.body.company,
              email: req.body.email,
              paid_amount: req.body.paid_amount,
              due_amount: req.body.due_amount,
              hours_used: req.body.hours_used,
              hours_available: req.body.hours_available,
              deliverables: req.body.deliverables,
              _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('client_form', { title: 'Update Client', client: client, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Client.findByIdAndUpdate(req.params.id, client, {}, function (err, theclient) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(theclient.url);
            });
        }
    }
];

exports.client_new_note_post = function(req,res,next) {
  body('note').trim(),

  sanitizeBody('note').escaped,

  (req, res, next) => {
    const errors = validationResult(req);


    if (!errors.isEmpty()) {
      res.render('client_detail', {title: 'Client Detail', client: req.body, errors: errors.array() });
      return;
    }
    else {

      var note = new Note(
        {
          client: req.params.id,
          note: req.body.note
        }
      )

      note.save(function (err) {
        if (err) {return next(err) }
        res.redirect('/catalog/clients')
      })
    }
  }
}
