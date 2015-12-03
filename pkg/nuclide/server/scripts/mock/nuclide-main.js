'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let version;

function processArgs() {
  const args = process.argv.slice(2);
  const processedArgs = {};

  args.forEach(function (argument, index) {
    if (index % 2 !== 0) {
      processedArgs[args[index - 1].slice(2)] = argument;
    }
  });
  return processedArgs;
}

function startServer(args) {
  let _webServer;
  if (args.key && args.cert && args.ca) {
    const webServerOptions = {
      key: fs.readFileSync(args.key),
      cert: fs.readFileSync(args.cert),
      ca: fs.readFileSync(args.ca),
      requestCert: true,
      rejectUnauthorized: true,
    };

    _webServer = https.createServer(webServerOptions, handleRequest);
    console.log('running in secure mode'); //eslint-disable-line no-console
  } else {
    _webServer = http.createServer(handleRequest);
  }

  _webServer.on('listening', function () {
    console.log('listening on port ' + args.port); //eslint-disable-line no-console
  });

  _webServer.listen(args.port || 8084, '::');
}

function handleRequest(request, response) {
  const pathname = url.parse(request.url, false).pathname;

  switch (pathname) {
    case '/heartbeat':
      handleVersion(request, response);
      break;
    default:
      response.writeHead(500);
      response.write('This mock server does not understand that command');
      response.end();
      break;
  }
}


function handleVersion(request, response) {
  response.writeHead(200);
  response.write(version);
  response.end();
}

// Set the initial version by reading from the file.
try {
  const json = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'version.json')));
  version = json.Version.toString();
} catch (e) {
  version = 'test-version';
}
startServer(processArgs());
