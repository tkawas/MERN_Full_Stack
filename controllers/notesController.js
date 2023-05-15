const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const { model } = require('mongoose')

// @desc Get all notes 
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
    // Get all notes from MongoDB
    const notes = await Note.find().lean()
    if(!notes?.length){
        return res.status(400).json({message:'No Notes found'})
    } 
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))
    res.json(notesWithUser)
})

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body
    // Confirm data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    // Check for duplicate title
    const duplicate = Note.findOne({ title }).lean().exec()
     if (duplicate?.title) {
      return res.status(409).json({ message: 'Duplicate note title' })
   }
    // Create and store the new user 
    const note = await Note.create({user, title, text})
    if (note) { // Created 
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }
})
// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    const { _id, user, title, text, completed } = req.body
    // Confirm data
    console.log(req.body)
    if (!_id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }
    // Confirm note exists to update
    const note = await Note.findById(_id).exec()
    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }
    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()
    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() == _id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }
    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save();

    res.json(`Ticket with title: '${updatedNote.title}' has been updated successfully`)
})

// @desc Delete notes 
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const {_id} = req.body
    // Confirm data
    if(!_id){
        return res.status(400).json({message: 'Note ID is required'})
    }
    // Confirm note exists to delete 
    const note = await Note.findById(_id).exec()

    if(!note){
        return res.status(400).json({message:'Note not found'})
    }

    const result = await note.deleteOne()
    const reply = `Note ${result.title} with ID ${result._id} deleted`
    res.json(reply)

})


module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}