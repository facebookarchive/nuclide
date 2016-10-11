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

exports.getEpics = getEpics;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _nuclideTextedit;

function _load_nuclideTextedit() {
  return _nuclideTextedit = _interopRequireDefault(require('../../nuclide-textedit'));
}

function getEpics(providers) {
  return [function getRefactorings(actions) {
    // TODO cancel if another action comes along
    return actions.ofType('open').switchMap(_asyncToGenerator(function* () {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return {
          type: 'got-refactorings',
          error: true
        };
      }
      var cursor = editor.getLastCursor();
      var provider = providers.getProviderForEditor(editor);
      if (provider == null) {
        return {
          type: 'got-refactorings',
          error: true
        };
      }
      var availableRefactorings = yield provider.refactoringsAtPoint(editor, cursor.getBufferPosition());
      return {
        type: 'got-refactorings',
        payload: {
          editor: editor,
          provider: provider,
          availableRefactorings: availableRefactorings
        }
      };
    }));
  }, function executeRefactoring(actions) {
    return actions.ofType('execute').switchMap(_asyncToGenerator(function* (action) {
      // Flow doesn't understand the implications of ofType :(
      (0, (_assert || _load_assert()).default)(action.type === 'execute');
      var _action$payload = action.payload;
      var refactoring = _action$payload.refactoring;
      var provider = _action$payload.provider;

      var response = yield provider.refactor(refactoring);
      (0, (_assert || _load_assert()).default)(response != null);
      var editor = atom.workspace.getActiveTextEditor();
      (0, (_assert || _load_assert()).default)(editor != null);
      var path = editor.getPath();
      (0, (_assert || _load_assert()).default)(path != null);
      // TODO also apply edits to other files
      var fileEdits = response.edits.get(path);
      (0, (_assert || _load_assert()).default)(fileEdits != null);
      (0, (_nuclideTextedit || _load_nuclideTextedit()).default).apply(undefined, [path].concat(_toConsumableArray(fileEdits)));
      return {
        type: 'close'
      };
    }));
  }, function handleErrors(actions) {
    return actions
    // This is weird but Flow won't accept `action.error` or even `Boolean(action.error)`
    .filter(function (action) {
      return action.error ? true : false;
    })
    // TODO provide some feedback to the user that an error has occurred
    .map(function (action) {
      (0, (_assert || _load_assert()).default)(action.error);
      return {
        type: 'close'
      };
    });
  }];
}