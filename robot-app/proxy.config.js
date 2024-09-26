const proxy = [
  {
    context: '/api',
    target: 'http://localhost:8000/api',
    pathRewrite: { '^/api': '' }
  }
]

module.exports = proxy
