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
exports.open = open;
exports.gotRefactorings = gotRefactorings;
exports.gotRefactoringsError = gotRefactoringsError;
exports.pickedRefactor = pickedRefactor;
exports.execute = execute;
exports.close = close;

function open(ui) {
  return {
    type: 'open',
    ui: ui
  };
}

function gotRefactorings(editor, originalPoint, provider, availableRefactorings) {
  return {
    type: 'got-refactorings',
    payload: {
      editor: editor,
      originalPoint: originalPoint,
      provider: provider,
      availableRefactorings: availableRefactorings
    }
  };
}

function gotRefactoringsError() {
  return {
    type: 'got-refactorings',
    error: true
  };
}

function pickedRefactor(refactoring) {
  return {
    type: 'picked-refactor',
    payload: {
      refactoring: refactoring
    }
  };
}

function execute(provider, refactoring) {
  return {
    type: 'execute',
    payload: {
      provider: provider,
      refactoring: refactoring
    }
  };
}

function close() {
  return {
    type: 'close'
  };
}