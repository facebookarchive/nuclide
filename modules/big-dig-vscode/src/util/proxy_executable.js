/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @noflow
 */
'use strict';

/* eslint
  comma-dangle: [1, always-multiline],
  prefer-object-spread/prefer-object-spread: 0,
  nuclide-internal/no-commonjs: 0,
  */
/* eslint-disable no-console, no-inner-declarations */

/**
 * A command line program that forwards stdio to the given websocket address.
 * We use this because vscode does not allow us to directly hook stdio of tasks.
 *
 * This file is run as a separate process from the rest of the extension.
 *
 * Usage: node proxy_executable.js ${server} ${args...}
 *   server - the address (including a pathname representing a handler) of a
 *     websocket we will forward stdio between.
 *   args - these will be passed to the handler.
*/


const WS = require('ws');

// Once all channels are closed, we'll terminate
let openChannels = 3;

try {
  // The first arguments are 'node', this file, and then the WS address.
  const serverAddress = process.argv[2];
  // Subsequent arguments will be passed to the WS.
  const args = process.argv.slice(3);

  const server = new WS(`${serverAddress}?args=${encodeURIComponent(JSON.stringify(args))}`, {args});
  if (typeof process.stdin.setRawMode === 'function') {
    process.stdin.setRawMode(true);
  }
  function onResize() {
    const msg = JSON.stringify({
      ch: 'resize',
      columns: process.stdout.columns,
      rows: process.stdout.rows,
    });
    server.send(msg);
  }
  function onStdout(data) {
    process.stdout.write(data);
  }
  function onStderr(data) {
    process.stderr.write(data);
  }
  function onStdin(data) {
    const msg = JSON.stringify({ch: 'stdin', data: data.toString()});
    server.send(msg);
  }
  function onMessage(chunk) {
    try {
      const data = JSON.parse(chunk);
      switch (data.ch) {
        case 'stdout':
          onStdout(data.data);
          break;
        case 'stderr':
          onStderr(data.data);
          break;
      }
    } catch (err) {
      console.error(err);
    }
  }
  function onChannelClosed() {
    console.log('closed!');
    --openChannels;
    if (openChannels <= 0) {
      process.exit(0);
    }
  }
  function onServerError(error) {
    console.error(error);
  }
  function onServerOpen() {
    try {
      process.stdin.on('data', onStdin);
      process.stdout.on('resize', onResize);
      process.stdin.once('close', onChannelClosed);
      process.stdout.once('close', onChannelClosed);
      process.stderr.once('close', onChannelClosed);
      onResize();
    } catch (error) {
      console.error(error);
    }
  }

  server.on('error', onServerError);
  server.on('message', onMessage);
  server.on('open', onServerOpen);
} catch (err) {
  console.log(err);
}
