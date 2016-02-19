'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DiagnosticMessage} from '../../base';

const {Column, Table} = require('fixed-data-table');
const {React} = require('react-for-atom');
const {PropTypes} = React;

import {track} from '../../../analytics';

const {fileColumnCellDataGetter, getProjectRelativePathOfDiagnostic} = require('./paneUtils');

type textAndType = {text: string, isPlainText: boolean};

const DEFAULT_LINE_TEXT_HEIGHT = 15;
const DESCRIPTION_COLUMN_FLEX_GROW = 3;
const DESCRIPTION_COLUMN_WIDTH = 100;
const FILE_COLUMN_FLEX_GROW = 2;
const FILE_COLUMN_WIDTH = 100;
const LINE_COLUMN_WIDTH = 100;
const PIXELS_PER_CHAR = 6;
const ROW_HORIZONTAL_PADDING = 16; // 8px left and right padding.
const ROW_VERTICAL_PADDING = 16; // 8px top and bottom padding.
const SOURCE_COLUMN_WIDTH = 175;
const TYPE_COLUMN_WIDTH = 100;

const TypeToHighlightClassName = {
  ERROR: 'highlight-error',
  WARNING: 'highlight-warning',
};

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
  const options = {
    searchAllPanes: true,
    // If initialLine is N, Atom will navigate to line N+1.
    // Flow sometimes reports a row of -1, so this ensures the line is at least one.
    initialLine: Math.max(rowData.range ? rowData.range.start.row : 0, 0),
  };
  atom.workspace.open(uri, options);
}

class DiagnosticsPane extends React.Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    diagnostics: PropTypes.array.isRequired,
    showFileName: PropTypes.bool,
    width: PropTypes.number.isRequired,
  };

  constructor(props: mixed) {
    super(props);
    (this: any)._rowGetter = this._rowGetter.bind(this);
    (this: any)._rowHeightGetter = this._rowHeightGetter.bind(this);
    (this: any)._renderHeader = this._renderHeader.bind(this);
  }

  _rowGetter(rowIndex: number): DiagnosticMessage {
    return this.props.diagnostics[rowIndex];
  }

  _rowHeightGetter(rowIndex: number): number {
    const tableWidth = this.props.width;
    const diagnostic = this._rowGetter(rowIndex);
    const filePath = getProjectRelativePathOfDiagnostic(diagnostic);
    const {text: message} = messageColumnCellDataGetter('message', diagnostic);

    // Calculate (character) length of description and file respectively.
    const descriptionLength = message.length;
    const fileLength = filePath.length;

    // Calculate (pixel) width of flexible space used by description and file cells.
    const nonFlexWidth =
      TYPE_COLUMN_WIDTH + SOURCE_COLUMN_WIDTH + LINE_COLUMN_WIDTH;
    const flexWidth = tableWidth - nonFlexWidth;

    // Calculate (pixel) widths of description and file cells respectively.
    const flexGrowTotal = DESCRIPTION_COLUMN_FLEX_GROW + FILE_COLUMN_FLEX_GROW;
    const descriptionWidth =
      flexWidth * (DESCRIPTION_COLUMN_FLEX_GROW / flexGrowTotal) - ROW_HORIZONTAL_PADDING;
    const fileWidth =
      flexWidth * (FILE_COLUMN_FLEX_GROW / flexGrowTotal) - ROW_HORIZONTAL_PADDING;

    // Calculate number of characters that fit in one line using cell width.
    const descriptionCharsPerRow = descriptionWidth / PIXELS_PER_CHAR;
    const fileCharsPerRow = fileWidth / PIXELS_PER_CHAR;

    // Calculate number of lines needed using text length and characters per line.
    const descriptionMaxLinesOfText =
      Math.floor(descriptionLength / descriptionCharsPerRow) + 1;
    const fileMaxLinesOfText =
      Math.floor(fileLength / fileCharsPerRow) + 1;

    // Set height using the maximum of the two required cell heights.
    const maxNumLinesOfText = Math.max(
      descriptionMaxLinesOfText,
      fileMaxLinesOfText
    );
    return maxNumLinesOfText * DEFAULT_LINE_TEXT_HEIGHT + ROW_VERTICAL_PADDING;
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
    let fileColumn = null;
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
          width={FILE_COLUMN_WIDTH}
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
          label="Type"
          width={TYPE_COLUMN_WIDTH}
        />
        <Column
          align="left"
          cellDataGetter={sourceColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="providerName"
          label="Source"
          width={SOURCE_COLUMN_WIDTH}
        />
        <Column
          align="left"
          cellDataGetter={messageColumnCellDataGetter}
          cellRenderer={messageColumnCellRenderer}
          dataKey="message"
          flexGrow={3}
          label="Description"
          width={DESCRIPTION_COLUMN_WIDTH}
        />
        {fileColumn}
        <Column
          align="left"
          cellDataGetter={locationColumnCellDataGetter}
          cellRenderer={plainTextColumnCellRenderer}
          dataKey="range"
          label="Line"
          width={LINE_COLUMN_WIDTH}
        />
      </Table>
    );
  }
}

module.exports = DiagnosticsPane;
