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

var _require = require('fixed-data-table-for-atom');

var Column = _require.Column;
var Table = _require.Table;

var React = require('react-for-atom');

var _require2 = require('./paneUtils');

var fileColumnCellDataGetter = _require2.fileColumnCellDataGetter;

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
      var filePath = fileColumnCellDataGetter('filePath', diagnostic);

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

var PropTypes = React.PropTypes;

DiagnosticsPane.propTypes = {
  height: PropTypes.number.isRequired,
  diagnostics: PropTypes.array.isRequired,
  showFileName: PropTypes.bool,
  width: PropTypes.number.isRequired
};

module.exports = DiagnosticsPane;
//# sourceMappingURL=data:application/json;base64,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Q3hDLGlCQUFPLEVBQUMsU0FBUztBQUNqQixrQkFBUSxFQUFFLENBQUMsQUFBQztBQUNaLGVBQUssRUFBQyxhQUFhO0FBQ25CLGVBQUssRUFBRSxHQUFHLEFBQUM7VUFDWDtRQUNELFVBQVU7UUFDWCxvQkFBQyxNQUFNO0FBQ0wsZUFBSyxFQUFDLE1BQU07QUFDWix3QkFBYyxFQUFFLDRCQUE0QixBQUFDO0FBQzdDLHNCQUFZLEVBQUUsMkJBQTJCLEFBQUM7QUFDMUMsaUJBQU8sRUFBQyxPQUFPO0FBQ2Ysa0JBQVEsRUFBRSxHQUFHLEFBQUM7QUFDZCxlQUFLLEVBQUMsTUFBTTtBQUNaLGVBQUssRUFBRSxFQUFFLEFBQUM7VUFDVjtPQUNJLENBQ1I7S0FDSDs7O1NBdkdHLGVBQWU7R0FBUyxLQUFLLENBQUMsU0FBUzs7SUEwR3RDLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0FBRWhCLGVBQWUsQ0FBQyxTQUFTLEdBQUc7QUFDMUIsUUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNuQyxhQUFXLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVO0FBQ3ZDLGNBQVksRUFBRSxTQUFTLENBQUMsSUFBSTtBQUM1QixPQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0NBQ25DLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGlhZ25vc3RpY3NQYW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0RpYWdub3N0aWNNZXNzYWdlfSBmcm9tICcuLi8uLi9iYXNlJztcblxuY29uc3Qge0NvbHVtbiwgVGFibGV9ID0gcmVxdWlyZSgnZml4ZWQtZGF0YS10YWJsZS1mb3ItYXRvbScpO1xuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi8uLi9hbmFseXRpY3MnO1xuXG5jb25zdCB7ZmlsZUNvbHVtbkNlbGxEYXRhR2V0dGVyfSA9IHJlcXVpcmUoJy4vcGFuZVV0aWxzJyk7XG5cbnR5cGUgdGV4dEFuZFR5cGUgPSB7dGV4dDogc3RyaW5nLCBpc1BsYWluVGV4dDogYm9vbGVhbn07XG5cbmNvbnN0IFJPV19WRVJUSUNBTF9QQURESU5HID0gMTY7IC8vIDhweCB0b3AgYW5kIGJvdHRvbSBwYWRkaW5nLlxuY29uc3QgREVGQVVMVF9ST1dfVEVYVF9IRUlHSFQgPSAxNTtcbmNvbnN0IE1BWF9DSEFSU19QRVJfTElORSA9IDEwMDtcblxuY29uc3QgVHlwZVRvSGlnaGxpZ2h0Q2xhc3NOYW1lID0ge1xuICBFUlJPUjogJ2hpZ2hsaWdodC1lcnJvcicsXG4gIFdBUk5JTkc6ICdoaWdobGlnaHQtd2FybmluZycsXG59O1xuXG5mdW5jdGlvbiBsb2NhdGlvbkNvbHVtbkNlbGxEYXRhR2V0dGVyKGNlbGxEYXRhS2V5OiAncmFuZ2UnLCBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIHJldHVybiBkaWFnbm9zdGljLnJhbmdlID8gKGRpYWdub3N0aWMucmFuZ2Uuc3RhcnQucm93ICsgMSkudG9TdHJpbmcoKSA6ICcnO1xufVxuXG5mdW5jdGlvbiB0eXBlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoY2VsbERhdGFLZXk6ICd0eXBlJywgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICByZXR1cm4gZGlhZ25vc3RpYy50eXBlO1xufVxuXG5mdW5jdGlvbiBzb3VyY2VDb2x1bW5DZWxsRGF0YUdldHRlcihjZWxsRGF0YUtleTogJ3Byb3ZpZGVyTmFtZScsIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRpYWdub3N0aWMucHJvdmlkZXJOYW1lO1xufVxuXG5mdW5jdGlvbiBwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXIodGV4dDogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgLy8gRm9yIGNvbnNpc3RlbmN5IHdpdGggbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCksIHJlbmRlciBwbGFpbnRleHQgaW4gYSA8c3Bhbj4gc28gdGhhdFxuICAvLyBldmVyeXRoaW5nIGxpbmVzIHVwLlxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1maXhlZC1kYXRhLWNlbGxcIj57dGV4dH08L3NwYW4+O1xufVxuXG5mdW5jdGlvbiB0eXBlQ29sdW1uQ2VsbFJlbmRlcmVyKHRleHQ6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IGhpZ2hsaWdodENsYXNzTmFtZSA9IFR5cGVUb0hpZ2hsaWdodENsYXNzTmFtZVt0ZXh0LnRvVXBwZXJDYXNlKCldIHx8ICdoaWdobGlnaHQnO1xuICByZXR1cm4gKFxuICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZml4ZWQtZGF0YS1jZWxsXCI+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2hpZ2hsaWdodENsYXNzTmFtZX0+XG4gICAgICAgIHt0ZXh0fVxuICAgICAgPC9zcGFuPlxuICAgIDwvc3Bhbj5cbiAgKTtcbn1cblxuLyoqIEByZXR1cm4gdGV4dCBhbmQgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciBpdCBpcyBwbGFpbnRleHQgb3IgSFRNTC4gKi9cbmZ1bmN0aW9uIG1lc3NhZ2VDb2x1bW5DZWxsRGF0YUdldHRlcihcbiAgY2VsbERhdGFLZXk6ICdtZXNzYWdlJyxcbiAgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHRleHRBbmRUeXBlIHtcbiAgbGV0IHRleHQgPSAnJztcbiAgbGV0IGlzUGxhaW5UZXh0ID0gdHJ1ZTtcbiAgY29uc3QgdHJhY2VzID0gZGlhZ25vc3RpYy50cmFjZSB8fCBbXTtcbiAgY29uc3QgYWxsTWVzc2FnZXM6IEFycmF5PHtodG1sPzogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nfT4gPSBbZGlhZ25vc3RpYywgLi4udHJhY2VzXTtcbiAgZm9yIChjb25zdCBtZXNzYWdlIG9mIGFsbE1lc3NhZ2VzKSB7XG4gICAgaWYgKG1lc3NhZ2UuaHRtbCAhPSBudWxsKSB7XG4gICAgICB0ZXh0ICs9IG1lc3NhZ2UuaHRtbCArICcgJztcbiAgICAgIGlzUGxhaW5UZXh0ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlLnRleHQgIT0gbnVsbCkge1xuICAgICAgdGV4dCArPSBtZXNzYWdlLnRleHQgKyAnICc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmVpdGhlciB0ZXh0IG5vciBodG1sIHByb3BlcnR5IGRlZmluZWQgb246ICR7bWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB0ZXh0OiB0ZXh0LnRyaW0oKSxcbiAgICBpc1BsYWluVGV4dCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWVzc2FnZUNvbHVtbkNlbGxSZW5kZXJlcihtZXNzYWdlOiB0ZXh0QW5kVHlwZSk6IFJlYWN0RWxlbWVudCB7XG4gIGlmIChtZXNzYWdlLmlzUGxhaW5UZXh0KSB7XG4gICAgcmV0dXJuIHBsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcihtZXNzYWdlLnRleHQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWZpeGVkLWRhdGEtY2VsbFwiIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBtZXNzYWdlLnRleHR9fSAvPjtcbiAgfVxufVxuXG5mdW5jdGlvbiBvblJvd0NsaWNrKFxuICBldmVudDogU3ludGhldGljTW91c2VFdmVudCxcbiAgcm93SW5kZXg6IG51bWJlcixcbiAgcm93RGF0YTogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHZvaWQge1xuICBpZiAocm93RGF0YS5zY29wZSAhPT0gJ2ZpbGUnIHx8IHJvd0RhdGEuZmlsZVBhdGggPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyYWNrKCdkaWFnbm9zdGljcy1wYW5lbC1nb3RvLWxvY2F0aW9uJyk7XG5cbiAgY29uc3QgdXJpID0gcm93RGF0YS5maWxlUGF0aDtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAvLyBJZiBpbml0aWFsTGluZSBpcyBOLCBBdG9tIHdpbGwgbmF2aWdhdGUgdG8gbGluZSBOKzEuXG4gICAgLy8gRmxvdyBzb21ldGltZXMgcmVwb3J0cyBhIHJvdyBvZiAtMSwgc28gdGhpcyBlbnN1cmVzIHRoZSBsaW5lIGlzIGF0IGxlYXN0IG9uZS5cbiAgICBpbml0aWFsTGluZTogTWF0aC5tYXgocm93RGF0YS5yYW5nZSA/IHJvd0RhdGEucmFuZ2Uuc3RhcnQucm93IDogMCwgMCksXG4gIH07XG4gIGF0b20ud29ya3NwYWNlLm9wZW4odXJpLCBvcHRpb25zKTtcbn1cblxuY2xhc3MgRGlhZ25vc3RpY3NQYW5lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogbWl4ZWQpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fcm93R2V0dGVyID0gdGhpcy5fcm93R2V0dGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcm93SGVpZ2h0R2V0dGVyID0gdGhpcy5fcm93SGVpZ2h0R2V0dGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcmVuZGVySGVhZGVyID0gdGhpcy5fcmVuZGVySGVhZGVyLmJpbmQodGhpcyk7XG4gIH1cblxuICBfcm93R2V0dGVyKHJvd0luZGV4OiBudW1iZXIpOiBEaWFnbm9zdGljTWVzc2FnZSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZGlhZ25vc3RpY3Nbcm93SW5kZXhdO1xuICB9XG5cbiAgX3Jvd0hlaWdodEdldHRlcihyb3dJbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAvLyBUT0RPKHQ4MDU1NDE2KTogSW1wcm92ZSB0aGlzIGhldXJpc3RpYyBmb3IgZGV0ZXJtaW5pbmcgdGhlIHJvdyBoZWlnaHQuXG4gICAgY29uc3QgZGlhZ25vc3RpYyA9IHRoaXMuX3Jvd0dldHRlcihyb3dJbmRleCk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoJ2ZpbGVQYXRoJywgZGlhZ25vc3RpYyk7XG4gICAgY29uc3Qge3RleHQ6IG1lc3NhZ2V9ID0gbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCdtZXNzYWdlJywgZGlhZ25vc3RpYyk7XG5cbiAgICAvLyBOb3RlIHRoaXMgd2lsbCBiZSBhbiBvdmVyZXN0aW1hdGUgaWYgdGhlIG1lc3NhZ2UgaXMgSFRNTCBpbnN0ZWFkIG9mIHBsYWludGV4dC5cbiAgICBjb25zdCBtZXNzYWdlTGVuZ3RoID0gbWVzc2FnZS5sZW5ndGg7XG5cbiAgICBjb25zdCB0ZXh0TGVuZ3RoID0gTWF0aC5tYXgoZmlsZVBhdGgubGVuZ3RoLCBtZXNzYWdlTGVuZ3RoKTtcbiAgICBjb25zdCBudW1Sb3dzT2ZUZXh0ID0gTWF0aC5mbG9vcih0ZXh0TGVuZ3RoIC8gTUFYX0NIQVJTX1BFUl9MSU5FKSArIDE7XG4gICAgcmV0dXJuIG51bVJvd3NPZlRleHQgKiBERUZBVUxUX1JPV19URVhUX0hFSUdIVCArIFJPV19WRVJUSUNBTF9QQURESU5HO1xuICB9XG5cbiAgX3JlbmRlckhlYWRlcihsYWJlbDogP3N0cmluZywgY2VsbERhdGFLZXk6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gVE9ETyhlaHpoYW5nKTogRmlndXJlIG91dCB3aHkgYW4gb25DbGljayBhZGRlZCB0byB0aGlzIDxzcGFuPiBkb2VzIG5vdCBmaXJlLlxuICAgIHJldHVybiAoXG4gICAgICA8c3Bhbj57bGFiZWx9PC9zcGFuPlxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBUT0RPKGVoemhhbmcpOiBTZXR0aW5nIGlzUmVzaXphYmxlPXt0cnVlfSBvbiBjb2x1bW5zIHNlZW1zIHRvIGJyZWFrIHRoaW5ncyBwcmV0dHkgYmFkbHkuXG4gICAgLy8gUGVyaGFwcyB0aGlzIGlzIGJlY2F1c2Ugd2UgYXJlIHVzaW5nIHJlYWN0LWZvci1hdG9tIGluc3RlYWQgb2YgcmVhY3Q/XG4gICAgbGV0IGZpbGVDb2x1bW4gPSBudWxsO1xuICAgIGlmICh0aGlzLnByb3BzLnNob3dGaWxlTmFtZSkge1xuICAgICAgZmlsZUNvbHVtbiA9IChcbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e2ZpbGVDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwiZmlsZVBhdGhcIlxuICAgICAgICAgIGZsZXhHcm93PXsyfVxuICAgICAgICAgIGhlYWRlclJlbmRlcmVyPXt0aGlzLl9yZW5kZXJIZWFkZXJ9XG4gICAgICAgICAgbGFiZWw9XCJGaWxlXCJcbiAgICAgICAgICB3aWR0aD17MTAwfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxUYWJsZVxuICAgICAgICBoZWlnaHQ9e3RoaXMucHJvcHMuaGVpZ2h0fVxuICAgICAgICBoZWFkZXJIZWlnaHQ9ezMwfVxuICAgICAgICBvblJvd0NsaWNrPXtvblJvd0NsaWNrfVxuICAgICAgICBvdmVyZmxvd1g9XCJoaWRkZW5cIlxuICAgICAgICBvdmVyZmxvd1k9XCJhdXRvXCJcbiAgICAgICAgcm93R2V0dGVyPXt0aGlzLl9yb3dHZXR0ZXJ9XG4gICAgICAgIHJvd0hlaWdodD17REVGQVVMVF9ST1dfVEVYVF9IRUlHSFQgKyBST1dfVkVSVElDQUxfUEFERElOR31cbiAgICAgICAgcm93SGVpZ2h0R2V0dGVyPXt0aGlzLl9yb3dIZWlnaHRHZXR0ZXJ9XG4gICAgICAgIHJvd3NDb3VudD17dGhpcy5wcm9wcy5kaWFnbm9zdGljcy5sZW5ndGh9XG4gICAgICAgIHdpZHRoPXt0aGlzLnByb3BzLndpZHRofVxuICAgICAgICA+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXt0eXBlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXt0eXBlQ29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJ0eXBlXCJcbiAgICAgICAgICBtYXhXaWR0aD17MTAwfVxuICAgICAgICAgIGxhYmVsPVwiVHlwZVwiXG4gICAgICAgICAgd2lkdGg9ezc1fVxuICAgICAgICAvPlxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgYWxpZ249XCJsZWZ0XCJcbiAgICAgICAgICBjZWxsRGF0YUdldHRlcj17c291cmNlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXtwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cInByb3ZpZGVyTmFtZVwiXG4gICAgICAgICAgd2lkdGg9ezE3NX1cbiAgICAgICAgICBsYWJlbD1cIlNvdXJjZVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXttZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXttZXNzYWdlQ29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJtZXNzYWdlXCJcbiAgICAgICAgICBmbGV4R3Jvdz17M31cbiAgICAgICAgICBsYWJlbD1cIkRlc2NyaXB0aW9uXCJcbiAgICAgICAgICB3aWR0aD17MTAwfVxuICAgICAgICAvPlxuICAgICAgICB7ZmlsZUNvbHVtbn1cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e2xvY2F0aW9uQ29sdW1uQ2VsbERhdGFHZXR0ZXJ9XG4gICAgICAgICAgY2VsbFJlbmRlcmVyPXtwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cInJhbmdlXCJcbiAgICAgICAgICBtYXhXaWR0aD17MTAwfVxuICAgICAgICAgIGxhYmVsPVwiTGluZVwiXG4gICAgICAgICAgd2lkdGg9ezUwfVxuICAgICAgICAvPlxuICAgICAgPC9UYWJsZT5cbiAgICApO1xuICB9XG59XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbkRpYWdub3N0aWNzUGFuZS5wcm9wVHlwZXMgPSB7XG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICBkaWFnbm9zdGljczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gIHNob3dGaWxlTmFtZTogUHJvcFR5cGVzLmJvb2wsXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdub3N0aWNzUGFuZTtcbiJdfQ==