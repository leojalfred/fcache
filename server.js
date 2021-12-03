const express = require('express')
const main = express()
const port = 3000

main.listen(port, () =>
  console.log(`fcache listening at http://localhost:${port}`)
)

main.use('/', express.static('sender'))
main.use('/receiver', express.static('receiver'))
