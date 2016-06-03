/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This file must be written in ES5. It is used to bootstrap a forked process.
/* eslint-disable no-var, prefer-arrow-callback, no-inner-declarations */

var isBootstrapped = false;
var messagesToProcess = [];

function processMessage(message) {
  var action = message.action;
  if (action === 'bootstrap') {
    if (!isBootstrapped) {
      var transpiler = message.transpiler;
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
    var file = message.file;
    var exports = require(file);
    var method = message.method;
    var service = method ? exports[method] : exports;

    // Invoke the service.
    var args = message.args || [];
    var output;
    var error;
    try {
      output = service.apply(null, args);
    } catch (e) {
      error = e;
    }

    // Send back the result.
    var id = message.id;

    function sendSuccessResponse(result) {
      process.send({
        id,
        result,
      });
    }

    function sendErrorResponse(err) {
      process.send({
        id,
        error: {
          message: err.message,
          stack: err.stack,
        },
      });
    }

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
process.on('uncaughtException', function(err) {
  /*eslint-disable no-console*/
  console.error('uncaughtException:', err);
  /*eslint-enable no-console*/
  process.exit(1);
});
// Properly terminate if the parent server crashes.
process.on('disconnect', function() {
  process.exit();
});
