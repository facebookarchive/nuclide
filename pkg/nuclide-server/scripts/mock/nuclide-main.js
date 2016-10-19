function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _https;

function _load_https() {
  return _https = _interopRequireDefault(require('https'));
}

var _http;

function _load_http() {
  return _http = _interopRequireDefault(require('http'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireDefault(require('fs'));
}

var _url;

function _load_url() {
  return _url = _interopRequireDefault(require('url'));
}

// Set the initial version by reading from the file.
var json = JSON.parse((_fs || _load_fs()).default.readFileSync(require.resolve('./package.json'), 'utf8'));
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
      key: (_fs || _load_fs()).default.readFileSync(args.key),
      cert: (_fs || _load_fs()).default.readFileSync(args.cert),
      ca: (_fs || _load_fs()).default.readFileSync(args.ca),
      requestCert: true,
      rejectUnauthorized: true
    };

    _webServer = (_https || _load_https()).default.createServer(webServerOptions, handleRequest);
    // eslint-disable-next-line no-console
    console.log('running in secure mode');
  } else {
    _webServer = (_http || _load_http()).default.createServer(handleRequest);
  }

  _webServer.on('listening', function () {
    // eslint-disable-next-line no-console
    console.log('listening on port ' + args.port);
  });

  _webServer.listen(args.port || 8084, '::');
}

function handleRequest(request, response) {
  var pathname = (_url || _load_url()).default.parse(request.url, false).pathname;

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