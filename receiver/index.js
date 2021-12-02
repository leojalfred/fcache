// random string generation function
function genString() {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 512000; i++)
    result += characters.charAt(Math.floor(Math.random() * characters.length))

  return result
}

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

async function receiver(db) {
  // generate random strings
  const strings = [genString(), genString()]
  let si = 0 // initialize random string index

  // set message in channel database
  async function put() {
    await db
      .transaction('receiver', 'readwrite')
      .objectStore('receiver')
      .put({ index: '0', string: strings[si] })

    si = +!si // alternate random string index
  }

  const delay = 200
  let threshold
  async function getThreshold() {
    let thresholds = []
    for (let i = 0; i < 20; i++) {
      let time = new Date().getTime()
      let threshold = 0

      while (new Date().getTime() - time < delay) {
        await put()
        threshold++
      }

      thresholds.push(threshold)
    }

    threshold = thresholds.reduce((a, b) => a + b, 0) / thresholds.length
    console.log(threshold)
  }
  await getThreshold()

  let id = []
  async function receive() {
    let time = new Date().getTime()
    let rate = 0
    while (new Date().getTime() - time < delay) {
      await put()
      rate++
    }

    console.log(rate, threshold)
    if (rate < threshold) id.push(1)
    else id.push(0)

    console.log(id)
  }

  // align time to interval to work well with sender
  let time = new Date().getTime()
  let interval = delay * 8
  while (time % interval > 10) time = new Date().getTime()

  // receive message
  // console.log(new Date().getTime())
  // for (let i = 0; i < 8; i++) setTimeout(receive, delay)

  // repeatedly receive message
  setInterval(() => {
    while (time % interval > 10) time = new Date().getTime()
    console.log(new Date().getTime())

    id = []
    for (let i = 0; i < 8; i++)
      setTimeout(async () => {
        await receive()
      }, delay)
  }, interval)

  // document.addEventListener('click', event => {
  //   if (event.target.matches('#add')) put()
  //   else if (event.target.matches('#remove')) {
  //     const request = db
  //       .transaction('receiver', 'readwrite')
  //       .objectStore('receiver')
  //       .delete('0')

  //     request.onsuccess = event =>
  //       console.log('Removed random string from receiver database.')

  //     request.onerror = event =>
  //       console.log('Could not remove random string from receiver database.')
  //   } else if (event.target.matches('#get')) {
  //     const request = db.transaction('receiver').objectStore('receiver').get('0')

  //     request.onsuccess = event => {
  //       if (request.result)
  //         console.log('Found random string in receiver database.', request.result)
  //       else console.log('Could not find random string in receiver database.')
  //     }

  //     request.onerror = event =>
  //       console.log('Could not get random string from receiver database.')
  //   } else if (event.target.matches('#clear')) {
  //     window.indexedDB
  //       .databases()
  //       .then(r => {
  //         for (var i = 0; i < r.length; i++)
  //           window.indexedDB.deleteDatabase(r[i].name)
  //       })
  //       .then(() => {
  //         alert('All data cleared.')
  //       })
  //   }
  // })
}

// open channel database
let db
if (!window.indexedDB)
  console.log('Your browser does not support a stable version of IndexedDB.')
else {
  const request = window.indexedDB.open('channel', 1)

  request.onerror = event => console.log('Could not open channel database.')
  request.onsuccess = event => {
    db = request.result
    console.log('Opened channel database.')
    receiver(db)
  }
  request.onupgradeneeded = event => {
    db = event.target.result
    db.createObjectStore('receiver', { keyPath: 'index' })
    receiver(db)
  }
}
