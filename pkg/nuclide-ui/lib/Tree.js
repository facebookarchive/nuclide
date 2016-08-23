Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var TreeItem = function TreeItem(props) {
  var className = props.className;
  var selected = props.selected;
  var children = props.children;

  var remainingProps = _objectWithoutProperties(props, ['className', 'selected', 'children']);

  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'li',
    _extends({ className: (0, (_classnames2 || _classnames()).default)(className, {
        selected: selected
      }, 'list-item')
    }, remainingProps),
    selected && typeof children === 'string'
    // String children must be wrapped to receive correct styles when selected.
    ? (_reactForAtom2 || _reactForAtom()).React.createElement(
      'span',
      null,
      children
    ) : children
  );
};

exports.TreeItem = TreeItem;
var NestedTreeItem = function NestedTreeItem(props) {
  var className = props.className;
  var selected = props.selected;
  var collapsed = props.collapsed;
  var title = props.title;
  var children = props.children;

  var remainingProps = _objectWithoutProperties(props, ['className', 'selected', 'collapsed', 'title', 'children']);

  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'li',
    _extends({ className: (0, (_classnames2 || _classnames()).default)(className, {
        selected: selected,
        collapsed: collapsed
      }, 'list-nested-item')
    }, remainingProps),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      { className: 'list-item' },
      title
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      TreeList,
      null,
      children
    )
  );
};

exports.NestedTreeItem = NestedTreeItem;
var TreeList = function TreeList(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'ul',
    { className: (0, (_classnames2 || _classnames()).default)(props.className, {
        'has-collapsable-children': props.showArrows
      }, 'list-tree') },
    props.children
  );
};
exports.TreeList = TreeList;

/* typically, instances of TreeItem or NestedTreeItem. */