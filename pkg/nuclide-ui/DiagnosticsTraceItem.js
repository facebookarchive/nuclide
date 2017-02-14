'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsTraceItem = undefined;

var _reactForAtom = require('react-for-atom');

var _DiagnosticsMessageText;

function _load_DiagnosticsMessageText() {
  return _DiagnosticsMessageText = require('./DiagnosticsMessageText');
}

// TODO move LESS styles to nuclide-ui
const DiagnosticsTraceItem = exports.DiagnosticsTraceItem = props => {
  const {
    trace,
    goToLocation
  } = props;
  let locSpan = null;
  // Local variable so that the type refinement holds in the onClick handler.
  const path = trace.filePath;
  if (path) {
    const [, relativePath] = atom.project.relativizePath(path);
    let locString = relativePath;
    if (trace.range) {
      locString += `:${trace.range.start.row + 1}`;
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
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    */