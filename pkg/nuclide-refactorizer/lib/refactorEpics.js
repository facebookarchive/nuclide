'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getRefactorings = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (providers) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-refactorizer:get-refactorings');
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null || editor.getPath() == null) {
      return (_refactorActions || _load_refactorActions()).error('get-refactorings', Error('Must be run from a saved file.'));
    }
    const cursor = editor.getLastCursor();
    const provider = providers.getProviderForEditor(editor);
    if (provider == null) {
      return (_refactorActions || _load_refactorActions()).error('get-refactorings', Error('No providers found.'));
    }
    try {
      const cursorPosition = cursor.getBufferPosition();
      const availableRefactorings = yield provider.refactoringsAtPoint(editor, cursorPosition);
      return (_refactorActions || _load_refactorActions()).gotRefactorings(editor, cursorPosition, provider, availableRefactorings);
    } catch (e) {
      return (_refactorActions || _load_refactorActions()).error('get-refactorings', e);
    }
  });

  return function getRefactorings(_x) {
    return _ref.apply(this, arguments);
  };
})();

let executeRefactoring = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (action) {
    const { refactoring, provider } = action.payload;
    let response;
    try {
      response = yield provider.refactor(refactoring);
    } catch (e) {
      return (_refactorActions || _load_refactorActions()).error('execute', e);
    }
    if (response == null) {
      // TODO use an error action here
      return (_refactorActions || _load_refactorActions()).close();
    }
    const editor = atom.workspace.getActiveTextEditor();
    // TODO handle it if the editor has gone away

    if (!(editor != null)) {
      throw new Error('Invariant violation: "editor != null"');
    }

    const path = editor.getPath();
    // TODO handle editors with no path

    if (!(path != null)) {
      throw new Error('Invariant violation: "path != null"');
    }
    // TODO also apply edits to other files


    const fileEdits = response.edits.get(path);

    if (!(fileEdits != null)) {
      throw new Error('Invariant violation: "fileEdits != null"');
    }
    // TODO check the return value to see if the edits were applied correctly. if not, display an
    // appropriate message.


    (0, (_nuclideTextedit || _load_nuclideTextedit()).default)(path, ...fileEdits);
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-refactorizer:success');
    return (_refactorActions || _load_refactorActions()).close();
  });

  return function executeRefactoring(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.getEpics = getEpics;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideTextedit;

function _load_nuclideTextedit() {
  return _nuclideTextedit = _interopRequireDefault(require('../../nuclide-textedit'));
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('./refactorActions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEpics(providers) {
  return [function getRefactoringsEpic(actions) {
    return actions.ofType('open').switchMap(() => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(getRefactorings(providers)).takeUntil(actions);
    });
  }, function executeRefactoringEpic(actions) {
    return actions.ofType('execute').switchMap(action => {
      // Flow doesn't understand the implications of ofType :(
      if (!(action.type === 'execute')) {
        throw new Error('Invariant violation: "action.type === \'execute\'"');
      }

      return _rxjsBundlesRxMinJs.Observable.fromPromise(executeRefactoring(action)).takeUntil(actions);
    });
  }, function handleErrors(actions) {
    return actions.ofType('error').map(action => {
      if (!(action.type === 'error')) {
        throw new Error('Invariant violation: "action.type === \'error\'"');
      }

      const { source, error } = action.payload;
      const sourceName = source === 'got-refactorings' ? 'getting refactors' : 'executing refactor';
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Error ${sourceName}:`, error);
      atom.notifications.addError(`Error ${sourceName}`, { detail: error.stack, dismissable: true });
      return (_refactorActions || _load_refactorActions()).close();
    });
  }];
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */