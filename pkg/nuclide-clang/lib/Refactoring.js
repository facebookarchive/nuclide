'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

const SUPPORTED_CURSORS = new Set(['VAR_DECL', 'PARM_DECL']);

async function checkDiagnostics(editor) {
  // Don't allow refactoring if there are any warnings or errors.
  const diagnostics = await (0, (_libclang || _load_libclang()).getDiagnostics)(editor);
  return diagnostics != null && diagnostics.accurateFlags === true && diagnostics.diagnostics.length === 0;
}

class RefactoringHelpers {
  static refactorings(editor, range) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang:refactoringsAtPoint', () => RefactoringHelpers._refactorings(editor, range));
  }

  static async _refactorings(editor, range) {
    const path = editor.getPath();
    if (path == null || !(await checkDiagnostics(editor))) {
      return [];
    }

    const { row, column } = range.start;
    const declInfo = await (0, (_libclang || _load_libclang()).getDeclarationInfo)(editor, row, column);
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
  }

  static refactor(request) {
    return (0, (_observable || _load_observable()).compact)(_rxjsBundlesRxMinJs.Observable.fromPromise(RefactoringHelpers._refactor(request)));
  }

  // TODO(hansonw): Move this to the clang-rpc service.
  static async _refactor(request) {
    if (!(request.kind === 'rename')) {
      throw new Error('Invariant violation: "request.kind === \'rename\'"');
    }

    const { editor, originalPoint, newName } = request;
    const path = editor.getPath();
    if (path == null || !(await checkDiagnostics(editor))) {
      return null;
    }

    // TODO(hansonw): We should disallow renames that conflict with an existing variable.
    const refs = await (0, (_libclang || _load_libclang()).getLocalReferences)(editor, originalPoint.row, originalPoint.column);
    if (refs == null) {
      return null;
    }

    // TODO(hansonw): Apply clang-format.
    const edits = refs.references.map(ref => ({
      oldRange: ref,
      oldText: refs.cursor_name,
      newText: newName
    }));

    return {
      type: 'edit',
      edits: new Map([[path, edits]])
    };
  }
}
exports.default = RefactoringHelpers;