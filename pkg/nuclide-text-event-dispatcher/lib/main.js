Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _TextEventDispatcher2;

function _TextEventDispatcher() {
  return _TextEventDispatcher2 = require('./TextEventDispatcher');
}

exports.TextEventDispatcher = (_TextEventDispatcher2 || _TextEventDispatcher()).TextEventDispatcher;

var dispatcher = null;
module.exports = {
  getInstance: function getInstance() {
    if (!dispatcher) {
      dispatcher = new (_TextEventDispatcher2 || _TextEventDispatcher()).TextEventDispatcher();
    }
    return dispatcher;
  }
};