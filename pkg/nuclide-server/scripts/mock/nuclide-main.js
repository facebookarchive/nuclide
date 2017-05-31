'use strict';

var _https = _interopRequireDefault(require('https'));

var _http = _interopRequireDefault(require('http'));

var _fs = _interopRequireDefault(require('fs'));

var _url = _interopRequireDefault(require('url'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Set the initial version by reading from the file.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const json = JSON.parse(_fs.default.readFileSync(require.resolve('./package.json'), 'utf8'));
const version = /^(\d+)\.(\d+)\.(\d+)(?:-([a-z0-9.-]+))?$/.exec(json.version)[2];

function processArgs() {
  const args = process.argv.slice(2);
  const processedArgs = {};

  args.forEach((argument, index) => {
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
      key: _fs.default.readFileSync(args.key),
      cert: _fs.default.readFileSync(args.cert),
      ca: _fs.default.readFileSync(args.ca),
      requestCert: true,
      rejectUnauthorized: true
    };

    _webServer = _https.default.createServer(webServerOptions, handleRequest);
    // eslint-disable-next-line no-console
    console.log('running in secure mode');
  } else {
    _webServer = _http.default.createServer(handleRequest);
  }

  _webServer.on('listening', () => {
    // eslint-disable-next-line no-console
    console.log('listening on port ' + args.port);
  });

  _webServer.listen(args.port || 8084, '::');
}

function handleRequest(request, response) {
  const pathname = _url.default.parse(request.url, false).pathname;

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

startServer(processArgs());