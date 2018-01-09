'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('nuclide-commons-ui/AtomTextEditor');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Complex types can end up being super long. Truncate them.
const MAX_LENGTH = 100; /**
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

class MarkedStringSnippet extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      isExpanded: false
    }, _temp;
  }

  render() {
    const { grammar, value } = this.props;
    const shouldTruncate = value.length > MAX_LENGTH && !this.state.isExpanded;
    const buffer = new _atom.TextBuffer(shouldTruncate ? value.substr(0, MAX_LENGTH) + '...' : value);
    return _react.createElement(
      'div',
      {
        className: 'datatip-marked-text-editor-container',
        onClick: e => {
          this.setState({ isExpanded: !this.state.isExpanded });
          e.stopPropagation();
        } },
      _react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        className: 'datatip-marked-text-editor',
        gutterHidden: true,
        readOnly: true,
        syncTextContents: false,
        autoGrow: true,
        grammar: grammar,
        textBuffer: buffer
      })
    );
  }
}
exports.default = MarkedStringSnippet;