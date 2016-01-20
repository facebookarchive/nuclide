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

// these are required for the eval'd script to work
global.window = global;
var pureRequire = require;
var rnRequire;

// respond to ops
var ops = {
  evalScript: function (id, data) {
    global.require = null;
    if (data.inject) {
      for (var name in data.inject) {
        global[name] = JSON.parse(data.inject[name]);
      }
    }
    try {
      // The file name is dummy here. Without a file name, the source map is not used.
      vm.runInThisContext(data.script, '/tmp/react-native.js');
    } catch (e) {
      doLog('Failed to exec script: ' + e);
    }
    rnRequire = global.require;
    // node-inspector needs to inject some code when the debugging session starts, which happens to
    // include the following snippet:
    // `require('module')._load(....)
    // However, `module` module does not exist in the RN execution context, and so in order to make
    // it work, we wrap the require function here and hard code `module` to use the vanilla require
    // function.
    global.require = function(moduleName) {
      if (moduleName === 'module') {
        return pureRequire(moduleName);
      }
      return rnRequire(moduleName);
    };
    send(id);
  },

  call: function (id, data) {
    var returnValue = [[], [], [], [], []];
    try {
      if (typeof __fbBatchedBridge === 'object') {
        returnValue = __fbBatchedBridge[data.method].apply(null, data.arguments);
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
