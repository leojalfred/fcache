const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Fuck you')
})

let i = 0
app.get('/favicon.ico', (req, res) => {
  console.log('Requested favicon', i)
  i++
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
