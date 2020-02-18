const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')


userRouter.post('/', async (req, res, next) => {
  const body = req.body

  const saltRnd = 10

  if(body.password.length < 3) {
    return res.status(400).json({ error: 'Password must be at least 3 characters long' })
  }

  const passwordHash = await bcrypt.hash(body.password, saltRnd)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })

  try {

    const savedUser = await user.save()
    res.json(savedUser)

  } catch (error) {
    next(error)
  }

})

userRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
  res.json(users.map(u => u.toJSON()))
})

module.exports = userRouter