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

var ROW_VERTICAL_PADDING = 16; // 8px top and bottom padding.
var DEFAULT_ROW_TEXT_HEIGHT = 15;
var MAX_CHARS_PER_LINE = 100;

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
      // TODO(t8055416): Improve this heuristic for determining the row height.
      var diagnostic = this._rowGetter(rowIndex);
      var filePath = getProjectRelativePathOfDiagnostic(diagnostic);

      var _messageColumnCellDataGetter = messageColumnCellDataGetter('message', diagnostic);

      var message = _messageColumnCellDataGetter.text;

      // Note this will be an overestimate if the message is HTML instead of plaintext.
      var messageLength = message.length;

      var textLength = Math.max(filePath.length, messageLength);
      var numRowsOfText = Math.floor(textLength / MAX_CHARS_PER_LINE) + 1;
      return numRowsOfText * DEFAULT_ROW_TEXT_HEIGHT + ROW_VERTICAL_PADDING;
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
          width: 100
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
          rowGetter: this._rowGetter,
          rowHeight: DEFAULT_ROW_TEXT_HEIGHT + ROW_VERTICAL_PADDING,
          rowHeightGetter: this._rowHeightGetter,
          rowsCount: this.props.diagnostics.length,
          width: this.props.width
        },
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: typeColumnCellDataGetter,
          cellRenderer: typeColumnCellRenderer,
          dataKey: 'type',
          maxWidth: 100,
          label: 'Type',
          width: 75
        }),
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: sourceColumnCellDataGetter,
          cellRenderer: plainTextColumnCellRenderer,
          dataKey: 'providerName',
          width: 175,
          label: 'Source'
        }),
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: messageColumnCellDataGetter,
          cellRenderer: messageColumnCellRenderer,
          dataKey: 'message',
          flexGrow: 3,
          label: 'Description',
          width: 100
        }),
        fileColumn,
        React.createElement(Column, {
          align: 'left',
          cellDataGetter: locationColumnCellDataGetter,
          cellRenderer: plainTextColumnCellRenderer,
          dataKey: 'range',
          maxWidth: 100,
          label: 'Line',
          width: 50
        })
      );
    }
  }]);

  return DiagnosticsPane;
})(React.Component);

module.exports = DiagnosticsPane;
//# sourceMappingURL=data:application/json;base64,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QyxNQUFNO0FBQ1osd0JBQWMsRUFBRSwwQkFBMEIsQUFBQztBQUMzQyxzQkFBWSxFQUFFLDJCQUEyQixBQUFDO0FBQzFDLGlCQUFPLEVBQUMsY0FBYztBQUN0QixlQUFLLEVBQUUsR0FBRyxBQUFDO0FBQ1gsZUFBSyxFQUFDLFFBQVE7VUFDZDtRQUNGLG9CQUFDLE1BQU07QUFDTCxlQUFLLEVBQUMsTUFBTTtBQUNaLHdCQUFjLEVBQUUsMkJBQTJCLEFBQUM7QUFDNUMsc0JBQVksRUFBRSx5QkFBeUIsQUFBQztBQUN4QyxpQkFBTyxFQUFDLFNBQVM7QUFDakIsa0JBQVEsRUFBRSxDQUFDLEFBQUM7QUFDWixlQUFLLEVBQUMsYUFBYTtBQUNuQixlQUFLLEVBQUUsR0FBRyxBQUFDO1VBQ1g7UUFDRCxVQUFVO1FBQ1gsb0JBQUMsTUFBTTtBQUNMLGVBQUssRUFBQyxNQUFNO0FBQ1osd0JBQWMsRUFBRSw0QkFBNEIsQUFBQztBQUM3QyxzQkFBWSxFQUFFLDJCQUEyQixBQUFDO0FBQzFDLGlCQUFPLEVBQUMsT0FBTztBQUNmLGtCQUFRLEVBQUUsR0FBRyxBQUFDO0FBQ2QsZUFBSyxFQUFDLE1BQU07QUFDWixlQUFLLEVBQUUsRUFBRSxBQUFDO1VBQ1Y7T0FDSSxDQUNSO0tBQ0g7OztTQTdHRyxlQUFlO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBZ0g3QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljc1BhbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlhZ25vc3RpY01lc3NhZ2V9IGZyb20gJy4uLy4uL2Jhc2UnO1xuXG5jb25zdCB7Q29sdW1uLCBUYWJsZX0gPSByZXF1aXJlKCdmaXhlZC1kYXRhLXRhYmxlJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uLy4uL2FuYWx5dGljcyc7XG5cbmNvbnN0IHtmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIsIGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWN9ID0gcmVxdWlyZSgnLi9wYW5lVXRpbHMnKTtcblxudHlwZSB0ZXh0QW5kVHlwZSA9IHt0ZXh0OiBzdHJpbmcsIGlzUGxhaW5UZXh0OiBib29sZWFufTtcblxuY29uc3QgUk9XX1ZFUlRJQ0FMX1BBRERJTkcgPSAxNjsgLy8gOHB4IHRvcCBhbmQgYm90dG9tIHBhZGRpbmcuXG5jb25zdCBERUZBVUxUX1JPV19URVhUX0hFSUdIVCA9IDE1O1xuY29uc3QgTUFYX0NIQVJTX1BFUl9MSU5FID0gMTAwO1xuXG5jb25zdCBUeXBlVG9IaWdobGlnaHRDbGFzc05hbWUgPSB7XG4gIEVSUk9SOiAnaGlnaGxpZ2h0LWVycm9yJyxcbiAgV0FSTklORzogJ2hpZ2hsaWdodC13YXJuaW5nJyxcbn07XG5cbmZ1bmN0aW9uIGxvY2F0aW9uQ29sdW1uQ2VsbERhdGFHZXR0ZXIoY2VsbERhdGFLZXk6ICdyYW5nZScsIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRpYWdub3N0aWMucmFuZ2UgPyAoZGlhZ25vc3RpYy5yYW5nZS5zdGFydC5yb3cgKyAxKS50b1N0cmluZygpIDogJyc7XG59XG5cbmZ1bmN0aW9uIHR5cGVDb2x1bW5DZWxsRGF0YUdldHRlcihjZWxsRGF0YUtleTogJ3R5cGUnLCBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIHJldHVybiBkaWFnbm9zdGljLnR5cGU7XG59XG5cbmZ1bmN0aW9uIHNvdXJjZUNvbHVtbkNlbGxEYXRhR2V0dGVyKFxuICBjZWxsRGF0YUtleTogJ3Byb3ZpZGVyTmFtZScsXG4gIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlXG4pOiBzdHJpbmcge1xuICByZXR1cm4gZGlhZ25vc3RpYy5wcm92aWRlck5hbWU7XG59XG5cbmZ1bmN0aW9uIHBsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcih0ZXh0OiBzdHJpbmcpOiBSZWFjdEVsZW1lbnQge1xuICAvLyBGb3IgY29uc2lzdGVuY3kgd2l0aCBtZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoKSwgcmVuZGVyIHBsYWludGV4dCBpbiBhIDxzcGFuPiBzbyB0aGF0XG4gIC8vIGV2ZXJ5dGhpbmcgbGluZXMgdXAuXG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWZpeGVkLWRhdGEtY2VsbFwiPnt0ZXh0fTwvc3Bhbj47XG59XG5cbmZ1bmN0aW9uIHR5cGVDb2x1bW5DZWxsUmVuZGVyZXIodGV4dDogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3QgaGlnaGxpZ2h0Q2xhc3NOYW1lID0gVHlwZVRvSGlnaGxpZ2h0Q2xhc3NOYW1lW3RleHQudG9VcHBlckNhc2UoKV0gfHwgJ2hpZ2hsaWdodCc7XG4gIHJldHVybiAoXG4gICAgPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1maXhlZC1kYXRhLWNlbGxcIj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17aGlnaGxpZ2h0Q2xhc3NOYW1lfT5cbiAgICAgICAge3RleHR9XG4gICAgICA8L3NwYW4+XG4gICAgPC9zcGFuPlxuICApO1xufVxuXG4vKiogQHJldHVybiB0ZXh0IGFuZCBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIGl0IGlzIHBsYWludGV4dCBvciBIVE1MLiAqL1xuZnVuY3Rpb24gbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKFxuICBjZWxsRGF0YUtleTogJ21lc3NhZ2UnLFxuICBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZVxuKTogdGV4dEFuZFR5cGUge1xuICBsZXQgdGV4dCA9ICcnO1xuICBsZXQgaXNQbGFpblRleHQgPSB0cnVlO1xuICBjb25zdCB0cmFjZXMgPSBkaWFnbm9zdGljLnRyYWNlIHx8IFtdO1xuICBjb25zdCBhbGxNZXNzYWdlczogQXJyYXk8e2h0bWw/OiBzdHJpbmcsIHRleHQ/OiBzdHJpbmd9PiA9IFtkaWFnbm9zdGljLCAuLi50cmFjZXNdO1xuICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgYWxsTWVzc2FnZXMpIHtcbiAgICBpZiAobWVzc2FnZS5odG1sICE9IG51bGwpIHtcbiAgICAgIHRleHQgKz0gbWVzc2FnZS5odG1sICsgJyAnO1xuICAgICAgaXNQbGFpblRleHQgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudGV4dCAhPSBudWxsKSB7XG4gICAgICB0ZXh0ICs9IG1lc3NhZ2UudGV4dCArICcgJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOZWl0aGVyIHRleHQgbm9yIGh0bWwgcHJvcGVydHkgZGVmaW5lZCBvbjogJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIHRleHQ6IHRleHQudHJpbSgpLFxuICAgIGlzUGxhaW5UZXh0LFxuICB9O1xufVxuXG5mdW5jdGlvbiBtZXNzYWdlQ29sdW1uQ2VsbFJlbmRlcmVyKG1lc3NhZ2U6IHRleHRBbmRUeXBlKTogUmVhY3RFbGVtZW50IHtcbiAgaWYgKG1lc3NhZ2UuaXNQbGFpblRleHQpIHtcbiAgICByZXR1cm4gcGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyKG1lc3NhZ2UudGV4dCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZml4ZWQtZGF0YS1jZWxsXCIgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IG1lc3NhZ2UudGV4dH19IC8+XG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvblJvd0NsaWNrKFxuICBldmVudDogU3ludGhldGljTW91c2VFdmVudCxcbiAgcm93SW5kZXg6IG51bWJlcixcbiAgcm93RGF0YTogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHZvaWQge1xuICBpZiAocm93RGF0YS5zY29wZSAhPT0gJ2ZpbGUnIHx8IHJvd0RhdGEuZmlsZVBhdGggPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyYWNrKCdkaWFnbm9zdGljcy1wYW5lbC1nb3RvLWxvY2F0aW9uJyk7XG5cbiAgY29uc3QgdXJpID0gcm93RGF0YS5maWxlUGF0aDtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAvLyBJZiBpbml0aWFsTGluZSBpcyBOLCBBdG9tIHdpbGwgbmF2aWdhdGUgdG8gbGluZSBOKzEuXG4gICAgLy8gRmxvdyBzb21ldGltZXMgcmVwb3J0cyBhIHJvdyBvZiAtMSwgc28gdGhpcyBlbnN1cmVzIHRoZSBsaW5lIGlzIGF0IGxlYXN0IG9uZS5cbiAgICBpbml0aWFsTGluZTogTWF0aC5tYXgocm93RGF0YS5yYW5nZSA/IHJvd0RhdGEucmFuZ2Uuc3RhcnQucm93IDogMCwgMCksXG4gIH07XG4gIGF0b20ud29ya3NwYWNlLm9wZW4odXJpLCBvcHRpb25zKTtcbn1cblxuY2xhc3MgRGlhZ25vc3RpY3NQYW5lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBkaWFnbm9zdGljczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgc2hvd0ZpbGVOYW1lOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB3aWR0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9yb3dHZXR0ZXIgPSB0aGlzLl9yb3dHZXR0ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yb3dIZWlnaHRHZXR0ZXIgPSB0aGlzLl9yb3dIZWlnaHRHZXR0ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZW5kZXJIZWFkZXIgPSB0aGlzLl9yZW5kZXJIZWFkZXIuYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9yb3dHZXR0ZXIocm93SW5kZXg6IG51bWJlcik6IERpYWdub3N0aWNNZXNzYWdlIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5kaWFnbm9zdGljc1tyb3dJbmRleF07XG4gIH1cblxuICBfcm93SGVpZ2h0R2V0dGVyKHJvd0luZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIC8vIFRPRE8odDgwNTU0MTYpOiBJbXByb3ZlIHRoaXMgaGV1cmlzdGljIGZvciBkZXRlcm1pbmluZyB0aGUgcm93IGhlaWdodC5cbiAgICBjb25zdCBkaWFnbm9zdGljID0gdGhpcy5fcm93R2V0dGVyKHJvd0luZGV4KTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWMoZGlhZ25vc3RpYyk7XG4gICAgY29uc3Qge3RleHQ6IG1lc3NhZ2V9ID0gbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCdtZXNzYWdlJywgZGlhZ25vc3RpYyk7XG5cbiAgICAvLyBOb3RlIHRoaXMgd2lsbCBiZSBhbiBvdmVyZXN0aW1hdGUgaWYgdGhlIG1lc3NhZ2UgaXMgSFRNTCBpbnN0ZWFkIG9mIHBsYWludGV4dC5cbiAgICBjb25zdCBtZXNzYWdlTGVuZ3RoID0gbWVzc2FnZS5sZW5ndGg7XG5cbiAgICBjb25zdCB0ZXh0TGVuZ3RoID0gTWF0aC5tYXgoZmlsZVBhdGgubGVuZ3RoLCBtZXNzYWdlTGVuZ3RoKTtcbiAgICBjb25zdCBudW1Sb3dzT2ZUZXh0ID0gTWF0aC5mbG9vcih0ZXh0TGVuZ3RoIC8gTUFYX0NIQVJTX1BFUl9MSU5FKSArIDE7XG4gICAgcmV0dXJuIG51bVJvd3NPZlRleHQgKiBERUZBVUxUX1JPV19URVhUX0hFSUdIVCArIFJPV19WRVJUSUNBTF9QQURESU5HO1xuICB9XG5cbiAgX3JlbmRlckhlYWRlcihsYWJlbDogP3N0cmluZywgY2VsbERhdGFLZXk6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gVE9ETyhlaHpoYW5nKTogRmlndXJlIG91dCB3aHkgYW4gb25DbGljayBhZGRlZCB0byB0aGlzIDxzcGFuPiBkb2VzIG5vdCBmaXJlLlxuICAgIHJldHVybiAoXG4gICAgICA8c3Bhbj57bGFiZWx9PC9zcGFuPlxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBUT0RPKGVoemhhbmcpOiBTZXR0aW5nIGlzUmVzaXphYmxlPXt0cnVlfSBvbiBjb2x1bW5zIHNlZW1zIHRvIGJyZWFrIHRoaW5ncyBwcmV0dHkgYmFkbHkuXG4gICAgLy8gUGVyaGFwcyB0aGlzIGlzIGJlY2F1c2Ugd2UgYXJlIHVzaW5nIHJlYWN0LWZvci1hdG9tIGluc3RlYWQgb2YgcmVhY3Q/XG4gICAgbGV0IGZpbGVDb2x1bW4gPSBudWxsO1xuICAgIGlmICh0aGlzLnByb3BzLnNob3dGaWxlTmFtZSkge1xuICAgICAgZmlsZUNvbHVtbiA9IChcbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e2ZpbGVDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwiZmlsZVBhdGhcIlxuICAgICAgICAgIGZsZXhHcm93PXsyfVxuICAgICAgICAgIGhlYWRlclJlbmRlcmVyPXt0aGlzLl9yZW5kZXJIZWFkZXJ9XG4gICAgICAgICAgbGFiZWw9XCJGaWxlXCJcbiAgICAgICAgICB3aWR0aD17MTAwfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxUYWJsZVxuICAgICAgICBoZWlnaHQ9e3RoaXMucHJvcHMuaGVpZ2h0fVxuICAgICAgICBoZWFkZXJIZWlnaHQ9ezMwfVxuICAgICAgICBvblJvd0NsaWNrPXtvblJvd0NsaWNrfVxuICAgICAgICBvdmVyZmxvd1g9XCJoaWRkZW5cIlxuICAgICAgICBvdmVyZmxvd1k9XCJhdXRvXCJcbiAgICAgICAgcm93R2V0dGVyPXt0aGlzLl9yb3dHZXR0ZXJ9XG4gICAgICAgIHJvd0hlaWdodD17REVGQVVMVF9ST1dfVEVYVF9IRUlHSFQgKyBST1dfVkVSVElDQUxfUEFERElOR31cbiAgICAgICAgcm93SGVpZ2h0R2V0dGVyPXt0aGlzLl9yb3dIZWlnaHRHZXR0ZXJ9XG4gICAgICAgIHJvd3NDb3VudD17dGhpcy5wcm9wcy5kaWFnbm9zdGljcy5sZW5ndGh9XG4gICAgICAgIHdpZHRoPXt0aGlzLnByb3BzLndpZHRofVxuICAgICAgICA+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXt0eXBlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXt0eXBlQ29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJ0eXBlXCJcbiAgICAgICAgICBtYXhXaWR0aD17MTAwfVxuICAgICAgICAgIGxhYmVsPVwiVHlwZVwiXG4gICAgICAgICAgd2lkdGg9ezc1fVxuICAgICAgICAvPlxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgYWxpZ249XCJsZWZ0XCJcbiAgICAgICAgICBjZWxsRGF0YUdldHRlcj17c291cmNlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXtwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cInByb3ZpZGVyTmFtZVwiXG4gICAgICAgICAgd2lkdGg9ezE3NX1cbiAgICAgICAgICBsYWJlbD1cIlNvdXJjZVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXttZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXttZXNzYWdlQ29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJtZXNzYWdlXCJcbiAgICAgICAgICBmbGV4R3Jvdz17M31cbiAgICAgICAgICBsYWJlbD1cIkRlc2NyaXB0aW9uXCJcbiAgICAgICAgICB3aWR0aD17MTAwfVxuICAgICAgICAvPlxuICAgICAgICB7ZmlsZUNvbHVtbn1cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e2xvY2F0aW9uQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXtwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cInJhbmdlXCJcbiAgICAgICAgICBtYXhXaWR0aD17MTAwfVxuICAgICAgICAgIGxhYmVsPVwiTGluZVwiXG4gICAgICAgICAgd2lkdGg9ezUwfVxuICAgICAgICAvPlxuICAgICAgPC9UYWJsZT5cbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlhZ25vc3RpY3NQYW5lO1xuIl19