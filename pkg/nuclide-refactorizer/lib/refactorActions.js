'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.open = open;
exports.gotRefactorings = gotRefactorings;
exports.error = error;
exports.pickedRefactor = pickedRefactor;
exports.execute = execute;
exports.close = close;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function open(ui) {
  return {
    type: 'open',
    ui
  };
}

function gotRefactorings(editor, originalPoint, provider, availableRefactorings) {
  return {
    type: 'got-refactorings',
    payload: {
      editor,
      originalPoint,
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

function close() {
  return {
    type: 'close'
  };
}