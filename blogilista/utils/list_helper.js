const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const max = blogs.reduce((prev, current) =>  (prev.likes > current.likes) ? prev : current)

  return {
    title: max.title,
    author: max.author,
    likes: max.likes
  }
}

const mostBlogs = (blogs) => {
  let authors = new Map()
  let mostBlogsCount = 0
  let mostBlogsIndex = 0
  blogs.forEach((blog, i) => {
    let c = 1
    if(authors.has(blogs[i].author)) {
      c += authors.get(blogs[i].author)
    }
    authors.set(blogs[i].author, c)
    if(c > mostBlogsCount) {
      mostBlogsCount = c
      mostBlogsIndex = i
    }
  })
  return { author: blogs[mostBlogsIndex].author, blogs: mostBlogsCount }
}

const mostLikes = (blogs) => {
  let authors = new Map()
  let mostLikesCount = 0
  let mostLikesIndex = 0
  blogs.forEach((blog, i) => {
    let c = 0
    if(authors.has(blogs[i].author)) {
      c = authors.get(blogs[i].author) + blog.likes
    } else {
      c = blog.likes
    }
    authors.set(blogs[i].author, c)
    if(c > mostLikesCount) {
      mostLikesCount = c
      mostLikesIndex = i
    }
  })
  return { author: blogs[mostLikesIndex].author, likes: mostLikesCount }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}