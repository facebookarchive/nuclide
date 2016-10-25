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
exports.TreeList = exports.NestedTreeItem = exports.TreeItem = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const TreeItem = exports.TreeItem = props => {
  const className = props.className;
  const selected = props.selected;
  const children = props.children;

  const remainingProps = _objectWithoutProperties(props, ['className', 'selected', 'children']);

  return _reactForAtom.React.createElement(
    'li',
    _extends({ className: (0, (_classnames || _load_classnames()).default)(className, {
        selected: selected
      }, 'list-item')
    }, remainingProps),
    selected && typeof children === 'string'
    // String children must be wrapped to receive correct styles when selected.
    ? _reactForAtom.React.createElement(
      'span',
      null,
      children
    ) : children
  );
};

const NestedTreeItem = exports.NestedTreeItem = props => {
  const className = props.className;
  const selected = props.selected;
  const collapsed = props.collapsed;
  const title = props.title;
  const children = props.children;

  const remainingProps = _objectWithoutProperties(props, ['className', 'selected', 'collapsed', 'title', 'children']);

  return _reactForAtom.React.createElement(
    'li',
    _extends({ className: (0, (_classnames || _load_classnames()).default)(className, {
        selected: selected,
        collapsed: collapsed
      }, 'list-nested-item')
    }, remainingProps),
    _reactForAtom.React.createElement(
      'div',
      { className: 'list-item' },
      title
    ),
    _reactForAtom.React.createElement(
      TreeList,
      null,
      children
    )
  );
};

const TreeList = exports.TreeList = props => _reactForAtom.React.createElement(
  'ul',
  { className: (0, (_classnames || _load_classnames()).default)(props.className, {
      'has-collapsable-children': props.showArrows
    }, 'list-tree') },
  props.children
);