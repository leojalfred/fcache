async function receiver() {
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

  const delay = 1000
  async function getThreshold() {
    let thresholds = []
    const passes = 20
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

  async function receive() {
    let time = new Date().getTime()
    let rate = 0
    while (new Date().getTime() - time < delay) {
      await put()
      rate++
    }

    console.log(rate, threshold)
    if (rate < threshold) return 1
    else return 0
  }

  // align time to interval to work well with sender
  let time = new Date().getTime()
  const length = 8
  let interval = delay * length
  while (time % interval !== 0) time = new Date().getTime()

  // repeatedly receive message
  setInterval(async () => {
    while (time % interval !== 0) time = new Date().getTime()
    console.log(new Date().getTime())

    let id = []
    for (let i = 0; i < length; i++) id.push(await receive())
    console.log(id)
  }, interval)
}

receiver()
