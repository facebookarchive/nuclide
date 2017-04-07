'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeTypeHintComponent = makeTypeHintComponent;

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Complex types can end up being super long. Truncate them.
const MAX_LENGTH = 100; /**
                         * Copyright (c) 2015-present, Facebook, Inc.
                         * All rights reserved.
                         *
                         * This source code is licensed under the license found in the LICENSE file in
                         * the root directory of this source tree.
                         *
                         * 
                         */

function makeTypeHintComponent(content, grammar) {
  return () => _react.default.createElement(TypeHintComponent, { content: content, grammar: grammar });
}

class TypeHintComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false
    };
  }

  render() {
    const value = this.props.content;
    const shouldTruncate = value.length > MAX_LENGTH && !this.state.isExpanded;
    const buffer = new _atom.TextBuffer(shouldTruncate ? value.substr(0, MAX_LENGTH) + '...' : value);
    const { grammar } = this.props;
    return _react.default.createElement(
      'div',
      {
        className: 'nuclide-type-hint-text-editor-container',
        onClick: e => {
          this.setState({ isExpanded: !this.state.isExpanded });
          e.stopPropagation();
        } },
      _react.default.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        className: 'nuclide-type-hint-text-editor',
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