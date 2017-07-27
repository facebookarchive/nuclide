'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsTraceItem = undefined;

var _react = _interopRequireDefault(require('react'));

var _DiagnosticsMessageText;

function _load_DiagnosticsMessageText() {
  return _DiagnosticsMessageText = require('./DiagnosticsMessageText');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO move LESS styles to nuclide-ui
const DiagnosticsTraceItem = exports.DiagnosticsTraceItem = props => {
  const { trace, goToLocation } = props;
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
    locSpan = _react.default.createElement(
      'span',
      null,
      ':',
      ' ',
      _react.default.createElement(
        'a',
        { href: '#', onClick: onClick },
        locString
      )
    );
  }
  return _react.default.createElement(
    'div',
    null,
    _react.default.createElement((_DiagnosticsMessageText || _load_DiagnosticsMessageText()).DiagnosticsMessageText, { message: trace }),
    locSpan
  );
}; /**
    * Copyright (c) 2017-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the BSD-style license found in the
    * LICENSE file in the root directory of this source tree. An additional grant
    * of patent rights can be found in the PATENTS file in the same directory.
    *
    * 
    * @format
    */