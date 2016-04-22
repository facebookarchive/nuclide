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

var _paneUtils = require('./paneUtils');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideUiLibPanelComponentScroller = require('../../nuclide-ui/lib/PanelComponentScroller');

var _reactForAtom = require('react-for-atom');

var _nuclideAnalytics = require('../../nuclide-analytics');

var PropTypes = _reactForAtom.React.PropTypes;

var DEFAULT_LINE_TEXT_HEIGHT = 15;
var PIXELS_PER_CHAR = 6;
var MAX_ROW_LINES = 3;
var ROW_HORIZONTAL_PADDING = 16;
var ROW_VERTICAL_PADDING = 8;

var TYPE_COLUMN_WIDTH = 80;
var PROVIDER_NAME_COLUMN_WIDTH = 175;
var FILE_PATH_COLUMN_WIDTH = 300;
var RANGE_COLUMN_WIDTH = 50;

// Maximum number of results to render in the table before truncating and displaying a "Max results
// reached" message.
var MAX_RESULTS_COUNT = 1000;

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
  return _reactForAtom.React.createElement(
    'span',
    null,
    text
  );
}

function typeColumnCellRenderer(text) {
  var highlightClassName = TypeToHighlightClassName[text.toUpperCase()] || 'highlight';
  return _reactForAtom.React.createElement(
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
    return _reactForAtom.React.createElement('span', { dangerouslySetInnerHTML: { __html: message.text } });
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

/*
 * Returns markup similar to that produced by fixed-data-table v0.6.0.
 */
function Cell(props) {
  return _reactForAtom.React.createElement(
    'div',
    {
      className: 'fixedDataTableCellLayout_main public_fixedDataTableCell_main',
      style: props.style,
      title: props.title },
    _reactForAtom.React.createElement(
      'div',
      { className: 'fixedDataTableCellLayout_wrap1 public_fixedDataTableCell_wrap1' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'fixedDataTableCellLayout_wrap2 public_fixedDataTableCell_wrap2' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'fixedDataTableCellLayout_wrap3 public_fixedDataTableCell_wrap3' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'public_fixedDataTableCell_cellContent' },
            props.children
          )
        )
      )
    )
  );
}

var DiagnosticsPane = (function (_React$Component) {
  _inherits(DiagnosticsPane, _React$Component);

  _createClass(DiagnosticsPane, null, [{
    key: 'propTypes',
    value: {
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
    key: 'render',
    value: function render() {
      var _this = this;

      var diagnosticCells = [];

      var _loop = function (index) {
        var diag = _this.props.diagnostics[index];
        diagnosticCells.push(_reactForAtom.React.createElement(
          'div',
          {
            className: 'fixedDataTableCellGroupLayout_cellGroup nuclide-diagnostics-pane__actionable',
            key: index,
            onClick: function (e) {
              onRowClick(e, index, diag);
            },
            style: { height: _this._rowHeightGetter(index) } },
          _reactForAtom.React.createElement(
            Cell,
            { style: { width: _this.state.widths.type + 'px' } },
            typeColumnCellRenderer(typeColumnCellDataGetter('type', diag))
          ),
          _reactForAtom.React.createElement(
            Cell,
            { style: { width: _this.state.widths.providerName + 'px' } },
            plainTextColumnCellRenderer(sourceColumnCellDataGetter('providerName', diag))
          ),
          _this.props.showFileName ? _reactForAtom.React.createElement(
            Cell,
            {
              style: { width: _this.state.widths.filePath + 'px' },
              title: plainTextColumnCellRenderer((0, _paneUtils.fileColumnCellDataGetter)('filePath', diag)) },
            plainTextColumnCellRenderer((0, _paneUtils.fileColumnCellDataGetter)('filePath', diag))
          ) : null,
          _reactForAtom.React.createElement(
            Cell,
            { style: { width: _this.state.widths.range + 'px' } },
            plainTextColumnCellRenderer(locationColumnCellDataGetter('range', diag))
          ),
          _reactForAtom.React.createElement(
            Cell,
            { style: { width: _this._getMessageWidth() + 'px' } },
            messageColumnCellRenderer(messageColumnCellDataGetter('message', diag))
          )
        ));
      };

      for (var index = 0; index < Math.min(MAX_RESULTS_COUNT, this.props.diagnostics.length); index++) {
        _loop(index);
      }

      if (this.props.diagnostics.length > MAX_RESULTS_COUNT) {
        diagnosticCells.push(_reactForAtom.React.createElement(
          'div',
          { className: 'fixedDataTableCellGroupLayout_cellGroup', key: 'maxResultsMessage' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'public_fixedDataTableCell_cellContent text-center' },
            _reactForAtom.React.createElement(
              'em',
              null,
              'Max results (',
              MAX_RESULTS_COUNT,
              ') reached. Fix diagnostics or show only diagnostics for the current file to view more.'
            )
          )
        ));
      }

      return _reactForAtom.React.createElement(
        'div',
        { className: 'fixedDataTableLayout_main' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'public_fixedDataTable_main' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'public_fixedDataTable_header' },
            _reactForAtom.React.createElement(
              'div',
              { className: 'fixedDataTableCellGroupLayout_cellGroup', style: { height: '30px' } },
              _reactForAtom.React.createElement(
                Cell,
                { style: { width: this.state.widths.type + 'px' } },
                'Type'
              ),
              _reactForAtom.React.createElement(
                Cell,
                { style: { width: this.state.widths.providerName + 'px' } },
                'Source'
              ),
              this.props.showFileName ? _reactForAtom.React.createElement(
                Cell,
                { style: { width: this.state.widths.filePath + 'px' } },
                'File'
              ) : null,
              _reactForAtom.React.createElement(
                Cell,
                { style: { width: this.state.widths.range + 'px' } },
                'Line'
              ),
              _reactForAtom.React.createElement(
                Cell,
                { style: { width: this._getMessageWidth() + 'px' } },
                'Description'
              )
            )
          ),
          _reactForAtom.React.createElement(
            _nuclideUiLibPanelComponentScroller.PanelComponentScroller,
            { flexDirection: 'column' },
            diagnosticCells
          )
        )
      );
    }
  }]);

  return DiagnosticsPane;
})(_reactForAtom.React.Component);

module.exports = DiagnosticsPane;
//# sourceMappingURL=data:application/json;base64,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WSxHQUNwRSxJQUFJO2NBRVI7QUFBQyxvQkFBSTtrQkFBQyxLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxPQUFJLEVBQUMsQUFBQzs7ZUFBWTtjQUNqRTtBQUFDLG9CQUFJO2tCQUFDLEtBQUssRUFBRSxFQUFDLEtBQUssRUFBSyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsT0FBSSxFQUFDLEFBQUM7O2VBQW1CO2FBQ3BFO1dBQ0Y7VUFDTjs7Y0FBd0IsYUFBYSxFQUFDLFFBQVE7WUFDM0MsZUFBZTtXQUNPO1NBQ3JCO09BQ0YsQ0FDTjtLQUNIOzs7U0FySEcsZUFBZTtHQUFTLG9CQUFNLFNBQVM7O0FBd0g3QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljc1BhbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlhZ25vc3RpY01lc3NhZ2V9IGZyb20gJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtYmFzZSc7XG5cbmltcG9ydCB7ZmlsZUNvbHVtbkNlbGxEYXRhR2V0dGVyfSBmcm9tICcuL3BhbmVVdGlscyc7XG5pbXBvcnQge2dvVG9Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtQYW5lbENvbXBvbmVudFNjcm9sbGVyfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9QYW5lbENvbXBvbmVudFNjcm9sbGVyJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxudHlwZSB0ZXh0QW5kVHlwZSA9IHt0ZXh0OiBzdHJpbmc7IGlzUGxhaW5UZXh0OiBib29sZWFufTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcbmNvbnN0IERFRkFVTFRfTElORV9URVhUX0hFSUdIVCA9IDE1O1xuY29uc3QgUElYRUxTX1BFUl9DSEFSID0gNjtcbmNvbnN0IE1BWF9ST1dfTElORVMgPSAzO1xuY29uc3QgUk9XX0hPUklaT05UQUxfUEFERElORyA9IDE2O1xuY29uc3QgUk9XX1ZFUlRJQ0FMX1BBRERJTkcgPSA4O1xuXG5jb25zdCBUWVBFX0NPTFVNTl9XSURUSCA9IDgwO1xuY29uc3QgUFJPVklERVJfTkFNRV9DT0xVTU5fV0lEVEggPSAxNzU7XG5jb25zdCBGSUxFX1BBVEhfQ09MVU1OX1dJRFRIID0gMzAwO1xuY29uc3QgUkFOR0VfQ09MVU1OX1dJRFRIID0gNTA7XG5cbi8vIE1heGltdW0gbnVtYmVyIG9mIHJlc3VsdHMgdG8gcmVuZGVyIGluIHRoZSB0YWJsZSBiZWZvcmUgdHJ1bmNhdGluZyBhbmQgZGlzcGxheWluZyBhIFwiTWF4IHJlc3VsdHNcbi8vIHJlYWNoZWRcIiBtZXNzYWdlLlxuY29uc3QgTUFYX1JFU1VMVFNfQ09VTlQgPSAxMDAwO1xuXG5jb25zdCBUeXBlVG9IaWdobGlnaHRDbGFzc05hbWUgPSBPYmplY3QuZnJlZXplKHtcbiAgRVJST1I6ICdoaWdobGlnaHQtZXJyb3InLFxuICBXQVJOSU5HOiAnaGlnaGxpZ2h0LXdhcm5pbmcnLFxufSk7XG5cbmZ1bmN0aW9uIGxvY2F0aW9uQ29sdW1uQ2VsbERhdGFHZXR0ZXIoY2VsbERhdGFLZXk6ICdyYW5nZScsIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRpYWdub3N0aWMucmFuZ2UgPyAoZGlhZ25vc3RpYy5yYW5nZS5zdGFydC5yb3cgKyAxKS50b1N0cmluZygpIDogJyc7XG59XG5cbmZ1bmN0aW9uIHR5cGVDb2x1bW5DZWxsRGF0YUdldHRlcihjZWxsRGF0YUtleTogJ3R5cGUnLCBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIHJldHVybiBkaWFnbm9zdGljLnR5cGU7XG59XG5cbmZ1bmN0aW9uIHNvdXJjZUNvbHVtbkNlbGxEYXRhR2V0dGVyKFxuICBjZWxsRGF0YUtleTogJ3Byb3ZpZGVyTmFtZScsXG4gIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlXG4pOiBzdHJpbmcge1xuICByZXR1cm4gZGlhZ25vc3RpYy5wcm92aWRlck5hbWU7XG59XG5cbmZ1bmN0aW9uIHBsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcih0ZXh0OiBzdHJpbmcpOiBSZWFjdC5FbGVtZW50IHtcbiAgLy8gRm9yIGNvbnNpc3RlbmN5IHdpdGggbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCksIHJlbmRlciBwbGFpbnRleHQgaW4gYSA8c3Bhbj4gc28gdGhhdFxuICAvLyBldmVyeXRoaW5nIGxpbmVzIHVwLlxuICByZXR1cm4gPHNwYW4+e3RleHR9PC9zcGFuPjtcbn1cblxuZnVuY3Rpb24gdHlwZUNvbHVtbkNlbGxSZW5kZXJlcih0ZXh0OiBzdHJpbmcpOiBSZWFjdC5FbGVtZW50IHtcbiAgY29uc3QgaGlnaGxpZ2h0Q2xhc3NOYW1lID0gVHlwZVRvSGlnaGxpZ2h0Q2xhc3NOYW1lW3RleHQudG9VcHBlckNhc2UoKV0gfHwgJ2hpZ2hsaWdodCc7XG4gIHJldHVybiAoXG4gICAgPHNwYW4gY2xhc3NOYW1lPXtoaWdobGlnaHRDbGFzc05hbWV9PlxuICAgICAge3RleHR9XG4gICAgPC9zcGFuPlxuICApO1xufVxuXG4vKiogQHJldHVybiB0ZXh0IGFuZCBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIGl0IGlzIHBsYWludGV4dCBvciBIVE1MLiAqL1xuZnVuY3Rpb24gbWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKFxuICBjZWxsRGF0YUtleTogJ21lc3NhZ2UnLFxuICBkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZVxuKTogdGV4dEFuZFR5cGUge1xuICBsZXQgdGV4dCA9ICcnO1xuICBsZXQgaXNQbGFpblRleHQgPSB0cnVlO1xuICBjb25zdCB0cmFjZXMgPSBkaWFnbm9zdGljLnRyYWNlIHx8IFtdO1xuICBjb25zdCBhbGxNZXNzYWdlczogQXJyYXk8e2h0bWw/OiBzdHJpbmc7IHRleHQ/OiBzdHJpbmd9PiA9IFtkaWFnbm9zdGljLCAuLi50cmFjZXNdO1xuICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgYWxsTWVzc2FnZXMpIHtcbiAgICBpZiAobWVzc2FnZS5odG1sICE9IG51bGwpIHtcbiAgICAgIHRleHQgKz0gbWVzc2FnZS5odG1sICsgJyAnO1xuICAgICAgaXNQbGFpblRleHQgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudGV4dCAhPSBudWxsKSB7XG4gICAgICB0ZXh0ICs9IG1lc3NhZ2UudGV4dCArICcgJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOZWl0aGVyIHRleHQgbm9yIGh0bWwgcHJvcGVydHkgZGVmaW5lZCBvbjogJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIHRleHQ6IHRleHQudHJpbSgpLFxuICAgIGlzUGxhaW5UZXh0LFxuICB9O1xufVxuXG5mdW5jdGlvbiBtZXNzYWdlQ29sdW1uQ2VsbFJlbmRlcmVyKG1lc3NhZ2U6IHRleHRBbmRUeXBlKTogUmVhY3QuRWxlbWVudCB7XG4gIGlmIChtZXNzYWdlLmlzUGxhaW5UZXh0KSB7XG4gICAgcmV0dXJuIHBsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcihtZXNzYWdlLnRleHQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiA8c3BhbiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogbWVzc2FnZS50ZXh0fX0+PC9zcGFuPjtcbiAgfVxufVxuXG5mdW5jdGlvbiBvblJvd0NsaWNrKFxuICBldmVudDogU3ludGhldGljTW91c2VFdmVudCxcbiAgcm93SW5kZXg6IG51bWJlcixcbiAgcm93RGF0YTogRGlhZ25vc3RpY01lc3NhZ2Vcbik6IHZvaWQge1xuICBpZiAocm93RGF0YS5zY29wZSAhPT0gJ2ZpbGUnIHx8IHJvd0RhdGEuZmlsZVBhdGggPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyYWNrKCdkaWFnbm9zdGljcy1wYW5lbC1nb3RvLWxvY2F0aW9uJyk7XG5cbiAgY29uc3QgdXJpID0gcm93RGF0YS5maWxlUGF0aDtcbiAgLy8gSWYgaW5pdGlhbExpbmUgaXMgTiwgQXRvbSB3aWxsIG5hdmlnYXRlIHRvIGxpbmUgTisxLlxuICAvLyBGbG93IHNvbWV0aW1lcyByZXBvcnRzIGEgcm93IG9mIC0xLCBzbyB0aGlzIGVuc3VyZXMgdGhlIGxpbmUgaXMgYXQgbGVhc3Qgb25lLlxuICBjb25zdCBsaW5lID0gTWF0aC5tYXgocm93RGF0YS5yYW5nZSA/IHJvd0RhdGEucmFuZ2Uuc3RhcnQucm93IDogMCwgMCk7XG4gIGNvbnN0IGNvbHVtbiA9IDA7XG4gIGdvVG9Mb2NhdGlvbih1cmksIGxpbmUsIGNvbHVtbik7XG59XG5cbnR5cGUgQ2VsbFByb3BzID0ge1xuICBjaGlsZHJlbjogUmVhY3QuRWxlbWVudDtcbiAgc3R5bGU/OiBPYmplY3Q7XG4gIHRpdGxlPzogc3RyaW5nO1xufTtcblxuLypcbiAqIFJldHVybnMgbWFya3VwIHNpbWlsYXIgdG8gdGhhdCBwcm9kdWNlZCBieSBmaXhlZC1kYXRhLXRhYmxlIHYwLjYuMC5cbiAqL1xuZnVuY3Rpb24gQ2VsbChwcm9wczogQ2VsbFByb3BzKTogUmVhY3QuRWxlbWVudCB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwiZml4ZWREYXRhVGFibGVDZWxsTGF5b3V0X21haW4gcHVibGljX2ZpeGVkRGF0YVRhYmxlQ2VsbF9tYWluXCJcbiAgICAgIHN0eWxlPXtwcm9wcy5zdHlsZX1cbiAgICAgIHRpdGxlPXtwcm9wcy50aXRsZX0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpeGVkRGF0YVRhYmxlQ2VsbExheW91dF93cmFwMSBwdWJsaWNfZml4ZWREYXRhVGFibGVDZWxsX3dyYXAxXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZml4ZWREYXRhVGFibGVDZWxsTGF5b3V0X3dyYXAyIHB1YmxpY19maXhlZERhdGFUYWJsZUNlbGxfd3JhcDJcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpeGVkRGF0YVRhYmxlQ2VsbExheW91dF93cmFwMyBwdWJsaWNfZml4ZWREYXRhVGFibGVDZWxsX3dyYXAzXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1YmxpY19maXhlZERhdGFUYWJsZUNlbGxfY2VsbENvbnRlbnRcIj5cbiAgICAgICAgICAgICAge3Byb3BzLmNoaWxkcmVufVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbmNsYXNzIERpYWdub3N0aWNzUGFuZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgZGlhZ25vc3RpY3M6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIHNob3dGaWxlTmFtZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBzdGF0ZToge3dpZHRoczoge1trZXk6IHN0cmluZ106IG51bWJlcn19OztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogbWl4ZWQpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX3Jvd0dldHRlciA9IHRoaXMuX3Jvd0dldHRlci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9yb3dIZWlnaHRHZXR0ZXIgPSB0aGlzLl9yb3dIZWlnaHRHZXR0ZXIuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fZ2V0TWVzc2FnZVdpZHRoID0gdGhpcy5fZ2V0TWVzc2FnZVdpZHRoLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgd2lkdGhzOiB7XG4gICAgICAgIHR5cGU6IFRZUEVfQ09MVU1OX1dJRFRILFxuICAgICAgICBwcm92aWRlck5hbWU6IFBST1ZJREVSX05BTUVfQ09MVU1OX1dJRFRILFxuICAgICAgICBmaWxlUGF0aDogRklMRV9QQVRIX0NPTFVNTl9XSURUSCxcbiAgICAgICAgcmFuZ2U6IFJBTkdFX0NPTFVNTl9XSURUSCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8vIEEgaG9tZS1tYWRlIGZsZXggZnVuY3Rpb24gc28gdGhhdCB3ZSBjYW4gcmVhZCB0aGUgbWVzc2FnZSBjb2x1bW4gd2lkdGggZWFzaWx5LlxuICBfZ2V0TWVzc2FnZVdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMud2lkdGhcbiAgICAgIC0gdGhpcy5zdGF0ZS53aWR0aHMudHlwZVxuICAgICAgLSB0aGlzLnN0YXRlLndpZHRocy5wcm92aWRlck5hbWVcbiAgICAgIC0gKHRoaXMucHJvcHMuc2hvd0ZpbGVOYW1lID8gdGhpcy5zdGF0ZS53aWR0aHMuZmlsZVBhdGggOiAwKVxuICAgICAgLSB0aGlzLnN0YXRlLndpZHRocy5yYW5nZTtcbiAgfVxuXG4gIF9yb3dHZXR0ZXIocm93SW5kZXg6IG51bWJlcik6IERpYWdub3N0aWNNZXNzYWdlIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5kaWFnbm9zdGljc1tyb3dJbmRleF07XG4gIH1cblxuICBfcm93SGVpZ2h0R2V0dGVyKHJvd0luZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGNvbnN0IGRpYWdub3N0aWMgPSB0aGlzLl9yb3dHZXR0ZXIocm93SW5kZXgpO1xuICAgIGNvbnN0IHt0ZXh0OiBtZXNzYWdlfSA9IG1lc3NhZ2VDb2x1bW5DZWxsRGF0YUdldHRlcignbWVzc2FnZScsIGRpYWdub3N0aWMpO1xuICAgIGNvbnN0IG1lc3NhZ2VDaGFyc1BlclJvdyA9ICh0aGlzLl9nZXRNZXNzYWdlV2lkdGgoKSAtIFJPV19IT1JJWk9OVEFMX1BBRERJTkcpIC8gUElYRUxTX1BFUl9DSEFSO1xuICAgIGNvbnN0IG1lc3NhZ2VMaW5lc09mVGV4dCA9IE1hdGguZmxvb3IobWVzc2FnZS5sZW5ndGggLyBtZXNzYWdlQ2hhcnNQZXJSb3cpICsgMTtcbiAgICBjb25zdCBtZXNzYWdlTWF4TGluZXNPZlRleHQgPSBNYXRoLm1pbihNQVhfUk9XX0xJTkVTLCBtZXNzYWdlTGluZXNPZlRleHQpO1xuICAgIHJldHVybiBtZXNzYWdlTWF4TGluZXNPZlRleHQgKiBERUZBVUxUX0xJTkVfVEVYVF9IRUlHSFQgKyBST1dfVkVSVElDQUxfUEFERElORztcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCBkaWFnbm9zdGljQ2VsbHMgPSBbXTtcbiAgICBmb3IgKFxuICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgIGluZGV4IDwgTWF0aC5taW4oTUFYX1JFU1VMVFNfQ09VTlQsIHRoaXMucHJvcHMuZGlhZ25vc3RpY3MubGVuZ3RoKTtcbiAgICAgIGluZGV4KytcbiAgICApIHtcbiAgICAgIGNvbnN0IGRpYWcgPSB0aGlzLnByb3BzLmRpYWdub3N0aWNzW2luZGV4XTtcbiAgICAgIGRpYWdub3N0aWNDZWxscy5wdXNoKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWREYXRhVGFibGVDZWxsR3JvdXBMYXlvdXRfY2VsbEdyb3VwIG51Y2xpZGUtZGlhZ25vc3RpY3MtcGFuZV9fYWN0aW9uYWJsZVwiXG4gICAgICAgICAga2V5PXtpbmRleH1cbiAgICAgICAgICBvbkNsaWNrPXtlID0+IHsgb25Sb3dDbGljayhlLCBpbmRleCwgZGlhZyk7IH19XG4gICAgICAgICAgc3R5bGU9e3toZWlnaHQ6IHRoaXMuX3Jvd0hlaWdodEdldHRlcihpbmRleCl9fT5cbiAgICAgICAgICA8Q2VsbCBzdHlsZT17e3dpZHRoOiBgJHt0aGlzLnN0YXRlLndpZHRocy50eXBlfXB4YH19PlxuICAgICAgICAgICAge3R5cGVDb2x1bW5DZWxsUmVuZGVyZXIodHlwZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCd0eXBlJywgZGlhZykpfVxuICAgICAgICAgIDwvQ2VsbD5cbiAgICAgICAgICA8Q2VsbCBzdHlsZT17e3dpZHRoOiBgJHt0aGlzLnN0YXRlLndpZHRocy5wcm92aWRlck5hbWV9cHhgfX0+XG4gICAgICAgICAgICB7cGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyKHNvdXJjZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCdwcm92aWRlck5hbWUnLCBkaWFnKSl9XG4gICAgICAgICAgPC9DZWxsPlxuICAgICAgICAgIHt0aGlzLnByb3BzLnNob3dGaWxlTmFtZVxuICAgICAgICAgICAgPyA8Q2VsbFxuICAgICAgICAgICAgICAgIHN0eWxlPXt7d2lkdGg6IGAke3RoaXMuc3RhdGUud2lkdGhzLmZpbGVQYXRofXB4YH19XG4gICAgICAgICAgICAgICAgdGl0bGU9e3BsYWluVGV4dENvbHVtbkNlbGxSZW5kZXJlcihmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoJ2ZpbGVQYXRoJywgZGlhZykpfT5cbiAgICAgICAgICAgICAgICB7cGxhaW5UZXh0Q29sdW1uQ2VsbFJlbmRlcmVyKGZpbGVDb2x1bW5DZWxsRGF0YUdldHRlcignZmlsZVBhdGgnLCBkaWFnKSl9XG4gICAgICAgICAgICAgIDwvQ2VsbD5cbiAgICAgICAgICAgIDogbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgICA8Q2VsbCBzdHlsZT17e3dpZHRoOiBgJHt0aGlzLnN0YXRlLndpZHRocy5yYW5nZX1weGB9fT5cbiAgICAgICAgICAgIHtwbGFpblRleHRDb2x1bW5DZWxsUmVuZGVyZXIobG9jYXRpb25Db2x1bW5DZWxsRGF0YUdldHRlcigncmFuZ2UnLCBkaWFnKSl9XG4gICAgICAgICAgPC9DZWxsPlxuICAgICAgICAgIDxDZWxsIHN0eWxlPXt7d2lkdGg6IGAke3RoaXMuX2dldE1lc3NhZ2VXaWR0aCgpfXB4YH19PlxuICAgICAgICAgICAge21lc3NhZ2VDb2x1bW5DZWxsUmVuZGVyZXIobWVzc2FnZUNvbHVtbkNlbGxEYXRhR2V0dGVyKCdtZXNzYWdlJywgZGlhZykpfVxuICAgICAgICAgIDwvQ2VsbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnByb3BzLmRpYWdub3N0aWNzLmxlbmd0aCA+IE1BWF9SRVNVTFRTX0NPVU5UKSB7XG4gICAgICBkaWFnbm9zdGljQ2VsbHMucHVzaChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZERhdGFUYWJsZUNlbGxHcm91cExheW91dF9jZWxsR3JvdXBcIiBrZXk9XCJtYXhSZXN1bHRzTWVzc2FnZVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHVibGljX2ZpeGVkRGF0YVRhYmxlQ2VsbF9jZWxsQ29udGVudCB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgPGVtPk1heCByZXN1bHRzICh7TUFYX1JFU1VMVFNfQ09VTlR9KSByZWFjaGVkLiBGaXggZGlhZ25vc3RpY3Mgb3Igc2hvdyBvbmx5IGRpYWdub3N0aWNzXG4gICAgICAgICAgICBmb3IgdGhlIGN1cnJlbnQgZmlsZSB0byB2aWV3IG1vcmUuPC9lbT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpeGVkRGF0YVRhYmxlTGF5b3V0X21haW5cIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdWJsaWNfZml4ZWREYXRhVGFibGVfbWFpblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHVibGljX2ZpeGVkRGF0YVRhYmxlX2hlYWRlclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZERhdGFUYWJsZUNlbGxHcm91cExheW91dF9jZWxsR3JvdXBcIiBzdHlsZT17e2hlaWdodDogJzMwcHgnfX0+XG4gICAgICAgICAgICAgIDxDZWxsIHN0eWxlPXt7d2lkdGg6IGAke3RoaXMuc3RhdGUud2lkdGhzLnR5cGV9cHhgfX0+VHlwZTwvQ2VsbD5cbiAgICAgICAgICAgICAgPENlbGwgc3R5bGU9e3t3aWR0aDogYCR7dGhpcy5zdGF0ZS53aWR0aHMucHJvdmlkZXJOYW1lfXB4YH19PlNvdXJjZTwvQ2VsbD5cbiAgICAgICAgICAgICAge3RoaXMucHJvcHMuc2hvd0ZpbGVOYW1lXG4gICAgICAgICAgICAgICAgPyA8Q2VsbCBzdHlsZT17e3dpZHRoOiBgJHt0aGlzLnN0YXRlLndpZHRocy5maWxlUGF0aH1weGB9fT5GaWxlPC9DZWxsPlxuICAgICAgICAgICAgICAgIDogbnVsbFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIDxDZWxsIHN0eWxlPXt7d2lkdGg6IGAke3RoaXMuc3RhdGUud2lkdGhzLnJhbmdlfXB4YH19PkxpbmU8L0NlbGw+XG4gICAgICAgICAgICAgIDxDZWxsIHN0eWxlPXt7d2lkdGg6IGAke3RoaXMuX2dldE1lc3NhZ2VXaWR0aCgpfXB4YH19PkRlc2NyaXB0aW9uPC9DZWxsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPFBhbmVsQ29tcG9uZW50U2Nyb2xsZXIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgICAgICAge2RpYWdub3N0aWNDZWxsc31cbiAgICAgICAgICA8L1BhbmVsQ29tcG9uZW50U2Nyb2xsZXI+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdub3N0aWNzUGFuZTtcbiJdfQ==