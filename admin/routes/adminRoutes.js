const express = require('express')

const adminController = require('../controller/adminController')
const userController = require('../../user/controller/userController')
const authService = require('../../middlewares/authService')
const userAuthentication = require('../../middlewares/authToken')

const adminRoutes = express.Router()

adminRoutes.post('/adminLogin', authService.isAdmin, userController.loginUser)
adminRoutes.get('/adminDashBoard', userAuthentication, adminController.adminDashBoard)
adminRoutes.get('/viewUsers', userAuthentication, adminController.viewUsers)
adminRoutes.get('/userDetails/:userId', userAuthentication, adminController.userDetails)
adminRoutes.get('/borrowBooksList', userAuthentication, adminController.borrowBooksList)

module.exports = adminRoutes