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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var checkDiagnostics = _asyncToGenerator(function* (editor) {
  // Don't allow refactoring if there are any warnings or errors.
  var diagnostics = yield (0, (_libclang2 || _libclang()).getDiagnostics)(editor);
  return diagnostics != null && diagnostics.accurateFlags === true && diagnostics.diagnostics.length === 0;
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _libclang2;

function _libclang() {
  return _libclang2 = require('./libclang');
}

var SUPPORTED_CURSORS = new Set(['VAR_DECL', 'PARM_DECL']);

var RefactoringHelpers = (function () {
  function RefactoringHelpers() {
    _classCallCheck(this, RefactoringHelpers);
  }

  _createDecoratedClass(RefactoringHelpers, null, [{
    key: 'refactoringsAtPoint',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-clang:refactoringsAtPoint')],
    value: _asyncToGenerator(function* (editor, point) {
      var path = editor.getPath();
      if (path == null || !(yield checkDiagnostics(editor))) {
        return [];
      }

      var row = point.row;
      var column = point.column;

      var declInfo = yield (0, (_libclang2 || _libclang()).getDeclarationInfo)(editor, row, column);
      if (declInfo == null || !SUPPORTED_CURSORS.has(declInfo[0].type)) {
        return [];
      }

      return [{
        kind: 'rename',
        symbolAtPoint: {
          name: declInfo[0].name,
          range: declInfo[0].extent
        }
      }];
    })

    // TODO(hansonw): Move this to the clang-rpc service.
  }, {
    key: 'refactor',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-clang:refactor')],
    value: _asyncToGenerator(function* (request) {
      (0, (_assert2 || _assert()).default)(request.kind === 'rename');
      var editor = request.editor;
      var point = request.point;
      var newName = request.newName;

      var path = editor.getPath();
      if (path == null || !(yield checkDiagnostics(editor))) {
        return null;
      }

      // TODO(hansonw): We should disallow renames that conflict with an existing variable.
      var refs = yield (0, (_libclang2 || _libclang()).getLocalReferences)(editor, point.row, point.column);
      if (refs == null) {
        return null;
      }

      // TODO(hansonw): Apply clang-format.
      var edits = refs.references.map(function (ref) {
        return {
          oldRange: ref,
          oldText: refs.cursor_name,
          newText: newName
        };
      });

      return {
        edits: new Map([[path, edits]])
      };
    })
  }]);

  return RefactoringHelpers;
})();

exports.default = RefactoringHelpers;
module.exports = exports.default;