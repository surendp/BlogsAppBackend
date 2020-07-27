const User = require("../models/user")

const initialBlogs = [
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 10,
  },
  {
    title: 'Go To Statement Considered Harmless',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmless.html',
    likes: 4,
  },
]

const initialUsers = [
  {
    username: "surendp",
    password: "pandey1234",
    name: "Surendra Pandey",
  },
  {
    username: "johndow",
    password: "dow1234",
    name: "John Dow",
  }
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(users => users.toJSON())
}

const getToken = async api => {
  const user1 = initialUsers[0]

  // login
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: user1.username,
      password: user1.password,
    })
  
  return `bearer ${loginResponse.body.token}` || null
}

module.exports = {
  initialBlogs,
  initialUsers,
  getToken,
  usersInDb,
}