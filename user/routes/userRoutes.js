const express = require('express')

const userController = require('../controller/userController')
const { isUser } = require('../../middlewares/authService')
const imageStorage = require('../../middlewares/imageStorage')
const userAuthentication = require('../../middlewares/authToken')

const userRouter = express.Router()

userRouter.post('/signupUser', userController.signupUser)
userRouter.post('/userLogin', isUser, userController.loginUser)
userRouter.post('/resetPassword/:userId/:token', userController.resetPassword)
userRouter.post('/setNewPassword/:userId', userAuthentication, userController.setNewPassword)
userRouter.get('/viewProfile/:userId', userAuthentication, userController.viewProfile)
userRouter.patch('/editProfile/:userId', userAuthentication, imageStorage.profilePicUpload.single('userProfilePic'), userController.editProfile)
userRouter.get('/userDashBoard', userAuthentication, userController.userDashBoard)

module.exports = userRouter