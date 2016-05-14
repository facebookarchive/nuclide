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

import {fileColumnCellDataGetter} from './paneUtils';
import {goToLocation} from '../../commons-atom/go-to-location';
import {PanelComponentScroller} from '../../nuclide-ui/lib/PanelComponentScroller';
import {React} from 'react-for-atom';
import {track} from '../../nuclide-analytics';

type textAndType = {text: string; isPlainText: boolean};

const {PropTypes} = React;
const DEFAULT_LINE_TEXT_HEIGHT = 15;
const PIXELS_PER_CHAR = 6;
const MAX_ROW_LINES = 3;
const ROW_HORIZONTAL_PADDING = 16;
const ROW_VERTICAL_PADDING = 8;

const TYPE_COLUMN_WIDTH = 80;
const PROVIDER_NAME_COLUMN_WIDTH = 175;
const FILE_PATH_COLUMN_WIDTH = 300;
const RANGE_COLUMN_WIDTH = 50;

// Maximum number of results to render in the table before truncating and displaying a "Max results
// reached" message.
const MAX_RESULTS_COUNT = 1000;

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

function plainTextColumnCellRenderer(text: string): React.Element {
  // For consistency with messageColumnCellDataGetter(), render plaintext in a <span> so that
  // everything lines up.
  return <span>{text}</span>;
}

function typeColumnCellRenderer(text: string): React.Element {
  const highlightClassName = TypeToHighlightClassName[text.toUpperCase()] || 'highlight';
  return (
    <span className={highlightClassName}>
      {text}
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

function messageColumnCellRenderer(message: textAndType): React.Element {
  if (message.isPlainText) {
    return plainTextColumnCellRenderer(message.text);
  } else {
    return <span dangerouslySetInnerHTML={{__html: message.text}}></span>;
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

type CellProps = {
  children: React.Element;
  style?: Object;
  title?: string;
};

/*
 * Returns markup similar to that produced by fixed-data-table v0.6.0.
 */
function Cell(props: CellProps): React.Element {
  return (
    <div
      className="fixedDataTableCellLayout_main public_fixedDataTableCell_main"
      style={props.style}
      title={props.title}>
      <div className="fixedDataTableCellLayout_wrap1 public_fixedDataTableCell_wrap1">
        <div className="fixedDataTableCellLayout_wrap2 public_fixedDataTableCell_wrap2">
          <div className="fixedDataTableCellLayout_wrap3 public_fixedDataTableCell_wrap3">
            <div className="public_fixedDataTableCell_cellContent">
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

class DiagnosticsPane extends React.Component {
  static propTypes = {
    diagnostics: PropTypes.array.isRequired,
    showFileName: PropTypes.bool,
    width: PropTypes.number.isRequired,
  };

  state: {widths: {[key: string]: number}};;

  constructor(props: mixed) {
    super(props);
    (this: any)._rowGetter = this._rowGetter.bind(this);
    (this: any)._rowHeightGetter = this._rowHeightGetter.bind(this);
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

  render(): React.Element {
    const diagnosticCells = [];
    for (
      let index = 0;
      index < Math.min(MAX_RESULTS_COUNT, this.props.diagnostics.length);
      index++
    ) {
      const diag = this.props.diagnostics[index];
      diagnosticCells.push(
        <div
          className="fixedDataTableCellGroupLayout_cellGroup nuclide-diagnostics-pane__actionable"
          key={index}
          onClick={e => { onRowClick(e, index, diag); }}
          style={{height: this._rowHeightGetter(index)}}>
          <Cell style={{width: `${this.state.widths.type}px`}}>
            {typeColumnCellRenderer(typeColumnCellDataGetter('type', diag))}
          </Cell>
          <Cell style={{width: `${this.state.widths.providerName}px`}}>
            {plainTextColumnCellRenderer(sourceColumnCellDataGetter('providerName', diag))}
          </Cell>
          {this.props.showFileName
            ? <Cell
                style={{width: `${this.state.widths.filePath}px`}}
                title={fileColumnCellDataGetter('filePath', diag)}>
                {plainTextColumnCellRenderer(fileColumnCellDataGetter('filePath', diag))}
              </Cell>
            : null
          }
          <Cell style={{width: `${this.state.widths.range}px`}}>
            {plainTextColumnCellRenderer(locationColumnCellDataGetter('range', diag))}
          </Cell>
          <Cell style={{width: `${this._getMessageWidth()}px`}}>
            {messageColumnCellRenderer(messageColumnCellDataGetter('message', diag))}
          </Cell>
        </div>
      );
    }

    if (this.props.diagnostics.length > MAX_RESULTS_COUNT) {
      diagnosticCells.push(
        <div className="fixedDataTableCellGroupLayout_cellGroup" key="maxResultsMessage">
          <div className="public_fixedDataTableCell_cellContent text-center">
            <em>Max results ({MAX_RESULTS_COUNT}) reached. Fix diagnostics or show only diagnostics
            for the current file to view more.</em>
          </div>
        </div>
      );
    }

    return (
      <div className="fixedDataTableLayout_main">
        <div className="public_fixedDataTable_main">
          <div className="public_fixedDataTable_header">
            <div className="fixedDataTableCellGroupLayout_cellGroup" style={{height: '30px'}}>
              <Cell style={{width: `${this.state.widths.type}px`}}>Type</Cell>
              <Cell style={{width: `${this.state.widths.providerName}px`}}>Source</Cell>
              {this.props.showFileName
                ? <Cell style={{width: `${this.state.widths.filePath}px`}}>File</Cell>
                : null
              }
              <Cell style={{width: `${this.state.widths.range}px`}}>Line</Cell>
              <Cell style={{width: `${this._getMessageWidth()}px`}}>Description</Cell>
            </div>
          </div>
          <PanelComponentScroller flexDirection="column">
            {diagnosticCells}
          </PanelComponentScroller>
        </div>
      </div>
    );
  }
}

module.exports = DiagnosticsPane;
