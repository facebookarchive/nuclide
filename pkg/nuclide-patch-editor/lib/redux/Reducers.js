'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rootReducer = rootReducer;

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./createEmptyAppState');
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

    case (_ActionTypes || _load_ActionTypes()).TOGGLE_FILE_ACTION:
      {
        const { patchId, fileId } = action.payload;

        const patchEditors = new Map(state.patchEditors);
        const patchData = (0, (_nullthrows || _load_nullthrows()).default)(patchEditors.get(patchId));
        patchEditors.set(patchId, updatePatchData(patchData, fileId));
        return Object.assign({}, state, {
          patchEditors
        });
      }

    case (_ActionTypes || _load_ActionTypes()).TOGGLE_HUNK_ACTION:
      {
        const { patchId, fileId, hunkOldStart } = action.payload;

        const patchEditors = new Map(state.patchEditors);
        const patchData = (0, (_nullthrows || _load_nullthrows()).default)(patchEditors.get(patchId));
        patchEditors.set(patchId, updatePatchData(patchData, fileId, hunkOldStart));
        return Object.assign({}, state, {
          patchEditors
        });
      }

    case (_ActionTypes || _load_ActionTypes()).TOGGLE_LINE_ACTION:
      {
        const { patchId, fileId, hunkOldStart, line } = action.payload;

        const patchEditors = new Map(state.patchEditors);
        const patchData = (0, (_nullthrows || _load_nullthrows()).default)(patchEditors.get(patchId));
        patchEditors.set(patchId, updatePatchData(patchData, fileId, hunkOldStart, line));
        return Object.assign({}, state, {
          patchEditors
        });
      }
  }
  return state;
}

function updatePatchData(patchData, fileId, hunkOldStart, line) {
  // line should never be non-null while hunkOldStart is
  if (!(line == null || hunkOldStart != null)) {
    throw new Error('Invariant violation: "line == null || hunkOldStart != null"');
  }

  const files = new Map(patchData.files);
  const oldFile = (0, (_nullthrows || _load_nullthrows()).default)(files.get(fileId));
  files.set(fileId, updateFileData(oldFile, hunkOldStart, line));

  return Object.assign({}, patchData, {
    files
  });
}

function updateFileData(fileData, hunkOldStart, line) {
  let { countEnabledChunks, countPartialChunks } = fileData;
  let chunks;
  let selected;

  if (hunkOldStart != null) {
    // Toggling hunk or individual line
    chunks = new Map((0, (_nullthrows || _load_nullthrows()).default)(fileData.chunks));
    const oldHunk = (0, (_nullthrows || _load_nullthrows()).default)(chunks.get(hunkOldStart));
    const newHunk = updateHunkData(oldHunk, line);
    chunks.set(hunkOldStart, newHunk);

    // Update countEnabledChunks and countPartialChunks based on change in selected state

    if (!(!(oldHunk.selected === (_constants || _load_constants()).SelectedState.ALL && newHunk.selected === (_constants || _load_constants()).SelectedState.ALL) && !(oldHunk.selected === (_constants || _load_constants()).SelectedState.NONE && newHunk.selected === (_constants || _load_constants()).SelectedState.NONE))) {
      throw new Error('Invariant violation: "!(\\n        oldHunk.selected === SelectedState.ALL &&\\n        newHunk.selected === SelectedState.ALL\\n      ) &&\\n        !(\\n          oldHunk.selected === SelectedState.NONE &&\\n          newHunk.selected === SelectedState.NONE\\n        )"');
    }

    if (oldHunk.selected === (_constants || _load_constants()).SelectedState.ALL && newHunk.selected === (_constants || _load_constants()).SelectedState.SOME) {
      countEnabledChunks--;
      countPartialChunks++;
    } else if (oldHunk.selected === (_constants || _load_constants()).SelectedState.ALL && newHunk.selected === (_constants || _load_constants()).SelectedState.NONE) {
      countEnabledChunks--;
    } else if (oldHunk.selected === (_constants || _load_constants()).SelectedState.SOME && newHunk.selected === (_constants || _load_constants()).SelectedState.ALL) {
      countEnabledChunks++;
      countPartialChunks--;
    } else if (oldHunk.selected === (_constants || _load_constants()).SelectedState.SOME && newHunk.selected === (_constants || _load_constants()).SelectedState.NONE) {
      countPartialChunks--;
    } else if (oldHunk.selected === (_constants || _load_constants()).SelectedState.NONE && newHunk.selected === (_constants || _load_constants()).SelectedState.ALL) {
      countEnabledChunks++;
    } else if (oldHunk.selected === (_constants || _load_constants()).SelectedState.NONE && newHunk.selected === (_constants || _load_constants()).SelectedState.SOME) {
      countPartialChunks++;
    }

    if (countEnabledChunks + countPartialChunks === 0) {
      selected = (_constants || _load_constants()).SelectedState.NONE;
    } else if (countEnabledChunks === chunks.size) {
      if (!(countPartialChunks === 0)) {
        throw new Error('Invariant violation: "countPartialChunks === 0"');
      }

      selected = (_constants || _load_constants()).SelectedState.ALL;
    } else {
      selected = (_constants || _load_constants()).SelectedState.SOME;
    }
  } else {
    // Toggling whole file
    let isEnabling;
    if (fileData.selected === (_constants || _load_constants()).SelectedState.NONE) {
      selected = (_constants || _load_constants()).SelectedState.ALL;
      isEnabling = true;
    } else {
      selected = (_constants || _load_constants()).SelectedState.NONE;
      isEnabling = false;
    }

    if (fileData.chunks != null) {
      // Set all hunks to all unselected
      chunks = new Map();
      fileData.chunks.forEach((hunkData, oldStart) => chunks.set(oldStart, selectWholeHunk(hunkData, isEnabling)));
      // TODO: update all children hunks to reflect change
      countEnabledChunks = isEnabling ? chunks.size : 0;
      countPartialChunks = 0;
      selected = isEnabling ? (_constants || _load_constants()).SelectedState.ALL : (_constants || _load_constants()).SelectedState.NONE;
    }
  }

  return Object.assign({}, fileData, {
    chunks,
    countEnabledChunks,
    countPartialChunks,
    selected
  });
}

function updateHunkData(hunkData, line) {
  let countEnabledChanges;
  let selected;
  const allChanges = hunkData.allChanges.slice();

  if (line != null) {
    // toggling a single line in a chunk
    allChanges[line] = !allChanges[line];
    if (allChanges[line]) {
      countEnabledChanges = hunkData.countEnabledChanges + 1;
    } else {
      countEnabledChanges = hunkData.countEnabledChanges - 1;
    }
    if (countEnabledChanges === allChanges.length) {
      selected = (_constants || _load_constants()).SelectedState.ALL;
    } else if (countEnabledChanges === 0) {
      selected = (_constants || _load_constants()).SelectedState.NONE;
    } else {
      selected = (_constants || _load_constants()).SelectedState.SOME;
    }
  } else {
    // toggling the entire chunk
    if (hunkData.selected === (_constants || _load_constants()).SelectedState.NONE) {
      selected = (_constants || _load_constants()).SelectedState.ALL;
      allChanges.fill(true);
      countEnabledChanges = allChanges.length;
    } else {
      selected = (_constants || _load_constants()).SelectedState.NONE;
      allChanges.fill(false);
      countEnabledChanges = 0;
    }
  }

  return Object.assign({}, hunkData, {
    allChanges,
    countEnabledChanges,
    selected
  });
}

function selectWholeHunk(hunkData, isEnabling) {
  if (isEnabling && hunkData.selected === (_constants || _load_constants()).SelectedState.ALL || !isEnabling && hunkData.selected === (_constants || _load_constants()).SelectedState.NONE) {
    return hunkData;
  }
  return Object.assign({}, hunkData, {
    countEnabledChanges: isEnabling ? hunkData.allChanges.length : 0,
    allChanges: hunkData.allChanges.slice().fill(isEnabling),
    selected: isEnabling ? (_constants || _load_constants()).SelectedState.ALL : (_constants || _load_constants()).SelectedState.NONE
  });
}