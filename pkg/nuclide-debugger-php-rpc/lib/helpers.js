'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hphpdMightBeAttached = exports.DUMMY_FRAME_ID = exports.uriToPath = exports.pathToUri = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

// Returns true if hphpd might be attached according to some heuristics applied to the process list.
let hphpdMightBeAttached = exports.hphpdMightBeAttached = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    const processes = yield (0, (_process || _load_process()).runCommand)('ps', ['aux'], {}).toPromise();
    return processes.toString().split('\n').slice(1).some(function (line) {
      return line.indexOf('m debug') >= 0 || line.indexOf('mode debug') >= 0 // hhvm -m debug
      ; // hhvm --mode debug
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
  return _string = require('nuclide-commons/string');
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _helpers;

function _load_helpers() {
  return _helpers = require('../../nuclide-debugger-common/lib/helpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

exports.pathToUri = (_helpers || _load_helpers()).pathToUri;
exports.uriToPath = (_helpers || _load_helpers()).uriToPath;
const DUMMY_FRAME_ID = exports.DUMMY_FRAME_ID = 'Frame.0';

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

function getBreakpointLocation(breakpoint) {
  const { filename, lineNumber } = breakpoint.breakpointInfo;
  return {
    // chrome lineNumber is 0-based while xdebug is 1-based.
    lineNumber: lineNumber - 1,
    scriptId: (0, (_helpers || _load_helpers()).uriToPath)(filename)
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
  const {
    phpRuntimePath,
    phpRuntimeArgs,
    dummyRequestFilePath,
    launchWrapperCommand
  } = (0, (_config || _load_config()).getConfig)();
  const runtimeArgs = (0, (_string || _load_string()).shellParse)(phpRuntimeArgs);
  const isDummyLaunch = scriptPath === dummyRequestFilePath;

  let processPath = phpRuntimePath;
  const processOptions = {};
  if (!isDummyLaunch && launchWrapperCommand != null) {
    processPath = launchWrapperCommand;
    processOptions.cwd = (_nuclideUri || _load_nuclideUri()).default.dirname(dummyRequestFilePath);
  }

  const scriptArgs = (0, (_string || _load_string()).shellParse)(scriptPath);
  const args = [...runtimeArgs, ...scriptArgs];
  const proc = _child_process.default.spawn(processPath, args, processOptions);
  (_utils || _load_utils()).default.debug((_dedent || _load_dedent()).default`
    child_process(${proc.pid}) spawned with xdebug enabled.
    $ ${phpRuntimePath} ${args.join(' ')}
  `);

  proc.stdout.on('data', chunk => {
    // stdout should hopefully be set to line-buffering, in which case the
    const block = chunk.toString();
    const output = `child_process(${proc.pid}) stdout: ${block}`;
    (_utils || _load_utils()).default.debug(output);
    // No need to forward stdout to the client here. Stdout is also sent
    // over the XDebug protocol channel and is forwarded to the client
    // by DbgpSocket.
  });
  proc.stderr.on('data', chunk => {
    const block = chunk.toString().trim();
    const output = `child_process(${proc.pid}) stderr: ${block}`;
    (_utils || _load_utils()).default.debug(output);
    // TODO: Remove this when XDebug forwards stderr streams over
    // DbgpSocket.
    if (sendToOutputWindowAndResolve != null) {
      sendToOutputWindowAndResolve(block, 'error');
    }
  });
  proc.on('error', err => {
    (_utils || _load_utils()).default.debug(`child_process(${proc.pid}) error: ${err}`);
    if (sendToOutputWindowAndResolve != null) {
      sendToOutputWindowAndResolve(`The process running script: ${scriptPath} encountered an error: ${err}`, 'error');
    }
  });
  proc.on('exit', code => {
    (_utils || _load_utils()).default.debug(`child_process(${proc.pid}) exit: ${code}`);
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