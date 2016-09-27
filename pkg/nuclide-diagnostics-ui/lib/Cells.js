Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.Cell = Cell;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiIcon2;

function _nuclideUiIcon() {
  return _nuclideUiIcon2 = require('../../nuclide-ui/Icon');
}

/*
 * Returns markup similar to that produced by fixed-data-table v0.6.0.
 */

function Cell(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    {
      className: (0, (_classnames2 || _classnames()).default)({
        public_fixedDataTableCell_main: true,
        public_fixedDataTableCell_main_sortable: props.sortable
      }),
      onClick: props.onClick,
      style: props.style,
      title: props.title },
    props.children
  );
}

var SortDirections = Object.freeze({
  ASC: 'ASC',
  DESC: 'DESC'
});

exports.SortDirections = SortDirections;
var ColumnKeys = Object.freeze({
  TYPE: 'TYPE',
  PROVIDER: 'PROVIDER',
  FILE: 'FILE',
  RANGE: 'RANGE',
  DESCRIPTION: 'DESCRIPTION'
});

exports.ColumnKeys = ColumnKeys;

/*
 * Returns a header cell as in fixed-data-table's SortExample.
 */

var SortHeaderCell = (function (_React$Component) {
  _inherits(SortHeaderCell, _React$Component);

  function SortHeaderCell(props) {
    _classCallCheck(this, SortHeaderCell);

    _get(Object.getPrototypeOf(SortHeaderCell.prototype), 'constructor', this).call(this, props);
    this._onSortChange = this._onSortChange.bind(this);
  }

  _createClass(SortHeaderCell, [{
    key: '_onSortChange',
    value: function _onSortChange(e) {
      e.preventDefault();
      this.props.onSortChange(this.props.columnKey, this._reverseSortDirection(this.props.sortDirection));
    }
  }, {
    key: '_reverseSortDirection',
    value: function _reverseSortDirection(sortDirection) {
      return sortDirection === SortDirections.DESC ? SortDirections.ASC : SortDirections.DESC;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var sortDirection = _props.sortDirection;
      var children = _props.children;
      var style = _props.style;

      var sortIcon = (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiIcon2 || _nuclideUiIcon()).Icon, {
          icon: sortDirection === SortDirections.DESC ? 'triangle-down' : 'triangle-up',
          className: 'public_fixedDataTableCell_main_sortable_icon'
        })
      );

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        Cell,
        { style: style, onClick: this._onSortChange, sortable: true },
        children,
        ' ',
        sortDirection ? sortIcon : ''
      );
    }
  }]);

  return SortHeaderCell;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.SortHeaderCell = SortHeaderCell;