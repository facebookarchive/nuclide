"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = app;

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function app(state, action) {
  switch (action.type) {
    case Actions().UPDATE_STATE:
      {
        const {
          state: newState
        } = action.payload;
        return Object.assign({}, state, newState);
      }
  }

  return state;
}