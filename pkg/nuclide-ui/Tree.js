'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TreeList = exports.NestedTreeItem = exports.TreeItem = undefined;

var _react = _interopRequireDefault(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
                                                                                                                                                                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                              * the root directory of this source tree.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * 
                                                                                                                                                                                                                              */

const TreeItem = props => {
  const {
    className,
    selected,
    children
  } = props,
        remainingProps = _objectWithoutProperties(props, ['className', 'selected', 'children']);
  return _react.default.createElement(
    'li',
    Object.assign({ className: (0, (_classnames || _load_classnames()).default)(className, {
        selected
      }, 'list-item')
    }, remainingProps),
    selected && typeof children === 'string'
    // String children must be wrapped to receive correct styles when selected.
    ? _react.default.createElement(
      'span',
      null,
      children
    ) : children
  );
};

exports.TreeItem = TreeItem;
const NestedTreeItem = props => {
  const {
    className,
    selected,
    collapsed,
    title,
    children
  } = props,
        remainingProps = _objectWithoutProperties(props, ['className', 'selected', 'collapsed', 'title', 'children']);
  return _react.default.createElement(
    'li',
    Object.assign({ className: (0, (_classnames || _load_classnames()).default)(className, {
        selected,
        collapsed
      }, 'list-nested-item')
    }, remainingProps),
    _react.default.createElement(
      'div',
      { className: 'list-item' },
      title
    ),
    _react.default.createElement(
      TreeList,
      null,
      children
    )
  );
};

exports.NestedTreeItem = NestedTreeItem;
const TreeList = exports.TreeList = props => _react.default.createElement(
  'ul',
  { className: (0, (_classnames || _load_classnames()).default)(props.className, {
      'has-collapsable-children': props.showArrows
    }, 'list-tree') },
  props.children
);