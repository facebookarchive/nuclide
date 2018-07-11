"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _memoizeUntilChanged() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/memoizeUntilChanged"));

  _memoizeUntilChanged = function () {
    return data;
  };

  return data;
}

function _humanizePath() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-atom/humanizePath"));

  _humanizePath = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _Table() {
  const data = require("../../../../../nuclide-commons-ui/Table");

  _Table = function () {
    return data;
  };

  return data;
}

function _sortDiagnostics() {
  const data = _interopRequireDefault(require("../sortDiagnostics"));

  _sortDiagnostics = function () {
    return data;
  };

  return data;
}

function _DiagnosticsMessage() {
  const data = require("./DiagnosticsMessage");

  _DiagnosticsMessage = function () {
    return data;
  };

  return data;
}

function _DiagnosticsMessageText() {
  const data = require("./DiagnosticsMessageText");

  _DiagnosticsMessageText = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const DIAGNOSTICS_TO_ROWS_TRACES_MAP = new WeakMap();
const DIAGNOSTICS_TO_ROWS_NO_TRACES_MAP = new WeakMap(); // text is always used for sorting, while we render the element.

// Maximum number of results to render in the table before truncating and displaying a "Max results
// reached" message.
const MAX_RESULTS_COUNT = 1000;

class DiagnosticsTable extends React.PureComponent {
  constructor(props) {
    super(props); // Memoize `_getRows()`

    _initialiseProps.call(this);

    this._getRows = (0, _memoizeUntilChanged().default)(this._getRows, (diagnostics, showTraces) => ({
      diagnostics,
      showTraces
    }), (a, b) => a.showTraces === b.showTraces && (0, _collection().arrayEqual)(a.diagnostics, b.diagnostics));
    this.state = {
      sortDescending: true,
      sortedColumn: 'classification'
    };
  }

  _getColumns() {
    const {
      showFileName,
      showDirectoryColumn
    } = this.props; // These need to add up to 1.
    // TODO: Update the Table component so that we can have more control over this (and provide
    //       explicit pixel widths)

    const TYPE_WIDTH = 0;
    const SOURCE_WIDTH = 0;
    const FILENAME_WIDTH = 0.3;
    const DIR_WIDTH = 0.15;
    const LINE_NUMBER_WIDTH = 0;
    const filePathColumns = [];
    let descriptionWidth = 1 - (TYPE_WIDTH + SOURCE_WIDTH);

    if (showFileName) {
      if (showDirectoryColumn) {
        filePathColumns.push({
          component: DirComponent,
          key: 'dir',
          title: 'Path',
          width: DIR_WIDTH,
          shouldRightAlign: true,
          cellClassName: 'nuclide-diagnostics-ui-cell-dir'
        });
        descriptionWidth -= DIR_WIDTH;
      }

      filePathColumns.push({
        component: FilenameComponent,
        key: 'location',
        title: 'File Name',
        width: FILENAME_WIDTH,
        cellClassName: 'nuclide-diagnostics-ui-cell-filename'
      });
      descriptionWidth -= FILENAME_WIDTH;
    } else {
      // Not showing the filename? Then we need a separate column for the line number.
      filePathColumns.push({
        component: LineNumberComponent,
        key: 'line',
        title: 'Line',
        shouldRightAlign: true,
        width: LINE_NUMBER_WIDTH,
        minWidth: 60
      });
      descriptionWidth -= LINE_NUMBER_WIDTH;
    }

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
      minWidth: 100
    }, {
      component: this._renderDescription,
      key: 'description',
      title: 'Description',
      width: descriptionWidth,
      cellClassName: 'nuclide-diagnostics-ui-cell-description'
    }, ...filePathColumns];
  } // False positive for this lint rule?
  // eslint-disable-next-line react/no-unused-prop-types


  _getSortOptions(columns) {
    // If the column the user sorted by has been removed, return the default sorting. We do this
    // (instead of updating the state) so that if the column gets added back we can return to
    // sorting by that.
    const columnKeys = columns.map(column => column.key);

    if (!columnKeys.includes(this.state.sortedColumn)) {
      return {
        sortedColumn: 'classification',
        sortDescending: true
      };
    } // Otherwise, return the sorting they've chosen.


    return {
      sortedColumn: this.state.sortedColumn,
      sortDescending: this.state.sortDescending
    };
  }

  render() {
    const {
      diagnostics,
      selectedMessage,
      showTraces
    } = this.props;

    const columns = this._getColumns();

    const {
      sortedColumn,
      sortDescending
    } = this._getSortOptions(columns);

    const diagnosticRows = this._getRows(diagnostics, showTraces);

    let sortedRows = this._sortRows(diagnosticRows, sortedColumn, sortDescending);

    let maxResultsMessage;

    if (sortedRows.length > MAX_RESULTS_COUNT) {
      sortedRows = sortedRows.slice(0, MAX_RESULTS_COUNT);
      maxResultsMessage = React.createElement("div", {
        className: "highlight-warning diagnostics-ui-table-message"
      }, "Max results (", MAX_RESULTS_COUNT, ") reached. Fix diagnostics or show only diagnostics for the current file to view more.");
    }

    const selectedIndex = this._findSelectedIndex(selectedMessage, sortedRows);

    return React.createElement("div", {
      className: (0, _classnames().default)({
        'diagnostics-ui-table-container': true,
        'diagnostics-ui-table-container-empty': sortedRows.length === 0
      })
    }, React.createElement(_Table().Table, {
      ref: table => {
        this._table = table;
      },
      collapsable: true,
      columns: columns,
      emptyComponent: EmptyComponent,
      fixedHeader: true,
      maxBodyHeight: "99999px",
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
    }), maxResultsMessage);
  }

  focus() {
    if (this._table != null) {
      this._table.focus();
    }
  }

  _findSelectedIndex(selectedMessage, rows) {
    if (selectedMessage == null) {
      return -1;
    }

    let bestRank = -1;
    let bestRankedIndex = -1; // Look for the closest match, starting with the previously selected index.

    for (const [row, i] of (0, _collection().insideOut)(rows, this._previousSelectedIndex)) {
      const {
        diagnostic
      } = row.data.description;

      if (diagnostic === selectedMessage) {
        bestRankedIndex = i;
        break;
      }

      const rank = compareMessages(diagnostic, selectedMessage);

      if (rank != null && rank > bestRank) {
        bestRank = rank;
        bestRankedIndex = i;
      }
    }

    if (bestRankedIndex === -1) {
      bestRankedIndex = Math.min(this._previousSelectedIndex, rows.length - 1);
    }

    this._previousSelectedIndex = bestRankedIndex;
    return bestRankedIndex;
  }

  _getRows(diagnostics, showTraces) {
    const diagnosticsToRows = showTraces ? DIAGNOSTICS_TO_ROWS_TRACES_MAP : DIAGNOSTICS_TO_ROWS_NO_TRACES_MAP;
    return diagnostics.map(diagnostic => {
      let row = diagnosticsToRows.get(diagnostic);

      if (row == null) {
        var _ref;

        const {
          dir,
          location
        } = getLocation(diagnostic);
        row = {
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
            diagnostic,
            line: (_ref = location) != null ? (_ref = _ref.locationInFile) != null ? _ref.line : _ref : _ref
          }
        };
        diagnosticsToRows.set(diagnostic, row);
      }

      return row;
    });
  } // TODO: Memoize this so we don't recompute unnecessarily.


  _sortRows(rows, sortedColumn, descending) {
    return (0, _sortDiagnostics().default)(rows, sortedColumn, descending);
  }

}

exports.default = DiagnosticsTable;

var _initialiseProps = function () {
  this._previousSelectedIndex = -1;

  this._handleSort = (sortedColumn, sortDescending) => {
    this.setState({
      sortedColumn,
      sortDescending
    });
  };

  this._handleSelectTableRow = (item, index, event) => {
    this.props.selectMessage(item.diagnostic); // Users navigating with the keyboard may just be moving through items on their way to another.
    // If they have pending pane items enabled, it's not a big deal if we open the editor anyway.
    // But if they don't, we could wind up opening a ton of files they didn't even care about so,
    // to be safe, we won't do anything in that case.

    if (event.type !== 'click' && !atom.config.get('core.allowPendingPaneItems')) {
      return;
    }

    this.props.gotoMessageLocation(item.diagnostic, {
      focusEditor: false
    });
  };

  this._handleConfirmTableRow = item => {
    this.props.gotoMessageLocation(item.diagnostic, {
      focusEditor: true
    });
  };

  this._renderDescription = props => {
    const {
      showTraces,
      diagnostic,
      text,
      isPlainText
    } = props.data;
    return showTraces ? (0, _DiagnosticsMessage().DiagnosticsMessageNoHeader)({
      message: diagnostic,
      goToLocation: (file, line) => (0, _goToLocation().goToLocation)(file, {
        line
      }),
      fixer: () => {}
    }) : (0, _DiagnosticsMessageText().DiagnosticsMessageText)({
      preserveNewlines: showTraces,
      message: {
        text,
        html: isPlainText ? undefined : text
      }
    });
  };
};

const EmptyComponent = () => React.createElement("div", {
  className: "diagnostics-ui-empty-component"
}, "No diagnostic messages");

function TypeComponent(props) {
  const classification = props.data;
  const iconName = getIconName(classification);
  return React.createElement(_Icon().Icon, {
    icon: iconName
  });
}

function getIconName(classification) {
  const {
    kind,
    severity
  } = classification;

  if (kind === 'review') {
    return 'nuclicon-comment-discussion';
  }

  if (!(severity !== 'Hint')) {
    throw new Error("Invariant violation: \"severity !== 'Hint'\"");
  }

  switch (severity) {
    case 'Warning':
      return 'nuclicon-warning';

    case 'Error':
      return 'nuclicon-error';

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

  return {
    text: text.trim(),
    isPlainText
  };
}

function DirComponent(props) {
  return (// We're abusing `direction: rtl` here so we need the LRM to keep the slash on the right.
    React.createElement("div", {
      className: "nuclide-diagnostics-ui-dir-cell-contents"
    }, "\u200E", _nuclideUri().default.normalizeDir(props.data), "\u200E")
  );
}

function FilenameComponent(props) {
  const locationInFile = props.data && props.data.locationInFile;

  if (locationInFile == null) {
    // This is a project diagnostic.
    return React.createElement("span", null, DASH);
  }

  const {
    basename,
    line
  } = locationInFile;
  return React.createElement("span", null, basename, React.createElement("span", {
    className: "nuclide-diagnostics-ui-line-number"
  }, ":", line));
}

function LineNumberComponent(props) {
  const line = props.data; // Show a dash if this is a project diagnostic.

  return React.createElement("span", null, line == null ? DASH : line);
}

function getLocation(diagnostic) {
  const {
    filePath,
    range
  } = diagnostic;
  const line = range ? range.start.row + 1 : 0;
  const humanized = (0, _humanizePath().default)(filePath);

  if (_nuclideUri().default.endsWithSeparator(humanized)) {
    // It's a directory.
    return {
      dir: humanized,
      location: {
        fullPath: filePath,
        locationInFile: null
      }
    };
  }

  const {
    dir,
    base: basename
  } = _nuclideUri().default.parsePath(humanized);

  return {
    dir,
    location: {
      fullPath: filePath,
      locationInFile: {
        basename,
        line
      }
    }
  };
}
/**
 * Compute a number indicating the relative similarity of two messages. The smaller the number, the
 * more similar. (`null` indicates not at all similar.)
 */


function compareMessages(a, b) {
  const aKind = a.kind || 'lint';
  const bKind = b.kind || 'lint';
  const aFilePath = a.filePath;
  const bFilePath = b.filePath;

  if (aKind !== bKind || a.providerName !== b.providerName || a.type !== b.type || aFilePath !== bFilePath) {
    return null;
  }

  const aRange = a.range;
  const bRange = b.range;

  if (Boolean(aRange) !== Boolean(bRange)) {
    return null;
  } // Neither has a range, but they have the same text and they're for the same file.


  if (aRange == null || bRange == null) {
    return 0;
  } // TODO: This could be better if we also took into account the column and end start and column,
  // but it's probably good enough. (How likely are messages with the same text starting on the same
  // row?)


  return Math.abs(aRange.start.row - bRange.start.row);
}

const DASH = '\u2014';