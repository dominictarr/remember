var Emitter = require('scuttlebutt/events')

var emitter = new Emitter()
var emitter2 = new Emitter()
var remember = require('..')

var rmrf = require('rimraf')
var fs = require('fs')
var dir = '/tmp/remember-test'

require('tape')(function (assert) {

  rmrf(dir, function () {
  
    var sync = remember(fs)

    sync(emitter, '/tmp/remember-test-messages', function () {
      console.log('synced1')
    })

    var expected = [], actual = []

    /*
      create two scuttlebutt/events instances that will 
    */

    emitter.on('message', function (hi) {
      console.log('1>>', hi)
      expected.push(hi)
    })

    emitter2.on('message', function (hi) {
      console.log('2>>', hi)
      actual.push(hi)
    })

    var i = 0
    var timer = setInterval(function () {
      if(i++ < 5)
        return emitter.emit('message', 'hello_'+new Date())
      emitter.dispose()
      clearInterval(timer)
      sync(emitter2, '/tmp/remember-test-messages', function () {
        console.log('SYNCED emitter2')
        //assert they are consistent.
        console.log('ACTUAL', actual)
        console.log('EXPECTED', expected)
        assert.deepEqual(actual, expected)
        passed = true
        assert.end()
      })
    }, 1e2)
  })
})
