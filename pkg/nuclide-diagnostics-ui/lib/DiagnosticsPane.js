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

var TypeToHighlightClassName = {
  ERROR: 'highlight-error',
  WARNING: 'highlight-warning'
};

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
//# sourceMappingURL=data:application/json;base64,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IjoiRGlhZ25vc3RpY3NQYW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0RpYWdub3N0aWNNZXNzYWdlfSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuXG5jb25zdCB7Q29sdW1uLCBUYWJsZX0gPSByZXF1aXJlKCdmaXhlZC1kYXRhLXRhYmxlJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7Z29Ub0xvY2F0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5cbmNvbnN0IHtmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9ID0gcmVxdWlyZSgnLi9wYW5lVXRpbHMnKTtcblxudHlwZSB0ZXh0QW5kVHlwZSA9IHt0ZXh0OiBzdHJpbmc7IGlzUGxhaW5UZXh0OiBib29sZWFufTtcblxuY29uc3QgREVGQVVMVF9MSU5FX1RFWFRfSEVJR0hUID0gMTU7XG5jb25zdCBQSVhFTFNfUEVSX0NIQVIgPSA2O1xuY29uc3QgTUFYX1JPV19MSU5FUyA9IDM7XG5jb25zdCBST1dfSE9SSVpPTlRBTF9QQURESU5HID0gMTY7XG5jb25zdCBST1dfVkVSVElDQUxfUEFERElORyA9IDg7XG5cbmNvbnN0IFRZUEVfQ09MVU1OX1dJRFRIID0gNzU7XG5jb25zdCBQUk9WSURFUl9OQU1FX0NPTFVNTl9XSURUSCA9IDE3NTtcbmNvbnN0IEZJTEVfUEFUSF9DT0xVTU5fV0lEVEggPSAzMDA7XG5jb25zdCBSQU5HRV9DT0xVTU5fV0lEVEggPSA1MDtcblxuY29uc3QgVHlwZVRvSGlnaGxpZ2h0Q2xhc3NOYW1lID0ge1xuICBFUlJPUjogJ2hpZ2hsaWdodC1lcnJvcicsXG4gIFdBUk5JTkc6ICdoaWdobGlnaHQtd2FybmluZycsXG59O1xuXG5mdW5jdGlvbiBsb2NhdGlvbkNvbHVtbkNlbGxEYXRhR2V0dGVyKGNlbGxEYXRhS2V5OiAncmFuZ2UnLCBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIHJldHVybiBkaWFnbm9zdGljLnJhbmdlID8gKGRpYWdub3N0aWMucmFuZ2Uuc3RhcnQucm93ICsgMSkudG9TdHJpbmcoKSA6ICcnO1xufVxuXG5mdW5jdGlvbiB0eXBlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoY2VsbERhdGFLZXk6ICd0eXBlJywgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICByZXR1cm4gZGlhZ25vc3RpYy50eXBlO1xufVxuXG5mdW5jdGlvbiBzb3VyY2VDb2x1bW5DZWxsRGF0YUdldHRlcihcbiAgY2VsbERhdGFLZXk6ICdwcm92aWRlck5hbWUnLFxuICBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZVxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRpYWdub3N0aWMucHJvdmlkZXJOYW1lO1xufVxuXG5mdW5jdGlvbiBwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXIodGV4dDogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgLy8gRm9yIGNvbnNpc3RlbmN5IHdpdGggbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCksIHJlbmRlciBwbGFpbnRleHQgaW4gYSA8c3Bhbj4gc28gdGhhdFxuICAvLyBldmVyeXRoaW5nIGxpbmVzIHVwLlxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1maXhlZC1kYXRhLWNlbGxcIj57dGV4dH08L3NwYW4+O1xufVxuXG5mdW5jdGlvbiB0eXBlQ29sdW1uQ2VsbFJlbmRlcmVyKHRleHQ6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IGhpZ2hsaWdodENsYXNzTmFtZSA9IFR5cGVUb0hpZ2hsaWdodENsYXNzTmFtZVt0ZXh0LnRvVXBwZXJDYXNlKCldIHx8ICdoaWdobGlnaHQnO1xuICByZXR1cm4gKFxuICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZml4ZWQtZGF0YS1jZWxsXCI+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2hpZ2hsaWdodENsYXNzTmFtZX0+XG4gICAgICAgIHt0ZXh0fVxuICAgICAgPC9zcGFuPlxuICAgIDwvc3Bhbj5cbiAgKTtcbn1cblxuLyoqIEByZXR1cm4gdGV4dCBhbmQgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciBpdCBpcyBwbGFpbnRleHQgb3IgSFRNTC4gKi9cbmZ1bmN0aW9uIG1lc3NhZ2VDb2x1bW5DZWxsRGF0YUdldHRlcihcbiAgY2VsbERhdGFLZXk6ICdtZXNzYWdlJyxcbiAgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHRleHRBbmRUeXBlIHtcbiAgbGV0IHRleHQgPSAnJztcbiAgbGV0IGlzUGxhaW5UZXh0ID0gdHJ1ZTtcbiAgY29uc3QgdHJhY2VzID0gZGlhZ25vc3RpYy50cmFjZSB8fCBbXTtcbiAgY29uc3QgYWxsTWVzc2FnZXM6IEFycmF5PHtodG1sPzogc3RyaW5nOyB0ZXh0Pzogc3RyaW5nfT4gPSBbZGlhZ25vc3RpYywgLi4udHJhY2VzXTtcbiAgZm9yIChjb25zdCBtZXNzYWdlIG9mIGFsbE1lc3NhZ2VzKSB7XG4gICAgaWYgKG1lc3NhZ2UuaHRtbCAhPSBudWxsKSB7XG4gICAgICB0ZXh0ICs9IG1lc3NhZ2UuaHRtbCArICcgJztcbiAgICAgIGlzUGxhaW5UZXh0ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlLnRleHQgIT0gbnVsbCkge1xuICAgICAgdGV4dCArPSBtZXNzYWdlLnRleHQgKyAnICc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmVpdGhlciB0ZXh0IG5vciBodG1sIHByb3BlcnR5IGRlZmluZWQgb246ICR7bWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB0ZXh0OiB0ZXh0LnRyaW0oKSxcbiAgICBpc1BsYWluVGV4dCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWVzc2FnZUNvbHVtbkNlbGxSZW5kZXJlcihtZXNzYWdlOiB0ZXh0QW5kVHlwZSk6IFJlYWN0RWxlbWVudCB7XG4gIGlmIChtZXNzYWdlLmlzUGxhaW5UZXh0KSB7XG4gICAgcmV0dXJuIHBsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcihtZXNzYWdlLnRleHQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWZpeGVkLWRhdGEtY2VsbFwiIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBtZXNzYWdlLnRleHR9fSAvPlxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25Sb3dDbGljayhcbiAgZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQsXG4gIHJvd0luZGV4OiBudW1iZXIsXG4gIHJvd0RhdGE6IERpYWdub3N0aWNNZXNzYWdlXG4pOiB2b2lkIHtcbiAgaWYgKHJvd0RhdGEuc2NvcGUgIT09ICdmaWxlJyB8fCByb3dEYXRhLmZpbGVQYXRoID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cmFjaygnZGlhZ25vc3RpY3MtcGFuZWwtZ290by1sb2NhdGlvbicpO1xuXG4gIGNvbnN0IHVyaSA9IHJvd0RhdGEuZmlsZVBhdGg7XG4gIC8vIElmIGluaXRpYWxMaW5lIGlzIE4sIEF0b20gd2lsbCBuYXZpZ2F0ZSB0byBsaW5lIE4rMS5cbiAgLy8gRmxvdyBzb21ldGltZXMgcmVwb3J0cyBhIHJvdyBvZiAtMSwgc28gdGhpcyBlbnN1cmVzIHRoZSBsaW5lIGlzIGF0IGxlYXN0IG9uZS5cbiAgY29uc3QgbGluZSA9IE1hdGgubWF4KHJvd0RhdGEucmFuZ2UgPyByb3dEYXRhLnJhbmdlLnN0YXJ0LnJvdyA6IDAsIDApO1xuICBjb25zdCBjb2x1bW4gPSAwO1xuICBnb1RvTG9jYXRpb24odXJpLCBsaW5lLCBjb2x1bW4pO1xufVxuXG5jbGFzcyBEaWFnbm9zdGljc1BhbmUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGhlaWdodDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGRpYWdub3N0aWNzOiBQcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICBzaG93RmlsZU5hbWU6IFByb3BUeXBlcy5ib29sLFxuICAgIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgc3RhdGU6IHt3aWR0aHM6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9fTs7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNvbHVtblJlc2l6ZUVuZENhbGxiYWNrID0gdGhpcy5fb25Db2x1bW5SZXNpemVFbmRDYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9yb3dHZXR0ZXIgPSB0aGlzLl9yb3dHZXR0ZXIuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fcm93SGVpZ2h0R2V0dGVyID0gdGhpcy5fcm93SGVpZ2h0R2V0dGVyLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3JlbmRlckhlYWRlciA9IHRoaXMuX3JlbmRlckhlYWRlci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9nZXRNZXNzYWdlV2lkdGggPSB0aGlzLl9nZXRNZXNzYWdlV2lkdGguYmluZCh0aGlzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB3aWR0aHM6IHtcbiAgICAgICAgdHlwZTogVFlQRV9DT0xVTU5fV0lEVEgsXG4gICAgICAgIHByb3ZpZGVyTmFtZTogUFJPVklERVJfTkFNRV9DT0xVTU5fV0lEVEgsXG4gICAgICAgIGZpbGVQYXRoOiBGSUxFX1BBVEhfQ09MVU1OX1dJRFRILFxuICAgICAgICByYW5nZTogUkFOR0VfQ09MVU1OX1dJRFRILFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLy8gQSBob21lLW1hZGUgZmxleCBmdW5jdGlvbiBzbyB0aGF0IHdlIGNhbiByZWFkIHRoZSBtZXNzYWdlIGNvbHVtbiB3aWR0aCBlYXNpbHkuXG4gIF9nZXRNZXNzYWdlV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy53aWR0aFxuICAgICAgLSB0aGlzLnN0YXRlLndpZHRocy50eXBlXG4gICAgICAtIHRoaXMuc3RhdGUud2lkdGhzLnByb3ZpZGVyTmFtZVxuICAgICAgLSAodGhpcy5wcm9wcy5zaG93RmlsZU5hbWUgPyB0aGlzLnN0YXRlLndpZHRocy5maWxlUGF0aCA6IDApXG4gICAgICAtIHRoaXMuc3RhdGUud2lkdGhzLnJhbmdlO1xuICB9XG5cbiAgX29uQ29sdW1uUmVzaXplRW5kQ2FsbGJhY2sobmV3Q29sdW1uV2lkdGg6IG51bWJlciwgY29sdW1uS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKCh7d2lkdGhzfSkgPT4gKHtcbiAgICAgIHdpZHRoczoge1xuICAgICAgICAuLi53aWR0aHMsXG4gICAgICAgIFtjb2x1bW5LZXldOiBuZXdDb2x1bW5XaWR0aCxcbiAgICAgIH0sXG4gICAgfSkpO1xuICB9XG5cbiAgX3Jvd0dldHRlcihyb3dJbmRleDogbnVtYmVyKTogRGlhZ25vc3RpY01lc3NhZ2Uge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmRpYWdub3N0aWNzW3Jvd0luZGV4XTtcbiAgfVxuXG4gIF9yb3dIZWlnaHRHZXR0ZXIocm93SW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gICAgY29uc3QgZGlhZ25vc3RpYyA9IHRoaXMuX3Jvd0dldHRlcihyb3dJbmRleCk7XG4gICAgY29uc3Qge3RleHQ6IG1lc3NhZ2V9ID0gbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCdtZXNzYWdlJywgZGlhZ25vc3RpYyk7XG4gICAgY29uc3QgbWVzc2FnZUNoYXJzUGVyUm93ID0gKHRoaXMuX2dldE1lc3NhZ2VXaWR0aCgpIC0gUk9XX0hPUklaT05UQUxfUEFERElORykgLyBQSVhFTFNfUEVSX0NIQVI7XG4gICAgY29uc3QgbWVzc2FnZUxpbmVzT2ZUZXh0ID0gTWF0aC5mbG9vcihtZXNzYWdlLmxlbmd0aCAvIG1lc3NhZ2VDaGFyc1BlclJvdykgKyAxO1xuICAgIGNvbnN0IG1lc3NhZ2VNYXhMaW5lc09mVGV4dCA9IE1hdGgubWluKE1BWF9ST1dfTElORVMsIG1lc3NhZ2VMaW5lc09mVGV4dCk7XG4gICAgcmV0dXJuIG1lc3NhZ2VNYXhMaW5lc09mVGV4dCAqIERFRkFVTFRfTElORV9URVhUX0hFSUdIVCArIFJPV19WRVJUSUNBTF9QQURESU5HO1xuICB9XG5cbiAgX3JlbmRlckhlYWRlcihsYWJlbDogP3N0cmluZywgY2VsbERhdGFLZXk6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gVE9ETyhlaHpoYW5nKTogRmlndXJlIG91dCB3aHkgYW4gb25DbGljayBhZGRlZCB0byB0aGlzIDxzcGFuPiBkb2VzIG5vdCBmaXJlLlxuICAgIHJldHVybiAoXG4gICAgICA8c3Bhbj57bGFiZWx9PC9zcGFuPlxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgZmlsZUNvbHVtbiA9IG51bGw7XG4gICAgaWYgKHRoaXMucHJvcHMuc2hvd0ZpbGVOYW1lKSB7XG4gICAgICBmaWxlQ29sdW1uID0gKFxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgYWxpZ249XCJsZWZ0XCJcbiAgICAgICAgICBjZWxsRGF0YUdldHRlcj17ZmlsZUNvbHVtbkNlbGxEYXRhR2V0dGVyfVxuICAgICAgICAgIGNlbGxSZW5kZXJlcj17cGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJmaWxlUGF0aFwiXG4gICAgICAgICAgaGVhZGVyUmVuZGVyZXI9e3RoaXMuX3JlbmRlckhlYWRlcn1cbiAgICAgICAgICBpc1Jlc2l6YWJsZT17dHJ1ZX1cbiAgICAgICAgICBsYWJlbD1cIkZpbGVcIlxuICAgICAgICAgIHdpZHRoPXt0aGlzLnN0YXRlLndpZHRocy5maWxlUGF0aH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8VGFibGVcbiAgICAgICAgaGVpZ2h0PXt0aGlzLnByb3BzLmhlaWdodH1cbiAgICAgICAgaGVhZGVySGVpZ2h0PXszMH1cbiAgICAgICAgaXNDb2x1bW5SZXNpemluZz17ZmFsc2V9XG4gICAgICAgIG9uUm93Q2xpY2s9e29uUm93Q2xpY2t9XG4gICAgICAgIG9uQ29sdW1uUmVzaXplRW5kQ2FsbGJhY2s9e3RoaXMuX29uQ29sdW1uUmVzaXplRW5kQ2FsbGJhY2t9XG4gICAgICAgIG92ZXJmbG93WD1cImhpZGRlblwiXG4gICAgICAgIG92ZXJmbG93WT1cImF1dG9cIlxuICAgICAgICByZWY9XCJ0YWJsZVwiXG4gICAgICAgIHJvd0dldHRlcj17dGhpcy5fcm93R2V0dGVyfVxuICAgICAgICByb3dIZWlnaHQ9e0RFRkFVTFRfTElORV9URVhUX0hFSUdIVCArIFJPV19WRVJUSUNBTF9QQURESU5HfVxuICAgICAgICByb3dIZWlnaHRHZXR0ZXI9e3RoaXMuX3Jvd0hlaWdodEdldHRlcn1cbiAgICAgICAgcm93c0NvdW50PXt0aGlzLnByb3BzLmRpYWdub3N0aWNzLmxlbmd0aH1cbiAgICAgICAgd2lkdGg9e3RoaXMucHJvcHMud2lkdGh9PlxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgYWxpZ249XCJsZWZ0XCJcbiAgICAgICAgICBjZWxsRGF0YUdldHRlcj17dHlwZUNvbHVtbkNlbGxEYXRhR2V0dGVyfVxuICAgICAgICAgIGNlbGxSZW5kZXJlcj17dHlwZUNvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwidHlwZVwiXG4gICAgICAgICAgaXNSZXNpemFibGU9e3RydWV9XG4gICAgICAgICAgbGFiZWw9XCJUeXBlXCJcbiAgICAgICAgICB3aWR0aD17dGhpcy5zdGF0ZS53aWR0aHMudHlwZX1cbiAgICAgICAgLz5cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e3NvdXJjZUNvbHVtbkNlbGxEYXRhR2V0dGVyfVxuICAgICAgICAgIGNlbGxSZW5kZXJlcj17cGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJwcm92aWRlck5hbWVcIlxuICAgICAgICAgIGlzUmVzaXphYmxlPXt0cnVlfVxuICAgICAgICAgIGxhYmVsPVwiU291cmNlXCJcbiAgICAgICAgICB3aWR0aD17dGhpcy5zdGF0ZS53aWR0aHMucHJvdmlkZXJOYW1lfVxuICAgICAgICAvPlxuICAgICAgICB7ZmlsZUNvbHVtbn1cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e2xvY2F0aW9uQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXtwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cInJhbmdlXCJcbiAgICAgICAgICBpc1Jlc2l6YWJsZT17dHJ1ZX1cbiAgICAgICAgICBsYWJlbD1cIkxpbmVcIlxuICAgICAgICAgIHdpZHRoPXt0aGlzLnN0YXRlLndpZHRocy5yYW5nZX1cbiAgICAgICAgLz5cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e21lc3NhZ2VDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e21lc3NhZ2VDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cIm1lc3NhZ2VcIlxuICAgICAgICAgIGxhYmVsPVwiRGVzY3JpcHRpb25cIlxuICAgICAgICAgIHdpZHRoPXt0aGlzLl9nZXRNZXNzYWdlV2lkdGgoKX1cbiAgICAgICAgLz5cbiAgICAgIDwvVGFibGU+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdub3N0aWNzUGFuZTtcbiJdfQ==