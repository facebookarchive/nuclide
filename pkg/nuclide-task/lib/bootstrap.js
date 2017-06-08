'use strict';

var _child_process = _interopRequireDefault(require('child_process'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.on('message', message => {
  const { id, file, method, args } = message;

  // $FlowIgnore
  const exports = require(file);
  const service = method != null ? exports[method] : exports;

  const sendSuccessResponse = result => {
    if (!(process.send != null)) {
      throw new Error('Invariant violation: "process.send != null"');
    }

    process.send({
      id,
      result
    });
  };

  const sendErrorResponse = err => {
    if (!(process.send != null && err != null)) {
      throw new Error('Invariant violation: "process.send != null && err != null"');
    }

    process.send({
      id,
      error: {
        message: err.message || err,
        stack: err.stack || null
      }
    });
  };

  // Invoke the service.
  let output;
  let error;
  try {
    output = service(...(args || []));
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
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */

process.on('uncaughtException', err => {
  // eslint-disable-next-line no-console
  console.error('uncaughtException:', err);
  process.exit(1);
});
// Properly terminate if the parent server crashes.
process.on('disconnect', () => {
  process.exit();
});
process.on('exit', () => {
  // Hack: kill all child processes.
  // $FlowIgnore: Private method.
  process._getActiveHandles().forEach(handle => {
    if (handle instanceof _child_process.default.ChildProcess) {
      handle.kill();
    }
  });
});