// Originally from https://github.com/dominictarr/event-stream/tree/bbcefd4
'use strict';

var Stream = require('stream').Stream;

//
// readable (asyncFunction)
// return a stream that calls an async function while the stream is not paused.
//
// the function must take: (count, callback) {...
//

module.exports = function readable(func, continueOnError) {
  var stream = new Stream()
    , i = 0
    , paused = false
    , ended = false
    , reading = false

  stream.readable = true
  stream.writable = false

  if('function' !== typeof func)
    throw new Error('event-stream.readable expects async function')

  stream.on('end', function () { ended = true })

  function get (err, data) {

    if(err) {
      stream.emit('error', err)
      if(!continueOnError) stream.emit('end')
    } else if (arguments.length > 1)
      stream.emit('data', data)

    process.nextTick(function () {
      if(ended || paused || reading) return
      try {
        reading = true
        func.call(stream, i++, function () {
          reading = false
          get.apply(null, arguments)
        })
      } catch (err) {
        stream.emit('error', err)
      }
    })
  }
  stream.resume = function () {
    paused = false
    get()
  }
  process.nextTick(get)
  stream.pause = function () {
     paused = true
  }
  stream.destroy = function () {
    stream.emit('end')
    stream.emit('close')
    ended = true
  }
  return stream
}
