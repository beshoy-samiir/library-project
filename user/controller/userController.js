const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userModel = require('../../models/userModel')
const bookModel = require('../../models/booksModel')

const signupUser = async (req, res) => {
    try {
        const userData = new userModel(req.body);
        const userExistEmail = await userModel.findOne({
            userEmail: req.body.userEmail
        })
        const userExistPhone = await userModel.findOne({
            userPhone: req.body.userPhone
        })
        if (!userExistEmail && !userExistPhone) {
            const bcryptPassword = await bcrypt.hash(req.body.userPassword, 10)
            userData.userPassword = bcryptPassword
            userData.usedPasswords.push(userData.userPassword)
            await userData.save()
            res.status(201).send({
                success: true,
                message: "User created successfully"
            })
        } else {
            res.status(400).send({
                success: false,
                message: "User email or phone is already in use!",
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error occur",
            error: error.message
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const { userEmail, userPassword } = req.body
        const userData = await userModel.findOne({ userEmail: userEmail })
        const isPasswordCorrect = await bcrypt.compare(userPassword, userData.userPassword) 
        if (isPasswordCorrect) {
            const token = await jwt.sign({ userData }, process.env.JWTKEY, { expiresIn: '1h' }) 
            return res.status(200).send({
                success: true,
                message: "User login success!",
                token: token,
            })
        }
        res.status(401).send({
            success: false,
            message: "User password or email is incorrect!"
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error occur",
            error: error.message
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        const { userId, token } = req.params
        const { newPassword, confirmPassword } = req.body
        let isPasswordExist = false
        const userData = await userModel.findById(userId)
        if (userData) {
            const isTokenCorrect = jwt.verify(token, process.env.JWTKEY);
            if (isTokenCorrect) {
                if (newPassword === confirmPassword) {
                    for (const oldPassword of userData.usedPasswords) {
                        if (await bcrypt.compare(newPassword, oldPassword)) {
                            isPasswordExist = true;
                            break;
                        }
                    }
                    if (!isPasswordExist) {
                        const bcryptPassword = await bcrypt.hash(newPassword, 10)
                        userData.userPassword = bcryptPassword;
                        userData.usedPasswords.push(bcryptPassword)
                        await userData.save()
                        res.status(200).send({
                            success: true,
                            message: "Your password is updated!",
                        })
                    } else {
                        res.status(401).send({
                            success: false,
                            message: "Your already use this password at past",
                        })
                    }
                } else {
                    res.status(400).send({
                        success: false,
                        message: "New password not match with confirm password",
                    })
                }
            } else {
                res.status(400).send({
                    success: false,
                    message: "Token is incorrect or expire",
                })
            }
        } else {
            res.status(401).send({
                success: false,
                message: "User not found!",
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error occur",
            error: error.message
        })
    }
}

const setNewPassword = async (req, res) => {
    try {
        const { userId } = req.params
        const { oldPassword, newPassword, confirmPassword } = req.body
        let isPasswordExist = false
        const userData = await userModel.findById(userId)
        if (userData) {
            const isPasswordCorrect = await bcrypt.compare(oldPassword, userData.userPassword)
            if (isPasswordCorrect) { 
                if (newPassword === confirmPassword) {
                    for (const oldPassword of userData.usedPasswords) {
                        if (await bcrypt.compare(newPassword, oldPassword)) {
                            isPasswordExist = true;
                            break;
                        }
                    }
                    if (!isPasswordExist) {
                        const bcryptPassword = await bcrypt.hash(newPassword, 10)
                        userData.userPassword = bcryptPassword;
                        userData.usedPasswords.push(bcryptPassword)
                        await userData.save()
                        res.status(200).send({
                            success: true,
                            message: "Your password is updated!",
                        })
                    } else {
                        res.status(401).send({
                            success: false,
                            message: "Your already use this password at past",
                        })
                    }
                } else {
                    res.status(400).send({
                        success: false,
                        message: "New password not match with confirm password",
                    })
                }
            } else {
                res.status(400).send({
                    success: false,
                    message: "Old password is incorrect"
                })
            }
        } else {
            res.status(401).send({
                success: false,
                message: "User not found!",
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error occur",
            error: error.message
        })
    }
}

const viewProfile = async (req, res) => {
    try {
        const { userId } = req.params
        const userData = await userModel.findById(userId).select('userName userPhone userEmail userAddress userProfilePic borrowBooks');
        if (userData) {
            res.status(200).send({
                success: true,
                message: "Your profile!",
                userProfile: userData,
            })
        } else {
            res.status(400).send({
                success: false,
                message: "User not found!"
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error occur",
            error: error.message
        })
    }
}

const editProfile = async (req, res) => {
    try {
        // Takeing userId from params
        const { userId } = req.params
        // updating the user data 
        const userData = await userModel.findByIdAndUpdate(userId, {
            userName: req.body.userName || undefined,
            userPhone: req.body.userPhone || undefined,
            userAddress: req.body.userAddress || undefined,
            userProfilePic: userProfilePic || undefined,
        }, {
            new: true,
        })
        if (userData) {
            res.status(200).send({
                success: true,
                message: "User profile is edited!",
                userProfile: userData,
            })
        } else {
            // if user id is not correct
            res.status(401).send({
                success: false,
                message: "User not found!"
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error occur",
            error: error.message
        })
    }
}

const userDashBoard = async (req, res) => {
    try {
        // Extract only top book base on like and it shows only 5 books
        const topBooks = await bookModel.find({})
            .sort({ bookLikes: -1 }).limit(5)
        res.status(200).send({
            success: true,
            message: "Top Books!",
            books: topBooks
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error occur",
            error: error.message
        })
    }
}

// Exporting api
module.exports = {
    signupUser,
    loginUser,
    resetPassword,
    setNewPassword,
    viewProfile,
    editProfile,
    userDashBoard,
}