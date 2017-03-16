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
// TODO(hansonw): we could parse these into hint trees
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const MAX_LENGTH = 100;

function makeTypeHintComponent(content, grammar) {
  return () => _react.default.createElement(TypeHintComponent, { content: content, grammar: grammar });
}

class TypeHintComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = {
      expandedNodes: new Set(),
      isPrimitiveExpanded: false
    };
  }

  renderPrimitive(value) {
    const shouldTruncate = value.length > MAX_LENGTH && !this.state.isPrimitiveExpanded;
    const buffer = new _atom.TextBuffer(shouldTruncate ? value.substr(0, MAX_LENGTH) + '...' : value);
    const { grammar } = this.props;
    return _react.default.createElement(
      'div',
      {
        className: 'nuclide-type-hint-text-editor-container',
        onClick: e => {
          this.setState({ isPrimitiveExpanded: !this.state.isPrimitiveExpanded });
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

  handleChevronClick(tree, event) {
    const { expandedNodes } = this.state;
    if (expandedNodes.has(tree)) {
      expandedNodes.delete(tree);
    } else {
      expandedNodes.add(tree);
    }
    // Force update.
    this.forceUpdate();
  }

  renderHierarchical(tree) {
    if (tree.children == null) {
      return this.renderPrimitive(tree.value);
    }
    const children = tree.children.map(child => this.renderHierarchical(child));
    const isExpanded = this.state.expandedNodes.has(tree);
    const childrenList = isExpanded ? _react.default.createElement(
      'ul',
      { className: 'list-tree' },
      children
    ) : null;
    const className = 'icon nuclide-type-hint-expandable-chevron ' + `icon-chevron-${isExpanded ? 'down' : 'right'}`;
    return _react.default.createElement(
      'li',
      { className: 'list-nested-item' },
      _react.default.createElement(
        'div',
        { className: 'list-item' },
        _react.default.createElement(
          'span',
          null,
          _react.default.createElement('span', {
            className: className,
            onClick: this.handleChevronClick.bind(this, tree)
          }),
          tree.value
        )
      ),
      childrenList
    );
  }

  render() {
    const { content } = this.props;
    if (typeof content === 'string') {
      return this.renderPrimitive(content);
    }
    return _react.default.createElement(
      'ul',
      { className: 'list-tree' },
      this.renderHierarchical(content)
    );
  }
}