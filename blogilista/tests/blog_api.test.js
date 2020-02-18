const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const login = {
  username: 'Test',
  password: 'password'
}

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)

  await User.deleteMany({})

  const user = new User({
    username: 'Test',
    name: 'Test User',
    passwordHash: '$2b$10$w4ETGh6WXMioW7b1hRSq0.KG/o0lzMqafH5INLOzGg8G3/UC5KQIC'
  })
  await user.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(helper.initialBlogs.length)
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'Test Title',
    author: 'Test Author',
    url: 'testurl',
    likes: 0
  }
  const loginRes = await api.post('/api/login').send(login)
  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${loginRes.body.token}`)
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)
  const contents = blogsAtEnd.map(n => n.title)
  expect(contents).toContain(
    'Test Title'
  )
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'Test Title',
    author: 'Test Author',
    url: 'testurl'
  }
  const loginRes = await api.post('/api/login').send(login)
  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${loginRes.body.token}`)
    .send(newBlog)
    .expect(200)
  const blogsAtEnd = await helper.blogsInDb()
  const blog = blogsAtEnd.find(n => n.title === newBlog.title)
  expect(blog.likes).toBe(0)
})

test('Blog id key is correct', async () => {
  const resp = await api.get('/api/blogs')
  resp.body.forEach((blog) => {
    expect(blog.id).toBeDefined()
    expect(blog._id).not.toBeDefined()
  })
})

test('Blog missing a title is not added', async () => {
  const newBlog = {
    author: 'Test Author',
    url: 'testurl'
  }
  const loginRes = await api.post('/api/login').send(login)
  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${loginRes.body.token}`)
    .send(newBlog)
    .expect(400)
})

test('Blog missing a url is not added', async () => {
  const newBlog = {
    title: 'Test Title',
    author: 'Test Author'
  }
  const loginRes = await api.post('/api/login').send(login)
  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${loginRes.body.token}`)
    .send(newBlog)
    .expect(400)
})

test('Adding blog without access token fails with 401', async () => {
  const newBlog = {
    title: 'Test Title',
    author: 'Test Author',
    url: 'testurl'
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
})

afterAll(() => {
  mongoose.connection.close()
})