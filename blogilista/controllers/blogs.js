const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body
  if(!request.token) {
    return response.status(401).json({ error: 'token missing' })
  }
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes = body.likes === undefined ? 0 : body.likes,
    user: user._id
  })
  try {
    const res = await blog.save()
    user.blogs = user.blogs.concat(res._id)
    await user.save()
    response.json(res.toJSON())
  }
  catch(error) {
    next(error)
  }

})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    if(!request.token) {
      return response.status(401).json({ error: 'token missing' })
    }
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if(!decodedToken.id) {
      return response.status(401).json({ error: 'invalid token' })
    }
    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(request.params.id)
    if(!blog) {
      return response.status(400).json({ error: 'Invalid id' })
    }
    if(blog.user.toString() === user.id) {
      try{
        await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
      } catch (error) {
        next(error)
      }
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    blog.likes = blog.likes + 1

    await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(blog.toJSON())
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter