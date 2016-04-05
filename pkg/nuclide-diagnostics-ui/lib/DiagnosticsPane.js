var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _require = require('fixed-data-table');

var Column = _require.Column;
var Table = _require.Table;

var _require2 = require('react-for-atom');

var React = _require2.React;
var PropTypes = React.PropTypes;

var _require3 = require('./paneUtils');

var fileColumnCellDataGetter = _require3.fileColumnCellDataGetter;

var DEFAULT_LINE_TEXT_HEIGHT = 15;
var PIXELS_PER_CHAR = 6;
var MAX_ROW_LINES = 3;
var ROW_HORIZONTAL_PADDING = 16;
var ROW_VERTICAL_PADDING = 8;

var TYPE_COLUMN_WIDTH = 75;
var PROVIDER_NAME_COLUMN_WIDTH = 175;
var FILE_PATH_COLUMN_WIDTH = 300;
var RANGE_COLUMN_WIDTH = 50;

var TypeToHighlightClassName = Object.freeze({
  ERROR: 'highlight-error',
  WARNING: 'highlight-warning'
});

function locationColumnCellDataGetter(cellDataKey, diagnostic) {
  return diagnostic.range ? (diagnostic.range.start.row + 1).toString() : '';
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
  return React.createElement(
    'span',
    { className: 'nuclide-fixed-data-cell' },
    text
  );
}

function typeColumnCellRenderer(text) {
  var highlightClassName = TypeToHighlightClassName[text.toUpperCase()] || 'highlight';
  return React.createElement(
    'span',
    { className: 'nuclide-fixed-data-cell' },
    React.createElement(
      'span',
      { className: highlightClassName },
      text
    )
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
      throw new Error('Neither text nor html property defined on: ' + message);
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
    return React.createElement('span', { className: 'nuclide-fixed-data-cell', dangerouslySetInnerHTML: { __html: message.text } });
  }
}

function onRowClick(event, rowIndex, rowData) {
  if (rowData.scope !== 'file' || rowData.filePath == null) {
    return;
  }

  (0, _nuclideAnalytics.track)('diagnostics-panel-goto-location');

  var uri = rowData.filePath;
  // If initialLine is N, Atom will navigate to line N+1.
  // Flow sometimes reports a row of -1, so this ensures the line is at least one.
  var line = Math.max(rowData.range ? rowData.range.start.row : 0, 0);
  var column = 0;
  (0, _nuclideAtomHelpers.goToLocation)(uri, line, column);
}

var DiagnosticsPane = (function (_React$Component) {
  _inherits(DiagnosticsPane, _React$Component);

  _createClass(DiagnosticsPane, null, [{
    key: 'propTypes',
    value: {
      height: PropTypes.number.isRequired,
      diagnostics: PropTypes.array.isRequired,
      showFileName: PropTypes.bool,
      width: PropTypes.number.isRequired
    },
    enumerable: true
  }]);

  function DiagnosticsPane(props) {
    _classCallCheck(this, DiagnosticsPane);

    _get(Object.getPrototypeOf(DiagnosticsPane.prototype), 'constructor', this).call(this, props);
    this._onColumnResizeEndCallback = this._onColumnResizeEndCallback.bind(this);
    this._rowGetter = this._rowGetter.bind(this);
    this._rowHeightGetter = this._rowHeightGetter.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
    this._getMessageWidth = this._getMessageWidth.bind(this);

    this.state = {
      widths: {
        type: TYPE_COLUMN_WIDTH,
        providerName: PROVIDER_NAME_COLUMN_WIDTH,
        filePath: FILE_PATH_COLUMN_WIDTH,
        range: RANGE_COLUMN_WIDTH
      }
    };
  }

  // A home-made flex function so that we can read the message column width easily.

  _createClass(DiagnosticsPane, [{
    key: '_getMessageWidth',
    value: function _getMessageWidth() {
      return this.props.width - this.state.widths.type - this.state.widths.providerName - (this.props.showFileName ? this.state.widths.filePath : 0) - this.state.widths.range;
    }
  }, {
    key: '_onColumnResizeEndCallback',
    value: function _onColumnResizeEndCallback(newColumnWidth, columnKey) {
      this.setState(function (_ref) {
        var widths = _ref.widths;
        return {
          widths: _extends({}, widths, _defineProperty({}, columnKey, newColumnWidth))
        };
      });
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
    key: '_renderHeader',
    value: function _renderHeader(label, cellDataKey) {
      // TODO(ehzhang): Figure out why an onClick added to this <span> does not fire.
      return React.createElement(
        'span',
        null,
        label
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var fileColumn = null;
      if (this.props.showFileName) {
        fileColumn = React.createElement(Column, {
          align: 'left',
          cellDataGetter: fileColumnCellDataGetter,
          cellRenderer: plainTextColumnCellRenderer,
          dataKey: 'filePath',
          headerRenderer: this._renderHeader,
          isResizable: true,
          label: 'File',
          width: this.state.widths.filePath
        });
      }
      return React.createElement(
        Table,
        {
          height: this.props.height,
          headerHeight: 30,
          isColumnResizing: false,
          onRowClick: onRowClick,
          onColumnResizeEndCallback: this._onColumnResizeEndCallback,
          overflowX: 'hidden',
          overflowY: 'auto',
          ref: 'table',
          rowGetter: this._rowGetter,
          rowHeight: DEFAULT_LINE_TEXT_HEIGHT + ROW_VERTICAL_PADDING,
          rowHeightGetter: this._rowHeightGetter,
          rowsCount: this.props.diagnostics.length,
          width: this.props.width },
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: typeColumnCellDataGetter,
          cellRenderer: typeColumnCellRenderer,
          dataKey: 'type',
          isResizable: true,
          label: 'Type',
          width: this.state.widths.type
        }),
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: sourceColumnCellDataGetter,
          cellRenderer: plainTextColumnCellRenderer,
          dataKey: 'providerName',
          isResizable: true,
          label: 'Source',
          width: this.state.widths.providerName
        }),
        fileColumn,
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: locationColumnCellDataGetter,
          cellRenderer: plainTextColumnCellRenderer,
          dataKey: 'range',
          isResizable: true,
          label: 'Line',
          width: this.state.widths.range
        }),
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: messageColumnCellDataGetter,
          cellRenderer: messageColumnCellRenderer,
          dataKey: 'message',
          label: 'Description',
          width: this._getMessageWidth()
        })
      );
    }
  }]);

  return DiagnosticsPane;
})(React.Component);

module.exports = DiagnosticsPane;
//# sourceMappingURL=data:application/json;base64,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QUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkRpYWdub3N0aWNzUGFuZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaWFnbm9zdGljTWVzc2FnZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1iYXNlJztcblxuY29uc3Qge0NvbHVtbiwgVGFibGV9ID0gcmVxdWlyZSgnZml4ZWQtZGF0YS10YWJsZScpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge2dvVG9Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuXG5jb25zdCB7ZmlsZUNvbHVtbkNlbGxEYXRhR2V0dGVyfSA9IHJlcXVpcmUoJy4vcGFuZVV0aWxzJyk7XG5cbnR5cGUgdGV4dEFuZFR5cGUgPSB7dGV4dDogc3RyaW5nOyBpc1BsYWluVGV4dDogYm9vbGVhbn07XG5cbmNvbnN0IERFRkFVTFRfTElORV9URVhUX0hFSUdIVCA9IDE1O1xuY29uc3QgUElYRUxTX1BFUl9DSEFSID0gNjtcbmNvbnN0IE1BWF9ST1dfTElORVMgPSAzO1xuY29uc3QgUk9XX0hPUklaT05UQUxfUEFERElORyA9IDE2O1xuY29uc3QgUk9XX1ZFUlRJQ0FMX1BBRERJTkcgPSA4O1xuXG5jb25zdCBUWVBFX0NPTFVNTl9XSURUSCA9IDc1O1xuY29uc3QgUFJPVklERVJfTkFNRV9DT0xVTU5fV0lEVEggPSAxNzU7XG5jb25zdCBGSUxFX1BBVEhfQ09MVU1OX1dJRFRIID0gMzAwO1xuY29uc3QgUkFOR0VfQ09MVU1OX1dJRFRIID0gNTA7XG5cbmNvbnN0IFR5cGVUb0hpZ2hsaWdodENsYXNzTmFtZSA9IE9iamVjdC5mcmVlemUoe1xuICBFUlJPUjogJ2hpZ2hsaWdodC1lcnJvcicsXG4gIFdBUk5JTkc6ICdoaWdobGlnaHQtd2FybmluZycsXG59KTtcblxuZnVuY3Rpb24gbG9jYXRpb25Db2x1bW5DZWxsRGF0YUdldHRlcihjZWxsRGF0YUtleTogJ3JhbmdlJywgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICByZXR1cm4gZGlhZ25vc3RpYy5yYW5nZSA/IChkaWFnbm9zdGljLnJhbmdlLnN0YXJ0LnJvdyArIDEpLnRvU3RyaW5nKCkgOiAnJztcbn1cblxuZnVuY3Rpb24gdHlwZUNvbHVtbkNlbGxEYXRhR2V0dGVyKGNlbGxEYXRhS2V5OiAndHlwZScsIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRpYWdub3N0aWMudHlwZTtcbn1cblxuZnVuY3Rpb24gc291cmNlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoXG4gIGNlbGxEYXRhS2V5OiAncHJvdmlkZXJOYW1lJyxcbiAgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHN0cmluZyB7XG4gIHJldHVybiBkaWFnbm9zdGljLnByb3ZpZGVyTmFtZTtcbn1cblxuZnVuY3Rpb24gcGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyKHRleHQ6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gIC8vIEZvciBjb25zaXN0ZW5jeSB3aXRoIG1lc3NhZ2VDb2x1bW5DZWxsRGF0YUdldHRlcigpLCByZW5kZXIgcGxhaW50ZXh0IGluIGEgPHNwYW4+IHNvIHRoYXRcbiAgLy8gZXZlcnl0aGluZyBsaW5lcyB1cC5cbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZml4ZWQtZGF0YS1jZWxsXCI+e3RleHR9PC9zcGFuPjtcbn1cblxuZnVuY3Rpb24gdHlwZUNvbHVtbkNlbGxSZW5kZXJlcih0ZXh0OiBzdHJpbmcpOiBSZWFjdEVsZW1lbnQge1xuICBjb25zdCBoaWdobGlnaHRDbGFzc05hbWUgPSBUeXBlVG9IaWdobGlnaHRDbGFzc05hbWVbdGV4dC50b1VwcGVyQ2FzZSgpXSB8fCAnaGlnaGxpZ2h0JztcbiAgcmV0dXJuIChcbiAgICA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWZpeGVkLWRhdGEtY2VsbFwiPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtoaWdobGlnaHRDbGFzc05hbWV9PlxuICAgICAgICB7dGV4dH1cbiAgICAgIDwvc3Bhbj5cbiAgICA8L3NwYW4+XG4gICk7XG59XG5cbi8qKiBAcmV0dXJuIHRleHQgYW5kIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgaXQgaXMgcGxhaW50ZXh0IG9yIEhUTUwuICovXG5mdW5jdGlvbiBtZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoXG4gIGNlbGxEYXRhS2V5OiAnbWVzc2FnZScsXG4gIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlXG4pOiB0ZXh0QW5kVHlwZSB7XG4gIGxldCB0ZXh0ID0gJyc7XG4gIGxldCBpc1BsYWluVGV4dCA9IHRydWU7XG4gIGNvbnN0IHRyYWNlcyA9IGRpYWdub3N0aWMudHJhY2UgfHwgW107XG4gIGNvbnN0IGFsbE1lc3NhZ2VzOiBBcnJheTx7aHRtbD86IHN0cmluZzsgdGV4dD86IHN0cmluZ30+ID0gW2RpYWdub3N0aWMsIC4uLnRyYWNlc107XG4gIGZvciAoY29uc3QgbWVzc2FnZSBvZiBhbGxNZXNzYWdlcykge1xuICAgIGlmIChtZXNzYWdlLmh0bWwgIT0gbnVsbCkge1xuICAgICAgdGV4dCArPSBtZXNzYWdlLmh0bWwgKyAnICc7XG4gICAgICBpc1BsYWluVGV4dCA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAobWVzc2FnZS50ZXh0ICE9IG51bGwpIHtcbiAgICAgIHRleHQgKz0gbWVzc2FnZS50ZXh0ICsgJyAnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5laXRoZXIgdGV4dCBub3IgaHRtbCBwcm9wZXJ0eSBkZWZpbmVkIG9uOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgdGV4dDogdGV4dC50cmltKCksXG4gICAgaXNQbGFpblRleHQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1lc3NhZ2VDb2x1bW5DZWxsUmVuZGVyZXIobWVzc2FnZTogdGV4dEFuZFR5cGUpOiBSZWFjdEVsZW1lbnQge1xuICBpZiAobWVzc2FnZS5pc1BsYWluVGV4dCkge1xuICAgIHJldHVybiBwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXIobWVzc2FnZS50ZXh0KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1maXhlZC1kYXRhLWNlbGxcIiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogbWVzc2FnZS50ZXh0fX0gLz5cbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uUm93Q2xpY2soXG4gIGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50LFxuICByb3dJbmRleDogbnVtYmVyLFxuICByb3dEYXRhOiBEaWFnbm9zdGljTWVzc2FnZVxuKTogdm9pZCB7XG4gIGlmIChyb3dEYXRhLnNjb3BlICE9PSAnZmlsZScgfHwgcm93RGF0YS5maWxlUGF0aCA9PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdHJhY2soJ2RpYWdub3N0aWNzLXBhbmVsLWdvdG8tbG9jYXRpb24nKTtcblxuICBjb25zdCB1cmkgPSByb3dEYXRhLmZpbGVQYXRoO1xuICAvLyBJZiBpbml0aWFsTGluZSBpcyBOLCBBdG9tIHdpbGwgbmF2aWdhdGUgdG8gbGluZSBOKzEuXG4gIC8vIEZsb3cgc29tZXRpbWVzIHJlcG9ydHMgYSByb3cgb2YgLTEsIHNvIHRoaXMgZW5zdXJlcyB0aGUgbGluZSBpcyBhdCBsZWFzdCBvbmUuXG4gIGNvbnN0IGxpbmUgPSBNYXRoLm1heChyb3dEYXRhLnJhbmdlID8gcm93RGF0YS5yYW5nZS5zdGFydC5yb3cgOiAwLCAwKTtcbiAgY29uc3QgY29sdW1uID0gMDtcbiAgZ29Ub0xvY2F0aW9uKHVyaSwgbGluZSwgY29sdW1uKTtcbn1cblxuY2xhc3MgRGlhZ25vc3RpY3NQYW5lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBkaWFnbm9zdGljczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgc2hvd0ZpbGVOYW1lOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB3aWR0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHN0YXRlOiB7d2lkdGhzOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfX07O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25Db2x1bW5SZXNpemVFbmRDYWxsYmFjayA9IHRoaXMuX29uQ29sdW1uUmVzaXplRW5kQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fcm93R2V0dGVyID0gdGhpcy5fcm93R2V0dGVyLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3Jvd0hlaWdodEdldHRlciA9IHRoaXMuX3Jvd0hlaWdodEdldHRlci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9yZW5kZXJIZWFkZXIgPSB0aGlzLl9yZW5kZXJIZWFkZXIuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fZ2V0TWVzc2FnZVdpZHRoID0gdGhpcy5fZ2V0TWVzc2FnZVdpZHRoLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgd2lkdGhzOiB7XG4gICAgICAgIHR5cGU6IFRZUEVfQ09MVU1OX1dJRFRILFxuICAgICAgICBwcm92aWRlck5hbWU6IFBST1ZJREVSX05BTUVfQ09MVU1OX1dJRFRILFxuICAgICAgICBmaWxlUGF0aDogRklMRV9QQVRIX0NPTFVNTl9XSURUSCxcbiAgICAgICAgcmFuZ2U6IFJBTkdFX0NPTFVNTl9XSURUSCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8vIEEgaG9tZS1tYWRlIGZsZXggZnVuY3Rpb24gc28gdGhhdCB3ZSBjYW4gcmVhZCB0aGUgbWVzc2FnZSBjb2x1bW4gd2lkdGggZWFzaWx5LlxuICBfZ2V0TWVzc2FnZVdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMud2lkdGhcbiAgICAgIC0gdGhpcy5zdGF0ZS53aWR0aHMudHlwZVxuICAgICAgLSB0aGlzLnN0YXRlLndpZHRocy5wcm92aWRlck5hbWVcbiAgICAgIC0gKHRoaXMucHJvcHMuc2hvd0ZpbGVOYW1lID8gdGhpcy5zdGF0ZS53aWR0aHMuZmlsZVBhdGggOiAwKVxuICAgICAgLSB0aGlzLnN0YXRlLndpZHRocy5yYW5nZTtcbiAgfVxuXG4gIF9vbkNvbHVtblJlc2l6ZUVuZENhbGxiYWNrKG5ld0NvbHVtbldpZHRoOiBudW1iZXIsIGNvbHVtbktleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSgoe3dpZHRoc30pID0+ICh7XG4gICAgICB3aWR0aHM6IHtcbiAgICAgICAgLi4ud2lkdGhzLFxuICAgICAgICBbY29sdW1uS2V5XTogbmV3Q29sdW1uV2lkdGgsXG4gICAgICB9LFxuICAgIH0pKTtcbiAgfVxuXG4gIF9yb3dHZXR0ZXIocm93SW5kZXg6IG51bWJlcik6IERpYWdub3N0aWNNZXNzYWdlIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5kaWFnbm9zdGljc1tyb3dJbmRleF07XG4gIH1cblxuICBfcm93SGVpZ2h0R2V0dGVyKHJvd0luZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGNvbnN0IGRpYWdub3N0aWMgPSB0aGlzLl9yb3dHZXR0ZXIocm93SW5kZXgpO1xuICAgIGNvbnN0IHt0ZXh0OiBtZXNzYWdlfSA9IG1lc3NhZ2VDb2x1bW5DZWxsRGF0YUdldHRlcignbWVzc2FnZScsIGRpYWdub3N0aWMpO1xuICAgIGNvbnN0IG1lc3NhZ2VDaGFyc1BlclJvdyA9ICh0aGlzLl9nZXRNZXNzYWdlV2lkdGgoKSAtIFJPV19IT1JJWk9OVEFMX1BBRERJTkcpIC8gUElYRUxTX1BFUl9DSEFSO1xuICAgIGNvbnN0IG1lc3NhZ2VMaW5lc09mVGV4dCA9IE1hdGguZmxvb3IobWVzc2FnZS5sZW5ndGggLyBtZXNzYWdlQ2hhcnNQZXJSb3cpICsgMTtcbiAgICBjb25zdCBtZXNzYWdlTWF4TGluZXNPZlRleHQgPSBNYXRoLm1pbihNQVhfUk9XX0xJTkVTLCBtZXNzYWdlTGluZXNPZlRleHQpO1xuICAgIHJldHVybiBtZXNzYWdlTWF4TGluZXNPZlRleHQgKiBERUZBVUxUX0xJTkVfVEVYVF9IRUlHSFQgKyBST1dfVkVSVElDQUxfUEFERElORztcbiAgfVxuXG4gIF9yZW5kZXJIZWFkZXIobGFiZWw6ID9zdHJpbmcsIGNlbGxEYXRhS2V5OiBzdHJpbmcpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIFRPRE8oZWh6aGFuZyk6IEZpZ3VyZSBvdXQgd2h5IGFuIG9uQ2xpY2sgYWRkZWQgdG8gdGhpcyA8c3Bhbj4gZG9lcyBub3QgZmlyZS5cbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4+e2xhYmVsfTwvc3Bhbj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgbGV0IGZpbGVDb2x1bW4gPSBudWxsO1xuICAgIGlmICh0aGlzLnByb3BzLnNob3dGaWxlTmFtZSkge1xuICAgICAgZmlsZUNvbHVtbiA9IChcbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e2ZpbGVDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwiZmlsZVBhdGhcIlxuICAgICAgICAgIGhlYWRlclJlbmRlcmVyPXt0aGlzLl9yZW5kZXJIZWFkZXJ9XG4gICAgICAgICAgaXNSZXNpemFibGU9e3RydWV9XG4gICAgICAgICAgbGFiZWw9XCJGaWxlXCJcbiAgICAgICAgICB3aWR0aD17dGhpcy5zdGF0ZS53aWR0aHMuZmlsZVBhdGh9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPFRhYmxlXG4gICAgICAgIGhlaWdodD17dGhpcy5wcm9wcy5oZWlnaHR9XG4gICAgICAgIGhlYWRlckhlaWdodD17MzB9XG4gICAgICAgIGlzQ29sdW1uUmVzaXppbmc9e2ZhbHNlfVxuICAgICAgICBvblJvd0NsaWNrPXtvblJvd0NsaWNrfVxuICAgICAgICBvbkNvbHVtblJlc2l6ZUVuZENhbGxiYWNrPXt0aGlzLl9vbkNvbHVtblJlc2l6ZUVuZENhbGxiYWNrfVxuICAgICAgICBvdmVyZmxvd1g9XCJoaWRkZW5cIlxuICAgICAgICBvdmVyZmxvd1k9XCJhdXRvXCJcbiAgICAgICAgcmVmPVwidGFibGVcIlxuICAgICAgICByb3dHZXR0ZXI9e3RoaXMuX3Jvd0dldHRlcn1cbiAgICAgICAgcm93SGVpZ2h0PXtERUZBVUxUX0xJTkVfVEVYVF9IRUlHSFQgKyBST1dfVkVSVElDQUxfUEFERElOR31cbiAgICAgICAgcm93SGVpZ2h0R2V0dGVyPXt0aGlzLl9yb3dIZWlnaHRHZXR0ZXJ9XG4gICAgICAgIHJvd3NDb3VudD17dGhpcy5wcm9wcy5kaWFnbm9zdGljcy5sZW5ndGh9XG4gICAgICAgIHdpZHRoPXt0aGlzLnByb3BzLndpZHRofT5cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e3R5cGVDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3R5cGVDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cInR5cGVcIlxuICAgICAgICAgIGlzUmVzaXphYmxlPXt0cnVlfVxuICAgICAgICAgIGxhYmVsPVwiVHlwZVwiXG4gICAgICAgICAgd2lkdGg9e3RoaXMuc3RhdGUud2lkdGhzLnR5cGV9XG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXtzb3VyY2VDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwicHJvdmlkZXJOYW1lXCJcbiAgICAgICAgICBpc1Jlc2l6YWJsZT17dHJ1ZX1cbiAgICAgICAgICBsYWJlbD1cIlNvdXJjZVwiXG4gICAgICAgICAgd2lkdGg9e3RoaXMuc3RhdGUud2lkdGhzLnByb3ZpZGVyTmFtZX1cbiAgICAgICAgLz5cbiAgICAgICAge2ZpbGVDb2x1bW59XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXtsb2NhdGlvbkNvbHVtbkNlbGxEYXRhR2V0dGVyfVxuICAgICAgICAgIGNlbGxSZW5kZXJlcj17cGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJyYW5nZVwiXG4gICAgICAgICAgaXNSZXNpemFibGU9e3RydWV9XG4gICAgICAgICAgbGFiZWw9XCJMaW5lXCJcbiAgICAgICAgICB3aWR0aD17dGhpcy5zdGF0ZS53aWR0aHMucmFuZ2V9XG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXttZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXttZXNzYWdlQ29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJtZXNzYWdlXCJcbiAgICAgICAgICBsYWJlbD1cIkRlc2NyaXB0aW9uXCJcbiAgICAgICAgICB3aWR0aD17dGhpcy5fZ2V0TWVzc2FnZVdpZHRoKCl9XG4gICAgICAgIC8+XG4gICAgICA8L1RhYmxlPlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWFnbm9zdGljc1BhbmU7XG4iXX0=