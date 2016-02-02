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

module.exports = DiagnosticsPane;
//# sourceMappingURL=data:application/json;base64,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LEVBQUUsMEJBQTBCLEFBQUM7QUFDM0Msc0JBQVksRUFBRSwyQkFBMkIsQUFBQztBQUMxQyxpQkFBTyxFQUFDLGNBQWM7QUFDdEIsZUFBSyxFQUFFLEdBQUcsQUFBQztBQUNYLGVBQUssRUFBQyxRQUFRO1VBQ2Q7UUFDRixvQkFBQyxNQUFNO0FBQ0wsZUFBSyxFQUFDLE1BQU07QUFDWix3QkFBYyxFQUFFLDJCQUEyQixBQUFDO0FBQzVDLHNCQUFZLEVBQUUseUJBQXlCLEFBQUM7QUFDeEMsaUJBQU8sRUFBQyxTQUFTO0FBQ2pCLGtCQUFRLEVBQUUsQ0FBQyxBQUFDO0FBQ1osZUFBSyxFQUFDLGFBQWE7QUFDbkIsZUFBSyxFQUFFLEdBQUcsQUFBQztVQUNYO1FBQ0QsVUFBVTtRQUNYLG9CQUFDLE1BQU07QUFDTCxlQUFLLEVBQUMsTUFBTTtBQUNaLHdCQUFjLEVBQUUsNEJBQTRCLEFBQUM7QUFDN0Msc0JBQVksRUFBRSwyQkFBMkIsQUFBQztBQUMxQyxpQkFBTyxFQUFDLE9BQU87QUFDZixrQkFBUSxFQUFFLEdBQUcsQUFBQztBQUNkLGVBQUssRUFBQyxNQUFNO0FBQ1osZUFBSyxFQUFFLEVBQUUsQUFBQztVQUNWO09BQ0ksQ0FDUjtLQUNIOzs7U0E3R0csZUFBZTtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQWdIN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGlhZ25vc3RpY3NQYW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0RpYWdub3N0aWNNZXNzYWdlfSBmcm9tICcuLi8uLi9iYXNlJztcblxuY29uc3Qge0NvbHVtbiwgVGFibGV9ID0gcmVxdWlyZSgnZml4ZWQtZGF0YS10YWJsZScpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi8uLi9hbmFseXRpY3MnO1xuXG5jb25zdCB7ZmlsZUNvbHVtbkNlbGxEYXRhR2V0dGVyfSA9IHJlcXVpcmUoJy4vcGFuZVV0aWxzJyk7XG5cbnR5cGUgdGV4dEFuZFR5cGUgPSB7dGV4dDogc3RyaW5nLCBpc1BsYWluVGV4dDogYm9vbGVhbn07XG5cbmNvbnN0IFJPV19WRVJUSUNBTF9QQURESU5HID0gMTY7IC8vIDhweCB0b3AgYW5kIGJvdHRvbSBwYWRkaW5nLlxuY29uc3QgREVGQVVMVF9ST1dfVEVYVF9IRUlHSFQgPSAxNTtcbmNvbnN0IE1BWF9DSEFSU19QRVJfTElORSA9IDEwMDtcblxuY29uc3QgVHlwZVRvSGlnaGxpZ2h0Q2xhc3NOYW1lID0ge1xuICBFUlJPUjogJ2hpZ2hsaWdodC1lcnJvcicsXG4gIFdBUk5JTkc6ICdoaWdobGlnaHQtd2FybmluZycsXG59O1xuXG5mdW5jdGlvbiBsb2NhdGlvbkNvbHVtbkNlbGxEYXRhR2V0dGVyKGNlbGxEYXRhS2V5OiAncmFuZ2UnLCBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIHJldHVybiBkaWFnbm9zdGljLnJhbmdlID8gKGRpYWdub3N0aWMucmFuZ2Uuc3RhcnQucm93ICsgMSkudG9TdHJpbmcoKSA6ICcnO1xufVxuXG5mdW5jdGlvbiB0eXBlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoY2VsbERhdGFLZXk6ICd0eXBlJywgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICByZXR1cm4gZGlhZ25vc3RpYy50eXBlO1xufVxuXG5mdW5jdGlvbiBzb3VyY2VDb2x1bW5DZWxsRGF0YUdldHRlcihjZWxsRGF0YUtleTogJ3Byb3ZpZGVyTmFtZScsIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRpYWdub3N0aWMucHJvdmlkZXJOYW1lO1xufVxuXG5mdW5jdGlvbiBwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXIodGV4dDogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgLy8gRm9yIGNvbnNpc3RlbmN5IHdpdGggbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCksIHJlbmRlciBwbGFpbnRleHQgaW4gYSA8c3Bhbj4gc28gdGhhdFxuICAvLyBldmVyeXRoaW5nIGxpbmVzIHVwLlxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1maXhlZC1kYXRhLWNlbGxcIj57dGV4dH08L3NwYW4+O1xufVxuXG5mdW5jdGlvbiB0eXBlQ29sdW1uQ2VsbFJlbmRlcmVyKHRleHQ6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IGhpZ2hsaWdodENsYXNzTmFtZSA9IFR5cGVUb0hpZ2hsaWdodENsYXNzTmFtZVt0ZXh0LnRvVXBwZXJDYXNlKCldIHx8ICdoaWdobGlnaHQnO1xuICByZXR1cm4gKFxuICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZml4ZWQtZGF0YS1jZWxsXCI+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2hpZ2hsaWdodENsYXNzTmFtZX0+XG4gICAgICAgIHt0ZXh0fVxuICAgICAgPC9zcGFuPlxuICAgIDwvc3Bhbj5cbiAgKTtcbn1cblxuLyoqIEByZXR1cm4gdGV4dCBhbmQgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciBpdCBpcyBwbGFpbnRleHQgb3IgSFRNTC4gKi9cbmZ1bmN0aW9uIG1lc3NhZ2VDb2x1bW5DZWxsRGF0YUdldHRlcihcbiAgY2VsbERhdGFLZXk6ICdtZXNzYWdlJyxcbiAgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHRleHRBbmRUeXBlIHtcbiAgbGV0IHRleHQgPSAnJztcbiAgbGV0IGlzUGxhaW5UZXh0ID0gdHJ1ZTtcbiAgY29uc3QgdHJhY2VzID0gZGlhZ25vc3RpYy50cmFjZSB8fCBbXTtcbiAgY29uc3QgYWxsTWVzc2FnZXM6IEFycmF5PHtodG1sPzogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nfT4gPSBbZGlhZ25vc3RpYywgLi4udHJhY2VzXTtcbiAgZm9yIChjb25zdCBtZXNzYWdlIG9mIGFsbE1lc3NhZ2VzKSB7XG4gICAgaWYgKG1lc3NhZ2UuaHRtbCAhPSBudWxsKSB7XG4gICAgICB0ZXh0ICs9IG1lc3NhZ2UuaHRtbCArICcgJztcbiAgICAgIGlzUGxhaW5UZXh0ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlLnRleHQgIT0gbnVsbCkge1xuICAgICAgdGV4dCArPSBtZXNzYWdlLnRleHQgKyAnICc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmVpdGhlciB0ZXh0IG5vciBodG1sIHByb3BlcnR5IGRlZmluZWQgb246ICR7bWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB0ZXh0OiB0ZXh0LnRyaW0oKSxcbiAgICBpc1BsYWluVGV4dCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWVzc2FnZUNvbHVtbkNlbGxSZW5kZXJlcihtZXNzYWdlOiB0ZXh0QW5kVHlwZSk6IFJlYWN0RWxlbWVudCB7XG4gIGlmIChtZXNzYWdlLmlzUGxhaW5UZXh0KSB7XG4gICAgcmV0dXJuIHBsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcihtZXNzYWdlLnRleHQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWZpeGVkLWRhdGEtY2VsbFwiIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBtZXNzYWdlLnRleHR9fSAvPjtcbiAgfVxufVxuXG5mdW5jdGlvbiBvblJvd0NsaWNrKFxuICBldmVudDogU3ludGhldGljTW91c2VFdmVudCxcbiAgcm93SW5kZXg6IG51bWJlcixcbiAgcm93RGF0YTogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHZvaWQge1xuICBpZiAocm93RGF0YS5zY29wZSAhPT0gJ2ZpbGUnIHx8IHJvd0RhdGEuZmlsZVBhdGggPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyYWNrKCdkaWFnbm9zdGljcy1wYW5lbC1nb3RvLWxvY2F0aW9uJyk7XG5cbiAgY29uc3QgdXJpID0gcm93RGF0YS5maWxlUGF0aDtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAvLyBJZiBpbml0aWFsTGluZSBpcyBOLCBBdG9tIHdpbGwgbmF2aWdhdGUgdG8gbGluZSBOKzEuXG4gICAgLy8gRmxvdyBzb21ldGltZXMgcmVwb3J0cyBhIHJvdyBvZiAtMSwgc28gdGhpcyBlbnN1cmVzIHRoZSBsaW5lIGlzIGF0IGxlYXN0IG9uZS5cbiAgICBpbml0aWFsTGluZTogTWF0aC5tYXgocm93RGF0YS5yYW5nZSA/IHJvd0RhdGEucmFuZ2Uuc3RhcnQucm93IDogMCwgMCksXG4gIH07XG4gIGF0b20ud29ya3NwYWNlLm9wZW4odXJpLCBvcHRpb25zKTtcbn1cblxuY2xhc3MgRGlhZ25vc3RpY3NQYW5lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBkaWFnbm9zdGljczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgc2hvd0ZpbGVOYW1lOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB3aWR0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9yb3dHZXR0ZXIgPSB0aGlzLl9yb3dHZXR0ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yb3dIZWlnaHRHZXR0ZXIgPSB0aGlzLl9yb3dIZWlnaHRHZXR0ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZW5kZXJIZWFkZXIgPSB0aGlzLl9yZW5kZXJIZWFkZXIuYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9yb3dHZXR0ZXIocm93SW5kZXg6IG51bWJlcik6IERpYWdub3N0aWNNZXNzYWdlIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5kaWFnbm9zdGljc1tyb3dJbmRleF07XG4gIH1cblxuICBfcm93SGVpZ2h0R2V0dGVyKHJvd0luZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIC8vIFRPRE8odDgwNTU0MTYpOiBJbXByb3ZlIHRoaXMgaGV1cmlzdGljIGZvciBkZXRlcm1pbmluZyB0aGUgcm93IGhlaWdodC5cbiAgICBjb25zdCBkaWFnbm9zdGljID0gdGhpcy5fcm93R2V0dGVyKHJvd0luZGV4KTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGZpbGVDb2x1bW5DZWxsRGF0YUdldHRlcignZmlsZVBhdGgnLCBkaWFnbm9zdGljKTtcbiAgICBjb25zdCB7dGV4dDogbWVzc2FnZX0gPSBtZXNzYWdlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoJ21lc3NhZ2UnLCBkaWFnbm9zdGljKTtcblxuICAgIC8vIE5vdGUgdGhpcyB3aWxsIGJlIGFuIG92ZXJlc3RpbWF0ZSBpZiB0aGUgbWVzc2FnZSBpcyBIVE1MIGluc3RlYWQgb2YgcGxhaW50ZXh0LlxuICAgIGNvbnN0IG1lc3NhZ2VMZW5ndGggPSBtZXNzYWdlLmxlbmd0aDtcblxuICAgIGNvbnN0IHRleHRMZW5ndGggPSBNYXRoLm1heChmaWxlUGF0aC5sZW5ndGgsIG1lc3NhZ2VMZW5ndGgpO1xuICAgIGNvbnN0IG51bVJvd3NPZlRleHQgPSBNYXRoLmZsb29yKHRleHRMZW5ndGggLyBNQVhfQ0hBUlNfUEVSX0xJTkUpICsgMTtcbiAgICByZXR1cm4gbnVtUm93c09mVGV4dCAqIERFRkFVTFRfUk9XX1RFWFRfSEVJR0hUICsgUk9XX1ZFUlRJQ0FMX1BBRERJTkc7XG4gIH1cblxuICBfcmVuZGVySGVhZGVyKGxhYmVsOiA/c3RyaW5nLCBjZWxsRGF0YUtleTogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBUT0RPKGVoemhhbmcpOiBGaWd1cmUgb3V0IHdoeSBhbiBvbkNsaWNrIGFkZGVkIHRvIHRoaXMgPHNwYW4+IGRvZXMgbm90IGZpcmUuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuPntsYWJlbH08L3NwYW4+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIFRPRE8oZWh6aGFuZyk6IFNldHRpbmcgaXNSZXNpemFibGU9e3RydWV9IG9uIGNvbHVtbnMgc2VlbXMgdG8gYnJlYWsgdGhpbmdzIHByZXR0eSBiYWRseS5cbiAgICAvLyBQZXJoYXBzIHRoaXMgaXMgYmVjYXVzZSB3ZSBhcmUgdXNpbmcgcmVhY3QtZm9yLWF0b20gaW5zdGVhZCBvZiByZWFjdD9cbiAgICBsZXQgZmlsZUNvbHVtbiA9IG51bGw7XG4gICAgaWYgKHRoaXMucHJvcHMuc2hvd0ZpbGVOYW1lKSB7XG4gICAgICBmaWxlQ29sdW1uID0gKFxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgYWxpZ249XCJsZWZ0XCJcbiAgICAgICAgICBjZWxsRGF0YUdldHRlcj17ZmlsZUNvbHVtbkNlbGxEYXRhR2V0dGVyfVxuICAgICAgICAgIGNlbGxSZW5kZXJlcj17cGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyfVxuICAgICAgICAgIGRhdGFLZXk9XCJmaWxlUGF0aFwiXG4gICAgICAgICAgZmxleEdyb3c9ezJ9XG4gICAgICAgICAgaGVhZGVyUmVuZGVyZXI9e3RoaXMuX3JlbmRlckhlYWRlcn1cbiAgICAgICAgICBsYWJlbD1cIkZpbGVcIlxuICAgICAgICAgIHdpZHRoPXsxMDB9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPFRhYmxlXG4gICAgICAgIGhlaWdodD17dGhpcy5wcm9wcy5oZWlnaHR9XG4gICAgICAgIGhlYWRlckhlaWdodD17MzB9XG4gICAgICAgIG9uUm93Q2xpY2s9e29uUm93Q2xpY2t9XG4gICAgICAgIG92ZXJmbG93WD1cImhpZGRlblwiXG4gICAgICAgIG92ZXJmbG93WT1cImF1dG9cIlxuICAgICAgICByb3dHZXR0ZXI9e3RoaXMuX3Jvd0dldHRlcn1cbiAgICAgICAgcm93SGVpZ2h0PXtERUZBVUxUX1JPV19URVhUX0hFSUdIVCArIFJPV19WRVJUSUNBTF9QQURESU5HfVxuICAgICAgICByb3dIZWlnaHRHZXR0ZXI9e3RoaXMuX3Jvd0hlaWdodEdldHRlcn1cbiAgICAgICAgcm93c0NvdW50PXt0aGlzLnByb3BzLmRpYWdub3N0aWNzLmxlbmd0aH1cbiAgICAgICAgd2lkdGg9e3RoaXMucHJvcHMud2lkdGh9XG4gICAgICAgID5cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e3R5cGVDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3R5cGVDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cInR5cGVcIlxuICAgICAgICAgIG1heFdpZHRoPXsxMDB9XG4gICAgICAgICAgbGFiZWw9XCJUeXBlXCJcbiAgICAgICAgICB3aWR0aD17NzV9XG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBhbGlnbj1cImxlZnRcIlxuICAgICAgICAgIGNlbGxEYXRhR2V0dGVyPXtzb3VyY2VDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwicHJvdmlkZXJOYW1lXCJcbiAgICAgICAgICB3aWR0aD17MTc1fVxuICAgICAgICAgIGxhYmVsPVwiU291cmNlXCJcbiAgICAgICAgLz5cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGFsaWduPVwibGVmdFwiXG4gICAgICAgICAgY2VsbERhdGFHZXR0ZXI9e21lc3NhZ2VDb2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e21lc3NhZ2VDb2x1bW5DZWxsUmVuZGVyZXJ9XG4gICAgICAgICAgZGF0YUtleT1cIm1lc3NhZ2VcIlxuICAgICAgICAgIGZsZXhHcm93PXszfVxuICAgICAgICAgIGxhYmVsPVwiRGVzY3JpcHRpb25cIlxuICAgICAgICAgIHdpZHRoPXsxMDB9XG4gICAgICAgIC8+XG4gICAgICAgIHtmaWxlQ29sdW1ufVxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgYWxpZ249XCJsZWZ0XCJcbiAgICAgICAgICBjZWxsRGF0YUdldHRlcj17bG9jYXRpb25Db2x1bW5DZWxsRGF0YUdldHRlcn1cbiAgICAgICAgICBjZWxsUmVuZGVyZXI9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcn1cbiAgICAgICAgICBkYXRhS2V5PVwicmFuZ2VcIlxuICAgICAgICAgIG1heFdpZHRoPXsxMDB9XG4gICAgICAgICAgbGFiZWw9XCJMaW5lXCJcbiAgICAgICAgICB3aWR0aD17NTB9XG4gICAgICAgIC8+XG4gICAgICA8L1RhYmxlPlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWFnbm9zdGljc1BhbmU7XG4iXX0=