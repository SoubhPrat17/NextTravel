const express = require('express');
const router = express.Router();
const { getSuggestions } = require('../controllers/suggestionsController')

router.post('/', getSuggestions);

module.exports = router;
