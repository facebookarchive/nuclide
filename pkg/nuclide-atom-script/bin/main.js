/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*
 * This script expects at least one argument, which is the path to the JavaScript
 * file to run as an Atom test. All subsequent arguments will be forwarded to the
 * function exported by the JavaScript file to run.
 *
 * Unfortunately, due to https://github.com/atom/atom/issues/10952, we need to introduce some
 * machinery so that the only bytes written to stdout are those passed to `console.log()` by
 * the code executed by the JavaScript file. To achieve this, we create a UNIX domain socket
 * whose location we pass to Atom so we can redefine `console.log()` to write to the UNIX
 * domain socket. In turn, data received by the socket is forwarded to the stdout of this process.
 *
 * It would probably be simpler to redirect `console.log()` to write to file descriptor 3
 * and then pipe that to stdout, but that appears to cause Atom to crash due to complaints
 * about writing to a "guarded file descriptor."
 */

// NOTE: This file is run as-is from Node, which is why we do not use let or Flow types.
/* eslint-disable no-var, no-console, prefer-arrow-callback */

var child_process = require('child_process');
var epipebomb = require('epipebomb');
var net = require('net');
var path = require('path');
var split = require('split');
var temp = require('temp').track();

var atomTest;
var server;
var domainSocket = path.join(temp.mkdirSync(), 'my.sock');

function exit(code) {
  // Unfortunately, this does not seem to kill Atom appropriately when the output of atom-script
  // is piped to another process. That is, this main process dies, but Atom sticks around.
  if (atomTest != null) {
    atomTest.kill('SIGTERM');
  }

  if (server != null) {
    server.close();
  }
  process.exit(code);
}

var entryPoint = process.argv[2];
if (typeof entryPoint !== 'string') {
  console.error('First argument must be a path to a file to run.');
  exit(1);
}
if (!path.isAbsolute(entryPoint)) {
  entryPoint = path.resolve(process.env['PWD'], entryPoint);
}

/**
 * Runs the appropriate `atom --test` command and exits when the test completes.
 *
 * Note that all data that is passed to the user's script are encoded via the --log-file
 * argument because that is the only communication channel we have between the command line
 * and the user's code (other than environment variables).
 */
function runAtom() {
  var scriptArgs = {
    path: entryPoint,
    args: process.argv.slice(3),
    stdout: domainSocket,
  };
  var args = [
    '--test',
    require.resolve('..'),
    '--log-file',
    JSON.stringify(scriptArgs),
  ];

  atomTest = child_process.spawn('atom', args);
  if (process.env['DEBUG_ATOM_SCRIPT'] != null) {
    // When the DEBUG_ATOM_SCRIPT environment variable is set, we forward stdout and stderr from
    // the Atom process to stderr so that the stdout is only what is written by `console.log()`
    // in the Atom process.
    var writeToStderr = process.stderr.write.bind(process.stderr);
    atomTest.stdout.on('data', writeToStderr);
    atomTest.stderr.on('data', writeToStderr);
  }

  atomTest.on('close', exit);
}

function main() {
  // This ensures that users of atom-script can pipe output to head, etc., without error.
  epipebomb(process.stdout, exit);

  server = net.createServer(function(connection) {
    connection
      .pipe(split(JSON.parse))
      .on('data', function(obj) {
        var method = obj.method;
        if (method === 'end') {
          server.close();
          return;
        }

        var id = obj.id;
        var data = obj.message;

        // Until a fix for suppressing this debug info is upstreamed:
        // https://github.com/atom/atom/commit/a4b9b9c6cd27e1403bd1ea4b82bd02f97031fc6a#commitcomment-16378936
        // We special-case content that starts with this prefix:
        var PREFIX = 'Window load time: ';
        // We use this technique instead of startsWith() so this works on Node 0.12.0.
        if (data.substring(0, PREFIX.length) !== PREFIX) {
          var stream = method === 'log' ? process.stdout : process.stderr;
          stream.write(data);
        }

        connection.write(`${id}\0`);
      })
      .on('error', function(error) {
        process.stderr.write('ERROR: ' + error + '\n');
      });
  });
  server.listen({path: domainSocket}, runAtom);
}

module.exports = main;
