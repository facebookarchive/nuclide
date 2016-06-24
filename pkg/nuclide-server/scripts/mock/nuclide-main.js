function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _https2;

function _https() {
  return _https2 = _interopRequireDefault(require('https'));
}

var _http2;

function _http() {
  return _http2 = _interopRequireDefault(require('http'));
}

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

// Set the initial version by reading from the file.
var json = JSON.parse((_fs2 || _fs()).default.readFileSync(require.resolve('./package.json')));
var version = /^(\d+)\.(\d+)\.(\d+)(?:-([a-z0-9.-]+))?$/.exec(json.version)[2];

function processArgs() {
  var args = process.argv.slice(2);
  var processedArgs = {};

  args.forEach(function (argument, index) {
    if (index % 2 !== 0) {
      processedArgs[args[index - 1].slice(2)] = argument;
    }
  });
  return processedArgs;
}

function startServer(args) {
  var _webServer = undefined;
  if (args.key && args.cert && args.ca) {
    var webServerOptions = {
      key: (_fs2 || _fs()).default.readFileSync(args.key),
      cert: (_fs2 || _fs()).default.readFileSync(args.cert),
      ca: (_fs2 || _fs()).default.readFileSync(args.ca),
      requestCert: true,
      rejectUnauthorized: true
    };

    _webServer = (_https2 || _https()).default.createServer(webServerOptions, handleRequest);
    console.log('running in secure mode'); //eslint-disable-line no-console
  } else {
      _webServer = (_http2 || _http()).default.createServer(handleRequest);
    }

  _webServer.on('listening', function () {
    console.log('listening on port ' + args.port); //eslint-disable-line no-console
  });

  _webServer.listen(args.port || 8084, '::');
}

function handleRequest(request, response) {
  var pathname = (_url2 || _url()).default.parse(request.url, false).pathname;

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