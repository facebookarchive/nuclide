'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerPatchEditor = registerPatchEditor;
exports.deregisterPatchEditor = deregisterPatchEditor;
exports.toggleFile = toggleFile;
exports.toggleHunk = toggleHunk;
exports.toggleLine = toggleLine;

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
 * @format
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

function toggleFile(patchId, fileId) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).TOGGLE_FILE_ACTION,
    payload: {
      patchId,
      fileId
    }
  };
}

function toggleHunk(patchId, fileId, hunkOldStart) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).TOGGLE_HUNK_ACTION,
    payload: {
      patchId,
      fileId,
      hunkOldStart
    }
  };
}

function toggleLine(patchId, fileId, hunkOldStart, line) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).TOGGLE_LINE_ACTION,
    payload: {
      patchId,
      fileId,
      hunkOldStart,
      line
    }
  };
}