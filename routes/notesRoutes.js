const express = require('express')
const { model } = require('mongoose')
const router = express.Router()
const notesController = require('../controllers/notesController')

router.route('/')
    .get(notesController.getAllNotes)
    .post(notesController.createNewNote)
    .patch(notesController.updateNote) //upades
    .delete(notesController.deleteNote)
    
module.exports = router
