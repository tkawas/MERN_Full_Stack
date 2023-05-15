const user = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const { model } = require('mongoose')

// @desc Get all users 
// @route GET /users 
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await user.find().select('-password').lean()
    if (!users?.length){
        return res.status(400).json({message: 'No users found'})
    }
    res.json(users)
})
// @desc Create new user
// @route POST /users 
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body
    //confirm data 
    if (!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({ message: 'All fields are required'})
    }
    // Check for duplicate 
    const duplicate = await user.findOne({username}).lean().exec()
    if (duplicate){
        return res.status(409).json({ message: 'Duplicate username'})
    }
    // Hash the password
    const hashedPwd = await bcrypt.hash(password, 10) //salt rounds

    const userObject = { username, "password": hashedPwd, roles}

    //create and store new user 
    const User = await user.create(userObject)

    if(User) { //created 
        res.status(201).json({message: `New user ${username} created`})
    }else{
        res.status(400).json({message: 'Invalid user data received'})
    }

})
// @desc Update a User
// @route PATCH /users 
// @access Private
const upadteUser = asyncHandler(async (req, res) => {
    const { _id, username, roles, active, password} = req.body

    //confirm data
    if (!_id || !username || !Array.isArray(roles) || !roles.length || typeof active !=='boolean'){
        return res.status(400).json({message: 'All fields except password are required'})
    }
    // Confirm user exists to update
    const User = await user.findById(_id).exec()
    if(!User){
        return res.status(400).json({ message: 'user not found'})
    }

    //check for duplicate
    const duplicate = await user.findOne({username}).lean().exec()
    //Allow updates to the original user
    if (duplicate && duplicate?._id.toString() !== _id){
        return res.status(409).json({message: 'Duplicate username'})
    }

    User.username = username
    User.roles = roles
    User.active = active

    if (password){
        //hash password 
        user.password = await bcrypt.hash(password, 10)// salt rounds
    }

    const upadteUser = await User.save()

    res.json({message: `${upadteUser.username} updated`})

})
// @desc Delete a User
// @route Delete /users 
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const {_id} = req.body

    if (!_id){
        return res.status(400).json({message: 'User ID Required'})
    }

    const note = await Note.findOne({user: _id}).lean().exec()
    if (note){
        return res.status(400).json({message: ' User has assigned notes'})
    }

    const User = await user.findById(_id).exec()

    if (!User){
        return res.status(400).json({message: 'User not found'})
    }

    const result = await User.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)

})


module.exports = {
    getAllUsers, 
    createNewUser, 
    upadteUser, 
    deleteUser
}

