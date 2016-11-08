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
exports.makeTypeHintComponent = makeTypeHintComponent;

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

function makeTypeHintComponent(content, grammar) {
  return () => _reactForAtom.React.createElement(TypeHintComponent, { content: content, grammar: grammar });
}

let TypeHintComponent = class TypeHintComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      expandedNodes: new Set()
    };
  }

  renderPrimitive(value) {
    const buffer = new _atom.TextBuffer(value);
    const grammar = this.props.grammar;

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-type-hint-text-editor-container' },
      _reactForAtom.React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
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
    const expandedNodes = this.state.expandedNodes;

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
    const childrenList = isExpanded ? _reactForAtom.React.createElement(
      'ul',
      { className: 'list-tree' },
      children
    ) : null;
    const className = 'icon nuclide-type-hint-expandable-chevron ' + `icon-chevron-${ isExpanded ? 'down' : 'right' }`;
    return _reactForAtom.React.createElement(
      'li',
      { className: 'list-nested-item' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'list-item' },
        _reactForAtom.React.createElement(
          'span',
          null,
          _reactForAtom.React.createElement('span', {
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
    const content = this.props.content;

    if (typeof content === 'string') {
      return this.renderPrimitive(content);
    }
    return _reactForAtom.React.createElement(
      'ul',
      { className: 'list-tree' },
      this.renderHierarchical(content)
    );
  }
};