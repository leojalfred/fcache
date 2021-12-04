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

  async function receive(id) {
    let time = Date.now()
    let rate = 0
    // console.log(time)

    // repeatedly write for delay amount of time, counting puts
    while (Date.now() - time < delay) {
      await put()
      rate++
    }
    // console.log(rate, threshold)

    // add to message based off rate and threshold
    if (rate < threshold) id.push(1)
    else id.push(0)

    console.log('ID', id)
    return id
  }

  // repeatedly receive message
  const length = 8
  const interval = delay * length * 2
  while (true) {
    // align message to readable interval
    let time = Date.now()
    while (time % interval !== 0) time = Date.now()

    // get message
    let id = []
    for (let i = 0; i < length; i++) id = await receive(id)
  }
}

receiver()
