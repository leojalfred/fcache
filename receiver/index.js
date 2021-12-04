async function receiver() {
  // open database connection
  const db = await idb.openDB('receiver', 1, {
    upgrade(db) {
      db.createObjectStore('receiver', { keyPath: 'index' })
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
      .transaction('receiver', 'readwrite')
      .objectStore('receiver')
      .put({ index: '0', string })
  }

  // must run sender before receiver to get proper threshold
  const delay = 200
  async function getThreshold() {
    let rates = []
    const passes = 10

    // get put rate for each pass
    for (let i = 0; i < passes; i++) {
      let time = new Date().getTime()
      let rate = 0

      // repeatedly write for delay amount of time, counting puts
      while (new Date().getTime() - time < delay) {
        await put()
        rate++
      }

      rates.push(rate)
    }

    // take average rate
    return rates.reduce((a, b) => a + b, 0) / rates.length
  }
  let threshold = await getThreshold()

  async function receive() {
    let time = Date.now()
    let rate = 0

    // repeatedly write for delay amount of time, counting puts
    while (Date.now() - time < delay) {
      await put()
      rate++
    }

    // add to message based off rate and threshold
    if (rate < threshold) return 1
    else return 0
  }

  const messages = []
  const length = 8

  // average message and return it to string form
  function averageMessage() {
    const message = []
    for (let i = 0; i < length; i++) {
      message[i] = 0
      for (let j = 0; j < messages.length; j++) message[i] += messages[j][i]
      message[i] = Math.round(message[i] / messages.length)
    }

    return message.join('')
  }

  const interval = delay * length * 2
  let k = 0
  const span = document.getElementById('id')

  // repeatedly receive message
  while (true) {
    // align message to readable interval
    let time = Date.now()
    while (time % interval !== 0) time = Date.now()

    // get message
    const message = []
    for (let i = 0; i < length; i++) message.push(await receive())

    messages[k] = message
    k = (k + 1) % 100

    span.textContent = averageMessage()
  }
}

receiver()
