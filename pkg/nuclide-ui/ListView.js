'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListView = exports.ListViewItem = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

var _ignoreTextSelectionEvents;

function _load_ignoreTextSelectionEvents() {
  return _ignoreTextSelectionEvents = _interopRequireDefault(require('nuclide-commons-ui/ignoreTextSelectionEvents'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * Use ListViewItem in conjunction with ListView.
 */
class ListViewItem extends _react.Component {
  _select(value, index, event) {
    this.props.onSelect(value, index);
  }

  render() {
    const _props = this.props,
          { children, index, value } = _props,
          remainingProps = _objectWithoutProperties(_props, ['children', 'index', 'value']);
    return _react.createElement(
      'div',
      Object.assign({
        className: 'nuclide-ui-listview-item'
      }, remainingProps, {
        onClick: (0, (_ignoreTextSelectionEvents || _load_ignoreTextSelectionEvents()).default)(this._select.bind(this, value, index)) }),
      children
    );
  }
}

exports.ListViewItem = ListViewItem;
class ListView extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleSelect = (value, index, event) => {
      if (this.props.selectable && this.props.onSelect != null) {
        this.props.onSelect(index, value);
      }
    }, _temp;
  }

  render() {
    const { children, alternateBackground, selectable } = this.props;
    const renderedItems = _react.Children.map(children, (child, index) => _react.cloneElement(child, {
      index,
      onSelect: this._handleSelect
    }));
    const className = (0, (_classnames || _load_classnames()).default)({
      'native-key-bindings': true,
      'nuclide-ui-listview': true,
      'nuclide-ui-listview-highlight-odd': alternateBackground,
      'nuclide-ui-listview-selectable': selectable
    });
    return _react.createElement(
      'div',
      { className: className, tabIndex: -1 },
      renderedItems
    );
  }
}
exports.ListView = ListView;