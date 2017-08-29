'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _Highlight;

function _load_Highlight() {
  return _Highlight = require('nuclide-commons-ui/Highlight');
}

var _DiagnosticsSorter;

function _load_DiagnosticsSorter() {
  return _DiagnosticsSorter = require('../DiagnosticsSorter');
}

var _paneUtils;

function _load_paneUtils() {
  return _paneUtils = require('../paneUtils');
}

var _DiagnosticsMessage;

function _load_DiagnosticsMessage() {
  return _DiagnosticsMessage = require('./DiagnosticsMessage');
}

var _DiagnosticsMessageText;

function _load_DiagnosticsMessageText() {
  return _DiagnosticsMessageText = require('./DiagnosticsMessageText');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Maximum number of results to render in the table before truncating and displaying a "Max results
// reached" message.


// text is always used for sorting, while we render the element.
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const MAX_RESULTS_COUNT = 1000;

const EmptyComponent = () => _react.createElement(
  'div',
  { className: 'nuclide-diagnostics-ui-empty-component' },
  'No diagnostic messages'
);

const TypeToHighlightColor = Object.freeze({
  ERROR: (_Highlight || _load_Highlight()).HighlightColors.error,
  WARNING: (_Highlight || _load_Highlight()).HighlightColors.warning,
  INFO: (_Highlight || _load_Highlight()).HighlightColors.info
});

function TypeComponent(props) {
  const text = props.data;
  const highlightColor = TypeToHighlightColor[text.toUpperCase()];
  return _react.createElement(
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
  text = text.trim();
  return {
    text,
    element: showTraces && diagnostic.scope === 'file' ? (0, (_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessageNoHeader)({
      message: diagnostic,
      goToLocation: (_goToLocation || _load_goToLocation()).goToLocation,
      fixer: () => {}
    }) : (0, (_DiagnosticsMessageText || _load_DiagnosticsMessageText()).DiagnosticsMessageText)({
      preserveNewlines: showTraces,
      message: { text, html: isPlainText ? undefined : text }
    })
  };
}

function DescriptionComponent(props) {
  const message = props.data;
  if (message.element != null) {
    return message.element;
  } else if (message.html != null) {
    return _react.createElement('span', { dangerouslySetInnerHTML: { __html: message.text } });
  } else {
    return _react.createElement(
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

  (_analytics || _load_analytics()).default.track('diagnostics-panel-goto-location');

  const uri = rowData.filePath;
  // If initialLine is N, Atom will navigate to line N+1.
  // Flow sometimes reports a row of -1, so this ensures the line is at least one.
  const line = Math.max(rowData.range ? rowData.range.start.row : 0, 0);
  const column = 0;
  (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri, line, column);
}

class DiagnosticsTable extends _react.Component {
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
      sortedColumn,
      sortDescending
    });
  }

  _handleSelectTableRow(item, selectedIndex) {
    goToDiagnosticLocation(item.diagnostic);
  }

  _getColumns() {
    const { showFileName } = this.props;
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
      width: 0.05,
      shouldRightAlign: true
    }, {
      component: DescriptionComponent,
      key: 'description',
      title: 'Description',
      width: showFileName ? 0.6 : 0.6 + filePathColumnWidth
    }];
  }

  render() {
    const { diagnostics, showTraces } = this.props;
    const { sortedColumn, sortDescending } = this.state;
    const diagnosticRows = diagnostics.map(diagnostic => {
      const messageContent = getMessageContent(showTraces, diagnostic);
      return {
        data: {
          type: diagnostic.type,
          providerName: diagnostic.providerName,
          filePath: (0, (_paneUtils || _load_paneUtils()).getProjectRelativePathOfDiagnostic)(diagnostic),
          range: diagnostic.range ? diagnostic.range.start.row + 1 : 0,
          description: messageContent,
          diagnostic
        }
      };
    });
    let sortedRows = (0, (_DiagnosticsSorter || _load_DiagnosticsSorter()).sortDiagnostics)(diagnosticRows, sortedColumn, sortDescending);
    let maxResultsMessage;
    if (sortedRows.length > MAX_RESULTS_COUNT) {
      sortedRows = sortedRows.slice(0, MAX_RESULTS_COUNT);
      maxResultsMessage = _react.createElement(
        'div',
        { className: 'highlight-warning nuclide-diagnostics-ui-table-message' },
        'Max results (',
        MAX_RESULTS_COUNT,
        ') reached. Fix diagnostics or show only diagnostics for the current file to view more.'
      );
    }
    return _react.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)({
          'nuclide-diagnostics-ui-table-container': true,
          'nuclide-diagnostics-ui-table-container-empty': sortedRows.length === 0
        }) },
      _react.createElement((_Table || _load_Table()).Table, {
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
}
exports.default = DiagnosticsTable;