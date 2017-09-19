'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('nuclide-commons-ui/AtomTextEditor');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class Console extends _react.Component {
  render() {
    return _react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
      gutterHidden: true,
      path: '.ansi',
      readOnly: true,
      textBuffer: this.props.textBuffer
    });
  }
}
exports.default = Console; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            * @format
                            */