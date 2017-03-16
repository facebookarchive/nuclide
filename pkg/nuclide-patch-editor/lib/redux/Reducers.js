'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rootReducer = rootReducer;

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./createEmptyAppState');
}

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
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
 */

function rootReducer(state, action) {
  if (state == null) {
    return (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)();
  }
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).REGISTER_PATCH_EDITOR:
      {
        const patchEditors = new Map(state.patchEditors);
        patchEditors.set(action.payload.editorPath, (0, (_utils || _load_utils()).createPatchData)(action.payload.patchData));
        return Object.assign({}, state, {
          patchEditors
        });
      }

    case (_ActionTypes || _load_ActionTypes()).DEREGISTER_PATCH_EDITOR:
      {
        const patchEditors = new Map(state.patchEditors);
        patchEditors.delete(action.payload.editorPath);
        return Object.assign({}, state, {
          patchEditors
        });
      }

    case (_ActionTypes || _load_ActionTypes()).CLICK_CHECKBOX_ACTION:
      {
        // Coming soon
        return Object.assign({}, state);
      }
  }
  return state;
}