# remember

Persist gossip (scuttlebutt, crdt, etc)

This module is suitable when you want to persist a single `Scuttlebutt` at once.
If you have many, [level-scuttlebutt](https://github.com/dominictarr/level-scuttlebutt)
is recommended.

``` js
var Emitter  = require('scuttlebutt/events')
var fs       = require('fs')
var Remember = require('remember')

var emitter  = new Emitter()
var remember = Remember(fs)

remember(emitter, '/tmp/remember-test-messages', function () {
  console.log('synced1')
})
```

## License

MIT
