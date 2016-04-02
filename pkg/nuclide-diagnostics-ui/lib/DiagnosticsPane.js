'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DiagnosticMessage} from '../../nuclide-diagnostics-base';

const {Column, Table} = require('fixed-data-table');
const {React} = require('react-for-atom');
const {PropTypes} = React;

import {track} from '../../nuclide-analytics';
import {goToLocation} from '../../nuclide-atom-helpers';

const {fileColumnCellDataGetter} = require('./paneUtils');

type textAndType = {text: string; isPlainText: boolean};

const DEFAULT_LINE_TEXT_HEIGHT = 15;
const PIXELS_PER_CHAR = 6;
const MAX_ROW_LINES = 3;
const ROW_HORIZONTAL_PADDING = 16;
const ROW_VERTICAL_PADDING = 8;

const TYPE_COLUMN_WIDTH = 75;
const PROVIDER_NAME_COLUMN_WIDTH = 175;
const FILE_PATH_COLUMN_WIDTH = 300;
const RANGE_COLUMN_WIDTH = 50;

const TypeToHighlightClassName = Object.freeze({
  ERROR: 'highlight-error',
  WARNING: 'highlight-warning',
});

function locationColumnCellDataGetter(cellDataKey: 'range', diagnostic: DiagnosticMessage): string {
  return diagnostic.range ? (diagnostic.range.start.row + 1).toString() : '';
}

function typeColumnCellDataGetter(cellDataKey: 'type', diagnostic: DiagnosticMessage): string {
  return diagnostic.type;
}

function sourceColumnCellDataGetter(
  cellDataKey: 'providerName',
  diagnostic: DiagnosticMessage
): string {
  return diagnostic.providerName;
}

function plainTextColumnCellRenderer(text: string): ReactElement {
  // For consistency with messageColumnCellDataGetter(), render plaintext in a <span> so that
  // everything lines up.
  return <span className="nuclide-fixed-data-cell">{text}</span>;
}

function typeColumnCellRenderer(text: string): ReactElement {
  const highlightClassName = TypeToHighlightClassName[text.toUpperCase()] || 'highlight';
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
  const allMessages: Array<{html?: string; text?: string}> = [diagnostic, ...traces];
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
    return (
      <span className="nuclide-fixed-data-cell" dangerouslySetInnerHTML={{__html: message.text}} />
    );
  }
}

function onRowClick(
  event: SyntheticMouseEvent,
  rowIndex: number,
  rowData: DiagnosticMessage
): void {
  if (rowData.scope !== 'file' || rowData.filePath == null) {
    return;
  }

  track('diagnostics-panel-goto-location');

  const uri = rowData.filePath;
  // If initialLine is N, Atom will navigate to line N+1.
  // Flow sometimes reports a row of -1, so this ensures the line is at least one.
  const line = Math.max(rowData.range ? rowData.range.start.row : 0, 0);
  const column = 0;
  goToLocation(uri, line, column);
}

class DiagnosticsPane extends React.Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    diagnostics: PropTypes.array.isRequired,
    showFileName: PropTypes.bool,
    width: PropTypes.number.isRequired,
  };

  state: {widths: {[key: string]: number}};;

  constructor(props: mixed) {
    super(props);
    (this: any)._onColumnResizeEndCallback = this._onColumnResizeEndCallback.bind(this);
    (this: any)._rowGetter = this._rowGetter.bind(this);
    (this: any)._rowHeightGetter = this._rowHeightGetter.bind(this);
    (this: any)._renderHeader = this._renderHeader.bind(this);
    (this: any)._getMessageWidth = this._getMessageWidth.bind(this);

    this.state = {
      widths: {
        type: TYPE_COLUMN_WIDTH,
        providerName: PROVIDER_NAME_COLUMN_WIDTH,
        filePath: FILE_PATH_COLUMN_WIDTH,
        range: RANGE_COLUMN_WIDTH,
      },
    };
  }

  // A home-made flex function so that we can read the message column width easily.
  _getMessageWidth(): number {
    return this.props.width
      - this.state.widths.type
      - this.state.widths.providerName
      - (this.props.showFileName ? this.state.widths.filePath : 0)
      - this.state.widths.range;
  }

  _onColumnResizeEndCallback(newColumnWidth: number, columnKey: string): void {
    this.setState(({widths}) => ({
      widths: {
        ...widths,
        [columnKey]: newColumnWidth,
      },
    }));
  }

  _rowGetter(rowIndex: number): DiagnosticMessage {
    return this.props.diagnostics[rowIndex];
  }

  _rowHeightGetter(rowIndex: number): number {
    const diagnostic = this._rowGetter(rowIndex);
    const {text: message} = messageColumnCellDataGetter('message', diagnostic);
    const messageCharsPerRow = (this._getMessageWidth() - ROW_HORIZONTAL_PADDING) / PIXELS_PER_CHAR;
    const messageLinesOfText = Math.floor(message.length / messageCharsPerRow) + 1;
    const messageMaxLinesOfText = Math.min(MAX_ROW_LINES, messageLinesOfText);
    return messageMaxLinesOfText * DEFAULT_LINE_TEXT_HEIGHT + ROW_VERTICAL_PADDING;
  }

  _renderHeader(label: ?string, cellDataKey: string): ReactElement {
    // TODO(ehzhang): Figure out why an onClick added to this <span> does not fire.
    return (
      <span>{label}</span>
    );
  }

  render(): ReactElement {
    let fileColumn = null;
    if (this.props.showFileName) {
      fileColumn = (
        <Column
          align="left"
          cellDataGetter={fileColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="filePath"
          headerRenderer={this._renderHeader}
          isResizable={true}
          label="File"
          width={this.state.widths.filePath}
        />
      );
    }
    return (
      <Table
        height={this.props.height}
        headerHeight={30}
        isColumnResizing={false}
        onRowClick={onRowClick}
        onColumnResizeEndCallback={this._onColumnResizeEndCallback}
        overflowX="hidden"
        overflowY="auto"
        ref="table"
        rowGetter={this._rowGetter}
        rowHeight={DEFAULT_LINE_TEXT_HEIGHT + ROW_VERTICAL_PADDING}
        rowHeightGetter={this._rowHeightGetter}
        rowsCount={this.props.diagnostics.length}
        width={this.props.width}>
        <Column
          align="left"
          cellDataGetter={typeColumnCellDataGetter}
          cellRenderer={typeColumnCellRenderer}
          dataKey="type"
          isResizable={true}
          label="Type"
          width={this.state.widths.type}
        />
        <Column
          align="left"
          cellDataGetter={sourceColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="providerName"
          isResizable={true}
          label="Source"
          width={this.state.widths.providerName}
        />
        {fileColumn}
        <Column
          align="left"
          cellDataGetter={locationColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="range"
          isResizable={true}
          label="Line"
          width={this.state.widths.range}
        />
        <Column
          align="left"
          cellDataGetter={messageColumnCellDataGetter}
          cellRenderer={messageColumnCellRenderer}
          dataKey="message"
          label="Description"
          width={this._getMessageWidth()}
        />
      </Table>
    );
  }
}

module.exports = DiagnosticsPane;
