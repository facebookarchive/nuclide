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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _DiagnosticsMessageText2;

function _DiagnosticsMessageText() {
  return _DiagnosticsMessageText2 = require('./DiagnosticsMessageText');
}

// TODO move LESS styles to nuclide-ui
var DiagnosticsTraceItem = function DiagnosticsTraceItem(props) {
  var trace = props.trace;
  var goToLocation = props.goToLocation;

  var locSpan = null;
  // Local variable so that the type refinement holds in the onClick handler.
  var path = trace.filePath;
  if (path) {
    var _atom$project$relativizePath = atom.project.relativizePath(path);

    var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

    var relativePath = _atom$project$relativizePath2[1];

    var locString = relativePath;
    if (trace.range) {
      locString += ':' + (trace.range.start.row + 1);
    }
    var onClick = function onClick() {
      goToLocation(path, Math.max(trace.range ? trace.range.start.row : 0, 0));
    };
    locSpan = (_reactForAtom2 || _reactForAtom()).React.createElement(
      'span',
      null,
      ': ',
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'a',
        { href: '#', onClick: onClick },
        locString
      )
    );
  }
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement((_DiagnosticsMessageText2 || _DiagnosticsMessageText()).DiagnosticsMessageText, { message: trace }),
    locSpan
  );
};
exports.DiagnosticsTraceItem = DiagnosticsTraceItem;