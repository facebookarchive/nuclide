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

var getRefactorings = _asyncToGenerator(function* (providers) {
  var editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    return (_refactorActions || _load_refactorActions()).gotRefactoringsError();
  }
  var cursor = editor.getLastCursor();
  var provider = providers.getProviderForEditor(editor);
  if (provider == null) {
    return (_refactorActions || _load_refactorActions()).gotRefactoringsError();
  }
  try {
    var availableRefactorings = yield provider.refactoringsAtPoint(editor, cursor.getBufferPosition());
    return (_refactorActions || _load_refactorActions()).gotRefactorings(editor, provider, availableRefactorings);
  } catch (e) {
    return (_refactorActions || _load_refactorActions()).gotRefactoringsError();
  }
});

var executeRefactoring = _asyncToGenerator(function* (action) {
  var _action$payload = action.payload;
  var refactoring = _action$payload.refactoring;
  var provider = _action$payload.provider;

  var response = undefined;
  try {
    response = yield provider.refactor(refactoring);
  } catch (e) {
    // TODO use an error action here
    return (_refactorActions || _load_refactorActions()).close();
  }
  // TODO do something sane if the provider returns null
  (0, (_assert || _load_assert()).default)(response != null);
  var editor = atom.workspace.getActiveTextEditor();
  // TODO handle it if the editor has gone away
  (0, (_assert || _load_assert()).default)(editor != null);
  var path = editor.getPath();
  // TODO handle editors with no path
  (0, (_assert || _load_assert()).default)(path != null);
  // TODO also apply edits to other files
  var fileEdits = response.edits.get(path);
  (0, (_assert || _load_assert()).default)(fileEdits != null);
  (0, (_nuclideTextedit || _load_nuclideTextedit()).default).apply(undefined, [path].concat(_toConsumableArray(fileEdits)));
  return (_refactorActions || _load_refactorActions()).close();
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

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

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('./refactorActions'));
}

function getEpics(providers) {
  return [function getRefactoringsEpic(actions) {
    return actions.ofType('open').switchMap(function () {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(getRefactorings(providers)).takeUntil(actions);
    });
  }, function executeRefactoringEpic(actions) {
    return actions.ofType('execute').switchMap(function (action) {
      // Flow doesn't understand the implications of ofType :(
      (0, (_assert || _load_assert()).default)(action.type === 'execute');
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(executeRefactoring(action)).takeUntil(actions);
    });
  }, function handleErrors(actions) {
    return actions
    // This is weird but Flow won't accept `action.error` or even `Boolean(action.error)`
    .filter(function (action) {
      return action.error ? true : false;
    })
    // TODO provide some feedback to the user that an error has occurred
    .map(function (action) {
      (0, (_assert || _load_assert()).default)(action.error);
      return (_refactorActions || _load_refactorActions()).close();
    });
  }];
}