'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _humanizePath;

function _load_humanizePath() {
  return _humanizePath = _interopRequireDefault(require('nuclide-commons-atom/humanizePath'));
}

var _react = _interopRequireWildcard(require('react'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _sortDiagnostics;

function _load_sortDiagnostics() {
  return _sortDiagnostics = _interopRequireDefault(require('../sortDiagnostics'));
}

var _DiagnosticsMessage;

function _load_DiagnosticsMessage() {
  return _DiagnosticsMessage = require('./DiagnosticsMessage');
}

var _DiagnosticsMessageText;

function _load_DiagnosticsMessageText() {
  return _DiagnosticsMessageText = require('./DiagnosticsMessageText');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
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

class ExperimentalDiagnosticsTable extends _react.Component {

  constructor(props) {
    super(props);

    this._handleSelectTableRow = (item, index, event) => {
      this.props.selectMessage(item.diagnostic);
      // Users navigating with the keyboard may just be moving through items on their way to another.
      // If they have pending pane items enabled, it's not a big deal if we open the editor anyway.
      // But if they don't, we could wind up opening a ton of files they didn't even care about so,
      // to be safe, we won't do anything in that case.
      if (event.type !== 'click' && !atom.config.get('core.allowPendingPaneItems')) {
        return;
      }
      this.props.gotoMessageLocation(item.diagnostic, { focusEditor: false });
    };

    this._handleConfirmTableRow = item => {
      this.props.gotoMessageLocation(item.diagnostic, { focusEditor: true });
    };

    this._handleSort = this._handleSort.bind(this);
    this._handleSelectTableRow = this._handleSelectTableRow.bind(this);
    this.state = {
      sortDescending: true,
      sortedColumn: 'classification'
    };
  }

  _handleSort(sortedColumn, sortDescending) {
    this.setState({
      sortedColumn,
      sortDescending
    });
  }

  _getColumns() {
    const { showFileName } = this.props;

    // These need to add up to 1.
    // TODO: Update the Table component so that we can have more control over this (and provide
    //       explicit pixel widths)
    const TYPE_WIDTH = 0.05;
    const SOURCE_WIDTH = 0.1;
    const FILENAME_WIDTH = 0.3;
    const DIR_WIDTH = 0.15;
    const DESCRIPTION_WIDTH = showFileName ? 1 - (TYPE_WIDTH + SOURCE_WIDTH + FILENAME_WIDTH + DIR_WIDTH) : 1 - (TYPE_WIDTH + SOURCE_WIDTH);

    const filePathColumns = showFileName ? [{
      component: DirComponent,
      key: 'dir',
      title: 'Path',
      width: DIR_WIDTH,
      shouldRightAlign: true,
      cellClassName: 'nuclide-diagnostics-ui-cell-dir'
    }, {
      component: FilenameComponent,
      key: 'location',
      title: 'File Name',
      width: FILENAME_WIDTH,
      cellClassName: 'nuclide-diagnostics-ui-cell-filename'
    }] : [];
    return [{
      component: TypeComponent,
      key: 'classification',
      title: 'Type',
      width: TYPE_WIDTH,
      minWidth: 55,
      cellClassName: 'nuclide-diagnostics-ui-cell-classification'
    }, {
      key: 'providerName',
      title: 'Source',
      width: SOURCE_WIDTH,
      minWidth: 70
    }, {
      component: DescriptionComponent,
      key: 'description',
      title: 'Description',
      width: DESCRIPTION_WIDTH
    }, ...filePathColumns];
  }

  render() {
    const { diagnostics, selectedMessage, showTraces } = this.props;
    const { sortedColumn, sortDescending } = this.state;
    const diagnosticRows = this._getRows(diagnostics, showTraces);
    let sortedRows = this._sortRows(diagnosticRows, sortedColumn, sortDescending);
    let maxResultsMessage;
    if (sortedRows.length > MAX_RESULTS_COUNT) {
      sortedRows = sortedRows.slice(0, MAX_RESULTS_COUNT);
      maxResultsMessage = _react.createElement(
        'div',
        { className: 'highlight-warning diagnostics-ui-table-message' },
        'Max results (',
        MAX_RESULTS_COUNT,
        ') reached. Fix diagnostics or show only diagnostics for the current file to view more.'
      );
    }
    const selectedIndex = sortedRows.findIndex(row => row.data.description.diagnostic === selectedMessage);
    return _react.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)({
          'diagnostics-ui-table-container': true,
          'diagnostics-ui-table-container-empty': sortedRows.length === 0
        }) },
      _react.createElement((_Table || _load_Table()).Table, {
        ref: table => {
          this._table = table;
        },
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
        selectedIndex: selectedIndex,
        onSelect: this._handleSelectTableRow,
        onConfirm: this._handleConfirmTableRow,
        enableKeyboardNavigation: true
      }),
      maxResultsMessage
    );
  }

  focus() {
    if (this._table != null) {
      this._table.focus();
    }
  }

  // TODO: Memoize this so we don't recompute unnecessarily.
  _getRows(diagnostics, showTraces) {
    return diagnostics.map(diagnostic => {
      const { dir, location } = getLocation(diagnostic);
      return {
        data: {
          classification: {
            kind: diagnostic.kind || 'lint',
            severity: diagnostic.type
          },
          providerName: diagnostic.providerName,
          description: Object.assign({
            showTraces,
            diagnostic
          }, getMessageContent(diagnostic, showTraces)),
          dir,
          location,
          diagnostic
        }
      };
    });
  }

  // TODO: Memoize this so we don't recompute unnecessarily.
  _sortRows(rows, sortedColumn, descending) {
    return (0, (_sortDiagnostics || _load_sortDiagnostics()).default)(rows, sortedColumn, descending);
  }
}

exports.default = ExperimentalDiagnosticsTable;
const EmptyComponent = () => _react.createElement(
  'div',
  { className: 'diagnostics-ui-empty-component' },
  'No diagnostic messages'
);

function TypeComponent(props) {
  const classification = props.data;
  const iconName = getIconName(classification);
  return _react.createElement((_Icon || _load_Icon()).Icon, { icon: iconName });
}

function getIconName(classification) {
  const { kind, severity } = classification;
  if (kind === 'review') {
    return 'nuclicon-comment-discussion';
  }
  switch (severity) {
    case 'Warning':
      return 'alert';
    case 'Error':
      return 'nuclicon-stop';
    case 'Info':
      return 'info';
    default:
      severity;
      throw new Error(`Invalid severity: ${severity}`);
  }
}

function getMessageContent(diagnostic, showTraces) {
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
  return { text: text.trim(), isPlainText };
}

function DescriptionComponent(props) {
  const { showTraces, diagnostic, text, isPlainText } = props.data;
  return showTraces && diagnostic.scope === 'file' ? (0, (_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessageNoHeader)({
    message: diagnostic,
    goToLocation: (file, line) => (0, (_goToLocation || _load_goToLocation()).goToLocation)(file, { line }),
    fixer: () => {}
  }) : (0, (_DiagnosticsMessageText || _load_DiagnosticsMessageText()).DiagnosticsMessageText)({
    preserveNewlines: showTraces,
    message: { text, html: isPlainText ? undefined : text }
  });
}

function DirComponent(props) {
  return (
    // We're abusing `direction: rtl` here so we need the LRM to keep the slash on the right.
    _react.createElement(
      'div',
      { className: 'nuclide-diagnostics-ui-path-cell' },
      '\u200E',
      (_nuclideUri || _load_nuclideUri()).default.normalizeDir(props.data),
      '\u200E'
    )
  );
}

function FilenameComponent(props) {
  const locationInFile = props.data && props.data.locationInFile;
  if (locationInFile == null) {
    // This is a project diagnostic.
    return _react.createElement(
      'span',
      null,
      '\u2014'
    );
  }
  const { basename, line } = locationInFile;
  return _react.createElement(
    'span',
    null,
    basename,
    _react.createElement(
      'span',
      { className: 'nuclide-diagnostics-ui-line-number' },
      ':',
      line
    )
  );
}

function getLocation(diagnostic) {
  const filePath = typeof diagnostic.filePath === 'string' ? diagnostic.filePath : null;
  const line = diagnostic.range ? diagnostic.range.start.row + 1 : 0;

  if (filePath == null) {
    return {
      dir: '', // TODO: Use current working root?
      location: null
    };
  }

  const humanized = (0, (_humanizePath || _load_humanizePath()).default)(filePath);
  if (humanized.endsWith('/')) {
    // It's a directory.
    return {
      dir: humanized,
      location: {
        fullPath: filePath,
        locationInFile: null
      }
    };
  }

  const { dir, base: basename } = (_nuclideUri || _load_nuclideUri()).default.parsePath(humanized);
  return {
    dir,
    location: {
      fullPath: filePath,
      locationInFile: { basename, line }
    }
  };
}