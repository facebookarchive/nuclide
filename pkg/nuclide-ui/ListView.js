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
exports.ListView = exports.ListViewItem = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/**
 * Use ListViewItem in conjunction with ListView.
 */
let ListViewItem = exports.ListViewItem = class ListViewItem extends _reactForAtom.React.Component {

  _select(value, index, event) {
    this.props.onSelect(value, index);
  }
  // $FlowIssue `index` and `onSelect` are injected by the surrounding `ListView` component.


  render() {
    var _props = this.props;
    const children = _props.children;
    const index = _props.index;
    const value = _props.value;

    const remainingProps = _objectWithoutProperties(_props, ['children', 'index', 'value']);

    return _reactForAtom.React.createElement(
      'div',
      _extends({
        className: 'nuclide-ui-listview-item'
      }, remainingProps, {
        onClick: this._select.bind(this, value, index) }),
      children
    );
  }
};
let ListView = exports.ListView = class ListView extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleSelect = this._handleSelect.bind(this);
  }

  _handleSelect(value, index, event) {
    if (this.props.selectable && this.props.onSelect != null) {
      this.props.onSelect(index, value);
    }
  }

  render() {
    var _props2 = this.props;
    const children = _props2.children;
    const alternateBackground = _props2.alternateBackground;
    const selectable = _props2.selectable;

    const renderedItems = _reactForAtom.React.Children.map(children, (child, index) => _reactForAtom.React.cloneElement(child, {
      index: index,
      onSelect: this._handleSelect
    }));
    const className = (0, (_classnames || _load_classnames()).default)({
      'nuclide-ui-listview': true,
      'nuclide-ui-listview-highlight-odd': alternateBackground,
      'nuclide-ui-listview-selectable': selectable
    });
    return _reactForAtom.React.createElement(
      'div',
      { className: className },
      renderedItems
    );
  }
};