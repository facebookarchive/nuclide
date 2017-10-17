'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TreeNodeComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const INDENT_IN_PX = 10;
const INDENT_PER_LEVEL_IN_PX = 15;
const DOWN_ARROW = '\uF0A3';
const RIGHT_ARROW = '\uF078';
const SPINNER = '\uF087';

/**
 * Represents one entry in a TreeComponent.
 */
class TreeNodeComponent extends _react.PureComponent {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._onClick = event => {
      // $FlowFixMe
      if (_reactDom.default.findDOMNode(this.refs.arrow).contains(event.target)) {
        this.props.onClickArrow(event, this.props.node);
      } else {
        this.props.onClick(event, this.props.node);
      }
    }, this._onDoubleClick = event => {
      this.props.onDoubleClick(event, this.props.node);
    }, this._onMouseDown = event => {
      this.props.onMouseDown(event, this.props.node);
    }, _temp;
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
          arrow = _react.createElement(
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

    return _react.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)(rowClassNameObj),
        style: itemStyle,
        onClick: this._onClick,
        onDoubleClick: this._onDoubleClick,
        onMouseDown: this._onMouseDown },
      _react.createElement(
        'span',
        { className: 'nuclide-tree-component-item-arrow', ref: 'arrow' },
        arrow
      ),
      this.props.labelElement != null ? this.props.labelElement : _react.createElement(
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

}
exports.TreeNodeComponent = TreeNodeComponent;