"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.open = open;
exports.gotRefactorings = gotRefactorings;
exports.error = error;
exports.backFromDiffPreview = backFromDiffPreview;
exports.pickedRefactor = pickedRefactor;
exports.execute = execute;
exports.confirm = confirm;
exports.loadDiffPreview = loadDiffPreview;
exports.displayDiffPreview = displayDiffPreview;
exports.displayRename = displayRename;
exports.apply = apply;
exports.progress = progress;
exports.close = close;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
function open(ui) {
  return {
    type: 'open',
    ui
  };
}

function gotRefactorings(editor, originalRange, provider, availableRefactorings) {
  return {
    type: 'got-refactorings',
    payload: {
      editor,
      originalRange,
      provider,
      availableRefactorings
    }
  };
}

function error(source, err) {
  return {
    type: 'error',
    payload: {
      source,
      error: err
    }
  };
}

function backFromDiffPreview(phase) {
  return {
    type: 'back-from-diff-preview',
    payload: {
      phase
    }
  };
}

function pickedRefactor(refactoring) {
  return {
    type: 'picked-refactor',
    payload: {
      refactoring
    }
  };
}

function execute(provider, refactoring) {
  return {
    type: 'execute',
    payload: {
      provider,
      refactoring
    }
  };
}

function confirm(response) {
  return {
    type: 'confirm',
    payload: {
      response
    }
  };
}

function loadDiffPreview(previousPhase, uri, response) {
  return {
    type: 'load-diff-preview',
    payload: {
      previousPhase,
      uri,
      response
    }
  };
}

function displayDiffPreview(diffs) {
  return {
    type: 'display-diff-preview',
    payload: {
      diffs
    }
  };
}

function displayRename(editor, provider, selectedText, mountPosition, symbolPosition) {
  return {
    type: 'display-rename',
    payload: {
      editor,
      provider,
      selectedText,
      mountPosition,
      symbolPosition
    }
  };
}

function apply(response) {
  return {
    type: 'apply',
    payload: {
      response
    }
  };
}

function progress(message, value, max) {
  return {
    type: 'progress',
    payload: {
      message,
      value,
      max
    }
  };
}

function close() {
  return {
    type: 'close'
  };
}