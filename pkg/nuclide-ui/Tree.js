'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TreeList = exports.NestedTreeItem = exports.TreeItem = undefined;

var _react = _interopRequireWildcard(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _scrollIntoView;

function _load_scrollIntoView() {
  return _scrollIntoView = require('nuclide-commons-ui/scrollIntoView');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
                                                                                                                                                                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                              * the root directory of this source tree.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * 
                                                                                                                                                                                                                              * @format
                                                                                                                                                                                                                              */

class TreeItem extends _react.Component {

  scrollIntoView() {
    if (this._liNode != null) {
      (0, (_scrollIntoView || _load_scrollIntoView()).scrollIntoView)(this._liNode);
    }
  }

  render() {
    const _props = this.props,
          { className, selected, children } = _props,
          remainingProps = _objectWithoutProperties(_props, ['className', 'selected', 'children']);
    return (
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement(
        'li',
        Object.assign({
          className: (0, (_classnames || _load_classnames()).default)(className, {
            selected
          }, 'list-item')
        }, remainingProps, {
          ref: liNode => this._liNode = liNode }),
        selected && typeof children === 'string' ? // String children must be wrapped to receive correct styles when selected.
        _react.createElement(
          'span',
          null,
          children
        ) : children
      )
    );
  }
}

exports.TreeItem = TreeItem;
const NestedTreeItem = props => {
  const {
    className,
    hasFlatChildren,
    selected,
    collapsed,
    title,
    children
  } = props,
        remainingProps = _objectWithoutProperties(props, ['className', 'hasFlatChildren', 'selected', 'collapsed', 'title', 'children']);
  return _react.createElement(
    'li',
    Object.assign({
      className: (0, (_classnames || _load_classnames()).default)(className, {
        selected,
        collapsed
      }, 'list-nested-item')
    }, remainingProps),
    title ? _react.createElement(
      'div',
      { className: 'list-item' },
      title
    ) : null,
    _react.createElement(
      TreeList,
      { hasFlatChildren: hasFlatChildren },
      children
    )
  );
};

exports.NestedTreeItem = NestedTreeItem;
const TreeList = exports.TreeList = (props
// $FlowFixMe(>=0.53.0) Flow suppress
) => _react.createElement(
  'ul',
  {
    className: (0, (_classnames || _load_classnames()).default)(props.className, {
      'has-collapsable-children': props.showArrows,
      'has-flat-children': props.hasFlatChildren
    }, 'list-tree') },
  props.children
);