const express = require('express')
const main = express()
const port = 3000

main.listen(port, () =>
  console.log(`fcache listening at http://localhost:${port}`)
)

main.use('/', express.static('sender'))
main.use('/receiver', express.static('receiver'))

// const bits = 8
// for (let i = 0; i < bits; i++) {
//   const subdomain = express()
//   subdomain.listen(4000 + i)
//   subdomain.get('/', (req, res) => res.send(`Subdomain ${i}`))

//   let j = 0
//   subdomain.get('/favicon.ico', (req, res) => {
//     console.log(`Requested favicon ${i}: ${j}`)
//     j++
//   })
// }
