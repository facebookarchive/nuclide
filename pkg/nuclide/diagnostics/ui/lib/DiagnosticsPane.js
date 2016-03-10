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

var _atomHelpers = require('../../../atom-helpers');

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
  // If initialLine is N, Atom will navigate to line N+1.
  // Flow sometimes reports a row of -1, so this ensures the line is at least one.
  var line = Math.max(rowData.range ? rowData.range.start.row : 0, 0);
  var column = 0;
  (0, _atomHelpers.goToLocation)(uri, line, column);
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
//# sourceMappingURL=data:application/json;base64,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QzFDLGlCQUFPLEVBQUMsY0FBYztBQUN0QixlQUFLLEVBQUMsUUFBUTtBQUNkLGVBQUssRUFBRSxtQkFBbUIsQUFBQztVQUMzQjtRQUNGLG9CQUFDLE1BQU07QUFDTCxlQUFLLEVBQUMsTUFBTTtBQUNaLHdCQUFjLEVBQUUsMkJBQTJCLEFBQUM7QUFDNUMsc0JBQVksRUFBRSx5QkFBeUIsQUFBQztBQUN4QyxpQkFBTyxFQUFDLFNBQVM7QUFDakIsa0JBQVEsRUFBRSxDQUFDLEFBQUM7QUFDWixlQUFLLEVBQUMsYUFBYTtBQUNuQixlQUFLLEVBQUUsd0JBQXdCLEFBQUM7VUFDaEM7UUFDRCxVQUFVO1FBQ1gsb0JBQUMsTUFBTTtBQUNMLGVBQUssRUFBQyxNQUFNO0FBQ1osd0JBQWMsRUFBRSw0QkFBNEIsQUFBQztBQUM3QyxzQkFBWSxFQUFFLDJCQUEyQixBQUFDO0FBQzFDLGlCQUFPLEVBQUMsT0FBTztBQUNmLGVBQUssRUFBQyxNQUFNO0FBQ1osZUFBSyxFQUFFLGlCQUFpQixBQUFDO1VBQ3pCO09BQ0ksQ0FDUjtLQUNIOzs7U0FySUcsZUFBZTtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXdJN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGlhZ25vc3RpY3NQYW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0RpYWdub3N0aWNNZXNzYWdlfSBmcm9tICcuLi8uLi9iYXNlJztcblxuY29uc3Qge0NvbHVtbiwgVGFibGV9ID0gcmVxdWlyZSgnZml4ZWQtZGF0YS10YWJsZScpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtnb1RvTG9jYXRpb259IGZyb20gJy4uLy4uLy4uL2F0b20taGVscGVycyc7XG5cbmNvbnN0IHtmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIsIGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWN9ID0gcmVxdWlyZSgnLi9wYW5lVXRpbHMnKTtcblxudHlwZSB0ZXh0QW5kVHlwZSA9IHt0ZXh0OiBzdHJpbmc7IGlzUGxhaW5UZXh0OiBib29sZWFufTtcblxuY29uc3QgREVGQVVMVF9MSU5FX1RFWFRfSEVJR0hUID0gMTU7XG5jb25zdCBERVNDUklQVElPTl9DT0xVTU5fRkxFWF9HUk9XID0gMztcbmNvbnN0IERFU0NSSVBUSU9OX0NPTFVNTl9XSURUSCA9IDEwMDtcbmNvbnN0IEZJTEVfQ09MVU1OX0ZMRVhfR1JPVyA9IDI7XG5jb25zdCBGSUxFX0NPTFVNTl9XSURUSCA9IDEwMDtcbmNvbnN0IExJTkVfQ09MVU1OX1dJRFRIID0gMTAwO1xuY29uc3QgUElYRUxTX1BFUl9DSEFSID0gNjtcbmNvbnN0IFJPV19IT1JJWk9OVEFMX1BBRERJTkcgPSAxNjsgLy8gOHB4IGxlZnQgYW5kIHJpZ2h0IHBhZGRpbmcuXG5jb25zdCBST1dfVkVSVElDQUxfUEFERElORyA9IDg7IC8vIDRweCB0b3AgYW5kIGJvdHRvbSBwYWRkaW5nLlxuY29uc3QgU09VUkNFX0NPTFVNTl9XSURUSCA9IDE3NTtcbmNvbnN0IFRZUEVfQ09MVU1OX1dJRFRIID0gMTAwO1xuXG5jb25zdCBUeXBlVG9IaWdobGlnaHRDbGFzc05hbWUgPSB7XG4gIEVSUk9SOiAnaGlnaGxpZ2h0LWVycm9yJyxcbiAgV0FSTklORzogJ2hpZ2hsaWdodC13YXJuaW5nJyxcbn07XG5cbmZ1bmN0aW9uIGxvY2F0aW9uQ29sdW1uQ2VsbERhdGFHZXR0ZXIoY2VsbERhdGFLZXk6ICdyYW5nZScsIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRpYWdub3N0aWMucmFuZ2UgPyAoZGlhZ25vc3RpYy5yYW5nZS5zdGFydC5yb3cgKyAxKS50b1N0cmluZygpIDogJyc7XG59XG5cbmZ1bmN0aW9uIHR5cGVDb2x1bW5DZWxsRGF0YUdldHRlcihjZWxsRGF0YUtleTogJ3R5cGUnLCBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIHJldHVybiBkaWFnbm9zdGljLnR5cGU7XG59XG5cbmZ1bmN0aW9uIHNvdXJjZUNvbHVtbkNlbGxEYXRhR2V0dGVyKFxuICBjZWxsRGF0YUtleTogJ3Byb3ZpZGVyTmFtZScsXG4gIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlXG4pOiBzdHJpbmcge1xuICByZXR1cm4gZGlhZ25vc3RpYy5wcm92aWRlck5hbWU7XG59XG5cbmZ1bmN0aW9uIHBsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcih0ZXh0OiBzdHJpbmcpOiBSZWFjdEVsZW1lbnQge1xuICAvLyBGb3IgY29uc2lzdGVuY3kgd2l0aCBtZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoKSwgcmVuZGVyIHBsYWludGV4dCBpbiBhIDxzcGFuPiBzbyB0aGF0XG4gIC8vIGV2ZXJ5dGhpbmcgbGluZXMgdXAuXG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWZpeGVkLWRhdGEtY2VsbFwiPnt0ZXh0fTwvc3Bhbj47XG59XG5cbmZ1bmN0aW9uIHR5cGVDb2x1bW5DZWxsUmVuZGVyZXIodGV4dDogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3QgaGlnaGxpZ2h0Q2xhc3NOYW1lID0gVHlwZVRvSGlnaGxpZ2h0Q2xhc3NOYW1lW3RleHQudG9VcHBlckNhc2UoKV0gfHwgJ2hpZ2hsaWdodCc7XG4gIHJldHVybiAoXG4gICAgPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1maXhlZC1kYXRhLWNlbGxcIj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17aGlnaGxpZ2h0Q2xhc3NOYW1lfT5cbiAgICAgICAge3RleHR9XG4gICAgICA8L3NwYW4+XG4gICAgPC9zcGFuPlxuICApO1xufVxuXG4vKiogQHJldHVybiB0ZXh0IGFuZCBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIGl0IGlzIHBsYWludGV4dCBvciBIVE1MLiAqL1xuZnVuY3Rpb24gbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKFxuICBjZWxsRGF0YUtleTogJ21lc3NhZ2UnLFxuICBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZVxuKTogdGV4dEFuZFR5cGUge1xuICBsZXQgdGV4dCA9ICcnO1xuICBsZXQgaXNQbGFpblRleHQgPSB0cnVlO1xuICBjb25zdCB0cmFjZXMgPSBkaWFnbm9zdGljLnRyYWNlIHx8IFtdO1xuICBjb25zdCBhbGxNZXNzYWdlczogQXJyYXk8e2h0bWw/OiBzdHJpbmc7IHRleHQ/OiBzdHJpbmd9PiA9IFtkaWFnbm9zdGljLCAuLi50cmFjZXNdO1xuICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgYWxsTWVzc2FnZXMpIHtcbiAgICBpZiAobWVzc2FnZS5odG1sICE9IG51bGwpIHtcbiAgICAgIHRleHQgKz0gbWVzc2FnZS5odG1sICsgJyAnO1xuICAgICAgaXNQbGFpblRleHQgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudGV4dCAhPSBudWxsKSB7XG4gICAgICB0ZXh0ICs9IG1lc3NhZ2UudGV4dCArICcgJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOZWl0aGVyIHRleHQgbm9yIGh0bWwgcHJvcGVydHkgZGVmaW5lZCBvbjogJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIHRleHQ6IHRleHQudHJpbSgpLFxuICAgIGlzUGxhaW5UZXh0LFxuICB9O1xufVxuXG5mdW5jdGlvbiBtZXNzYWdlQ29sdW1uQ2VsbFJlbmRlcmVyKG1lc3NhZ2U6IHRleHRBbmRUeXBlKTogUmVhY3RFbGVtZW50IHtcbiAgaWYgKG1lc3NhZ2UuaXNQbGFpblRleHQpIHtcbiAgICByZXR1cm4gcGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyKG1lc3NhZ2UudGV4dCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZml4ZWQtZGF0YS1jZWxsXCIgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IG1lc3NhZ2UudGV4dH19IC8+XG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvblJvd0NsaWNrKFxuICBldmVudDogU3ludGhldGljTW91c2VFdmVudCxcbiAgcm93SW5kZXg6IG51bWJlcixcbiAgcm93RGF0YTogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHZvaWQge1xuICBpZiAocm93RGF0YS5zY29wZSAhPT0gJ2ZpbGUnIHx8IHJvd0RhdGEuZmlsZVBhdGggPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyYWNrKCdkaWFnbm9zdGljcy1wYW5lbC1nb3RvLWxvY2F0aW9uJyk7XG5cbiAgY29uc3QgdXJpID0gcm93RGF0YS5maWxlUGF0aDtcbiAgLy8gSWYgaW5pdGlhbExpbmUgaXMgTiwgQXRvbSB3aWxsIG5hdmlnYXRlIHRvIGxpbmUgTisxLlxuICAvLyBGbG93IHNvbWV0aW1lcyByZXBvcnRzIGEgcm93IG9mIC0xLCBzbyB0aGlzIGVuc3VyZXMgdGhlIGxpbmUgaXMgYXQgbGVhc3Qgb25lLlxuICBjb25zdCBsaW5lID0gTWF0aC5tYXgocm93RGF0YS5yYW5nZSA/IHJvd0RhdGEucmFuZ2Uuc3RhcnQucm93IDogMCwgMCk7XG4gIGNvbnN0IGNvbHVtbiA9IDA7XG4gIGdvVG9Mb2NhdGlvbih1cmksIGxpbmUsIGNvbHVtbik7XG59XG5cbmNsYXNzIERpYWdub3N0aWNzUGFuZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgZGlhZ25vc3RpY3M6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIHNob3dGaWxlTmFtZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogbWl4ZWQpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX3Jvd0dldHRlciA9IHRoaXMuX3Jvd0dldHRlci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9yb3dIZWlnaHRHZXR0ZXIgPSB0aGlzLl9yb3dIZWlnaHRHZXR0ZXIuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fcmVuZGVySGVhZGVyID0gdGhpcy5fcmVuZGVySGVhZGVyLmJpbmQodGhpcyk7XG4gIH1cblxuICBfcm93R2V0dGVyKHJvd0luZGV4OiBudW1iZXIpOiBEaWFnbm9zdGljTWVzc2FnZSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZGlhZ25vc3RpY3Nbcm93SW5kZXhdO1xuICB9XG5cbiAgX3Jvd0hlaWdodEdldHRlcihyb3dJbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBjb25zdCB0YWJsZVdpZHRoID0gdGhpcy5wcm9wcy53aWR0aDtcbiAgICBjb25zdCBkaWFnbm9zdGljID0gdGhpcy5fcm93R2V0dGVyKHJvd0luZGV4KTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWMoZGlhZ25vc3RpYyk7XG4gICAgY29uc3Qge3RleHQ6IG1lc3NhZ2V9ID0gbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCdtZXNzYWdlJywgZGlhZ25vc3RpYyk7XG5cbiAgICAvLyBDYWxjdWxhdGUgKGNoYXJhY3RlcikgbGVuZ3RoIG9mIGRlc2NyaXB0aW9uIGFuZCBmaWxlIHJlc3BlY3RpdmVseS5cbiAgICBjb25zdCBkZXNjcmlwdGlvbkxlbmd0aCA9IG1lc3NhZ2UubGVuZ3RoO1xuICAgIGNvbnN0IGZpbGVMZW5ndGggPSBmaWxlUGF0aC5sZW5ndGg7XG5cbiAgICAvLyBDYWxjdWxhdGUgKHBpeGVsKSB3aWR0aCBvZiBmbGV4aWJsZSBzcGFjZSB1c2VkIGJ5IGRlc2NyaXB0aW9uIGFuZCBmaWxlIGNlbGxzLlxuICAgIGNvbnN0IG5vbkZsZXhXaWR0aCA9XG4gICAgICBUWVBFX0NPTFVNTl9XSURUSCArIFNPVVJDRV9DT0xVTU5fV0lEVEggKyBMSU5FX0NPTFVNTl9XSURUSDtcbiAgICBjb25zdCBmbGV4V2lkdGggPSB0YWJsZVdpZHRoIC0gbm9uRmxleFdpZHRoO1xuXG4gICAgLy8gQ2FsY3VsYXRlIChwaXhlbCkgd2lkdGhzIG9mIGRlc2NyaXB0aW9uIGFuZCBmaWxlIGNlbGxzIHJlc3BlY3RpdmVseS5cbiAgICBjb25zdCBmbGV4R3Jvd1RvdGFsID0gREVTQ1JJUFRJT05fQ09MVU1OX0ZMRVhfR1JPVyArIEZJTEVfQ09MVU1OX0ZMRVhfR1JPVztcbiAgICBjb25zdCBkZXNjcmlwdGlvbldpZHRoID1cbiAgICAgIGZsZXhXaWR0aCAqIChERVNDUklQVElPTl9DT0xVTU5fRkxFWF9HUk9XIC8gZmxleEdyb3dUb3RhbCkgLSBST1dfSE9SSVpPTlRBTF9QQURESU5HO1xuICAgIGNvbnN0IGZpbGVXaWR0aCA9XG4gICAgICBmbGV4V2lkdGggKiAoRklMRV9DT0xVTU5fRkxFWF9HUk9XIC8gZmxleEdyb3dUb3RhbCkgLSBST1dfSE9SSVpPTlRBTF9QQURESU5HO1xuXG4gICAgLy8gQ2FsY3VsYXRlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgZml0IGluIG9uZSBsaW5lIHVzaW5nIGNlbGwgd2lkdGguXG4gICAgY29uc3QgZGVzY3JpcHRpb25DaGFyc1BlclJvdyA9IGRlc2NyaXB0aW9uV2lkdGggLyBQSVhFTFNfUEVSX0NIQVI7XG4gICAgY29uc3QgZmlsZUNoYXJzUGVyUm93ID0gZmlsZVdpZHRoIC8gUElYRUxTX1BFUl9DSEFSO1xuXG4gICAgLy8gQ2FsY3VsYXRlIG51bWJlciBvZiBsaW5lcyBuZWVkZWQgdXNpbmcgdGV4dCBsZW5ndGggYW5kIGNoYXJhY3RlcnMgcGVyIGxpbmUuXG4gICAgY29uc3QgZGVzY3JpcHRpb25NYXhMaW5lc09mVGV4dCA9XG4gICAgICBNYXRoLmZsb29yKGRlc2NyaXB0aW9uTGVuZ3RoIC8gZGVzY3JpcHRpb25DaGFyc1BlclJvdykgKyAxO1xuICAgIGNvbnN0IGZpbGVNYXhMaW5lc09mVGV4dCA9XG4gICAgICBNYXRoLmZsb29yKGZpbGVMZW5ndGggLyBmaWxlQ2hhcnNQZXJSb3cpICsgMTtcblxuICAgIC8vIFNldCBoZWlnaHQgdXNpbmcgdGhlIG1heGltdW0gb2YgdGhlIHR3byByZXF1aXJlZCBjZWxsIGhlaWdodHMuXG4gICAgY29uc3QgbWF4TnVtTGluZXNPZlRleHQgPSBNYXRoLm1heChcbiAgICAgIGRlc2NyaXB0aW9uTWF4TGluZXNPZlRleHQsXG4gICAgICBmaWxlTWF4TGluZXNPZlRleHRcbiAgICApO1xuICAgIHJldHVybiBtYXhOdW1MaW5lc09mVGV4dCAqIERFRkFVTFRfTElORV9URVhUX0hFSUdIVCArIFJPV19WRVJUSUNBTF9QQURESU5HO1xuICB9XG5cbiAgX3JlbmRlckhlYWRlcihsYWJlbDogP3N0cmluZywgY2VsbERhdGFLZXk6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gVE9ETyhlaHpoYW5nKTogRmlndXJlIG91dCB3aHkgYW4gb25DbGljayBhZGRlZCB0byB0aGlzIDxzcGFuPiBkb2VzIG5vdCBmaXJlLlxuICAgIHJldHVybiAoXG4gICAgICA8c3Bhbj57bGFiZWx9PC9zcGFuPlxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBUT0RPKGVoemhhbmcpOiBTZXR0aW5nIGlzUmVzaXphYmxlPXt0cnVlfSBvbiBjb2x1bW5zIHNlZW1zIHRvIGJyZWFrIHRoaW5ncyBwcmV0dHkgYmFkbHkuXG4gICAgLy8gUGVyaGFwcyB0aGlzIGlzIGJlY2F1c2Ugd2UgYXJlIHVzaW5nIHJlYWN0LWZvci1hdG9tIGluc3RlYWQgb2YgcmVhY3Q/XG4gICAgbGV0IGZpbGVDb2x1bW4gPSBudWxsO1xuICAgIGlmICh0aGlzLnByb3BzLnNob3dGaWxlTmFtZSkge1xuICAgICAgZmlsZUNvbHVtbiA9IChcbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e2ZpbGVDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwiZmlsZVBhdGhcIlxuICAgICAgICAgIGZsZXhHcm93PXsyfVxuICAgICAgICAgIGhlYWRlclJlbmRlcmVyPXt0aGlzLl9yZW5kZXJIZWFkZXJ9XG4gICAgICAgICAgbGFiZWw9XCJGaWxlXCJcbiAgICAgICAgICB3aWR0aD17RklMRV9DT0xVTU5fV0lEVEh9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPFRhYmxlXG4gICAgICAgIGhlaWdodD17dGhpcy5wcm9wcy5oZWlnaHR9XG4gICAgICAgIGhlYWRlckhlaWdodD17MzB9XG4gICAgICAgIG9uUm93Q2xpY2s9e29uUm93Q2xpY2t9XG4gICAgICAgIG92ZXJmbG93WD1cImhpZGRlblwiXG4gICAgICAgIG92ZXJmbG93WT1cImF1dG9cIlxuICAgICAgICByZWY9XCJ0YWJsZVwiXG4gICAgICAgIHJvd0dldHRlcj17dGhpcy5fcm93R2V0dGVyfVxuICAgICAgICByb3dIZWlnaHQ9e0RFRkFVTFRfTElORV9URVhUX0hFSUdIVCArIFJPV19WRVJUSUNBTF9QQURESU5HfVxuICAgICAgICByb3dIZWlnaHRHZXR0ZXI9e3RoaXMuX3Jvd0hlaWdodEdldHRlcn1cbiAgICAgICAgcm93c0NvdW50PXt0aGlzLnByb3BzLmRpYWdub3N0aWNzLmxlbmd0aH1cbiAgICAgICAgd2lkdGg9e3RoaXMucHJvcHMud2lkdGh9PlxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgYWxpZ249XCJsZWZ0XCJcbiAgICAgICAgICBjZWxsRGF0YUdldHRlcj17dHlwZUNvbHVtbkNlbGxEYXRhR2V0dGVyfVxuICAgICAgICAgIGNlbGxSZW5kZXJlcj17dHlwZUNvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwidHlwZVwiXG4gICAgICAgICAgbGFiZWw9XCJUeXBlXCJcbiAgICAgICAgICB3aWR0aD17VFlQRV9DT0xVTU5fV0lEVEh9XG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXtzb3VyY2VDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwicHJvdmlkZXJOYW1lXCJcbiAgICAgICAgICBsYWJlbD1cIlNvdXJjZVwiXG4gICAgICAgICAgd2lkdGg9e1NPVVJDRV9DT0xVTU5fV0lEVEh9XG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXttZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXttZXNzYWdlQ29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJtZXNzYWdlXCJcbiAgICAgICAgICBmbGV4R3Jvdz17M31cbiAgICAgICAgICBsYWJlbD1cIkRlc2NyaXB0aW9uXCJcbiAgICAgICAgICB3aWR0aD17REVTQ1JJUFRJT05fQ09MVU1OX1dJRFRIfVxuICAgICAgICAvPlxuICAgICAgICB7ZmlsZUNvbHVtbn1cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e2xvY2F0aW9uQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXtwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cInJhbmdlXCJcbiAgICAgICAgICBsYWJlbD1cIkxpbmVcIlxuICAgICAgICAgIHdpZHRoPXtMSU5FX0NPTFVNTl9XSURUSH1cbiAgICAgICAgLz5cbiAgICAgIDwvVGFibGU+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdub3N0aWNzUGFuZTtcbiJdfQ==