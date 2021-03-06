const express = require('express')
const router = express.Router() 
const db = require('../models')
const bcrypt = require('bcryptjs')

// register form 
router.get("/register", (req, res) => {
  res.render("auth/register")
})

// create user 
router.post("/register", async (req, res) => {
  try {
    
    const foundUser = await db.User.findOne({ email: req.body.email })

    if (foundUser) {
      res.send({ message: "Account already exists"})
    }

    const salt = await bcrypt.genSalt(10)

    const hash = await bcrypt.hash(req.body.password, salt)
    req.body.password = hash

    await db.User.create(req.body)

    res.redirect('/login')

  } catch (error) {
    console.log(error)
    res.send({ message: "Internal Service Error"})
  }
})

// login form 
router.get("/login", (req, res) => {
  res.render("auth/login")
})

// login authentication 
router.post("/login", async (req, res) => {
  try {
    const foundUser = await db.User.findOne({ email: req.body.email })

    if (!foundUser) {
      return res.send({ message: "Email or password is incorrect"})
    }

    const match = await bcrypt.compare(req.body.password, foundUser.password)

    if(!match) {
      return res.send({ message: "Email or password is incorrect" })
    }

    req.session.currentUser = {
      username: foundUser.username, 
      id: foundUser._id
    }

    res.redirect('/collection')

  } catch (error) {
    console.log(error)
    res.send({ message: "Internal Server Error"})
  }
})

// logout 
router.delete('/logout', async (req, res) => {
  await req.session.destroy() 
  res.redirect('/')
})

module.exports = router
