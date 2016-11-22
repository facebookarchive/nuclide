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
exports.TreeNodeComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const INDENT_IN_PX = 10;
const INDENT_PER_LEVEL_IN_PX = 15;
const DOWN_ARROW = '\uF0A3';
const RIGHT_ARROW = '\uF078';
const SPINNER = '\uF087';

/**
 * Represents one entry in a TreeComponent.
 */
let TreeNodeComponent = exports.TreeNodeComponent = class TreeNodeComponent extends _reactForAtom.React.PureComponent {

  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
  }

  render() {
    const rowClassNameObj = {
      // Support for selectors in the "file-icons" package.
      // @see {@link https://atom.io/packages/file-icons|file-icons}
      'entry file list-item': true,
      'nuclide-tree-component-item': true,
      'nuclide-tree-component-selected': this.props.isSelected
    };
    if (this.props.rowClassName) {
      rowClassNameObj[this.props.rowClassName] = true;
    }

    const itemStyle = {
      paddingLeft: INDENT_IN_PX + this.props.depth * INDENT_PER_LEVEL_IN_PX
    };

    let arrow;
    if (this.props.isContainer) {
      if (this.props.isExpanded) {
        if (this.props.isLoading) {
          arrow = _reactForAtom.React.createElement(
            'span',
            { className: 'nuclide-tree-component-item-arrow-spinner' },
            SPINNER
          );
        } else {
          arrow = DOWN_ARROW;
        }
      } else {
        arrow = RIGHT_ARROW;
      }
    }

    return _reactForAtom.React.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)(rowClassNameObj),
        style: itemStyle,
        onClick: this._onClick,
        onDoubleClick: this._onDoubleClick,
        onMouseDown: this._onMouseDown },
      _reactForAtom.React.createElement(
        'span',
        { className: 'nuclide-tree-component-item-arrow', ref: 'arrow' },
        arrow
      ),
      this.props.labelElement != null ? this.props.labelElement : _reactForAtom.React.createElement(
        'span',
        {
          className: this.props.labelClassName
          // `data-name` is support for selectors in the "file-icons" package.
          // @see {@link https://atom.io/packages/file-icons|file-icons}
          , 'data-name': this.props.label,
          'data-path': this.props.path },
        this.props.label
      )
    );
  }

  _onClick(event) {
    if (_reactForAtom.ReactDOM.findDOMNode(this.refs.arrow).contains(event.target)) {
      this.props.onClickArrow(event, this.props.node);
    } else {
      this.props.onClick(event, this.props.node);
    }
  }

  _onDoubleClick(event) {
    this.props.onDoubleClick(event, this.props.node);
  }

  _onMouseDown(event) {
    this.props.onMouseDown(event, this.props.node);
  }
};