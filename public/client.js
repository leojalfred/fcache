function genString() {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < 512000; i++)
    result += characters.charAt(Math.floor(Math.random() * characters.length))

  return result
}

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

let db
if (!window.indexedDB)
  console.log('Your browser does not support a stable version of IndexedDB.')
else {
  const request = window.indexedDB.open('channel', 1)
  request.onerror = event => console.log('Could not open channel database.')

  request.onsuccess = event => {
    db = request.result
    console.log('Opened channel database', db)
  }

  request.onupgradeneeded = event => {
    db = event.target.result
    db.createObjectStore('receiver', { keyPath: 'index' })
  }
}

const strings = [genString(), genString()]
let si = 0

document.addEventListener('click', event => {
  if (event.target.matches('#add')) {
    const request = db
      .transaction('receiver', 'readwrite')
      .objectStore('receiver')
      .put({ index: '0', string: strings[si] })

    request.onsuccess = event =>
      console.log('Added random string to receiver database.')

    request.onerror = event =>
      console.log('Could not add random string to receiver database.')

    if (si === 1) si = 0
    else si = 1
  } else if (event.target.matches('#remove')) {
    const request = db
      .transaction('receiver', 'readwrite')
      .objectStore('receiver')
      .delete('0')

    request.onsuccess = event =>
      console.log('Removed random string from receiver database.')

    request.onerror = event =>
      console.log('Could not remove random string from receiver database.')
  } else if (event.target.matches('#get')) {
    const request = db.transaction('receiver').objectStore('receiver').get('0')

    request.onsuccess = event => {
      if (request.result)
        console.log('Found random string in receiver database.', request.result)
      else console.log('Could not find random string in receiver database.')
    }

    request.onerror = event =>
      console.log('Could not get random string from receiver database.')
  } else if (event.target.matches('#clear')) {
    window.indexedDB
      .databases()
      .then(r => {
        for (var i = 0; i < r.length; i++)
          window.indexedDB.deleteDatabase(r[i].name)
      })
      .then(() => {
        alert('All data cleared.')
      })
  }
})
