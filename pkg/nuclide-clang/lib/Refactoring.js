"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _libclang() {
  const data = require("./libclang");

  _libclang = function () {
    return data;
  };

  return data;
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
  const diagnostics = await (0, _libclang().getDiagnostics)(editor);
  return diagnostics != null && diagnostics.accurateFlags === true && diagnostics.diagnostics.length === 0;
}

class RefactoringHelpers {
  static refactorings(editor, range) {
    return (0, _nuclideAnalytics().trackTiming)('nuclide-clang:refactoringsAtPoint', () => RefactoringHelpers._refactorings(editor, range));
  }

  static async _refactorings(editor, range) {
    const path = editor.getPath();

    if (path == null || !(await checkDiagnostics(editor))) {
      return [];
    }

    const {
      row,
      column
    } = range.start;
    const declInfo = await (0, _libclang().getDeclarationInfo)(editor, row, column);

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
    return (0, _observable().compact)(_RxMin.Observable.fromPromise(RefactoringHelpers._refactor(request)));
  } // TODO(hansonw): Move this to the clang-rpc service.


  static async _refactor(request) {
    if (!(request.kind === 'rename')) {
      throw new Error("Invariant violation: \"request.kind === 'rename'\"");
    }

    const {
      editor,
      originalPoint,
      newName
    } = request;
    const path = editor.getPath();

    if (path == null || !(await checkDiagnostics(editor))) {
      return null;
    } // TODO(hansonw): We should disallow renames that conflict with an existing variable.


    const refs = await (0, _libclang().getLocalReferences)(editor, originalPoint.row, originalPoint.column);

    if (refs == null) {
      return null;
    } // TODO(hansonw): Apply clang-format.


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