/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Starts listening for xdebug connections on the given port.
// Once connected you can enter xdebug commands, messages from the xdebug connection
// are displayed on stdout.
//
// After starting this script, run start-hhvm-client.sh to launch hhvm with xdebug enabled.

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

rl.on('line', function(line){
  if (socket) {
    if (line === 'b') {
      line = 'break -i 2\0';
    }
    console.log('local: ' + line);
    socket.write(line + '\0', undefined /* encoding */, function() {
      console.log('finished writing: ' + line);
    });
  }
})


