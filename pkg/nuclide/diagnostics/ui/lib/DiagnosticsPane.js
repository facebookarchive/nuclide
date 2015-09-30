'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {Column, Table} = require('fixed-data-table-for-atom');
var React = require('react-for-atom');
var {fileColumnCellDataGetter} = require('./paneUtils');

type textAndType = {text: string, isPlainText: boolean};

var ROW_VERTICAL_PADDING = 16; // 8px top and bottom padding.
var DEFAULT_ROW_TEXT_HEIGHT = 15;
var MAX_CHARS_PER_LINE = 100;

var TypeToHighlightClassName = {
  ERROR: 'highlight-error',
  WARNING: 'highlight-warning',
};

function locationColumnCellDataGetter(cellDataKey: 'range', diagnostic: DiagnosticMessage): string {
  return diagnostic.range ? (diagnostic.range.start.row + 1).toString() : '';
}

function typeColumnCellDataGetter(cellDataKey: 'type', diagnostic: DiagnosticMessage): string {
  return diagnostic.type;
}

function sourceColumnCellDataGetter(cellDataKey: 'providerName', diagnostic: DiagnosticMessage): string {
  return diagnostic.providerName;
}

function plainTextColumnCellRenderer(text: string): ReactElement {
  // For consistency with messageColumnCellDataGetter(), render plaintext in a <span> so that
  // everything lines up.
  return <span className="nuclide-fixed-data-cell">{text}</span>;
}

function typeColumnCellRenderer(text: string): ReactElement {
  var highlightClassName = TypeToHighlightClassName[text.toUpperCase()] || 'highlight';
  return (
    <span className="nuclide-fixed-data-cell">
      <span className={highlightClassName}>
        {text}
      </span>
    </span>
  );
}

/** @return text and a boolean indicating whether it is plaintext or HTML. */
function messageColumnCellDataGetter(
  cellDataKey: 'message',
  diagnostic: DiagnosticMessage
): textAndType {
  let text = '';
  let isPlainText = true;
  const traces = diagnostic.trace || [];
  // This works fine, and in fact Flow accepts it if I use a for...of and push onto the array,
  // instead of using a spread operator.
  // $FlowIssue
  const allMessages: Array<{html?: string, text?: string}> = [diagnostic, ...traces];
  for (const message of allMessages) {
    if (message.html != null) {
      text += message.html + ' ';
      isPlainText = false;
    } else if (message.text != null) {
      text += message.text + ' ';
    } else {
      throw new Error(`Neither text nor html property defined on: ${message}`);
    }
  }
  return {
    text: text.trim(),
    isPlainText,
  };
}

function messageColumnCellRenderer(message: textAndType): ReactElement {
  if (message.isPlainText) {
    return plainTextColumnCellRenderer(message.text);
  } else {
    return <span className="nuclide-fixed-data-cell" dangerouslySetInnerHTML={{__html: message.text}} />;
  }
}

function onRowClick(
  event: SyntheticMouseEvent,
  rowIndex: number,
  rowData: DiagnosticMessage
): void {
  if (rowData.filePath == null) {
    return;
  }

  var uri = rowData.filePath;
  var options = {
    searchAllPanes: true,
    // If initialLine is N, Atom will navigate to line N+1.
    // Flow sometimes reports a row of -1, so this ensures the line is at least one.
    initialLine: Math.max(rowData.range ? rowData.range.start.row : 0, 0),
  };
  atom.workspace.open(uri, options);
}

class DiagnosticsPane extends React.Component {

  constructor(props: mixed) {
    super(props);
    this._rowGetter = this._rowGetter.bind(this);
    this._rowHeightGetter = this._rowHeightGetter.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
  }

  _rowGetter(rowIndex: number): DiagnosticMessage {
    return this.props.diagnostics[rowIndex];
  }

  _rowHeightGetter(rowIndex: number): number {
    // TODO(t8055416): Improve this heuristic for determining the row height.
    var diagnostic = this._rowGetter(rowIndex);
    var filePath = fileColumnCellDataGetter('filePath', diagnostic);
    var {text: message} = messageColumnCellDataGetter('message', diagnostic);

    // Note this will be an overestimate if the message is HTML instead of plaintext.
    var messageLength = message.length;

    var textLength = Math.max(filePath.length, messageLength);
    var numRowsOfText = Math.floor(textLength / MAX_CHARS_PER_LINE) + 1;
    return numRowsOfText * DEFAULT_ROW_TEXT_HEIGHT + ROW_VERTICAL_PADDING;
  }

  _renderHeader(label: ?string, cellDataKey: string): ReactElement {
    // TODO(ehzhang): Figure out why an onClick added to this <span> does not fire.
    return (
      <span>{label}</span>
    );
  }

  render(): ReactElement {
    // TODO(ehzhang): Setting isResizable={true} on columns seems to break things pretty badly.
    // Perhaps this is because we are using react-for-atom instead of react?
    var fileColumn = null;
    if (this.props.showFileName) {
      fileColumn = (
        <Column
          align="left"
          cellDataGetter={fileColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="filePath"
          flexGrow={2}
          headerRenderer={this._renderHeader}
          label="File"
          width={100}
        />
      );
    }
    return (
      <Table
        height={this.props.height}
        headerHeight={30}
        onRowClick={onRowClick}
        overflowX="hidden"
        overflowY="auto"
        rowGetter={this._rowGetter}
        rowHeight={DEFAULT_ROW_TEXT_HEIGHT + ROW_VERTICAL_PADDING}
        rowHeightGetter={this._rowHeightGetter}
        rowsCount={this.props.diagnostics.length}
        width={this.props.width}
        >
        <Column
          align="left"
          cellDataGetter={typeColumnCellDataGetter}
          cellRenderer={typeColumnCellRenderer}
          dataKey="type"
          maxWidth={100}
          label="Type"
          width={75}
        />
        <Column
          align="left"
          cellDataGetter={sourceColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="providerName"
          width={175}
          label="Source"
        />
        <Column
          align="left"
          cellDataGetter={messageColumnCellDataGetter}
          cellRenderer={messageColumnCellRenderer}
          dataKey="message"
          flexGrow={3}
          label="Description"
          width={100}
        />
        {fileColumn}
        <Column
          align="left"
          cellDataGetter={locationColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="range"
          maxWidth={100}
          label="Line"
          width={50}
        />
      </Table>
    );
  }
}

var {PropTypes} = React;

DiagnosticsPane.propTypes = {
  height: PropTypes.number.isRequired,
  diagnostics: PropTypes.array.isRequired,
  showFileName: PropTypes.boolean,
  width: PropTypes.number.isRequired,
};

module.exports = DiagnosticsPane;
