const _ = require('lodash')
const logger = require('../utils/logger')

const totalLikes = blogs => {
  return blogs.reduce((accumulator, currentValue) => (
    accumulator + currentValue.likes
  ), 0)
}

const favoriteBlog = blogs => {
  return blogs.reduce((accumulator, currentValue) => (
    accumulator.likes > currentValue.likes
      ? accumulator
      : currentValue
  ), {})
}

const mostBlogs = blogs => {
  const groupedBlogs = _.groupBy(blogs, 'author')

  // return the blog list of author having most blogs
  const authorWithMostBlogs = _.reduce(groupedBlogs, (accumulator, currentValue) => {
    return (
      currentValue.length > accumulator.length
        ? currentValue
        : accumulator
    )
  }, [])

  if (!authorWithMostBlogs.length) {
    return {}
  }

  return {
    author: authorWithMostBlogs[0].author,
    blogs:  authorWithMostBlogs.length
  }
}

const mostLikes = blogs => {
  const groupBlogs = _.groupBy(blogs, 'author')
  const maxLikesBlogList = _.reduce(groupBlogs, (accumulator, currentValue) => {
    return (
      totalLikes(accumulator) > totalLikes(currentValue)
        ? accumulator
        : currentValue
    )
  }, [])

  if (!maxLikesBlogList.length) {
    return {}
  }

  return {
    author: maxLikesBlogList[0].author,
    likes: totalLikes(maxLikesBlogList)
  }
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}