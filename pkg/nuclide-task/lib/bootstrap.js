'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* NON-TRANSPILED FILE */
/* eslint-disable babel/func-params-comma-dangle, prefer-object-spread/prefer-object-spread */

const child_process = require('child_process');

let isBootstrapped = false;
let messagesToProcess = [];

function processMessage(message) {
  const action = message.action;
  if (action === 'bootstrap') {
    if (!isBootstrapped) {
      const transpiler = message.transpiler;
      require(transpiler);
      messagesToProcess.forEach(processMessage);
      messagesToProcess = null;
      isBootstrapped = true;
    }
    return;
  }

  if (!isBootstrapped) {
    messagesToProcess.push(message);
    return;
  }

  if (action === 'request') {
    // Look up the service function.
    const file = message.file;
    const exports = require(file);
    const method = message.method;
    const service = method ? exports[method] : exports;

    // Invoke the service.
    const args = message.args || [];
    let output;
    let error;
    try {
      output = service.apply(null, args);
    } catch (e) {
      error = e;
    }

    // Send back the result.
    const id = message.id;

    const sendSuccessResponse = result => {
      process.send({
        id,
        result,
      });
    };

    const sendErrorResponse = err => {
      process.send({
        id,
        error: {
          message: err.message,
          stack: err.stack,
        },
      });
    };

    if (error) {
      sendErrorResponse(error);
    } else if (isPromise(output)) {
      output.then(sendSuccessResponse, sendErrorResponse);
    } else {
      sendSuccessResponse(output);
    }
  }
}

function isPromise(arg) {
  // Unfortunately, there is no Promise.isPromise() akin to Array.isArray(),
  // so we use the heuristic that the argument is an object with a then()
  // method. This test for a "thenable" appears to be consistent with the ES6
  // spec.
  return typeof arg === 'object' && typeof arg.then === 'function';
}

process.on('message', processMessage);
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
  process._getActiveHandles()
    .forEach(handle => {
      if (handle instanceof child_process.ChildProcess) {
        handle.kill();
      }
    });
});
