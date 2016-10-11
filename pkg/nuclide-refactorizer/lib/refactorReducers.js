Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.default = refactorReducers;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

function refactorReducers(state_, action) {
  var state = state_;
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
  (0, (_assert || _load_assert()).default)(state.type === 'closed');

  return {
    type: 'open',
    phase: {
      type: 'get-refactorings'
    }
  };
}

function gotRefactorings(state, action) {
  (0, (_assert || _load_assert()).default)(state.type === 'open');
  (0, (_assert || _load_assert()).default)(state.phase.type === 'get-refactorings');

  var editor = action.payload.editor;

  return {
    type: 'open',
    phase: {
      type: 'pick',
      provider: action.payload.provider,
      editor: editor,
      availableRefactorings: action.payload.availableRefactorings
    }
  };
}

function close(state) {
  (0, (_assert || _load_assert()).default)(state.type === 'open');
  return {
    type: 'closed'
  };
}

function pickedRefactor(state, action) {
  (0, (_assert || _load_assert()).default)(state.type === 'open');
  (0, (_assert || _load_assert()).default)(state.phase.type === 'pick');

  var refactoring = action.payload.refactoring;
  var editor = state.phase.editor;
  return {
    type: 'open',
    phase: {
      type: 'rename',
      provider: state.phase.provider,
      symbolAtPoint: refactoring.symbolAtPoint,
      editor: editor
    }
  };
}

function executeRefactor(state, action) {
  (0, (_assert || _load_assert()).default)(state.type === 'open');
  return {
    type: 'open',
    phase: {
      type: 'execute'
    }
  };
}
module.exports = exports.default;