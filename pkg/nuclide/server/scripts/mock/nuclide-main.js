'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

var version;

function processArgs() {
  var args = process.argv.slice(2);
  var processedArgs = {};

  args.forEach(function (argument, index) {
    if (index % 2 !== 0) {
      processedArgs[args[index-1].slice(2)] = argument;
    }
  });
  return processedArgs;
}

function startServer(args) {
  if (args.key && args.cert && args.ca) {
    var webServerOptions = {
      key: fs.readFileSync(args.key),
      cert: fs.readFileSync(args.cert),
      ca: fs.readFileSync(args.ca),
      requestCert: true,
      rejectUnauthorized: true,
    };

    var _webServer = https.createServer(webServerOptions, handleRequest);
    console.log('running in secure mode');
  } else {
    var _webServer = http.createServer(handleRequest);
  }

  _webServer.on('listening', function () {
    console.log('listening on port ' + args.port);
  });

  _webServer.listen(args.port || 8084, '::');
}

function handleRequest(request, response) {
  var path = url.parse(request.url, false).pathname;

  switch (path) {
    case '/server/version':
      handleVersion(request, response);
      break;
    case '/server/setversion':
      handleSetVersion(request, response);
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

function handleSetVersion(request, response) {
  response.writeHead(200);
  var parsedUrl = url.parse(request.url, true);

  if (parsedUrl.query) {
    version = parsedUrl.query.version;
    response.write('Version set to ' + parsedUrl.query.version);
  }

  response.end();
}

// Set the initial version by reading from the file.
try {
  var json = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'version.json')));
  version = json.Version.toString();
} catch (e) {
  version = 'test-version';
}
startServer(processArgs());
