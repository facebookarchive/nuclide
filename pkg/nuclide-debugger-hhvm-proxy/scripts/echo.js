/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* Is not transpiled, allow `var` and console usage. */
/* eslint-disable no-var, no-console, prefer-arrow-callback */

// Starts listening for xdebug connections on the given port.
// Once connected you can enter xdebug commands, messages from the xdebug connection
// are displayed on stdout.
//
// After starting this script, run start-hhvm-client.sh to launch hhvm with xdebug enabled.

// Matches an xdebug command name, e.g. matches 'eval' in 'eval -i 3 -- data'.
var COMMAND_NAME_MATCHER = /^(\w+)/;

var port = process.argv[2] || 9000;

console.log('Attempting to connect on port: ' + port);

var socket = null;

var net = require('net');
var server = net.createServer(
  function(c) {
    socket = c;
    console.log('client connected');
    socket.on('end', function() {
      console.log('client disconnected');
    });

    socket.on('data', function(data) {
      console.log('server: ' + data.toString());
      var components = data.toString().split('\x00');
      console.log('components count: ' + components.length);
      console.log('message content length: ' + components[1].length);
      process.stdout.write(DBG_PROMPT_TEXT);
    });
  });

server.listen(port, function() { //'listening' listener
  console.log('server bound');
});

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

var commandId = 0;
var DBG_PROMPT_TEXT = 'xdebug> ';
process.stdout.write(DBG_PROMPT_TEXT);
rl.on('line', function(line) {
  process.stdout.write(DBG_PROMPT_TEXT);
  if (socket == null) {
    return;
  }
  line = line.trim();
  if (!line) {
    return;
  }
  var matches = COMMAND_NAME_MATCHER.exec(line);
  if (matches == null) {
    return;
  }
  ++commandId;
  var match = matches[0];
  var lineEnd = line.substring(match.length + 1); // + 1 for the leading space.
  var lineWithId = `${match} -i ${commandId} ${lineEnd}`.trim();
  console.log('local: ' + lineWithId);
  socket.write(lineWithId + '\0', undefined /* encoding */, function() {
    console.log('finished writing: ' + lineWithId);
  });
});
