'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TreeList = exports.NestedTreeItem = exports.TreeItem = undefined;
exports.Tree = Tree;

var _react = _interopRequireWildcard(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _scrollIntoView;

function _load_scrollIntoView() {
  return _scrollIntoView = require('./scrollIntoView');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
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

/* eslint-env browser */

function Tree(_ref) {
  let { className, style } = _ref,
      props = _objectWithoutProperties(_ref, ['className', 'style']);

  return _react.createElement('ol', Object.assign({
    className: (0, (_classnames || _load_classnames()).default)('list-tree', className),
    style: Object.assign({ position: 'relative' }, style)
  }, props));
}

class TreeItem extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleClick = handleClick.bind(this), _temp;
  }

  scrollIntoView() {
    if (this._liNode != null) {
      (0, (_scrollIntoView || _load_scrollIntoView()).scrollIntoView)(this._liNode);
    }
  }

  render() {
    const {
      className,
      selected,
      children,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      path,
      name
    } = this.props;

    return _react.createElement(
      'li',
      {
        'aria-selected': selected,
        className: (0, (_classnames || _load_classnames()).default)(className, {
          selected
        }, 'list-item'),
        onMouseDown: onMouseDown,
        onMouseEnter: onMouseEnter,
        onMouseLeave: onMouseLeave,
        'data-path': path,
        'data-name': name,
        onClick: this._handleClick,
        ref: liNode => this._liNode = liNode,
        role: 'treeitem',
        tabIndex: selected ? '0' : '-1' },
      selected && typeof children === 'string' ?
      // String children must be wrapped to receive correct styles when selected.
      _react.createElement(
        'span',
        null,
        children
      ) : children
    );
  }
}

exports.TreeItem = TreeItem;
class NestedTreeItem extends _react.Component {
  constructor(...args) {
    var _temp2;

    return _temp2 = super(...args), this._handleClick = e => {
      const itemNode = this._itemNode;
      if (itemNode == null) {
        return;
      }

      if (!(e.target instanceof Element)) {
        throw new Error('Invariant violation: "e.target instanceof Element"');
      }

      if (e.target.closest('.list-item') === itemNode) {
        handleClick.call(this, e);
      }
    }, _temp2;
  }

  render() {
    const {
      className,
      hasFlatChildren,
      selected,
      collapsed,
      title,
      children
    } = this.props;

    return _react.createElement(
      'li',
      {
        'aria-selected': selected,
        'aria-expanded': !collapsed,
        className: (0, (_classnames || _load_classnames()).default)(className, {
          selected,
          collapsed
        }, 'list-nested-item'),
        onClick: this._handleClick,
        role: 'treeitem',
        tabIndex: selected ? '0' : '-1' },
      title == null ? null : _react.createElement(
        'div',
        {
          tabIndex: -1,
          className: 'native-key-bindings list-item',
          ref: node => this._itemNode = node },
        title
      ),
      _react.createElement(
        TreeList,
        { hasFlatChildren: hasFlatChildren },
        children
      )
    );
  }
}

exports.NestedTreeItem = NestedTreeItem;
const TreeList = exports.TreeList = props =>
// $FlowFixMe(>=0.53.0) Flow suppress
_react.createElement(
  'ul',
  {
    className: (0, (_classnames || _load_classnames()).default)(props.className, {
      'has-collapsable-children': props.showArrows,
      'has-flat-children': props.hasFlatChildren
    }, 'list-tree'),
    role: 'group' },
  props.children
);

function handleClick(e) {
  const { onSelect, onConfirm, onTripleClick } = this.props;

  const numberOfClicks = e.detail;
  switch (numberOfClicks) {
    case 1:
      onSelect && onSelect(e);
      break;
    case 2:
      onConfirm && onConfirm(e);
      break;
    case 3:
      onTripleClick && onTripleClick(e);
      break;
    default:
      break;
  }
}