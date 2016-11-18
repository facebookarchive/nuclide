'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _WorkingSet;

function _load_WorkingSet() {
  return _WorkingSet = require('./WorkingSet');
}

Object.defineProperty(exports, 'WorkingSet', {
  enumerable: true,
  get: function () {
    return (_WorkingSet || _load_WorkingSet()).WorkingSet;
  }
});