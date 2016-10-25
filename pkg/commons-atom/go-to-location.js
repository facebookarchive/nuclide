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
exports.goToLocation = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

// Opens the given file at the line/column.
// By default will center the opened text editor.
let goToLocation = exports.goToLocation = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (file, line, column) {
    let center = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    const editor = yield atom.workspace.open(file, {
      initialLine: line,
      initialColumn: column,
      searchAllPanes: true
    });

    if (center) {
      editor.scrollToBufferPosition([line, column], { center: true });
    }
    return editor;
  });

  return function goToLocation(_x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

exports.goToLocationInEditor = goToLocationInEditor;
exports.observeNavigatingEditors = observeNavigatingEditors;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const goToLocationSubject = new _rxjsBundlesRxMinJs.Subject();

// Scrolls to the given line/column at the given editor
// broadcasts the editor instance on an observable (subject) available
// through the getGoToLocation
function goToLocationInEditor(editor, line, column) {
  let center = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  editor.setCursorBufferPosition([line, column]);
  if (center) {
    editor.scrollToBufferPosition([line, column], { center: true });
  }

  goToLocationSubject.next(editor);
}

function observeNavigatingEditors() {
  return goToLocationSubject;
}