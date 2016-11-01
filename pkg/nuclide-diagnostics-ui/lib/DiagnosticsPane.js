'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _Table;

function _load_Table() {
  return _Table = require('../../nuclide-ui/Table');
}

var _Highlight;

function _load_Highlight() {
  return _Highlight = require('../../nuclide-ui/Highlight');
}

var _DiagnosticsSorter;

function _load_DiagnosticsSorter() {
  return _DiagnosticsSorter = require('./DiagnosticsSorter');
}

var _paneUtils;

function _load_paneUtils() {
  return _paneUtils = require('./paneUtils');
}

var _DiagnosticsMessage;

function _load_DiagnosticsMessage() {
  return _DiagnosticsMessage = require('../../nuclide-ui/DiagnosticsMessage');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Maximum number of results to render in the table before truncating and displaying a "Max results
// reached" message.


// text is always used for sorting.
// Precedence for rendering is: element, html, text.
const MAX_RESULTS_COUNT = 1000;

const EmptyComponent = () => _reactForAtom.React.createElement(
  'div',
  { className: 'nuclide-diagnostics-ui-empty-component' },
  'No diagnostic messages'
);

const TypeToHighlightColor = Object.freeze({
  ERROR: (_Highlight || _load_Highlight()).HighlightColors.error,
  WARNING: (_Highlight || _load_Highlight()).HighlightColors.warning
});

function TypeComponent(props) {
  const text = props.data;
  const highlightColor = TypeToHighlightColor[text.toUpperCase()];
  return _reactForAtom.React.createElement(
    (_Highlight || _load_Highlight()).Highlight,
    { color: highlightColor },
    text
  );
}

/** @return text and a boolean indicating whether it is plaintext or HTML. */
function getMessageContent(showTraces, diagnostic) {
  let text = '';
  let isPlainText = true;
  const traces = diagnostic.trace || [];
  const allMessages = [diagnostic, ...traces];
  for (const message of allMessages) {
    // TODO: A mix of html and text diagnostics will yield a wonky sort ordering.
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
    html: isPlainText ? null : text.trim(),
    element: showTraces && diagnostic.scope === 'file' ? (0, (_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessageNoHeader)({ message: diagnostic, goToLocation: (_goToLocation || _load_goToLocation()).goToLocation, fixer: () => {} }) : null
  };
}

function DescriptionComponent(props) {
  const message = props.data;
  if (message.element != null) {
    return message.element;
  } else if (message.html != null) {
    return _reactForAtom.React.createElement('span', { dangerouslySetInnerHTML: { __html: message.text } });
  } else {
    return _reactForAtom.React.createElement(
      'span',
      null,
      message.text
    );
  }
}

function goToDiagnosticLocation(rowData) {
  if (rowData.scope !== 'file' || rowData.filePath == null) {
    return;
  }

  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-panel-goto-location');

  const uri = rowData.filePath;
  // If initialLine is N, Atom will navigate to line N+1.
  // Flow sometimes reports a row of -1, so this ensures the line is at least one.
  const line = Math.max(rowData.range ? rowData.range.start.row : 0, 0);
  const column = 0;
  (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri, line, column);
}

let DiagnosticsPane = class DiagnosticsPane extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleSort = this._handleSort.bind(this);
    this._handleSelectTableRow = this._handleSelectTableRow.bind(this);
    this.state = {
      sortDescending: false,
      sortedColumn: null
    };
  }

  _handleSort(sortedColumn, sortDescending) {
    this.setState({
      sortedColumn: sortedColumn,
      sortDescending: sortDescending
    });
  }

  _handleSelectTableRow(item, selectedIndex) {
    goToDiagnosticLocation(item.diagnostic);
  }

  _getColumns() {
    const showFileName = this.props.showFileName;

    const filePathColumnWidth = 0.2;
    const filePathColumn = showFileName ? [{
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
    }, ...filePathColumn, {
      key: 'range',
      title: 'Line',
      width: 0.05
    }, {
      component: DescriptionComponent,
      key: 'description',
      title: 'Description',
      width: showFileName ? 0.6 : 0.6 + filePathColumnWidth
    }];
  }

  render() {
    var _props = this.props;
    const diagnostics = _props.diagnostics,
          showTraces = _props.showTraces;
    var _state = this.state;
    const sortedColumn = _state.sortedColumn,
          sortDescending = _state.sortDescending;

    const diagnosticRows = diagnostics.map(diagnostic => {
      const messageContent = getMessageContent(showTraces, diagnostic);
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
    let sortedRows = (0, (_DiagnosticsSorter || _load_DiagnosticsSorter()).sortDiagnostics)(diagnosticRows, sortedColumn, sortDescending);
    let maxResultsMessage;
    if (sortedRows.length > MAX_RESULTS_COUNT) {
      sortedRows = sortedRows.slice(0, MAX_RESULTS_COUNT);
      maxResultsMessage = _reactForAtom.React.createElement(
        'div',
        { className: 'highlight-warning nuclide-diagnostics-ui-table-message' },
        'Max results (',
        MAX_RESULTS_COUNT,
        ') reached. Fix diagnostics or show only diagnostics for the current file to view more.'
      );
    }
    return _reactForAtom.React.createElement(
      'div',
      { className: (0, (_classnames || _load_classnames()).default)({
          'nuclide-diagnostics-ui-table-container': true,
          'nuclide-diagnostics-ui-table-container-empty': sortedRows.length === 0
        }) },
      _reactForAtom.React.createElement((_Table || _load_Table()).Table, {
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
};
exports.default = DiagnosticsPane;
module.exports = exports['default'];