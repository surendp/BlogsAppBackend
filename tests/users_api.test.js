const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const User = require('../models/user')
const helper = require('./test_helper')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      username: 'root',
      passwordHash
    })

    await user.save()
  })
  
  test('creation succeeds with a fresh username', async () =>{
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'johndow',
      name: 'John Dow',
      password: 'dow1234'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()
    
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'root'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if the username or password does not meet api specification', async () => {
    const usersAtStart = await helper.usersInDb()

    const user1 = {
      username: 'jo',
      password: 'jo1234',
      name: 'John Dow'
    }

    const user2 = {
      username: 'johnd',
      password: 'jo',
      name: 'John Dow'
    }

    const response1 = await api
      .post('/api/users')
      .send(user1)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(response1.body.error).toContain('username and password must be of atleast 3 characters long')

    const response2 = await api
      .post('/api/users')
      .send(user2)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response2.body.error).toContain('username and password must be of atleast 3 characters long')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtStart).toHaveLength(usersAtEnd.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})