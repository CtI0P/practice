const express = require('express');
const router = express.Router();
const controller = require('../controllers/lessonController');

router.get('/:id/playlist', controller.getPlaylist);
router.get('/:id/:file', controller.getSegment);

module.exports = router;
