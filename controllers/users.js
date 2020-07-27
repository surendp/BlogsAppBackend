const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {
  const result = await User
    .find({})
    .populate('blogs', { url: 1, title: 1, author: 1, id: 1 })
  response.json(result)
})

usersRouter.get('/:id', async (request, response, next) => {
  const result = await User
    .findById(request.params.id)
    .populate('blogs', { url: 1, title: 1, author: 1, id: 1 })
  response.json(result)
})

usersRouter.post('/', async (request, response, next) => {
  const body = request.body
  const {
    username,
    password,
    name
  } = body

  if (!(username && username.length >= 3
    && password && password.length >= 3)) {
    return response.status(400).send({
      error: 'username and password must be of atleast 3 characters long'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const user = new User({
    username,
    passwordHash,
    name
  })
  
  const savedUser = await user.save()
  response.json(savedUser)
})

module.exports = usersRouter