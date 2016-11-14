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
exports.default = refactorReducers;

function refactorReducers(state_, action) {
  let state = state_;
  if (state == null) {
    state = { type: 'closed' };
  }

  if (action.error) {
    // We handle errors in epics, display an appropriate message, and then send an ordinary action
    // to update the state appropriately.
    return state;
  }

  switch (action.type) {
    case 'open':
      return open(state, action);
    case 'got-refactorings':
      return gotRefactorings(state, action);
    case 'close':
      return close(state);
    case 'picked-refactor':
      return pickedRefactor(state, action);
    case 'execute':
      return executeRefactor(state, action);
    default:
      return state;
  }
}

function open(state, action) {
  if (!(state.type === 'closed')) {
    throw new Error('Invariant violation: "state.type === \'closed\'"');
  }

  return {
    type: 'open',
    ui: action.ui,
    phase: {
      type: 'get-refactorings'
    }
  };
}

function gotRefactorings(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  if (!(state.phase.type === 'get-refactorings')) {
    throw new Error('Invariant violation: "state.phase.type === \'get-refactorings\'"');
  }

  var _action$payload = action.payload;
  const editor = _action$payload.editor,
        originalPoint = _action$payload.originalPoint;


  return {
    type: 'open',
    ui: state.ui,
    phase: {
      type: 'pick',
      provider: action.payload.provider,
      editor: editor,
      originalPoint: originalPoint,
      availableRefactorings: action.payload.availableRefactorings
    }
  };
}

function close(state) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  return {
    type: 'closed'
  };
}

function pickedRefactor(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  if (!(state.phase.type === 'pick')) {
    throw new Error('Invariant violation: "state.phase.type === \'pick\'"');
  }

  const refactoring = action.payload.refactoring;
  var _state$phase = state.phase;
  const editor = _state$phase.editor,
        originalPoint = _state$phase.originalPoint;

  return {
    type: 'open',
    ui: state.ui,
    phase: {
      type: 'rename',
      provider: state.phase.provider,
      originalPoint: originalPoint,
      symbolAtPoint: refactoring.symbolAtPoint,
      editor: editor
    }
  };
}

function executeRefactor(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  return {
    type: 'open',
    ui: state.ui,
    phase: {
      type: 'execute'
    }
  };
}
module.exports = exports['default'];