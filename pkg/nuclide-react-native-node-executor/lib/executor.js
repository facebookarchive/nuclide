/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

/* eslint-disable no-var */

var vm = require('vm');
var fs = require('fs');

function doLog(data) {
  fs.appendFileSync('/tmp/nuclide-react-node-executor.log', data + '\n');
}

var currentContext = null;

// respond to ops
var ops = {
  executeApplicationScript: function (id, data) {
    var globals = {
      console: console,
    };
    if (data.inject) {
      for (var name in data.inject) {
        globals[name] = JSON.parse(data.inject[name]);
      }
    }
    currentContext = vm.createContext(globals);

    try {
      // The file name is dummy here. Without a file name, the source map is not used.
      vm.runInContext(data.script, currentContext, '/tmp/react-native.js');
    } catch (e) {
      doLog('Failed to exec script: ' + e);
    }

    send(id);
  },

  call: function (id, data) {
    var returnValue = [[], [], [], [], []];
    try {
      if (currentContext != null && typeof currentContext.__fbBatchedBridge === 'object') {
        returnValue = currentContext.__fbBatchedBridge[data.method].apply(null, data.arguments);
      }
    } catch (e) {
      doLog('Failed while making a call ' + data.method + ':::' + e);
    } finally {
      send(id, JSON.stringify(returnValue));
    }
  },
};

process.on('message', function (payload) {
  if (!ops[payload.op]) {
    doLog('Unknown op' + payload.op + ' ' + payload);
    return;
  }
  ops[payload.op](payload.id, payload.data);
});

function send(replyId, result) {
  process.send({replyId: replyId, result: result});
}
