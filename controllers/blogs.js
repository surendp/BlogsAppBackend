const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const blog = await Blog
    .findById(id)
    .populate('user', { username: 1, name: 1, id: 1 })
  response.json(blog)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = request.token
    ? jwt.verify(request.token, process.env.SECRET)
    : null

  if (!request.token || !(decodedToken && decodedToken.id)) {
    return response
      .status(401)
      .json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    ...body,
    likes: body.likes ? body.likes : 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = [ ...user.blogs, savedBlog._id ]
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const blogId = request.params.id
  const existingBlog = await Blog.findById(blogId)
  const userId = request.token
    ? jwt.verify(request.token, process.env.SECRET).id
    : null

  if (!request.token || !userId) {
    return response
      .status(401)
      .json({ error: 'token missing or invalid' })
  }

  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  if (!(existingBlog
    && existingBlog.user.toString() === userId.toString())) {
    return response.status(401).json({
      error: 'unauthorized access denied'
    })
  }

  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true })
  
  response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  const blog = await Blog.findById(id)
  const token = request.token
  const userId = token
   ? jwt.verify(token, process.env.SECRET).id
   : null

  if (!(blog
    && token
    && blog.user.toString() === userId.toString())) {
    return response.status(401).json({
      error: 'unauthorized access denied'
    })
  }

  await Blog.findByIdAndRemove(id)
  response.status(200).end()
})

module.exports = blogsRouter