const express = require("express")
const cors = require('cors');

const app = express()

require("dotenv").config()
app.use(express.json())
app.use(cors())
require("../models/config/db")
const adminRoutes = require("../admin/routes/adminRoutes")
const bookRoutes = require("../admin/routes/bookRoutes")
const categoryRoutes = require("../admin/routes/categoryRoutes")
const userRoutes = require("../user/routes/userRoutes")
const reviewRoutes = require("../user/routes/reviewRoutes")
app.use(adminRoutes)
app.use(bookRoutes)
app.use(categoryRoutes)
app.use(userRoutes)
app.use(reviewRoutes)

app.get("*", (req, res) => res.send({ error: "invalid url" }))

module.exports = app