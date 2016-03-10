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
var ROW_VERTICAL_PADDING = 8; // 4px top and bottom padding.
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
//# sourceMappingURL=data:application/json;base64,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QTJCLEFBQUM7QUFDMUMsaUJBQU8sRUFBQyxjQUFjO0FBQ3RCLGVBQUssRUFBQyxRQUFRO0FBQ2QsZUFBSyxFQUFFLG1CQUFtQixBQUFDO1VBQzNCO1FBQ0Ysb0JBQUMsTUFBTTtBQUNMLGVBQUssRUFBQyxNQUFNO0FBQ1osd0JBQWMsRUFBRSwyQkFBMkIsQUFBQztBQUM1QyxzQkFBWSxFQUFFLHlCQUF5QixBQUFDO0FBQ3hDLGlCQUFPLEVBQUMsU0FBUztBQUNqQixrQkFBUSxFQUFFLENBQUMsQUFBQztBQUNaLGVBQUssRUFBQyxhQUFhO0FBQ25CLGVBQUssRUFBRSx3QkFBd0IsQUFBQztVQUNoQztRQUNELFVBQVU7UUFDWCxvQkFBQyxNQUFNO0FBQ0wsZUFBSyxFQUFDLE1BQU07QUFDWix3QkFBYyxFQUFFLDRCQUE0QixBQUFDO0FBQzdDLHNCQUFZLEVBQUUsMkJBQTJCLEFBQUM7QUFDMUMsaUJBQU8sRUFBQyxPQUFPO0FBQ2YsZUFBSyxFQUFDLE1BQU07QUFDWixlQUFLLEVBQUUsaUJBQWlCLEFBQUM7VUFDekI7T0FDSSxDQUNSO0tBQ0g7OztTQXJJRyxlQUFlO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBd0k3QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljc1BhbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlhZ25vc3RpY01lc3NhZ2V9IGZyb20gJy4uLy4uL2Jhc2UnO1xuXG5jb25zdCB7Q29sdW1uLCBUYWJsZX0gPSByZXF1aXJlKCdmaXhlZC1kYXRhLXRhYmxlJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uLy4uL2FuYWx5dGljcyc7XG5cbmNvbnN0IHtmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIsIGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWN9ID0gcmVxdWlyZSgnLi9wYW5lVXRpbHMnKTtcblxudHlwZSB0ZXh0QW5kVHlwZSA9IHt0ZXh0OiBzdHJpbmc7IGlzUGxhaW5UZXh0OiBib29sZWFufTtcblxuY29uc3QgREVGQVVMVF9MSU5FX1RFWFRfSEVJR0hUID0gMTU7XG5jb25zdCBERVNDUklQVElPTl9DT0xVTU5fRkxFWF9HUk9XID0gMztcbmNvbnN0IERFU0NSSVBUSU9OX0NPTFVNTl9XSURUSCA9IDEwMDtcbmNvbnN0IEZJTEVfQ09MVU1OX0ZMRVhfR1JPVyA9IDI7XG5jb25zdCBGSUxFX0NPTFVNTl9XSURUSCA9IDEwMDtcbmNvbnN0IExJTkVfQ09MVU1OX1dJRFRIID0gMTAwO1xuY29uc3QgUElYRUxTX1BFUl9DSEFSID0gNjtcbmNvbnN0IFJPV19IT1JJWk9OVEFMX1BBRERJTkcgPSAxNjsgLy8gOHB4IGxlZnQgYW5kIHJpZ2h0IHBhZGRpbmcuXG5jb25zdCBST1dfVkVSVElDQUxfUEFERElORyA9IDg7IC8vIDRweCB0b3AgYW5kIGJvdHRvbSBwYWRkaW5nLlxuY29uc3QgU09VUkNFX0NPTFVNTl9XSURUSCA9IDE3NTtcbmNvbnN0IFRZUEVfQ09MVU1OX1dJRFRIID0gMTAwO1xuXG5jb25zdCBUeXBlVG9IaWdobGlnaHRDbGFzc05hbWUgPSB7XG4gIEVSUk9SOiAnaGlnaGxpZ2h0LWVycm9yJyxcbiAgV0FSTklORzogJ2hpZ2hsaWdodC13YXJuaW5nJyxcbn07XG5cbmZ1bmN0aW9uIGxvY2F0aW9uQ29sdW1uQ2VsbERhdGFHZXR0ZXIoY2VsbERhdGFLZXk6ICdyYW5nZScsIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRpYWdub3N0aWMucmFuZ2UgPyAoZGlhZ25vc3RpYy5yYW5nZS5zdGFydC5yb3cgKyAxKS50b1N0cmluZygpIDogJyc7XG59XG5cbmZ1bmN0aW9uIHR5cGVDb2x1bW5DZWxsRGF0YUdldHRlcihjZWxsRGF0YUtleTogJ3R5cGUnLCBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIHJldHVybiBkaWFnbm9zdGljLnR5cGU7XG59XG5cbmZ1bmN0aW9uIHNvdXJjZUNvbHVtbkNlbGxEYXRhR2V0dGVyKFxuICBjZWxsRGF0YUtleTogJ3Byb3ZpZGVyTmFtZScsXG4gIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlXG4pOiBzdHJpbmcge1xuICByZXR1cm4gZGlhZ25vc3RpYy5wcm92aWRlck5hbWU7XG59XG5cbmZ1bmN0aW9uIHBsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcih0ZXh0OiBzdHJpbmcpOiBSZWFjdEVsZW1lbnQge1xuICAvLyBGb3IgY29uc2lzdGVuY3kgd2l0aCBtZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoKSwgcmVuZGVyIHBsYWludGV4dCBpbiBhIDxzcGFuPiBzbyB0aGF0XG4gIC8vIGV2ZXJ5dGhpbmcgbGluZXMgdXAuXG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWZpeGVkLWRhdGEtY2VsbFwiPnt0ZXh0fTwvc3Bhbj47XG59XG5cbmZ1bmN0aW9uIHR5cGVDb2x1bW5DZWxsUmVuZGVyZXIodGV4dDogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3QgaGlnaGxpZ2h0Q2xhc3NOYW1lID0gVHlwZVRvSGlnaGxpZ2h0Q2xhc3NOYW1lW3RleHQudG9VcHBlckNhc2UoKV0gfHwgJ2hpZ2hsaWdodCc7XG4gIHJldHVybiAoXG4gICAgPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1maXhlZC1kYXRhLWNlbGxcIj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17aGlnaGxpZ2h0Q2xhc3NOYW1lfT5cbiAgICAgICAge3RleHR9XG4gICAgICA8L3NwYW4+XG4gICAgPC9zcGFuPlxuICApO1xufVxuXG4vKiogQHJldHVybiB0ZXh0IGFuZCBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIGl0IGlzIHBsYWludGV4dCBvciBIVE1MLiAqL1xuZnVuY3Rpb24gbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKFxuICBjZWxsRGF0YUtleTogJ21lc3NhZ2UnLFxuICBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZVxuKTogdGV4dEFuZFR5cGUge1xuICBsZXQgdGV4dCA9ICcnO1xuICBsZXQgaXNQbGFpblRleHQgPSB0cnVlO1xuICBjb25zdCB0cmFjZXMgPSBkaWFnbm9zdGljLnRyYWNlIHx8IFtdO1xuICBjb25zdCBhbGxNZXNzYWdlczogQXJyYXk8e2h0bWw/OiBzdHJpbmc7IHRleHQ/OiBzdHJpbmd9PiA9IFtkaWFnbm9zdGljLCAuLi50cmFjZXNdO1xuICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgYWxsTWVzc2FnZXMpIHtcbiAgICBpZiAobWVzc2FnZS5odG1sICE9IG51bGwpIHtcbiAgICAgIHRleHQgKz0gbWVzc2FnZS5odG1sICsgJyAnO1xuICAgICAgaXNQbGFpblRleHQgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudGV4dCAhPSBudWxsKSB7XG4gICAgICB0ZXh0ICs9IG1lc3NhZ2UudGV4dCArICcgJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOZWl0aGVyIHRleHQgbm9yIGh0bWwgcHJvcGVydHkgZGVmaW5lZCBvbjogJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIHRleHQ6IHRleHQudHJpbSgpLFxuICAgIGlzUGxhaW5UZXh0LFxuICB9O1xufVxuXG5mdW5jdGlvbiBtZXNzYWdlQ29sdW1uQ2VsbFJlbmRlcmVyKG1lc3NhZ2U6IHRleHRBbmRUeXBlKTogUmVhY3RFbGVtZW50IHtcbiAgaWYgKG1lc3NhZ2UuaXNQbGFpblRleHQpIHtcbiAgICByZXR1cm4gcGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyKG1lc3NhZ2UudGV4dCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZml4ZWQtZGF0YS1jZWxsXCIgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IG1lc3NhZ2UudGV4dH19IC8+XG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvblJvd0NsaWNrKFxuICBldmVudDogU3ludGhldGljTW91c2VFdmVudCxcbiAgcm93SW5kZXg6IG51bWJlcixcbiAgcm93RGF0YTogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHZvaWQge1xuICBpZiAocm93RGF0YS5zY29wZSAhPT0gJ2ZpbGUnIHx8IHJvd0RhdGEuZmlsZVBhdGggPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyYWNrKCdkaWFnbm9zdGljcy1wYW5lbC1nb3RvLWxvY2F0aW9uJyk7XG5cbiAgY29uc3QgdXJpID0gcm93RGF0YS5maWxlUGF0aDtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAvLyBJZiBpbml0aWFsTGluZSBpcyBOLCBBdG9tIHdpbGwgbmF2aWdhdGUgdG8gbGluZSBOKzEuXG4gICAgLy8gRmxvdyBzb21ldGltZXMgcmVwb3J0cyBhIHJvdyBvZiAtMSwgc28gdGhpcyBlbnN1cmVzIHRoZSBsaW5lIGlzIGF0IGxlYXN0IG9uZS5cbiAgICBpbml0aWFsTGluZTogTWF0aC5tYXgocm93RGF0YS5yYW5nZSA/IHJvd0RhdGEucmFuZ2Uuc3RhcnQucm93IDogMCwgMCksXG4gIH07XG4gIGF0b20ud29ya3NwYWNlLm9wZW4odXJpLCBvcHRpb25zKTtcbn1cblxuY2xhc3MgRGlhZ25vc3RpY3NQYW5lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBkaWFnbm9zdGljczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgc2hvd0ZpbGVOYW1lOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB3aWR0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fcm93R2V0dGVyID0gdGhpcy5fcm93R2V0dGVyLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3Jvd0hlaWdodEdldHRlciA9IHRoaXMuX3Jvd0hlaWdodEdldHRlci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9yZW5kZXJIZWFkZXIgPSB0aGlzLl9yZW5kZXJIZWFkZXIuYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9yb3dHZXR0ZXIocm93SW5kZXg6IG51bWJlcik6IERpYWdub3N0aWNNZXNzYWdlIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5kaWFnbm9zdGljc1tyb3dJbmRleF07XG4gIH1cblxuICBfcm93SGVpZ2h0R2V0dGVyKHJvd0luZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGNvbnN0IHRhYmxlV2lkdGggPSB0aGlzLnByb3BzLndpZHRoO1xuICAgIGNvbnN0IGRpYWdub3N0aWMgPSB0aGlzLl9yb3dHZXR0ZXIocm93SW5kZXgpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0UHJvamVjdFJlbGF0aXZlUGF0aE9mRGlhZ25vc3RpYyhkaWFnbm9zdGljKTtcbiAgICBjb25zdCB7dGV4dDogbWVzc2FnZX0gPSBtZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoJ21lc3NhZ2UnLCBkaWFnbm9zdGljKTtcblxuICAgIC8vIENhbGN1bGF0ZSAoY2hhcmFjdGVyKSBsZW5ndGggb2YgZGVzY3JpcHRpb24gYW5kIGZpbGUgcmVzcGVjdGl2ZWx5LlxuICAgIGNvbnN0IGRlc2NyaXB0aW9uTGVuZ3RoID0gbWVzc2FnZS5sZW5ndGg7XG4gICAgY29uc3QgZmlsZUxlbmd0aCA9IGZpbGVQYXRoLmxlbmd0aDtcblxuICAgIC8vIENhbGN1bGF0ZSAocGl4ZWwpIHdpZHRoIG9mIGZsZXhpYmxlIHNwYWNlIHVzZWQgYnkgZGVzY3JpcHRpb24gYW5kIGZpbGUgY2VsbHMuXG4gICAgY29uc3Qgbm9uRmxleFdpZHRoID1cbiAgICAgIFRZUEVfQ09MVU1OX1dJRFRIICsgU09VUkNFX0NPTFVNTl9XSURUSCArIExJTkVfQ09MVU1OX1dJRFRIO1xuICAgIGNvbnN0IGZsZXhXaWR0aCA9IHRhYmxlV2lkdGggLSBub25GbGV4V2lkdGg7XG5cbiAgICAvLyBDYWxjdWxhdGUgKHBpeGVsKSB3aWR0aHMgb2YgZGVzY3JpcHRpb24gYW5kIGZpbGUgY2VsbHMgcmVzcGVjdGl2ZWx5LlxuICAgIGNvbnN0IGZsZXhHcm93VG90YWwgPSBERVNDUklQVElPTl9DT0xVTU5fRkxFWF9HUk9XICsgRklMRV9DT0xVTU5fRkxFWF9HUk9XO1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uV2lkdGggPVxuICAgICAgZmxleFdpZHRoICogKERFU0NSSVBUSU9OX0NPTFVNTl9GTEVYX0dST1cgLyBmbGV4R3Jvd1RvdGFsKSAtIFJPV19IT1JJWk9OVEFMX1BBRERJTkc7XG4gICAgY29uc3QgZmlsZVdpZHRoID1cbiAgICAgIGZsZXhXaWR0aCAqIChGSUxFX0NPTFVNTl9GTEVYX0dST1cgLyBmbGV4R3Jvd1RvdGFsKSAtIFJPV19IT1JJWk9OVEFMX1BBRERJTkc7XG5cbiAgICAvLyBDYWxjdWxhdGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBmaXQgaW4gb25lIGxpbmUgdXNpbmcgY2VsbCB3aWR0aC5cbiAgICBjb25zdCBkZXNjcmlwdGlvbkNoYXJzUGVyUm93ID0gZGVzY3JpcHRpb25XaWR0aCAvIFBJWEVMU19QRVJfQ0hBUjtcbiAgICBjb25zdCBmaWxlQ2hhcnNQZXJSb3cgPSBmaWxlV2lkdGggLyBQSVhFTFNfUEVSX0NIQVI7XG5cbiAgICAvLyBDYWxjdWxhdGUgbnVtYmVyIG9mIGxpbmVzIG5lZWRlZCB1c2luZyB0ZXh0IGxlbmd0aCBhbmQgY2hhcmFjdGVycyBwZXIgbGluZS5cbiAgICBjb25zdCBkZXNjcmlwdGlvbk1heExpbmVzT2ZUZXh0ID1cbiAgICAgIE1hdGguZmxvb3IoZGVzY3JpcHRpb25MZW5ndGggLyBkZXNjcmlwdGlvbkNoYXJzUGVyUm93KSArIDE7XG4gICAgY29uc3QgZmlsZU1heExpbmVzT2ZUZXh0ID1cbiAgICAgIE1hdGguZmxvb3IoZmlsZUxlbmd0aCAvIGZpbGVDaGFyc1BlclJvdykgKyAxO1xuXG4gICAgLy8gU2V0IGhlaWdodCB1c2luZyB0aGUgbWF4aW11bSBvZiB0aGUgdHdvIHJlcXVpcmVkIGNlbGwgaGVpZ2h0cy5cbiAgICBjb25zdCBtYXhOdW1MaW5lc09mVGV4dCA9IE1hdGgubWF4KFxuICAgICAgZGVzY3JpcHRpb25NYXhMaW5lc09mVGV4dCxcbiAgICAgIGZpbGVNYXhMaW5lc09mVGV4dFxuICAgICk7XG4gICAgcmV0dXJuIG1heE51bUxpbmVzT2ZUZXh0ICogREVGQVVMVF9MSU5FX1RFWFRfSEVJR0hUICsgUk9XX1ZFUlRJQ0FMX1BBRERJTkc7XG4gIH1cblxuICBfcmVuZGVySGVhZGVyKGxhYmVsOiA/c3RyaW5nLCBjZWxsRGF0YUtleTogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBUT0RPKGVoemhhbmcpOiBGaWd1cmUgb3V0IHdoeSBhbiBvbkNsaWNrIGFkZGVkIHRvIHRoaXMgPHNwYW4+IGRvZXMgbm90IGZpcmUuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuPntsYWJlbH08L3NwYW4+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIFRPRE8oZWh6aGFuZyk6IFNldHRpbmcgaXNSZXNpemFibGU9e3RydWV9IG9uIGNvbHVtbnMgc2VlbXMgdG8gYnJlYWsgdGhpbmdzIHByZXR0eSBiYWRseS5cbiAgICAvLyBQZXJoYXBzIHRoaXMgaXMgYmVjYXVzZSB3ZSBhcmUgdXNpbmcgcmVhY3QtZm9yLWF0b20gaW5zdGVhZCBvZiByZWFjdD9cbiAgICBsZXQgZmlsZUNvbHVtbiA9IG51bGw7XG4gICAgaWYgKHRoaXMucHJvcHMuc2hvd0ZpbGVOYW1lKSB7XG4gICAgICBmaWxlQ29sdW1uID0gKFxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgYWxpZ249XCJsZWZ0XCJcbiAgICAgICAgICBjZWxsRGF0YUdldHRlcj17ZmlsZUNvbHVtbkNlbGxEYXRhR2V0dGVyfVxuICAgICAgICAgIGNlbGxSZW5kZXJlcj17cGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJmaWxlUGF0aFwiXG4gICAgICAgICAgZmxleEdyb3c9ezJ9XG4gICAgICAgICAgaGVhZGVyUmVuZGVyZXI9e3RoaXMuX3JlbmRlckhlYWRlcn1cbiAgICAgICAgICBsYWJlbD1cIkZpbGVcIlxuICAgICAgICAgIHdpZHRoPXtGSUxFX0NPTFVNTl9XSURUSH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8VGFibGVcbiAgICAgICAgaGVpZ2h0PXt0aGlzLnByb3BzLmhlaWdodH1cbiAgICAgICAgaGVhZGVySGVpZ2h0PXszMH1cbiAgICAgICAgb25Sb3dDbGljaz17b25Sb3dDbGlja31cbiAgICAgICAgb3ZlcmZsb3dYPVwiaGlkZGVuXCJcbiAgICAgICAgb3ZlcmZsb3dZPVwiYXV0b1wiXG4gICAgICAgIHJlZj1cInRhYmxlXCJcbiAgICAgICAgcm93R2V0dGVyPXt0aGlzLl9yb3dHZXR0ZXJ9XG4gICAgICAgIHJvd0hlaWdodD17REVGQVVMVF9MSU5FX1RFWFRfSEVJR0hUICsgUk9XX1ZFUlRJQ0FMX1BBRERJTkd9XG4gICAgICAgIHJvd0hlaWdodEdldHRlcj17dGhpcy5fcm93SGVpZ2h0R2V0dGVyfVxuICAgICAgICByb3dzQ291bnQ9e3RoaXMucHJvcHMuZGlhZ25vc3RpY3MubGVuZ3RofVxuICAgICAgICB3aWR0aD17dGhpcy5wcm9wcy53aWR0aH0+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXt0eXBlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXt0eXBlQ29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJ0eXBlXCJcbiAgICAgICAgICBsYWJlbD1cIlR5cGVcIlxuICAgICAgICAgIHdpZHRoPXtUWVBFX0NPTFVNTl9XSURUSH1cbiAgICAgICAgLz5cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e3NvdXJjZUNvbHVtbkNlbGxEYXRhR2V0dGVyfVxuICAgICAgICAgIGNlbGxSZW5kZXJlcj17cGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJwcm92aWRlck5hbWVcIlxuICAgICAgICAgIGxhYmVsPVwiU291cmNlXCJcbiAgICAgICAgICB3aWR0aD17U09VUkNFX0NPTFVNTl9XSURUSH1cbiAgICAgICAgLz5cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e21lc3NhZ2VDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e21lc3NhZ2VDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cIm1lc3NhZ2VcIlxuICAgICAgICAgIGZsZXhHcm93PXszfVxuICAgICAgICAgIGxhYmVsPVwiRGVzY3JpcHRpb25cIlxuICAgICAgICAgIHdpZHRoPXtERVNDUklQVElPTl9DT0xVTU5fV0lEVEh9XG4gICAgICAgIC8+XG4gICAgICAgIHtmaWxlQ29sdW1ufVxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgYWxpZ249XCJsZWZ0XCJcbiAgICAgICAgICBjZWxsRGF0YUdldHRlcj17bG9jYXRpb25Db2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwicmFuZ2VcIlxuICAgICAgICAgIGxhYmVsPVwiTGluZVwiXG4gICAgICAgICAgd2lkdGg9e0xJTkVfQ09MVU1OX1dJRFRIfVxuICAgICAgICAvPlxuICAgICAgPC9UYWJsZT5cbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlhZ25vc3RpY3NQYW5lO1xuIl19