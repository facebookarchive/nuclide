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

function locationColumnCellDataGetter(cellDataKey: 'range', diagnostic: DiagnosticMessage): string {
  return diagnostic.range ? 'Line ' + (diagnostic.range.start.row + 1) : '';
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

/** @return text and a boolean indicating whether it is plaintext or HTML. */
function messageColumnCellDataGetter(
  cellDataKey: 'message',
  diagnostic: DiagnosticMessage
): textAndType {
  if (diagnostic.html) {
    return {text: diagnostic.html, isPlainText: false};
  } else if (diagnostic.text) {
    return {text: diagnostic.text, isPlainText: true};
  } else {
    throw new Error(`Neither text nor html property defined on: ${diagnostic}`);
  }
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
    // TODO(mbolin): Improve this heuristic for determining the row height.
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
    return (
      <Table
        height={this.props.height}
        headerHeight={30}
        onRowClick={onRowClick}
        overflowY="auto"
        rowGetter={this._rowGetter}
        rowHeight={DEFAULT_ROW_TEXT_HEIGHT + ROW_VERTICAL_PADDING}
        rowHeightGetter={this._rowHeightGetter}
        rowsCount={this.props.diagnostics.length}
        width={2000}
        >
        <Column
          align="left"
          cellDataGetter={fileColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="filePath"
          headerRenderer={this._renderHeader}
          label="File"
          width={700}
        />
        <Column
          align="left"
          cellDataGetter={locationColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="range"
          maxWidth={100}
          label="Location"
          width={100}
        />
        <Column
          align="left"
          cellDataGetter={typeColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="type"
          maxWidth={100}
          label="Type"
          width={100}
        />
        <Column
          align="left"
          cellDataGetter={sourceColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="providerName"
          maxWidth={100}
          label="Source"
          width={100}
        />
        <Column
          align="left"
          cellDataGetter={messageColumnCellDataGetter}
          cellRenderer={messageColumnCellRenderer}
          dataKey="message"
          label="Description"
          width={1000}
        />
      </Table>
    );
  }
}

var {PropTypes} = React;

DiagnosticsPane.propTypes = {
  height: PropTypes.number.isRequired,
  diagnostics: PropTypes.array.isRequired,
};

module.exports = DiagnosticsPane;
