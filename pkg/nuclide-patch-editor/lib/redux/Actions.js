'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerPatchEditor = registerPatchEditor;
exports.deregisterPatchEditor = deregisterPatchEditor;
exports.clickCheckbox = clickCheckbox;

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
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

function registerPatchEditor(editorPath, patchData) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).REGISTER_PATCH_EDITOR,
    payload: {
      editorPath,
      patchData
    }
  };
}

function deregisterPatchEditor(editorPath) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).DEREGISTER_PATCH_EDITOR,
    payload: {
      editorPath
    }
  };
}

function clickCheckbox(editorPath, fileName, hunkOldStartLine, line) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).CLICK_CHECKBOX_ACTION,
    payload: {
      editorPath,
      fileName,
      hunkOldStartLine,
      line
    }
  };
}