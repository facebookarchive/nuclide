Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _Icon2;

function _Icon() {
  return _Icon2 = require('./Icon');
}

var DefaultEmptyComponent = function DefaultEmptyComponent() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { className: 'nuclide-ui-table-empty-message' },
    'Empty table'
  );
};

// ColumnKey must be unique within the containing collection.

var Table = (function (_React$Component) {
  _inherits(Table, _React$Component);

  function Table(props) {
    _classCallCheck(this, Table);

    _get(Object.getPrototypeOf(Table.prototype), 'constructor', this).call(this, props);
    this._globalEventsDisposable = null;
    this._resizeStartX = null;
    this._tableWidth = null;
    this._columnBeingResized = null;
    this._handleResizerGlobalMouseUp = this._handleResizerGlobalMouseUp.bind(this);
    this._handleResizerGlobalMouseMove = this._handleResizerGlobalMouseMove.bind(this);
    this.state = {
      columnWidthRatios: this._getInitialWidthsForColumns(this.props.columns)
    };
  }

  _createClass(Table, [{
    key: '_getInitialWidthsForColumns',
    value: function _getInitialWidthsForColumns(columns) {
      var columnWidthRatios = {};
      var assignedWidth = 0;
      var unresolvedColumns = [];
      columns.forEach(function (column) {
        var key = column.key;
        var width = column.width;

        if (width != null) {
          columnWidthRatios[key] = width;
          assignedWidth += width;
        } else {
          unresolvedColumns.push(column);
        }
      });
      var residualColumnWidth = (1 - assignedWidth) / unresolvedColumns.length;
      unresolvedColumns.forEach(function (column) {
        columnWidthRatios[column.key] = residualColumnWidth;
      });
      return columnWidthRatios;
    }

    /* Applies sizing constraints, and returns whether the column width actually changed. */
  }, {
    key: '_updateWidths',
    value: function _updateWidths(resizedColumn, newColumnSize) {
      var columnWidthRatios = this.state.columnWidthRatios;
      var columns = this.props.columns;

      var originalColumnSize = columnWidthRatios[resizedColumn];
      var columnAfterResizedColumn = columns[columns.findIndex(function (column) {
        return column.key === resizedColumn;
      }) + 1].key;
      var followingColumnSize = columnWidthRatios[columnAfterResizedColumn];
      var constrainedNewColumnSize = Math.max(0, Math.min(newColumnSize, followingColumnSize + originalColumnSize));
      if (Math.abs(newColumnSize - constrainedNewColumnSize) > Number.EPSILON) {
        return false;
      }
      var updatedColumnWidths = {};
      columns.forEach(function (column) {
        var key = column.key;

        var width = undefined;
        if (column.key === resizedColumn) {
          width = constrainedNewColumnSize;
        } else if (column.key === columnAfterResizedColumn) {
          width = columnWidthRatios[resizedColumn] - constrainedNewColumnSize + columnWidthRatios[key];
        } else {
          width = columnWidthRatios[key];
        }
        updatedColumnWidths[key] = width;
      });
      this.setState({
        columnWidthRatios: updatedColumnWidths
      });
      return true;
    }
  }, {
    key: '_handleResizerMouseDown',
    value: function _handleResizerMouseDown(key, event) {
      var _this = this;

      if (this._globalEventsDisposable != null) {
        this._unsubscribeFromGlobalEvents();
      }
      // Prevent browser from initiating drag events on accidentally selected elements.
      var selection = document.getSelection();
      if (selection != null) {
        selection.removeAllRanges();
      }
      document.addEventListener('mousemove', this._handleResizerGlobalMouseMove);
      document.addEventListener('mouseup', this._handleResizerGlobalMouseUp);
      this._resizeStartX = event.pageX;
      this._tableWidth = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.table).getBoundingClientRect().width;
      this._columnBeingResized = key;
      this._globalEventsDisposable = new (_atom2 || _atom()).Disposable(function () {
        document.removeEventListener('mousemove', _this._handleResizerGlobalMouseMove);
        document.removeEventListener('mouseup', _this._handleResizerGlobalMouseUp);
        _this._resizeStartX = null;
        _this._tableWidth = null;
        _this._columnBeingResized = null;
      });
    }
  }, {
    key: '_unsubscribeFromGlobalEvents',
    value: function _unsubscribeFromGlobalEvents() {
      if (this._globalEventsDisposable == null) {
        return;
      }
      this._globalEventsDisposable.dispose();
      this._globalEventsDisposable = null;
    }
  }, {
    key: '_handleResizerGlobalMouseUp',
    value: function _handleResizerGlobalMouseUp(event) {
      this._unsubscribeFromGlobalEvents();
    }
  }, {
    key: '_handleResizerGlobalMouseMove',
    value: function _handleResizerGlobalMouseMove(event) {
      if (this._resizeStartX == null || this._tableWidth == null || this._columnBeingResized == null) {
        return;
      }
      var _ref = event;
      var pageX = _ref.pageX;

      var deltaX = pageX - this._resizeStartX;
      var currentColumnSize = this.state.columnWidthRatios[this._columnBeingResized];
      var didUpdate = this._updateWidths(this._columnBeingResized, (this._tableWidth * currentColumnSize + deltaX) / this._tableWidth);
      if (didUpdate) {
        this._resizeStartX = pageX;
      }
    }
  }, {
    key: '_dispose',
    value: function _dispose() {
      this._unsubscribeFromGlobalEvents();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._dispose();
    }
  }, {
    key: '_handleSortByColumn',
    value: function _handleSortByColumn(sortedBy) {
      var _props = this.props;
      var onSort = _props.onSort;
      var sortDescending = _props.sortDescending;
      var sortedColumn = _props.sortedColumn;

      if (onSort == null) {
        return;
      }
      onSort(sortedBy, sortDescending == null || sortedBy !== sortedColumn ? false : !sortDescending);
    }
  }, {
    key: '_handleRowClick',
    value: function _handleRowClick(selectedIndex, event) {
      var _props2 = this.props;
      var onSelect = _props2.onSelect;
      var rows = _props2.rows;

      if (onSelect == null) {
        return;
      }
      var selectedItem = rows[selectedIndex];
      onSelect(selectedItem.data, selectedIndex);
    }
  }, {
    key: '_renderEmptyCellContent',
    value: function _renderEmptyCellContent() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement('div', null);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props3 = this.props;
      var alternateBackground = _props3.alternateBackground;
      var className = _props3.className;
      var columns = _props3.columns;
      var maxBodyHeight = _props3.maxBodyHeight;
      var rows = _props3.rows;
      var selectable = _props3.selectable;
      var selectedIndex = _props3.selectedIndex;
      var sortable = _props3.sortable;
      var sortedColumn = _props3.sortedColumn;
      var sortDescending = _props3.sortDescending;

      var header = columns.map(function (column, i) {
        var title = column.title;
        var key = column.key;

        var resizeHandle = i === columns.length - 1 ? null : (_reactForAtom2 || _reactForAtom()).React.createElement('div', {
          className: 'nuclide-ui-table-header-resize-handle',
          onMouseDown: _this2._handleResizerMouseDown.bind(_this2, key),
          onClick: function (e) {
            // Prevent sortable column header click event from firing.
            e.stopPropagation();
          }
        });
        var width = _this2.state.columnWidthRatios[key];
        var optionalHeaderCellProps = {};
        if (width != null) {
          optionalHeaderCellProps.style = {
            width: width + '%'
          };
        }
        var sortIndicator = undefined;
        var titleOverlay = title;
        if (sortable) {
          optionalHeaderCellProps.onClick = _this2._handleSortByColumn.bind(_this2, key);
          titleOverlay += ' – click to sort';
          if (sortedColumn === key) {
            sortIndicator = (_reactForAtom2 || _reactForAtom()).React.createElement(
              'span',
              null,
              ' ',
              (_reactForAtom2 || _reactForAtom()).React.createElement((_Icon2 || _Icon()).Icon, { icon: sortDescending ? 'triangle-down' : 'triangle-up' })
            );
          }
        }
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'th',
          _extends({
            className: (0, (_classnames2 || _classnames()).default)({
              'nuclide-ui-table-header-cell': true,
              'nuclide-ui-table-header-cell-sortable': sortable
            }),
            title: titleOverlay,
            key: key
          }, optionalHeaderCellProps),
          title,
          sortIndicator,
          resizeHandle
        );
      });
      var body = rows.map(function (row, i) {
        var rowClassName = row.className;
        var data = row.data;

        var renderedRow = columns.map(function (column, j) {
          var key = column.key;
          var Component = column.component;

          var datum = data[key];
          if (Component != null) {
            datum = (_reactForAtom2 || _reactForAtom()).React.createElement(Component, { data: datum });
          } else if (datum == null) {
            datum = _this2._renderEmptyCellContent();
          }
          var cellStyle = {};
          if (i === 0) {
            var _width = _this2.state.columnWidthRatios[key];
            if (_width != null) {
              cellStyle.width = _width + '%';
            }
          }
          return (_reactForAtom2 || _reactForAtom()).React.createElement(
            'td',
            {
              className: 'nuclide-ui-table-body-cell',
              key: j,
              style: cellStyle },
            datum
          );
        });
        var rowProps = {};
        if (selectable) {
          rowProps.onClick = _this2._handleRowClick.bind(_this2, i);
        }
        var isSelectedRow = selectedIndex != null && i === selectedIndex;
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'tr',
          _extends({
            className: (0, (_classnames2 || _classnames()).default)(rowClassName, {
              'nuclide-ui-table-row-selectable': selectable,
              'nuclide-ui-table-row-selected': isSelectedRow,
              'nuclide-ui-table-row-alternate': alternateBackground !== false && i % 2 === 1,
              'nuclide-ui-table-collapsed-row': _this2.props.collapsable && !isSelectedRow
            }),
            key: i
          }, rowProps),
          renderedRow
        );
      });
      if (rows.length === 0) {
        var EmptyComponent = this.props.emptyComponent || DefaultEmptyComponent;
        body = (_reactForAtom2 || _reactForAtom()).React.createElement(
          'tr',
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'td',
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(EmptyComponent, null)
          )
        );
      }
      var scrollableBodyStyle = {};
      if (maxBodyHeight != null) {
        scrollableBodyStyle.maxHeight = maxBodyHeight;
        scrollableBodyStyle.overflowY = 'auto';
      }
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: className },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'table',
          {
            className: 'nuclide-ui-table',
            ref: 'table' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'thead',
            { className: 'nuclide-ui-table-header' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'tr',
              null,
              header
            )
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { style: scrollableBodyStyle },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'table',
            { className: 'nuclide-ui-table nuclide-ui-table-body' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'tbody',
              null,
              body
            )
          )
        )
      );
    }
  }]);

  return Table;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.Table = Table;

// Percentage. The `width`s of all columns must add up to 1.

// Optional React component for rendering cell contents.
// The component receives the cell value via `props.data`.

/**
 * Optional classname for the entire table.
 */

/**
 * Optional max-height for the body container.
 * Useful for making the table scrollable while keeping the header fixed.
 */

/**
 * Whether to shade even and odd items differently. Default behavior is `true`.
 */

/**
 * Whether column widths can be resized interactively via drag&drop. Default behavior is `true`.
 */

/**
 * Whether columns can be sorted.
 * If specified, `onSort`, `sortedColumn`, and `sortDescending` must also be specified.
 */

/**
 * Whether items can be selected.
 * If specified, `onSelect` must also be specified.
 */

/**
 * Handler to be called upon selection. Called iff `selectable` is `true`.
 */

/**
 * Optional React Component to override the default message when zero rows are provided.
 * Useful for showing loading spinners and custom messages.
 */

/**
 * Whether a table row will be collapsed if its content is too large
 */