Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.base64Decode = base64Decode;
exports.base64Encode = base64Encode;

// Returns true if hphpd might be attached according to some heuristics applied to the process list.

var hphpdMightBeAttached = _asyncToGenerator(function* () {
  var processes = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).checkOutput)('ps', ['aux'], {});
  return processes.stdout.toString().split('\n').slice(1).some(function (line) {
    return line.indexOf('m debug') >= 0 // hhvm -m debug
     || line.indexOf('mode debug') >= 0; // hhvm --mode debug
  });
});

exports.hphpdMightBeAttached = hphpdMightBeAttached;
exports.makeDbgpMessage = makeDbgpMessage;
exports.makeMessage = makeMessage;
exports.pathToUri = pathToUri;
exports.uriToPath = uriToPath;
exports.launchScriptForDummyConnection = launchScriptForDummyConnection;
exports.launchScriptToDebug = launchScriptToDebug;
exports.launchPhpScriptWithXDebugEnabled = launchPhpScriptWithXDebugEnabled;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _child_process2;

function _child_process() {
  return _child_process2 = _interopRequireDefault(require('child_process'));
}

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _shellQuote2;

function _shellQuote() {
  return _shellQuote2 = require('shell-quote');
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var DUMMY_FRAME_ID = 'Frame.0';

exports.DUMMY_FRAME_ID = DUMMY_FRAME_ID;

function base64Decode(value) {
  return new Buffer(value, 'base64').toString();
}

function base64Encode(value) {
  return new Buffer(value).toString('base64');
}

function makeDbgpMessage(message) {
  return String(message.length) + '\x00' + message + '\x00';
}

function makeMessage(obj, body) {
  body = body || '';
  var result = '<?xml version="1.0" encoding="iso-8859-1"?>' + '<response xmlns="urn:debugger_protocol_v1" xmlns:xdebug="http://xdebug.org/dbgp/xdebug"';
  for (var key in obj) {
    result += ' ' + key + '="' + obj[key] + '"';
  }
  result += '>' + body + '</response>';
  return makeDbgpMessage(result);
}

function pathToUri(path) {
  return 'file://' + path;
}

function uriToPath(uri) {
  var components = (_url2 || _url()).default.parse(uri);
  // Some filename returned from hhvm does not have protocol.
  if (components.protocol !== 'file:' && components.protocol != null) {
    (_utils2 || _utils()).default.logErrorAndThrow('unexpected file protocol. Got: ' + components.protocol);
  }
  return components.pathname || '';
}

/**
 * Used to start the HHVM instance that the dummy connection connects to so we can evaluate
 * expressions in the REPL.
 */

function launchScriptForDummyConnection(scriptPath) {
  return launchPhpScriptWithXDebugEnabled(scriptPath);
}

/**
 * Used to start an HHVM instance running the given script in debug mode.
 */

function launchScriptToDebug(scriptPath, sendToOutputWindow) {
  return new Promise(function (resolve) {
    launchPhpScriptWithXDebugEnabled(scriptPath, function (text) {
      sendToOutputWindow(text);
      resolve();
    });
  });
}

function launchPhpScriptWithXDebugEnabled(scriptPath, sendToOutputWindowAndResolve) {
  var args = (0, (_shellQuote2 || _shellQuote()).parse)(scriptPath);

  var _require = require('fs-plus');

  var existsSync = _require.existsSync;

  var modifiedArgs = args;
  // TODO: will remove when t10747769 is resolved.
  if (existsSync('fb/cli.hdf')) {
    modifiedArgs = ['-c', 'fb/cli.hdf'].concat(_toConsumableArray(args));
  }
  var proc = (_child_process2 || _child_process()).default.spawn((0, (_config2 || _config()).getConfig)().phpRuntimePath, modifiedArgs);
  (_utils2 || _utils()).default.log('child_process(' + proc.pid + ') spawned with xdebug enabled for: ' + scriptPath);

  proc.stdout.on('data', function (chunk) {
    // stdout should hopefully be set to line-buffering, in which case the

    var block = chunk.toString();
    var output = 'child_process(' + proc.pid + ') stdout: ' + block;
    (_utils2 || _utils()).default.log(output);
  });
  proc.on('error', function (err) {
    (_utils2 || _utils()).default.log('child_process(' + proc.pid + ') error: ' + err);
    if (sendToOutputWindowAndResolve != null) {
      sendToOutputWindowAndResolve('The process running script: ' + scriptPath + ' encountered an error: ' + err);
    }
  });
  proc.on('exit', function (code) {
    (_utils2 || _utils()).default.log('child_process(' + proc.pid + ') exit: ' + code);
    if (code != null && sendToOutputWindowAndResolve != null) {
      sendToOutputWindowAndResolve('Script: ' + scriptPath + ' exited with code: ' + code);
    }
  });
  return proc;
}

// string would come on one line.