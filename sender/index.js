// main sender functionality
async function sender() {
  // open database connection
  const db = await idb.openDB('channel', 1, {
    upgrade(db) {
      db.createObjectStore('receiver', { keyPath: 'index' })
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
      .transaction('receiver', 'readwrite')
      .objectStore('receiver')
      .put({ index: '0', string: strings[si] })

    si = +!si // alternate random string index
  }

  const message = [0, 0, 0, 0, 1, 1, 1, 1]
  const delay = 1000

  // function to send message until delay if message bit equals 1
  async function send(i) {
    if (message[i]) {
      let time = new Date().getTime()
      while (new Date().getTime() - time < delay) await put()
    }
  }

  // align time to interval to work well with receiver
  let time = new Date().getTime()
  let interval = delay * message.length
  while (time % interval !== 0) time = new Date().getTime()

  // repeatedly send message
  setInterval(async () => {
    while (time % interval !== 0) time = new Date().getTime()
    console.log(new Date().getTime())
    for (let i = 0; i < message.length; i++) await send(i)
  }, interval)
}

sender()
