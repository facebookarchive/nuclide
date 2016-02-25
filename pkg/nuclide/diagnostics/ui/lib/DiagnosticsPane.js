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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _analytics = require('../../../analytics');

var _require = require('fixed-data-table');

var Column = _require.Column;
var Table = _require.Table;

var _require2 = require('react-for-atom');

var React = _require2.React;
var PropTypes = React.PropTypes;

var _require3 = require('./paneUtils');

var fileColumnCellDataGetter = _require3.fileColumnCellDataGetter;
var getProjectRelativePathOfDiagnostic = _require3.getProjectRelativePathOfDiagnostic;

var DEFAULT_LINE_TEXT_HEIGHT = 15;
var DESCRIPTION_COLUMN_FLEX_GROW = 3;
var DESCRIPTION_COLUMN_WIDTH = 100;
var FILE_COLUMN_FLEX_GROW = 2;
var FILE_COLUMN_WIDTH = 100;
var LINE_COLUMN_WIDTH = 100;
var PIXELS_PER_CHAR = 6;
var ROW_HORIZONTAL_PADDING = 16; // 8px left and right padding.
var ROW_VERTICAL_PADDING = 16; // 8px top and bottom padding.
var SOURCE_COLUMN_WIDTH = 175;
var TYPE_COLUMN_WIDTH = 100;

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

  (0, _analytics.track)('diagnostics-panel-goto-location');

  var uri = rowData.filePath;
  var options = {
    searchAllPanes: true,
    // If initialLine is N, Atom will navigate to line N+1.
    // Flow sometimes reports a row of -1, so this ensures the line is at least one.
    initialLine: Math.max(rowData.range ? rowData.range.start.row : 0, 0)
  };
  atom.workspace.open(uri, options);
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
    this._rowGetter = this._rowGetter.bind(this);
    this._rowHeightGetter = this._rowHeightGetter.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
  }

  _createClass(DiagnosticsPane, [{
    key: '_rowGetter',
    value: function _rowGetter(rowIndex) {
      return this.props.diagnostics[rowIndex];
    }
  }, {
    key: '_rowHeightGetter',
    value: function _rowHeightGetter(rowIndex) {
      var tableWidth = this.props.width;
      var diagnostic = this._rowGetter(rowIndex);
      var filePath = getProjectRelativePathOfDiagnostic(diagnostic);

      var _messageColumnCellDataGetter = messageColumnCellDataGetter('message', diagnostic);

      var message = _messageColumnCellDataGetter.text;

      // Calculate (character) length of description and file respectively.
      var descriptionLength = message.length;
      var fileLength = filePath.length;

      // Calculate (pixel) width of flexible space used by description and file cells.
      var nonFlexWidth = TYPE_COLUMN_WIDTH + SOURCE_COLUMN_WIDTH + LINE_COLUMN_WIDTH;
      var flexWidth = tableWidth - nonFlexWidth;

      // Calculate (pixel) widths of description and file cells respectively.
      var flexGrowTotal = DESCRIPTION_COLUMN_FLEX_GROW + FILE_COLUMN_FLEX_GROW;
      var descriptionWidth = flexWidth * (DESCRIPTION_COLUMN_FLEX_GROW / flexGrowTotal) - ROW_HORIZONTAL_PADDING;
      var fileWidth = flexWidth * (FILE_COLUMN_FLEX_GROW / flexGrowTotal) - ROW_HORIZONTAL_PADDING;

      // Calculate number of characters that fit in one line using cell width.
      var descriptionCharsPerRow = descriptionWidth / PIXELS_PER_CHAR;
      var fileCharsPerRow = fileWidth / PIXELS_PER_CHAR;

      // Calculate number of lines needed using text length and characters per line.
      var descriptionMaxLinesOfText = Math.floor(descriptionLength / descriptionCharsPerRow) + 1;
      var fileMaxLinesOfText = Math.floor(fileLength / fileCharsPerRow) + 1;

      // Set height using the maximum of the two required cell heights.
      var maxNumLinesOfText = Math.max(descriptionMaxLinesOfText, fileMaxLinesOfText);
      return maxNumLinesOfText * DEFAULT_LINE_TEXT_HEIGHT + ROW_VERTICAL_PADDING;
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
      // TODO(ehzhang): Setting isResizable={true} on columns seems to break things pretty badly.
      // Perhaps this is because we are using react-for-atom instead of react?
      var fileColumn = null;
      if (this.props.showFileName) {
        fileColumn = React.createElement(Column, {
          align: 'left',
          cellDataGetter: fileColumnCellDataGetter,
          cellRenderer: plainTextColumnCellRenderer,
          dataKey: 'filePath',
          flexGrow: 2,
          headerRenderer: this._renderHeader,
          label: 'File',
          width: FILE_COLUMN_WIDTH
        });
      }
      return React.createElement(
        Table,
        {
          height: this.props.height,
          headerHeight: 30,
          onRowClick: onRowClick,
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
          label: 'Type',
          width: TYPE_COLUMN_WIDTH
        }),
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: sourceColumnCellDataGetter,
          cellRenderer: plainTextColumnCellRenderer,
          dataKey: 'providerName',
          label: 'Source',
          width: SOURCE_COLUMN_WIDTH
        }),
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: messageColumnCellDataGetter,
          cellRenderer: messageColumnCellRenderer,
          dataKey: 'message',
          flexGrow: 3,
          label: 'Description',
          width: DESCRIPTION_COLUMN_WIDTH
        }),
        fileColumn,
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: locationColumnCellDataGetter,
          cellRenderer: plainTextColumnCellRenderer,
          dataKey: 'range',
          label: 'Line',
          width: LINE_COLUMN_WIDTH
        })
      );
    }
  }]);

  return DiagnosticsPane;
})(React.Component);

module.exports = DiagnosticsPane;
//# sourceMappingURL=data:application/json;base64,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QTJCLEFBQUM7QUFDMUMsaUJBQU8sRUFBQyxjQUFjO0FBQ3RCLGVBQUssRUFBQyxRQUFRO0FBQ2QsZUFBSyxFQUFFLG1CQUFtQixBQUFDO1VBQzNCO1FBQ0Ysb0JBQUMsTUFBTTtBQUNMLGVBQUssRUFBQyxNQUFNO0FBQ1osd0JBQWMsRUFBRSwyQkFBMkIsQUFBQztBQUM1QyxzQkFBWSxFQUFFLHlCQUF5QixBQUFDO0FBQ3hDLGlCQUFPLEVBQUMsU0FBUztBQUNqQixrQkFBUSxFQUFFLENBQUMsQUFBQztBQUNaLGVBQUssRUFBQyxhQUFhO0FBQ25CLGVBQUssRUFBRSx3QkFBd0IsQUFBQztVQUNoQztRQUNELFVBQVU7UUFDWCxvQkFBQyxNQUFNO0FBQ0wsZUFBSyxFQUFDLE1BQU07QUFDWix3QkFBYyxFQUFFLDRCQUE0QixBQUFDO0FBQzdDLHNCQUFZLEVBQUUsMkJBQTJCLEFBQUM7QUFDMUMsaUJBQU8sRUFBQyxPQUFPO0FBQ2YsZUFBSyxFQUFDLE1BQU07QUFDWixlQUFLLEVBQUUsaUJBQWlCLEFBQUM7VUFDekI7T0FDSSxDQUNSO0tBQ0g7OztTQXJJRyxlQUFlO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBd0k3QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljc1BhbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlhZ25vc3RpY01lc3NhZ2V9IGZyb20gJy4uLy4uL2Jhc2UnO1xuXG5jb25zdCB7Q29sdW1uLCBUYWJsZX0gPSByZXF1aXJlKCdmaXhlZC1kYXRhLXRhYmxlJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uLy4uL2FuYWx5dGljcyc7XG5cbmNvbnN0IHtmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIsIGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWN9ID0gcmVxdWlyZSgnLi9wYW5lVXRpbHMnKTtcblxudHlwZSB0ZXh0QW5kVHlwZSA9IHt0ZXh0OiBzdHJpbmc7IGlzUGxhaW5UZXh0OiBib29sZWFufTtcblxuY29uc3QgREVGQVVMVF9MSU5FX1RFWFRfSEVJR0hUID0gMTU7XG5jb25zdCBERVNDUklQVElPTl9DT0xVTU5fRkxFWF9HUk9XID0gMztcbmNvbnN0IERFU0NSSVBUSU9OX0NPTFVNTl9XSURUSCA9IDEwMDtcbmNvbnN0IEZJTEVfQ09MVU1OX0ZMRVhfR1JPVyA9IDI7XG5jb25zdCBGSUxFX0NPTFVNTl9XSURUSCA9IDEwMDtcbmNvbnN0IExJTkVfQ09MVU1OX1dJRFRIID0gMTAwO1xuY29uc3QgUElYRUxTX1BFUl9DSEFSID0gNjtcbmNvbnN0IFJPV19IT1JJWk9OVEFMX1BBRERJTkcgPSAxNjsgLy8gOHB4IGxlZnQgYW5kIHJpZ2h0IHBhZGRpbmcuXG5jb25zdCBST1dfVkVSVElDQUxfUEFERElORyA9IDE2OyAvLyA4cHggdG9wIGFuZCBib3R0b20gcGFkZGluZy5cbmNvbnN0IFNPVVJDRV9DT0xVTU5fV0lEVEggPSAxNzU7XG5jb25zdCBUWVBFX0NPTFVNTl9XSURUSCA9IDEwMDtcblxuY29uc3QgVHlwZVRvSGlnaGxpZ2h0Q2xhc3NOYW1lID0ge1xuICBFUlJPUjogJ2hpZ2hsaWdodC1lcnJvcicsXG4gIFdBUk5JTkc6ICdoaWdobGlnaHQtd2FybmluZycsXG59O1xuXG5mdW5jdGlvbiBsb2NhdGlvbkNvbHVtbkNlbGxEYXRhR2V0dGVyKGNlbGxEYXRhS2V5OiAncmFuZ2UnLCBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIHJldHVybiBkaWFnbm9zdGljLnJhbmdlID8gKGRpYWdub3N0aWMucmFuZ2Uuc3RhcnQucm93ICsgMSkudG9TdHJpbmcoKSA6ICcnO1xufVxuXG5mdW5jdGlvbiB0eXBlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoY2VsbERhdGFLZXk6ICd0eXBlJywgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICByZXR1cm4gZGlhZ25vc3RpYy50eXBlO1xufVxuXG5mdW5jdGlvbiBzb3VyY2VDb2x1bW5DZWxsRGF0YUdldHRlcihcbiAgY2VsbERhdGFLZXk6ICdwcm92aWRlck5hbWUnLFxuICBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZVxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRpYWdub3N0aWMucHJvdmlkZXJOYW1lO1xufVxuXG5mdW5jdGlvbiBwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXIodGV4dDogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgLy8gRm9yIGNvbnNpc3RlbmN5IHdpdGggbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCksIHJlbmRlciBwbGFpbnRleHQgaW4gYSA8c3Bhbj4gc28gdGhhdFxuICAvLyBldmVyeXRoaW5nIGxpbmVzIHVwLlxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1maXhlZC1kYXRhLWNlbGxcIj57dGV4dH08L3NwYW4+O1xufVxuXG5mdW5jdGlvbiB0eXBlQ29sdW1uQ2VsbFJlbmRlcmVyKHRleHQ6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IGhpZ2hsaWdodENsYXNzTmFtZSA9IFR5cGVUb0hpZ2hsaWdodENsYXNzTmFtZVt0ZXh0LnRvVXBwZXJDYXNlKCldIHx8ICdoaWdobGlnaHQnO1xuICByZXR1cm4gKFxuICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZml4ZWQtZGF0YS1jZWxsXCI+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2hpZ2hsaWdodENsYXNzTmFtZX0+XG4gICAgICAgIHt0ZXh0fVxuICAgICAgPC9zcGFuPlxuICAgIDwvc3Bhbj5cbiAgKTtcbn1cblxuLyoqIEByZXR1cm4gdGV4dCBhbmQgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciBpdCBpcyBwbGFpbnRleHQgb3IgSFRNTC4gKi9cbmZ1bmN0aW9uIG1lc3NhZ2VDb2x1bW5DZWxsRGF0YUdldHRlcihcbiAgY2VsbERhdGFLZXk6ICdtZXNzYWdlJyxcbiAgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHRleHRBbmRUeXBlIHtcbiAgbGV0IHRleHQgPSAnJztcbiAgbGV0IGlzUGxhaW5UZXh0ID0gdHJ1ZTtcbiAgY29uc3QgdHJhY2VzID0gZGlhZ25vc3RpYy50cmFjZSB8fCBbXTtcbiAgY29uc3QgYWxsTWVzc2FnZXM6IEFycmF5PHtodG1sPzogc3RyaW5nOyB0ZXh0Pzogc3RyaW5nfT4gPSBbZGlhZ25vc3RpYywgLi4udHJhY2VzXTtcbiAgZm9yIChjb25zdCBtZXNzYWdlIG9mIGFsbE1lc3NhZ2VzKSB7XG4gICAgaWYgKG1lc3NhZ2UuaHRtbCAhPSBudWxsKSB7XG4gICAgICB0ZXh0ICs9IG1lc3NhZ2UuaHRtbCArICcgJztcbiAgICAgIGlzUGxhaW5UZXh0ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlLnRleHQgIT0gbnVsbCkge1xuICAgICAgdGV4dCArPSBtZXNzYWdlLnRleHQgKyAnICc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmVpdGhlciB0ZXh0IG5vciBodG1sIHByb3BlcnR5IGRlZmluZWQgb246ICR7bWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB0ZXh0OiB0ZXh0LnRyaW0oKSxcbiAgICBpc1BsYWluVGV4dCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWVzc2FnZUNvbHVtbkNlbGxSZW5kZXJlcihtZXNzYWdlOiB0ZXh0QW5kVHlwZSk6IFJlYWN0RWxlbWVudCB7XG4gIGlmIChtZXNzYWdlLmlzUGxhaW5UZXh0KSB7XG4gICAgcmV0dXJuIHBsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcihtZXNzYWdlLnRleHQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWZpeGVkLWRhdGEtY2VsbFwiIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBtZXNzYWdlLnRleHR9fSAvPlxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25Sb3dDbGljayhcbiAgZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQsXG4gIHJvd0luZGV4OiBudW1iZXIsXG4gIHJvd0RhdGE6IERpYWdub3N0aWNNZXNzYWdlXG4pOiB2b2lkIHtcbiAgaWYgKHJvd0RhdGEuc2NvcGUgIT09ICdmaWxlJyB8fCByb3dEYXRhLmZpbGVQYXRoID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cmFjaygnZGlhZ25vc3RpY3MtcGFuZWwtZ290by1sb2NhdGlvbicpO1xuXG4gIGNvbnN0IHVyaSA9IHJvd0RhdGEuZmlsZVBhdGg7XG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgLy8gSWYgaW5pdGlhbExpbmUgaXMgTiwgQXRvbSB3aWxsIG5hdmlnYXRlIHRvIGxpbmUgTisxLlxuICAgIC8vIEZsb3cgc29tZXRpbWVzIHJlcG9ydHMgYSByb3cgb2YgLTEsIHNvIHRoaXMgZW5zdXJlcyB0aGUgbGluZSBpcyBhdCBsZWFzdCBvbmUuXG4gICAgaW5pdGlhbExpbmU6IE1hdGgubWF4KHJvd0RhdGEucmFuZ2UgPyByb3dEYXRhLnJhbmdlLnN0YXJ0LnJvdyA6IDAsIDApLFxuICB9O1xuICBhdG9tLndvcmtzcGFjZS5vcGVuKHVyaSwgb3B0aW9ucyk7XG59XG5cbmNsYXNzIERpYWdub3N0aWNzUGFuZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgZGlhZ25vc3RpY3M6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIHNob3dGaWxlTmFtZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogbWl4ZWQpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX3Jvd0dldHRlciA9IHRoaXMuX3Jvd0dldHRlci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9yb3dIZWlnaHRHZXR0ZXIgPSB0aGlzLl9yb3dIZWlnaHRHZXR0ZXIuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fcmVuZGVySGVhZGVyID0gdGhpcy5fcmVuZGVySGVhZGVyLmJpbmQodGhpcyk7XG4gIH1cblxuICBfcm93R2V0dGVyKHJvd0luZGV4OiBudW1iZXIpOiBEaWFnbm9zdGljTWVzc2FnZSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZGlhZ25vc3RpY3Nbcm93SW5kZXhdO1xuICB9XG5cbiAgX3Jvd0hlaWdodEdldHRlcihyb3dJbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBjb25zdCB0YWJsZVdpZHRoID0gdGhpcy5wcm9wcy53aWR0aDtcbiAgICBjb25zdCBkaWFnbm9zdGljID0gdGhpcy5fcm93R2V0dGVyKHJvd0luZGV4KTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWMoZGlhZ25vc3RpYyk7XG4gICAgY29uc3Qge3RleHQ6IG1lc3NhZ2V9ID0gbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCdtZXNzYWdlJywgZGlhZ25vc3RpYyk7XG5cbiAgICAvLyBDYWxjdWxhdGUgKGNoYXJhY3RlcikgbGVuZ3RoIG9mIGRlc2NyaXB0aW9uIGFuZCBmaWxlIHJlc3BlY3RpdmVseS5cbiAgICBjb25zdCBkZXNjcmlwdGlvbkxlbmd0aCA9IG1lc3NhZ2UubGVuZ3RoO1xuICAgIGNvbnN0IGZpbGVMZW5ndGggPSBmaWxlUGF0aC5sZW5ndGg7XG5cbiAgICAvLyBDYWxjdWxhdGUgKHBpeGVsKSB3aWR0aCBvZiBmbGV4aWJsZSBzcGFjZSB1c2VkIGJ5IGRlc2NyaXB0aW9uIGFuZCBmaWxlIGNlbGxzLlxuICAgIGNvbnN0IG5vbkZsZXhXaWR0aCA9XG4gICAgICBUWVBFX0NPTFVNTl9XSURUSCArIFNPVVJDRV9DT0xVTU5fV0lEVEggKyBMSU5FX0NPTFVNTl9XSURUSDtcbiAgICBjb25zdCBmbGV4V2lkdGggPSB0YWJsZVdpZHRoIC0gbm9uRmxleFdpZHRoO1xuXG4gICAgLy8gQ2FsY3VsYXRlIChwaXhlbCkgd2lkdGhzIG9mIGRlc2NyaXB0aW9uIGFuZCBmaWxlIGNlbGxzIHJlc3BlY3RpdmVseS5cbiAgICBjb25zdCBmbGV4R3Jvd1RvdGFsID0gREVTQ1JJUFRJT05fQ09MVU1OX0ZMRVhfR1JPVyArIEZJTEVfQ09MVU1OX0ZMRVhfR1JPVztcbiAgICBjb25zdCBkZXNjcmlwdGlvbldpZHRoID1cbiAgICAgIGZsZXhXaWR0aCAqIChERVNDUklQVElPTl9DT0xVTU5fRkxFWF9HUk9XIC8gZmxleEdyb3dUb3RhbCkgLSBST1dfSE9SSVpPTlRBTF9QQURESU5HO1xuICAgIGNvbnN0IGZpbGVXaWR0aCA9XG4gICAgICBmbGV4V2lkdGggKiAoRklMRV9DT0xVTU5fRkxFWF9HUk9XIC8gZmxleEdyb3dUb3RhbCkgLSBST1dfSE9SSVpPTlRBTF9QQURESU5HO1xuXG4gICAgLy8gQ2FsY3VsYXRlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgZml0IGluIG9uZSBsaW5lIHVzaW5nIGNlbGwgd2lkdGguXG4gICAgY29uc3QgZGVzY3JpcHRpb25DaGFyc1BlclJvdyA9IGRlc2NyaXB0aW9uV2lkdGggLyBQSVhFTFNfUEVSX0NIQVI7XG4gICAgY29uc3QgZmlsZUNoYXJzUGVyUm93ID0gZmlsZVdpZHRoIC8gUElYRUxTX1BFUl9DSEFSO1xuXG4gICAgLy8gQ2FsY3VsYXRlIG51bWJlciBvZiBsaW5lcyBuZWVkZWQgdXNpbmcgdGV4dCBsZW5ndGggYW5kIGNoYXJhY3RlcnMgcGVyIGxpbmUuXG4gICAgY29uc3QgZGVzY3JpcHRpb25NYXhMaW5lc09mVGV4dCA9XG4gICAgICBNYXRoLmZsb29yKGRlc2NyaXB0aW9uTGVuZ3RoIC8gZGVzY3JpcHRpb25DaGFyc1BlclJvdykgKyAxO1xuICAgIGNvbnN0IGZpbGVNYXhMaW5lc09mVGV4dCA9XG4gICAgICBNYXRoLmZsb29yKGZpbGVMZW5ndGggLyBmaWxlQ2hhcnNQZXJSb3cpICsgMTtcblxuICAgIC8vIFNldCBoZWlnaHQgdXNpbmcgdGhlIG1heGltdW0gb2YgdGhlIHR3byByZXF1aXJlZCBjZWxsIGhlaWdodHMuXG4gICAgY29uc3QgbWF4TnVtTGluZXNPZlRleHQgPSBNYXRoLm1heChcbiAgICAgIGRlc2NyaXB0aW9uTWF4TGluZXNPZlRleHQsXG4gICAgICBmaWxlTWF4TGluZXNPZlRleHRcbiAgICApO1xuICAgIHJldHVybiBtYXhOdW1MaW5lc09mVGV4dCAqIERFRkFVTFRfTElORV9URVhUX0hFSUdIVCArIFJPV19WRVJUSUNBTF9QQURESU5HO1xuICB9XG5cbiAgX3JlbmRlckhlYWRlcihsYWJlbDogP3N0cmluZywgY2VsbERhdGFLZXk6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gVE9ETyhlaHpoYW5nKTogRmlndXJlIG91dCB3aHkgYW4gb25DbGljayBhZGRlZCB0byB0aGlzIDxzcGFuPiBkb2VzIG5vdCBmaXJlLlxuICAgIHJldHVybiAoXG4gICAgICA8c3Bhbj57bGFiZWx9PC9zcGFuPlxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBUT0RPKGVoemhhbmcpOiBTZXR0aW5nIGlzUmVzaXphYmxlPXt0cnVlfSBvbiBjb2x1bW5zIHNlZW1zIHRvIGJyZWFrIHRoaW5ncyBwcmV0dHkgYmFkbHkuXG4gICAgLy8gUGVyaGFwcyB0aGlzIGlzIGJlY2F1c2Ugd2UgYXJlIHVzaW5nIHJlYWN0LWZvci1hdG9tIGluc3RlYWQgb2YgcmVhY3Q/XG4gICAgbGV0IGZpbGVDb2x1bW4gPSBudWxsO1xuICAgIGlmICh0aGlzLnByb3BzLnNob3dGaWxlTmFtZSkge1xuICAgICAgZmlsZUNvbHVtbiA9IChcbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e2ZpbGVDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwiZmlsZVBhdGhcIlxuICAgICAgICAgIGZsZXhHcm93PXsyfVxuICAgICAgICAgIGhlYWRlclJlbmRlcmVyPXt0aGlzLl9yZW5kZXJIZWFkZXJ9XG4gICAgICAgICAgbGFiZWw9XCJGaWxlXCJcbiAgICAgICAgICB3aWR0aD17RklMRV9DT0xVTU5fV0lEVEh9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPFRhYmxlXG4gICAgICAgIGhlaWdodD17dGhpcy5wcm9wcy5oZWlnaHR9XG4gICAgICAgIGhlYWRlckhlaWdodD17MzB9XG4gICAgICAgIG9uUm93Q2xpY2s9e29uUm93Q2xpY2t9XG4gICAgICAgIG92ZXJmbG93WD1cImhpZGRlblwiXG4gICAgICAgIG92ZXJmbG93WT1cImF1dG9cIlxuICAgICAgICByZWY9XCJ0YWJsZVwiXG4gICAgICAgIHJvd0dldHRlcj17dGhpcy5fcm93R2V0dGVyfVxuICAgICAgICByb3dIZWlnaHQ9e0RFRkFVTFRfTElORV9URVhUX0hFSUdIVCArIFJPV19WRVJUSUNBTF9QQURESU5HfVxuICAgICAgICByb3dIZWlnaHRHZXR0ZXI9e3RoaXMuX3Jvd0hlaWdodEdldHRlcn1cbiAgICAgICAgcm93c0NvdW50PXt0aGlzLnByb3BzLmRpYWdub3N0aWNzLmxlbmd0aH1cbiAgICAgICAgd2lkdGg9e3RoaXMucHJvcHMud2lkdGh9PlxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgYWxpZ249XCJsZWZ0XCJcbiAgICAgICAgICBjZWxsRGF0YUdldHRlcj17dHlwZUNvbHVtbkNlbGxEYXRhR2V0dGVyfVxuICAgICAgICAgIGNlbGxSZW5kZXJlcj17dHlwZUNvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwidHlwZVwiXG4gICAgICAgICAgbGFiZWw9XCJUeXBlXCJcbiAgICAgICAgICB3aWR0aD17VFlQRV9DT0xVTU5fV0lEVEh9XG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXtzb3VyY2VDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwicHJvdmlkZXJOYW1lXCJcbiAgICAgICAgICBsYWJlbD1cIlNvdXJjZVwiXG4gICAgICAgICAgd2lkdGg9e1NPVVJDRV9DT0xVTU5fV0lEVEh9XG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXttZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXttZXNzYWdlQ29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJtZXNzYWdlXCJcbiAgICAgICAgICBmbGV4R3Jvdz17M31cbiAgICAgICAgICBsYWJlbD1cIkRlc2NyaXB0aW9uXCJcbiAgICAgICAgICB3aWR0aD17REVTQ1JJUFRJT05fQ09MVU1OX1dJRFRIfVxuICAgICAgICAvPlxuICAgICAgICB7ZmlsZUNvbHVtbn1cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e2xvY2F0aW9uQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXtwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cInJhbmdlXCJcbiAgICAgICAgICBsYWJlbD1cIkxpbmVcIlxuICAgICAgICAgIHdpZHRoPXtMSU5FX0NPTFVNTl9XSURUSH1cbiAgICAgICAgLz5cbiAgICAgIDwvVGFibGU+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdub3N0aWNzUGFuZTtcbiJdfQ==