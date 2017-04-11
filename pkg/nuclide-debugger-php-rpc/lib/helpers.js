'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hphpdMightBeAttached = exports.DUMMY_FRAME_ID = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

// Returns true if hphpd might be attached according to some heuristics applied to the process list.
let hphpdMightBeAttached = exports.hphpdMightBeAttached = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    const processes = yield (0, (_process || _load_process()).checkOutput)('ps', ['aux'], {});
    return processes.stdout.toString().split('\n').slice(1).some(function (line) {
      return line.indexOf('m debug') >= 0 // hhvm -m debug
      || line.indexOf('mode debug') >= 0; // hhvm --mode debug
    });
  });

  return function hphpdMightBeAttached() {
    return _ref.apply(this, arguments);
  };
})();

exports.isContinuationCommand = isContinuationCommand;
exports.isEvaluationCommand = isEvaluationCommand;
exports.base64Decode = base64Decode;
exports.base64Encode = base64Encode;
exports.makeDbgpMessage = makeDbgpMessage;
exports.makeMessage = makeMessage;
exports.pathToUri = pathToUri;
exports.uriToPath = uriToPath;
exports.getBreakpointLocation = getBreakpointLocation;
exports.launchScriptForDummyConnection = launchScriptForDummyConnection;
exports.launchScriptToDebug = launchScriptToDebug;
exports.launchPhpScriptWithXDebugEnabled = launchPhpScriptWithXDebugEnabled;
exports.getMode = getMode;

var _dedent;

function _load_dedent() {
  return _dedent = _interopRequireDefault(require('dedent'));
}

var _child_process = _interopRequireDefault(require('child_process'));

var _url = _interopRequireDefault(require('url'));

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DUMMY_FRAME_ID = exports.DUMMY_FRAME_ID = 'Frame.0'; /**
                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                            * All rights reserved.
                                                            *
                                                            * This source code is licensed under the license found in the LICENSE file in
                                                            * the root directory of this source tree.
                                                            *
                                                            * 
                                                            */

function isContinuationCommand(command) {
  return ['run', 'step_into', 'step_over', 'step_out', 'stop', 'detach'].some(continuationCommand => continuationCommand === command);
}

function isEvaluationCommand(command) {
  return command === 'eval';
}

function base64Decode(value) {
  return new Buffer(value, 'base64').toString();
}

function base64Encode(value) {
  return new Buffer(value).toString('base64');
}function makeDbgpMessage(message) {
  return String(message.length) + '\x00' + message + '\x00';
}

function makeMessage(obj, body_) {
  let body = body_;
  body = body || '';
  let result = '<?xml version="1.0" encoding="iso-8859-1"?>' + '<response xmlns="urn:debugger_protocol_v1" xmlns:xdebug="http://xdebug.org/dbgp/xdebug"';
  for (const key in obj) {
    result += ' ' + key + '="' + obj[key] + '"';
  }
  result += '>' + body + '</response>';
  return makeDbgpMessage(result);
}

function pathToUri(path) {
  return 'file://' + path;
}

function uriToPath(uri) {
  const components = _url.default.parse(uri);
  // Some filename returned from hhvm does not have protocol.
  if (components.protocol !== 'file:' && components.protocol != null) {
    (_utils || _load_utils()).default.logErrorAndThrow(`unexpected file protocol. Got: ${components.protocol}`);
  }
  return components.pathname || '';
}

function getBreakpointLocation(breakpoint) {
  const { filename, lineNumber } = breakpoint.breakpointInfo;
  return {
    // chrome lineNumber is 0-based while xdebug is 1-based.
    lineNumber: lineNumber - 1,
    scriptId: uriToPath(filename)
  };
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
  return new Promise(resolve => {
    launchPhpScriptWithXDebugEnabled(scriptPath, (text, level) => {
      sendToOutputWindow(text, level);
      resolve();
    });
  });
}

function launchPhpScriptWithXDebugEnabled(scriptPath, sendToOutputWindowAndResolve) {
  const { phpRuntimePath, phpRuntimeArgs } = (0, (_config || _load_config()).getConfig)();
  const runtimeArgs = (0, (_string || _load_string()).shellParse)(phpRuntimeArgs);
  const scriptArgs = (0, (_string || _load_string()).shellParse)(scriptPath);
  const args = [...runtimeArgs, ...scriptArgs];
  const proc = _child_process.default.spawn(phpRuntimePath, args);
  (_utils || _load_utils()).default.log((_dedent || _load_dedent()).default`
    child_process(${proc.pid}) spawned with xdebug enabled.
    $ ${phpRuntimePath} ${args.join(' ')}
  `);

  proc.stdout.on('data', chunk => {
    // stdout should hopefully be set to line-buffering, in which case the
    const block = chunk.toString();
    const output = `child_process(${proc.pid}) stdout: ${block}`;
    (_utils || _load_utils()).default.log(output);
  });
  proc.on('error', err => {
    (_utils || _load_utils()).default.log(`child_process(${proc.pid}) error: ${err}`);
    if (sendToOutputWindowAndResolve != null) {
      sendToOutputWindowAndResolve(`The process running script: ${scriptPath} encountered an error: ${err}`, 'error');
    }
  });
  proc.on('exit', code => {
    (_utils || _load_utils()).default.log(`child_process(${proc.pid}) exit: ${code}`);
    if (code != null && sendToOutputWindowAndResolve != null) {
      sendToOutputWindowAndResolve(`Script: ${scriptPath} exited with code: ${code}`, code === 0 ? 'info' : 'error');
    }
  });
  return proc;
}

function getMode() {
  const { launchScriptPath } = (0, (_config || _load_config()).getConfig)();
  return launchScriptPath == null ? 'attach' : 'launch';
}