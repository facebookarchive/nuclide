function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _child_process2;

function _child_process() {
  return _child_process2 = _interopRequireDefault(require('child_process'));
}

process.on('message', function (message) {
  var id = message.id;
  var file = message.file;
  var method = message.method;
  var args = message.args;

  // $FlowIgnore
  var exports = require(file);
  var service = method != null ? exports[method] : exports;

  var sendSuccessResponse = function sendSuccessResponse(result) {
    (0, (_assert2 || _assert()).default)(process.send != null);
    process.send({
      id: id,
      result: result
    });
  };

  var sendErrorResponse = function sendErrorResponse(err) {
    (0, (_assert2 || _assert()).default)(process.send != null && err != null);
    process.send({
      id: id,
      error: {
        message: err.message || err,
        stack: err.stack || null
      }
    });
  };

  // Invoke the service.
  var output = undefined;
  var error = undefined;
  try {
    output = service.apply(null, args || []);
  } catch (e) {
    error = e;
  }

  if (error) {
    sendErrorResponse(error);
  } else if (output != null && typeof output.then === 'function') {
    output.then(sendSuccessResponse, sendErrorResponse);
  } else {
    sendSuccessResponse(output);
  }
});

process.on('uncaughtException', function (err) {
  // eslint-disable-next-line no-console
  console.error('uncaughtException:', err);
  process.exit(1);
});
// Properly terminate if the parent server crashes.
process.on('disconnect', function () {
  process.exit();
});
process.on('exit', function () {
  // Hack: kill all child processes.
  // $FlowIgnore: Private method.
  process._getActiveHandles().forEach(function (handle) {
    if (handle instanceof (_child_process2 || _child_process()).default.ChildProcess) {
      handle.kill();
    }
  });
});