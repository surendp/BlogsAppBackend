const jwt = require('jsonwebtoken')
const commentsRouter = require('express').Router()
const Comment = require('../models/comment')
const Blog = require('../models/blog')

commentsRouter.get('/:id/comments', async (request, response) => {
  const blogId = request.params.id
  const comments = await Comment
    .find({ blog: blogId })
  response.json(comments)
})

commentsRouter.post('/:id/comments', async (request, response) => {
  const decodedToken = request.token
    ? jwt.verify(request.token, process.env.SECRET)
    : null

  if (!request.token || !(decodedToken && decodedToken.id)) {
    return response
      .status(401)
      .json({ error: 'token missing or invalid' })
  }

  const blogId = request.params.id
  const { comment } = request.body

  // find the blog from the database
  const blog = await Blog.findById(blogId)

  // if blog doesnot exist return with an error message
  if (!blog) {
    response.status(400).json({
      error: 'The blog on which you want to add a comment doesnot exists'
    })
    return
  }

  // create new comment and save in the database
  const newComment = new Comment({
    comment,
    blog: blogId
  })
  const savedComment = await newComment.save()

  // update the comments array of blog
  blog.comments = [ ...blog.comments, savedComment._id]
  await blog.save()

  response.status(201).json(savedComment)
})

module.exports = commentsRouter