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
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dec, _dec2, _desc, _value, _class;

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

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _libclang;

function _load_libclang() {
  return _libclang = require('./libclang');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

const SUPPORTED_CURSORS = new Set(['VAR_DECL', 'PARM_DECL']);

let RefactoringHelpers = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang:refactoringsAtPoint'), _dec2 = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang:refactor'), (_class = class RefactoringHelpers {
  static refactoringsAtPoint(editor, point) {
    return (0, _asyncToGenerator.default)(function* () {
      const path = editor.getPath();
      if (path == null || !(yield checkDiagnostics(editor))) {
        return [];
      }

      const row = point.row,
            column = point.column;

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

  // TODO(hansonw): Move this to the clang-rpc service.

  static refactor(request) {
    return (0, _asyncToGenerator.default)(function* () {
      if (!(request.kind === 'rename')) {
        throw new Error('Invariant violation: "request.kind === \'rename\'"');
      }

      const editor = request.editor,
            originalPoint = request.originalPoint,
            newName = request.newName;

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
        edits: new Map([[path, edits]])
      };
    })();
  }

}, (_applyDecoratedDescriptor(_class, 'refactoringsAtPoint', [_dec], Object.getOwnPropertyDescriptor(_class, 'refactoringsAtPoint'), _class), _applyDecoratedDescriptor(_class, 'refactor', [_dec2], Object.getOwnPropertyDescriptor(_class, 'refactor'), _class)), _class));
exports.default = RefactoringHelpers;
module.exports = exports['default'];