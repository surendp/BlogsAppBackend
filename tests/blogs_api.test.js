const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)


beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))

  const blogPromiseArray = blogObjects
    .map(blogObject => blogObject.save())
  const userPromiseArray = helper.initialUsers
    .map(user => api.post('/api/users').send(user))

  await Promise.all([...blogPromiseArray, ...userPromiseArray])
})

test('blogs are returned in the Json Format', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all the blogs are returned', async () => {
  const response = await api
    .get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('the uniques identifier property is named id', async () => {
  const response = await api
    .get('/api/blogs')
  
  expect(response.body[0].id).toBeDefined()
})

test('successfully creates new blog', async () => {
  const token = await helper.getToken(api)
  const newBlog = {
    title: 'New blog shoud be created',
    author: 'Surendra Pandey',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmless.html',
    likes: 4,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set({ Authorization: token })
    .expect(201)

  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(helper.initialBlogs.length + 1)
})

test('default value of likes is 0', async () => {
  const token = await helper.getToken(api)
  const newBlog = {
    title: 'New blog shoud be created',
    author: 'Surendra Pandey',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmless.html',
  }

  const result = await api
    .post('/api/blogs')
    .send(newBlog)
    .set({ Authorization: token })
    .expect(201)

  expect(result.body.likes).toBe(0)
})

test('missing title and url properties responds with 400 status code', async () =>  {
  const newBlogMissingTitle = {
    author: 'Surendra Pandey',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmless.html',
    likes: 5
  }

  const newBlogMissingUrl = {
    title: 'Blog is missing url',
    author: 'Surendra Pandey',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlogMissingTitle)
    .expect(400)

  await api
    .post('/api/blogs')
    .send(newBlogMissingUrl)
    .expect(400)

})

test('successfully deletes blogId from user document when blog is removed', async () => {
  const token = await helper.getToken(api)
  const newBlog = {
    title: 'New blog shoud be created',
    author: 'Surendra Pandey',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmless.html',
    likes: 4,
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .set({ Authorization: token })
  
  const savedBlog = response.body

  const getResponseAfterPost = await api
    .get(`/api/users/${savedBlog.user}`)
  const userAfterPost = getResponseAfterPost.body
  expect(userAfterPost.blogs).toHaveLength(1)

  await api
    .delete(`/api/blogs/${savedBlog.id}`)
    .set({ Authorization: token })

  const getResponseAfterDelete = await api
    .get(`/api/users/${savedBlog.user}`)
  const userAfterDelete = getResponseAfterDelete.body
  expect(userAfterDelete.blogs).toHaveLength(0)
})

afterAll(() => {
  mongoose.connection.close()
})