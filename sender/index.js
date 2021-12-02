// initialize IndexedDB objects
window.indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB
window.IDBTransaction =
  window.IDBTransaction ||
  window.webkitIDBTransaction ||
  window.msIDBTransaction
window.IDBKeyRange =
  window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

// main sender functionality
async function sender(db) {
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
    console.log('put')

    await db
      .transaction('receiver', 'readwrite')
      .objectStore('receiver')
      .put({ index: '0', string: strings[si] })

    si = +!si // alternate random string index
  }

  const message = [0, 0, 0, 0, 1, 1, 1, 1]
  const delay = 200

  // function to send message until delay if message bit equals 1
  async function send(i) {
    console.log('send')

    if (message[i]) {
      let time = new Date().getTime()
      while (new Date().getTime() - time < delay) await put()
    }
  }

  // align time to interval to work well with receiver
  let time = new Date().getTime()
  let interval = delay * message.length
  while (time % interval > 10) time = new Date().getTime()

  // send message
  // for (let i = 0; i < message.length; i++) setTimeout(() => send(i), delay)

  // repeatedly send message
  setInterval(() => {
    while (time % interval > 10) time = new Date().getTime()
    console.log(new Date().getTime())
    for (let i = 0; i < message.length; i++)
      setTimeout(async () => await send(i), delay)
  }, interval)
}

// open channel database
if (!window.indexedDB)
  console.log('Your browser does not support a stable version of IndexedDB.')
else {
  const request = window.indexedDB.open('channel', 1)

  request.onerror = event => console.log('Could not open channel database.')
  request.onsuccess = event => {
    const db = request.result
    console.log('Opened channel database.')

    sender(db)
  }
  request.onupgradeneeded = event => {
    const db = event.target.result
    db.createObjectStore('receiver', { keyPath: 'index' })

    sender(db)
  }
}
