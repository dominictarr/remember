module.exports = function (kv) {
  if(!kv) kv = require('fs')
  //append to a file

//UPDATE, the best way to do this is to use level-scuttlebutt.
//if you still just want to use this, then
return function sync(doc, name, cb) {

  name = name || doc.key
  function write () {
    cb(null, doc)
    doc.createReadStream() //track changes forever
      .pipe(kv.createWriteStream(name))   
  }

  // !!!FIX THIS!!!
  // this will break in some situations.
  // it will work mostly. 
  // can loose data if it crashes at the wrong time.
  //
  // TODO: make this reliable.

  kv.stat(name, function (err) {
    if(err) { //the doc is new
      doc.sync = true
      return write() 
    }
    var stream = kv.createReadStream(name)
    stream.once('close', write)
      .pipe(doc.createWriteStream())
  })
}


  /*
    syncronize a document,
    but periodically startover to keep the file
    from growing too large with redundant updates.
    (can't help if there are too many creates though)

    this is old code, and I just timeout and write another file,
    then rotate. it makes no difference whether you stream from 
    one file or two, because of commutativity!

    It would probably be better do that when the file size doubles (?)

    This means that doc should emit when there is a create
    and when there is an update.

    Since the files are rotated, you cant loose data.
    (maybe there are some crazy edge case where you can)
    but you wont loose (old) data from an occasional crash.
    can loose data that is not written yet.

    TODO doc emits update/create counter.
    fix this when write perf is important

    -------

    there may be a better way to do this, what about a duplex fs stream?
    https://github.com/dominictarr/stream-punks/issues/5

    could I make that work with the same exchange as tcp?
    what would the handshakes do? would they break stuff?

    
  */

  return function (doc, key, timer, cb) {
    if('function' === typeof timer)
      cb = timer, timer = null

    var turn, both, cs
    timer = timer || 6e5 //ten minutes
    key = key || doc.key

    function read(key, ready) {
      kv.stat(key, function (err) {
        if(err) return ready(err)
        var ds = doc.createWriteStream()
        kv.createReadStream(key).on('end', ready).pipe(ds)
      })
    }
    function write(key) {
      var source = doc.createReadStream()
      source.pipe(kv.createWriteStream(key))
      return source
    }

    function start() {
      if(!both) return both = true
      //doc emits 'sync', id .
      //in this case, we have loaded the doc's state from
      //disk, that is like syncing with your self. 
      //('sync', doc.id) 
      next()
      var timer = setInterval(next, timer)
      doc.once('dispose', function () {
        clearInterval(timer)
      })
    }

    function next() {
      turn = !turn
      if(cs) cs.destroy()
      cs = write(key + '_' + (turn ? 1 : 2))
    }

    read(key + '_1', start)
    read(key + '_2', start)
  }
}
