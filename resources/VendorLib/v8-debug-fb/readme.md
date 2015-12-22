[![Build Status](https://travis-ci.org/node-inspector/v8-debug.svg?branch=master)](https://travis-ci.org/node-inspector/v8-debug)
[![Build status](https://ci.appveyor.com/api/projects/status/rb02h15b61xyryhx/branch/master?svg=true)](https://ci.appveyor.com/project/3y3/v8-debug-145/branch/master)
[![npm version](https://badge.fury.io/js/v8-debug.svg)](http://badge.fury.io/js/v8-debug)

# v8-debug
Provides extending API for [node](http://github.com/ry/node) internal debugger protocol (based on [v8 debugger protocol](https://code.google.com/p/v8/wiki/DebuggerProtocol))

This is a part of [node-inspector](http://github.com/node-inspector/node-inspector).

## Installation
```
npm install v8-debug
```
## API

### registerCommand(name, callback)
Registers new debug processor command, like `lookup`.

`callback` accepts two arguments - **request** and **response**.

You need to modify `response.body` if you want to return something to caller.
```js
debug.registerCommand('_lookup', function(request, response) {
  var test = request.attributes;
  //do someting here
  //and modify response
  response.body = {
    test: test
  };
});
```

### registerEvent(eventName)
This is a shortcut for:
```js
debug.registerCommand('someEvent', debug.commandToEvent);
```

### execCommand(commandName, attributes)
Calls debug processor command like 'lookup'.

`attributes` will be passed to `registerCommand.callback` as `request.attributes`.

`attributes` needs to be valid JSON object.
```js
debug.registerCommand('_lookup', function(request, response) {
  var test = request.attributes;
  //do someting here
  //and modify response
  response.body = {
    test: test
  };
});

debug.execCommand('_lookup', { attr: 'test' });
```

### emitEvent(eventName, attributes)
This is a semantic alias for `execCommand`
```js
debug.emitEvent('myEvent', { attr: 'test' });
```

### commandToEvent(request, response)
`response` object has a different structure for commands and events.

By default `registerCommand.callback` receives command's response.

This is a small converter.
```js
debug.registerCommand('someEvent1', function(request, response) {
  debug.commandToEvent(request, response);
});

debug.registerCommand('someEvent2', debug.commandToEvent);
```
Use `debug.registerEvent` instead of this.

### runInDebugContext(script)
(alias `get`)

Evaluates string or function (will be stringifyed) in debug context.
```js
var MakeMirror = debug.get('MakeMirror');
var mirror = MakeMirror({ test: 1 });
```

### getFromFrame(index, value)
Tries to receive a `value` from targeted frame scopes
```js
function a(options) {
  //...
  b();
}

function b() {
  // There is no info about `options` object
  var options = debug.getFromFrame(1, 'options');
}
```

### enableWebkitProtocol()
Enables experimental usage of WebKit protocol

### registerAgentCommand(command, parameters, callback)
Experimental method for registering WebKit protocol handlers

## Usage

Simple console.log checking
```js
var debug = require('v8-debug');

debug.registerEvent('console.log');

console.log = (function(fn) {
  return function() {
    debug.emitEvent('console.log', {message: arguments[0]} /*, userdata*/);
    return fn.apply(console, arguments);
  }
} (console.log));
```

For more experience see [protocol documentation](https://github.com/buggerjs/bugger-v8-client/blob/master/PROTOCOL.md)
