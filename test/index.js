var Emitter = require('scuttlebutt/events')

var emitter = new Emitter()
var emitter2 = new Emitter()
var remember = require('..')

var rmrf = require('rimraf')
var kv   = require('kv')
var dir = '/tmp/remember-test'

var assert = require('assert')

rmrf(dir, function () {
  
  var sync = remember(kv(dir))

  sync(emitter, 'messages')

  var expected = [], actual = []

  /*
    create two scuttlebutt/events instances that will 
  */

  emitter.on('message', function (hi) {
//    console.log('1>>', hi)
    expected.push(hi)
  })

  emitter2.on('message', function (hi) {
//    console.log('2>>', hi)
    actual.push(hi)
  })

  emitter2.on('sync', function () {
    console.log('SYNCED emitter2')
    //assert they are consistent.
    console.log('ACTUAL', actual)
    console.log('EXPECTED', expected)
    assert.deepEqual(actual, expected)
    passed = true
  })

  var i = 0
  var timer = setInterval(function () {
    if(i++ < 5)
      return emitter.emit('message', 'hello_'+new Date())
    emitter.dispose()
    clearInterval(timer)
    sync(emitter2, 'messages')
    
  }, 1e2)
})
