Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsAtomGoToLocation;

function _load_commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation = require('../../commons-atom/go-to-location');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideUiTable;

function _load_nuclideUiTable() {
  return _nuclideUiTable = require('../../nuclide-ui/Table');
}

var _nuclideUiHighlight;

function _load_nuclideUiHighlight() {
  return _nuclideUiHighlight = require('../../nuclide-ui/Highlight');
}

var _DiagnosticsSorter;

function _load_DiagnosticsSorter() {
  return _DiagnosticsSorter = require('./DiagnosticsSorter');
}

var _paneUtils;

function _load_paneUtils() {
  return _paneUtils = require('./paneUtils');
}

// Maximum number of results to render in the table before truncating and displaying a "Max results
// reached" message.
var MAX_RESULTS_COUNT = 1000;

var EmptyComponent = function EmptyComponent() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    { className: 'nuclide-diagnostics-ui-empty-component' },
    'No diagnostic messages'
  );
};

var TypeToHighlightColor = Object.freeze({
  ERROR: (_nuclideUiHighlight || _load_nuclideUiHighlight()).HighlightColors.error,
  WARNING: (_nuclideUiHighlight || _load_nuclideUiHighlight()).HighlightColors.warning
});

function TypeComponent(props) {
  var text = props.data;
  var highlightColor = TypeToHighlightColor[text.toUpperCase()];
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    (_nuclideUiHighlight || _load_nuclideUiHighlight()).Highlight,
    { color: highlightColor },
    text
  );
}

/** @return text and a boolean indicating whether it is plaintext or HTML. */
function getMessageContent(diagnostic) {
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

function DescriptionComponent(props) {
  var message = props.data;
  if (message.isPlainText) {
    return (_reactForAtom || _load_reactForAtom()).React.createElement(
      'span',
      null,
      message.text
    );
  } else {
    return (_reactForAtom || _load_reactForAtom()).React.createElement('span', { dangerouslySetInnerHTML: { __html: message.text } });
  }
}

function goToDiagnosticLocation(rowData) {
  if (rowData.scope !== 'file' || rowData.filePath == null) {
    return;
  }

  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-panel-goto-location');

  var uri = rowData.filePath;
  // If initialLine is N, Atom will navigate to line N+1.
  // Flow sometimes reports a row of -1, so this ensures the line is at least one.
  var line = Math.max(rowData.range ? rowData.range.start.row : 0, 0);
  var column = 0;
  (0, (_commonsAtomGoToLocation || _load_commonsAtomGoToLocation()).goToLocation)(uri, line, column);
}

var DiagnosticsPane = (function (_React$Component) {
  _inherits(DiagnosticsPane, _React$Component);

  function DiagnosticsPane(props) {
    _classCallCheck(this, DiagnosticsPane);

    _get(Object.getPrototypeOf(DiagnosticsPane.prototype), 'constructor', this).call(this, props);
    this._handleSort = this._handleSort.bind(this);
    this._handleSelectTableRow = this._handleSelectTableRow.bind(this);
    this.state = {
      sortDescending: false,
      sortedColumn: null
    };
  }

  _createClass(DiagnosticsPane, [{
    key: '_handleSort',
    value: function _handleSort(sortedColumn, sortDescending) {
      this.setState({
        sortedColumn: sortedColumn,
        sortDescending: sortDescending
      });
    }
  }, {
    key: '_handleSelectTableRow',
    value: function _handleSelectTableRow(item, selectedIndex) {
      goToDiagnosticLocation(item.diagnostic);
    }
  }, {
    key: '_getColumns',
    value: function _getColumns() {
      var showFileName = this.props.showFileName;

      var filePathColumnWidth = 0.2;
      var filePathColumn = showFileName ? [{
        key: 'filePath',
        title: 'File',
        width: filePathColumnWidth
      }] : [];
      return [{
        component: TypeComponent,
        key: 'type',
        title: 'Type',
        width: 0.05
      }, {
        key: 'providerName',
        title: 'Source',
        width: 0.1
      }].concat(filePathColumn, [{
        key: 'range',
        title: 'Line',
        width: 0.05
      }, {
        component: DescriptionComponent,
        key: 'description',
        title: 'Description',
        width: showFileName ? 0.6 : 0.6 + filePathColumnWidth
      }]);
    }
  }, {
    key: 'render',
    value: function render() {
      var diagnostics = this.props.diagnostics;
      var _state = this.state;
      var sortedColumn = _state.sortedColumn;
      var sortDescending = _state.sortDescending;

      var diagnosticRows = diagnostics.map(function (diagnostic) {
        var messageContent = getMessageContent(diagnostic);
        return {
          data: {
            type: diagnostic.type,
            providerName: diagnostic.providerName,
            filePath: (0, (_paneUtils || _load_paneUtils()).getProjectRelativePathOfDiagnostic)(diagnostic),
            range: diagnostic.range ? diagnostic.range.start.row + 1 : 0,
            description: messageContent,
            diagnostic: diagnostic
          }
        };
      });
      var sortedRows = (0, (_DiagnosticsSorter || _load_DiagnosticsSorter()).sortDiagnostics)(diagnosticRows, sortedColumn, sortDescending);
      var maxResultsMessage = undefined;
      if (sortedRows.length > MAX_RESULTS_COUNT) {
        sortedRows = sortedRows.slice(0, MAX_RESULTS_COUNT);
        maxResultsMessage = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'highlight-warning nuclide-diagnostics-ui-table-message' },
          'Max results (',
          MAX_RESULTS_COUNT,
          ') reached. Fix diagnostics or show only diagnostics for the current file to view more.'
        );
      }
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: (0, (_classnames || _load_classnames()).default)({
            'nuclide-diagnostics-ui-table-container': true,
            'nuclide-diagnostics-ui-table-container-empty': sortedRows.length === 0
          }) },
        (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiTable || _load_nuclideUiTable()).Table, {
          collapsable: true,
          columns: this._getColumns(),
          emptyComponent: EmptyComponent,
          fixedHeader: true,
          maxBodyHeight: '99999px',
          rows: sortedRows,
          sortable: true,
          onSort: this._handleSort,
          sortedColumn: sortedColumn,
          sortDescending: sortDescending,
          selectable: true,
          onSelect: this._handleSelectTableRow
        }),
        maxResultsMessage
      );
    }
  }]);

  return DiagnosticsPane;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = DiagnosticsPane;
module.exports = exports.default;