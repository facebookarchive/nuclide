'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = app;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function app(state, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).UPDATE_STATE:
      {
        const { state: newState } = action.payload;
        return Object.assign({}, state, newState);
      }
  }
  return state;
}