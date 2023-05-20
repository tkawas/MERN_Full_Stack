const express = require('express')
const { model } = require('mongoose')
const router = express.Router()
const userController = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createNewUser)
    .patch(userController.upadteUser) //upades
    .delete(userController.deleteUser)

module.exports = router

