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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.app = app;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _constants2;

function _constants() {
  return _constants2 = require('../constants');
}

function app(state, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).SET_DIFF_OPTION:
      {
        var repository = action.payload.repository;

        var oldRepositoryState = state.repositoriesStates.get(repository);
        (0, (_assert2 || _assert()).default)(oldRepositoryState != null);
        return _extends({}, state, {
          repositoriesStates: new Map(state.repositoriesStates).set(repository, reduceRepositoryAction(oldRepositoryState, action))
        });
      }
    case (_ActionTypes2 || _ActionTypes()).ADD_REPOSITORY:
      {
        var repository = action.payload.repository;

        return _extends({}, state, {
          repositoriesStates: new Map(state.repositoriesStates).set(repository, getEmptyRepositoryState())
        });
      }
    default:
      {
        return state;
      }
  }
}

function getEmptyRepositoryState() {
  return {
    diffOption: (_constants2 || _constants()).DiffOption.COMPARE_COMMIT,
    revisionStatuses: new Map(),
    dirtyFileChanges: new Map(),
    headToForkBaseRevisions: [],
    headRevision: null,
    revisions: [],
    selectedCompareId: null,
    selectedFileChanges: new Map()
  };
}

function reduceRepositoryAction(repositoryState, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).SET_DIFF_OPTION:
      {
        return _extends({}, repositoryState, {
          diffOption: action.payload.diffOption
        });
      }
    default:
      {
        throw new Error('Invalid Repository Action!');
      }
  }
}