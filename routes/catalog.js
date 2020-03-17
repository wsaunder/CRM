var express = require('express');
var router = express.Router();

// Require controller modules.
var client_controller = require('../controllers/clientController');
var note_controller = require('../controllers/noteController')



// GET catalog home page.
router.get('/', client_controller.index);

/// Note ROUTES ///

// GET request for creating a Note. NOTE This must come before routes that display Note (uses id).
router.get('/note/create', note_controller.note_create_get);

// POST request for creating Note.
router.post('/note/create', note_controller.note_create_post);

// GET request to delete Note.
router.get('/note/:id/delete', note_controller.note_delete_get);

// POST request to delete Note.
router.post('/note/:id/delete', note_controller.note_delete_post);

// GET request to update Note.
router.get('/note/:id/update', note_controller.note_update_get);

// POST request to update Note.
router.post('/note/:id/update', note_controller.note_update_post);

// GET request for one Note.
router.get('/note/:id', note_controller.note_detail);

// GET request for list of all Note items.
router.get('/notes', note_controller.note_list);

/// CLIENT ROUTES ///

// GET request for creating Client. NOTE This must come before route for id (i.e. display client).
router.get('/client/create', client_controller.client_create_get);

// POST request for creating Client
router.post('/client/create', client_controller.client_create_post);

// GET request to delete Client
router.get('/client/:id/delete', client_controller.client_delete_get);

// POST request to delete Client
router.post('/client/:id/delete', client_controller.client_delete_post);

// GET request to update Client
router.get('/client/:id/update', client_controller.client_update_get);

// POST request to update Client
router.post('/client/:id/update', client_controller.client_update_post);

// GET request for one Client
router.get('/client/:id', client_controller.client_detail);

// GET request for list of all Clients.
router.get('/clients', client_controller.client_list);



module.exports = router;
