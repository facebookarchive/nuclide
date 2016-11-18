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
exports.DiagnosticsTraceItem = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _reactForAtom = require('react-for-atom');

var _DiagnosticsMessageText;

function _load_DiagnosticsMessageText() {
  return _DiagnosticsMessageText = require('./DiagnosticsMessageText');
}

// TODO move LESS styles to nuclide-ui
const DiagnosticsTraceItem = exports.DiagnosticsTraceItem = props => {
  const trace = props.trace,
        goToLocation = props.goToLocation;

  let locSpan = null;
  // Local variable so that the type refinement holds in the onClick handler.
  const path = trace.filePath;
  if (path) {
    var _atom$project$relativ = atom.project.relativizePath(path),
        _atom$project$relativ2 = _slicedToArray(_atom$project$relativ, 2);

    const relativePath = _atom$project$relativ2[1];

    let locString = relativePath;
    if (trace.range) {
      locString += `:${ trace.range.start.row + 1 }`;
    }
    const onClick = event => {
      event.stopPropagation();
      goToLocation(path, Math.max(trace.range ? trace.range.start.row : 0, 0));
    };
    locSpan = _reactForAtom.React.createElement(
      'span',
      null,
      ': ',
      _reactForAtom.React.createElement(
        'a',
        { href: '#', onClick: onClick },
        locString
      )
    );
  }
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement((_DiagnosticsMessageText || _load_DiagnosticsMessageText()).DiagnosticsMessageText, { message: trace }),
    locSpan
  );
};