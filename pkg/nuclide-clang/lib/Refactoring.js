'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let checkDiagnostics = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (editor) {
    // Don't allow refactoring if there are any warnings or errors.
    const diagnostics = yield (0, (_libclang || _load_libclang()).getDiagnostics)(editor);
    return diagnostics != null && diagnostics.accurateFlags === true && diagnostics.diagnostics.length === 0;
  });

  return function checkDiagnostics(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _libclang;

function _load_libclang() {
  return _libclang = require('./libclang');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const SUPPORTED_CURSORS = new Set(['VAR_DECL', 'PARM_DECL']);

class RefactoringHelpers {
  static refactoringsAtPoint(editor, point) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang:refactoringsAtPoint', () => RefactoringHelpers._refactoringsAtPoint(editor, point));
  }

  static _refactoringsAtPoint(editor, point) {
    return (0, _asyncToGenerator.default)(function* () {
      const path = editor.getPath();
      if (path == null || !(yield checkDiagnostics(editor))) {
        return [];
      }

      const { row, column } = point;
      const declInfo = yield (0, (_libclang || _load_libclang()).getDeclarationInfo)(editor, row, column);
      if (declInfo == null || !SUPPORTED_CURSORS.has(declInfo[0].type)) {
        return [];
      }

      return [{
        kind: 'rename',
        symbolAtPoint: {
          text: declInfo[0].name,
          range: declInfo[0].extent
        }
      }];
    })();
  }

  static refactor(request) {
    return (0, (_observable || _load_observable()).compact)(_rxjsBundlesRxMinJs.Observable.fromPromise(RefactoringHelpers._refactor(request)));
  }

  // TODO(hansonw): Move this to the clang-rpc service.
  static _refactor(request) {
    return (0, _asyncToGenerator.default)(function* () {
      if (!(request.kind === 'rename')) {
        throw new Error('Invariant violation: "request.kind === \'rename\'"');
      }

      const { editor, originalPoint, newName } = request;
      const path = editor.getPath();
      if (path == null || !(yield checkDiagnostics(editor))) {
        return null;
      }

      // TODO(hansonw): We should disallow renames that conflict with an existing variable.
      const refs = yield (0, (_libclang || _load_libclang()).getLocalReferences)(editor, originalPoint.row, originalPoint.column);
      if (refs == null) {
        return null;
      }

      // TODO(hansonw): Apply clang-format.
      const edits = refs.references.map(function (ref) {
        return {
          oldRange: ref,
          oldText: refs.cursor_name,
          newText: newName
        };
      });

      return {
        type: 'edit',
        edits: new Map([[path, edits]])
      };
    })();
  }
}
exports.default = RefactoringHelpers;