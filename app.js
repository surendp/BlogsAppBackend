const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const express = require('express')
require('express-async-errors')
const mongoose = require('mongoose')
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const commentsRouter = require('./controllers/comments')

logger.info('Connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(() => {
    logger.info('Database connected!!')
  })
  .catch(() => {
    logger.error('Unable to connect to MongoDB:', error.message)
  })

const app = express()

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/blogs', [blogsRouter, commentsRouter])
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

// Unknown API route handler
app.use('/api/*', middleware.unknownEndpoint)

// serve the frontend application when request
// arrives at the default route of the application
app.use(express.static('build'))

// Unknown static route handler
app.use('/*', express.static('build'))

app.use(middleware.errorHandler)

module.exports = app