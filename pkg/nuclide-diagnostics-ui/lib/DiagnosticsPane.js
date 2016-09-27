var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _columnGetters;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _Cells2;

function _Cells() {
  return _Cells2 = require('./Cells');
}

var _DiagnosticsSorter2;

function _DiagnosticsSorter() {
  return _DiagnosticsSorter2 = require('./DiagnosticsSorter');
}

var _paneUtils2;

function _paneUtils() {
  return _paneUtils2 = require('./paneUtils');
}

var _commonsAtomGoToLocation2;

function _commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation2 = require('../../commons-atom/go-to-location');
}

var _nuclideUiPanelComponentScroller2;

function _nuclideUiPanelComponentScroller() {
  return _nuclideUiPanelComponentScroller2 = require('../../nuclide-ui/PanelComponentScroller');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var DEFAULT_LINE_TEXT_HEIGHT = 15;
var PIXELS_PER_CHAR = 6;
var MAX_ROW_LINES = 3;
var ROW_HORIZONTAL_PADDING = 16;
var ROW_VERTICAL_PADDING = 8;

var TYPE_COLUMN_WIDTH = 80;
var PROVIDER_NAME_COLUMN_WIDTH = 175;
var FILE_PATH_COLUMN_WIDTH = 300;
var RANGE_COLUMN_WIDTH = 70;

// Maximum number of results to render in the table before truncating and displaying a "Max results
// reached" message.
var MAX_RESULTS_COUNT = 1000;

var TypeToHighlightClassName = Object.freeze({
  ERROR: 'highlight-error',
  WARNING: 'highlight-warning'
});

var columnGetters = (_columnGetters = {}, _defineProperty(_columnGetters, (_Cells2 || _Cells()).ColumnKeys.TYPE, function (diag) {
  return typeColumnCellDataGetter('type', diag);
}), _defineProperty(_columnGetters, (_Cells2 || _Cells()).ColumnKeys.PROVIDER, function (diag) {
  return sourceColumnCellDataGetter('providerName', diag);
}), _defineProperty(_columnGetters, (_Cells2 || _Cells()).ColumnKeys.FILE, function (diag) {
  return (0, (_paneUtils2 || _paneUtils()).fileColumnCellDataGetter)('filePath', diag);
}), _defineProperty(_columnGetters, (_Cells2 || _Cells()).ColumnKeys.RANGE, function (diag) {
  return rowOfDiagnostic(diag);
}), _defineProperty(_columnGetters, (_Cells2 || _Cells()).ColumnKeys.DESCRIPTION, function (diag) {
  return messageColumnCellDataGetter('message', diag).text;
}), _columnGetters);

function locationColumnCellDataGetter(cellDataKey, diagnostic) {
  var row = rowOfDiagnostic(diagnostic);
  return row === 0 ? '' : row.toString();
}

function rowOfDiagnostic(diagnostic) {
  return diagnostic.range ? diagnostic.range.start.row + 1 : 0;
}

function typeColumnCellDataGetter(cellDataKey, diagnostic) {
  return diagnostic.type;
}

function sourceColumnCellDataGetter(cellDataKey, diagnostic) {
  return diagnostic.providerName;
}

function plainTextColumnCellRenderer(text) {
  // For consistency with messageColumnCellDataGetter(), render plaintext in a <span> so that
  // everything lines up.
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'span',
    null,
    text
  );
}

function typeColumnCellRenderer(text) {
  var highlightClassName = TypeToHighlightClassName[text.toUpperCase()] || 'highlight';
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'span',
    { className: highlightClassName },
    text
  );
}

/** @return text and a boolean indicating whether it is plaintext or HTML. */
function messageColumnCellDataGetter(cellDataKey, diagnostic) {
  var text = '';
  var isPlainText = true;
  var traces = diagnostic.trace || [];
  var allMessages = [diagnostic].concat(_toConsumableArray(traces));
  for (var message of allMessages) {
    if (message.html != null) {
      text += message.html + ' ';
      isPlainText = false;
    } else if (message.text != null) {
      text += message.text + ' ';
    } else {
      throw new Error('Neither text nor html property defined on message');
    }
  }
  return {
    text: text.trim(),
    isPlainText: isPlainText
  };
}

function messageColumnCellRenderer(message) {
  if (message.isPlainText) {
    return plainTextColumnCellRenderer(message.text);
  } else {
    return (_reactForAtom2 || _reactForAtom()).React.createElement('span', { dangerouslySetInnerHTML: { __html: message.text } });
  }
}

function onRowClick(event, rowIndex, rowData) {
  if (rowData.scope !== 'file' || rowData.filePath == null) {
    return;
  }

  (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diagnostics-panel-goto-location');

  var uri = rowData.filePath;
  // If initialLine is N, Atom will navigate to line N+1.
  // Flow sometimes reports a row of -1, so this ensures the line is at least one.
  var line = Math.max(rowData.range ? rowData.range.start.row : 0, 0);
  var column = 0;
  (0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(uri, line, column);
}

var DiagnosticsPane = (function (_React$Component) {
  _inherits(DiagnosticsPane, _React$Component);

  function DiagnosticsPane(props) {
    _classCallCheck(this, DiagnosticsPane);

    _get(Object.getPrototypeOf(DiagnosticsPane.prototype), 'constructor', this).call(this, props);
    this._rowGetter = this._rowGetter.bind(this);
    this._rowHeightGetter = this._rowHeightGetter.bind(this);
    this._getMessageWidth = this._getMessageWidth.bind(this);
    this._onSortChange = this._onSortChange.bind(this);

    this.state = {
      widths: {
        type: TYPE_COLUMN_WIDTH,
        providerName: PROVIDER_NAME_COLUMN_WIDTH,
        filePath: FILE_PATH_COLUMN_WIDTH,
        range: RANGE_COLUMN_WIDTH
      },
      columnSortDirections: {}
    };
  }

  // A home-made flex function so that we can read the message column width easily.

  _createClass(DiagnosticsPane, [{
    key: '_getMessageWidth',
    value: function _getMessageWidth() {
      return this.props.width - this.state.widths.type - this.state.widths.providerName - (this.props.showFileName ? this.state.widths.filePath : 0) - this.state.widths.range;
    }
  }, {
    key: '_rowGetter',
    value: function _rowGetter(rowIndex) {
      return this.props.diagnostics[rowIndex];
    }
  }, {
    key: '_rowHeightGetter',
    value: function _rowHeightGetter(rowIndex) {
      var diagnostic = this._rowGetter(rowIndex);

      var _messageColumnCellDataGetter = messageColumnCellDataGetter('message', diagnostic);

      var message = _messageColumnCellDataGetter.text;

      var messageCharsPerRow = (this._getMessageWidth() - ROW_HORIZONTAL_PADDING) / PIXELS_PER_CHAR;
      var messageLinesOfText = Math.floor(message.length / messageCharsPerRow) + 1;
      var messageMaxLinesOfText = Math.min(MAX_ROW_LINES, messageLinesOfText);
      return messageMaxLinesOfText * DEFAULT_LINE_TEXT_HEIGHT + ROW_VERTICAL_PADDING;
    }
  }, {
    key: '_onSortChange',
    value: function _onSortChange(columnKey, sortDirection) {
      this.setState({
        columnSortDirections: _defineProperty({}, columnKey, sortDirection)
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var diagnosticCells = [];
      var columnSortDirections = this.state.columnSortDirections;

      var sortedDiagnostics = (0, (_DiagnosticsSorter2 || _DiagnosticsSorter()).sortDiagnostics)(this.props.diagnostics, columnSortDirections, columnGetters);

      var _loop = function (index) {
        var diag = sortedDiagnostics[index];
        diagnosticCells.push((_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          {
            className: 'fixedDataTableCellGroupLayout_cellGroup nuclide-diagnostics-pane__actionable',
            key: index,
            onClick: function (e) {
              onRowClick(e, index, diag);
            },
            style: { height: _this._rowHeightGetter(index) } },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Cells2 || _Cells()).Cell,
            { style: { width: _this.state.widths.type + 'px' } },
            typeColumnCellRenderer(typeColumnCellDataGetter('type', diag))
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Cells2 || _Cells()).Cell,
            { style: { width: _this.state.widths.providerName + 'px' } },
            plainTextColumnCellRenderer(sourceColumnCellDataGetter('providerName', diag))
          ),
          _this.props.showFileName ? (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Cells2 || _Cells()).Cell,
            {
              style: { width: _this.state.widths.filePath + 'px' },
              title: (0, (_paneUtils2 || _paneUtils()).fileColumnCellDataGetter)('filePath', diag) },
            plainTextColumnCellRenderer((0, (_paneUtils2 || _paneUtils()).fileColumnCellDataGetter)('filePath', diag))
          ) : null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Cells2 || _Cells()).Cell,
            { style: { width: _this.state.widths.range + 'px' } },
            plainTextColumnCellRenderer(locationColumnCellDataGetter('range', diag))
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Cells2 || _Cells()).Cell,
            { style: { width: _this._getMessageWidth() + 'px' } },
            messageColumnCellRenderer(messageColumnCellDataGetter('message', diag))
          )
        ));
      };

      for (var index = 0; index < Math.min(MAX_RESULTS_COUNT, sortedDiagnostics.length); index++) {
        _loop(index);
      }

      if (sortedDiagnostics.length > MAX_RESULTS_COUNT) {
        diagnosticCells.push((_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'fixedDataTableCellGroupLayout_cellGroup', key: 'maxResultsMessage' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'public_fixedDataTableCell_main' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'em',
              null,
              'Max results (',
              MAX_RESULTS_COUNT,
              ') reached. Fix diagnostics or show only diagnostics for the current file to view more.'
            )
          )
        ));
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'fixedDataTableLayout_main' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'public_fixedDataTable_main' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'public_fixedDataTable_header' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'div',
              { className: 'fixedDataTableCellGroupLayout_cellGroup', style: { height: '30px' } },
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                (_Cells2 || _Cells()).SortHeaderCell,
                {
                  columnKey: (_Cells2 || _Cells()).ColumnKeys.TYPE,
                  sortDirection: columnSortDirections[(_Cells2 || _Cells()).ColumnKeys.TYPE],
                  onSortChange: this._onSortChange,
                  style: { width: this.state.widths.type + 'px' } },
                'Type'
              ),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                (_Cells2 || _Cells()).SortHeaderCell,
                {
                  columnKey: (_Cells2 || _Cells()).ColumnKeys.PROVIDER,
                  sortDirection: columnSortDirections[(_Cells2 || _Cells()).ColumnKeys.PROVIDER],
                  onSortChange: this._onSortChange,
                  style: { width: this.state.widths.providerName + 'px' } },
                'Source'
              ),
              this.props.showFileName ? (_reactForAtom2 || _reactForAtom()).React.createElement(
                (_Cells2 || _Cells()).SortHeaderCell,
                {
                  columnKey: (_Cells2 || _Cells()).ColumnKeys.FILE,
                  sortDirection: columnSortDirections[(_Cells2 || _Cells()).ColumnKeys.FILE],
                  onSortChange: this._onSortChange,
                  style: { width: this.state.widths.filePath + 'px' } },
                'File'
              ) : null,
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                (_Cells2 || _Cells()).SortHeaderCell,
                {
                  columnKey: (_Cells2 || _Cells()).ColumnKeys.RANGE,
                  sortDirection: columnSortDirections[(_Cells2 || _Cells()).ColumnKeys.RANGE],
                  onSortChange: this._onSortChange,
                  style: { width: this.state.widths.range + 'px' } },
                'Line'
              ),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                (_Cells2 || _Cells()).SortHeaderCell,
                {
                  columnKey: (_Cells2 || _Cells()).ColumnKeys.DESCRIPTION,
                  sortDirection: columnSortDirections[(_Cells2 || _Cells()).ColumnKeys.DESCRIPTION],
                  onSortChange: this._onSortChange,
                  style: { width: this._getMessageWidth() + 'px' } },
                'Description'
              )
            )
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiPanelComponentScroller2 || _nuclideUiPanelComponentScroller()).PanelComponentScroller,
            { flexDirection: 'column' },
            diagnosticCells
          )
        )
      );
    }
  }]);

  return DiagnosticsPane;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = DiagnosticsPane;