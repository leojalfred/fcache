// main sender functionality
async function sender() {
  // open database connection
  const db = await idb.openDB('sender', 1, {
    upgrade(db) {
      db.createObjectStore('sender', { keyPath: 'index' })
    },
  })

  // random string generation function
  function genString() {
    let result = ''
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 512000; i++)
      result += characters.charAt(Math.floor(Math.random() * characters.length))

    return result
  }

  const strings = [genString(), genString()] // generate random strings
  let si = 0 // initialize random string index

  // set message in channel database
  async function put() {
    // put message
    await db
      .transaction('sender', 'readwrite')
      .objectStore('sender')
      .put({ index: '0', string: strings[si] })

    si = +!si // alternate random string index
  }

  const message = [0, 0, 0, 0, 1, 1, 1, 1]
  const delay = 200

  // function to send message until delay if message bit equals 1
  async function send(i) {
    // align time
    let time = Date.now()
    console.log(time)

    if (message[i]) {
      console.log('sending 1')
      while (Date.now() - time < delay) await put()
    } else {
      console.log('sending 0')
      while (Date.now() - time < delay) {}
    }
  }

  // repeatedly send message
  while (true) {
    // align message to readable interval
    let time = Date.now()
    const interval = delay * message.length
    while (time % (interval * 2) !== 0) time = Date.now()

    console.log('New message')
    for (let i = 0; i < message.length; i++) await send(i)
  }
}

sender()
