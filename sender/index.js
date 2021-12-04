async function sender() {
  // open database connection
  const db = await idb.openDB('sender', 1, {
    upgrade(db) {
      db.createObjectStore('sender', { keyPath: 'index' })
    },
  })

  // randomly generate 512kb string
  function genString() {
    let result = ''
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 512000; i++)
      result += characters.charAt(Math.floor(Math.random() * characters.length))

    return result
  }

  // put message
  const string = genString()
  async function put() {
    await db
      .transaction('sender', 'readwrite')
      .objectStore('sender')
      .put({ index: '0', string })
  }

  const message = [1, 0, 1, 0, 1, 0, 1, 0]
  const delay = 200

  // function to send message for delay amount of time depending on message bit
  async function send(i) {
    let time = Date.now()
    // console.log(time)

    if (message[i]) {
      // console.log('1')
      while (Date.now() - time < delay) await put()
    } else {
      // console.log('0')
      while (Date.now() - time < delay) {}
    }
  }

  // repeatedly send message
  const interval = delay * message.length * 2
  while (true) {
    // align message to readable interval
    let time = Date.now()
    while (time % interval !== 0) time = Date.now()

    // send message
    // console.log('New message')
    for (let i = 0; i < message.length; i++) await send(i)
  }
}

sender()
