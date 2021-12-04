async function receiver() {
  // open database connection
  const db = await idb.openDB('receiver', 1, {
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

  const delay = 200
  async function getThreshold() {
    let thresholds = []
    const passes = 10
    for (let i = 0; i < passes; i++) {
      let time = new Date().getTime()
      let threshold = 0

      while (new Date().getTime() - time < delay) {
        await put()
        threshold++
      }

      thresholds.push(threshold)
    }

    return Math.min(...thresholds)
  }
  let threshold = await getThreshold()

  async function receive(id) {
    // align time
    let time = Date.now()
    console.log(time)

    let rate = 0
    while (Date.now() - time < delay) {
      await put()
      rate++
    }

    console.log(rate, threshold)

    if (rate < threshold) id.push(1)
    else id.push(0)

    console.log('ID', id)
    return id
  }

  // align time to interval to work well with sender
  const length = 8
  let interval = delay * length

  // repeatedly receive message
  while (true) {
    // align message to readable interval
    let time = Date.now()
    while (time % (interval * 2) !== 0) time = Date.now()

    let id = []
    for (let i = 0; i < length; i++) id = await receive(id)
  }
}

receiver()
