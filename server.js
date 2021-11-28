const express = require('express')
const app = express()
const port = 3000

// let i = 0
// app.get('/favicon.ico', (req, res) => {
//   console.log('Requested favicon', i)
//   i++
// })

app.use(express.static('public'))

app.listen(port, () => {
  console.log(
    `Favicon cache covert channel listening at http://localhost:${port}`
  )
})
