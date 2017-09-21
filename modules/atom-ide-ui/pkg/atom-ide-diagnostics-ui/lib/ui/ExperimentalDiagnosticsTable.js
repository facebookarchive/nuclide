/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  DiagnosticMessage,
  DiagnosticMessageKind,
  DiagnosticMessageType,
} from '../../../atom-ide-diagnostics/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Column, Row} from 'nuclide-commons-ui/Table';
import type {IconName} from 'nuclide-commons-ui/Icon';

import classnames from 'classnames';
import humanizePath from 'nuclide-commons-atom/humanizePath';
import * as React from 'react';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import {Table} from 'nuclide-commons-ui/Table';
import sortDiagnostics from '../sortDiagnostics';
import {DiagnosticsMessageNoHeader} from './DiagnosticsMessage';
import {DiagnosticsMessageText} from './DiagnosticsMessageText';
import {Icon} from 'nuclide-commons-ui/Icon';

// text is always used for sorting, while we render the element.
type DescriptionField = {
  diagnostic: DiagnosticMessage,
  showTraces: boolean,
  text: string,
  isPlainText: boolean,
};

type Location = {|
  fullPath: NuclideUri,
  locationInFile: ?{|
    basename: string,
    line: number,
  |},
|};

export type DisplayDiagnostic = {
  +classification: {
    kind: DiagnosticMessageKind,
    severity: DiagnosticMessageType,
  },
  +providerName: string,
  +description: {
    showTraces: boolean,
    diagnostic: DiagnosticMessage,
    text: string,
    isPlainText: boolean,
  },
  +dir: string,
  +location: ?Location,
};

type ColumnName = $Keys<DisplayDiagnostic>;

// Maximum number of results to render in the table before truncating and displaying a "Max results
// reached" message.
const MAX_RESULTS_COUNT = 1000;

type Props = {
  diagnostics: Array<DiagnosticMessage>,
  selectedMessage: ?DiagnosticMessage,
  gotoMessageLocation: (message: DiagnosticMessage) => void,
  selectMessage: (message: DiagnosticMessage) => void,
  showFileName: ?boolean,
  showTraces: boolean,
};

type State = {
  sortDescending: boolean,
  sortedColumn: ColumnName,
};

export default class ExperimentalDiagnosticsTable extends React.Component<
  Props,
  State,
> {
  _table: ?Table<DisplayDiagnostic>;

  constructor(props: Props) {
    super(props);
    (this: any)._handleSort = this._handleSort.bind(this);
    (this: any)._handleSelectTableRow = this._handleSelectTableRow.bind(this);
    this.state = {
      sortDescending: true,
      sortedColumn: 'classification',
    };
  }

  _handleSort(sortedColumn: ColumnName, sortDescending: boolean): void {
    this.setState({
      sortedColumn,
      sortDescending,
    });
  }

  _handleSelectTableRow = (item: {diagnostic: DiagnosticMessage}): void => {
    this.props.selectMessage(item.diagnostic);
  };

  _handleConfirmTableRow = (item: {diagnostic: DiagnosticMessage}): void => {
    this.props.gotoMessageLocation(item.diagnostic);
  };

  _getColumns(): Array<Column<DisplayDiagnostic>> {
    const {showFileName} = this.props;

    // These need to add up to 1.
    // TODO: Update the Table component so that we can have more control over this (and provide
    //       explicit pixel widths)
    const TYPE_WIDTH = 0.05;
    const SOURCE_WIDTH = 0.1;
    const FILENAME_WIDTH = 0.3;
    const DIR_WIDTH = 0.15;
    const DESCRIPTION_WIDTH = showFileName
      ? 1 - (TYPE_WIDTH + SOURCE_WIDTH + FILENAME_WIDTH + DIR_WIDTH)
      : 1 - (TYPE_WIDTH + SOURCE_WIDTH);

    const filePathColumns = showFileName
      ? [
          {
            component: DirComponent,
            key: 'dir',
            title: 'Path',
            width: DIR_WIDTH,
            shouldRightAlign: true,
            cellClassName: 'nuclide-diagnostics-ui-cell-dir',
          },
          {
            component: FilenameComponent,
            key: 'location',
            title: 'File Name',
            width: FILENAME_WIDTH,
            cellClassName: 'nuclide-diagnostics-ui-cell-filename',
          },
        ]
      : [];
    return [
      {
        component: TypeComponent,
        key: 'classification',
        title: 'Type',
        width: TYPE_WIDTH,
        minWidth: 55,
        cellClassName: 'nuclide-diagnostics-ui-cell-classification',
      },
      {
        key: 'providerName',
        title: 'Source',
        width: SOURCE_WIDTH,
        minWidth: 70,
      },
      {
        component: DescriptionComponent,
        key: 'description',
        title: 'Description',
        width: DESCRIPTION_WIDTH,
      },
      ...filePathColumns,
    ];
  }

  render(): React.Node {
    const {diagnostics, selectedMessage, showTraces} = this.props;
    const {sortedColumn, sortDescending} = this.state;
    const diagnosticRows = this._getRows(diagnostics, showTraces);
    let sortedRows = this._sortRows(
      diagnosticRows,
      sortedColumn,
      sortDescending,
    );
    let maxResultsMessage;
    if (sortedRows.length > MAX_RESULTS_COUNT) {
      sortedRows = sortedRows.slice(0, MAX_RESULTS_COUNT);
      maxResultsMessage = (
        <div className="highlight-warning diagnostics-ui-table-message">
          Max results ({MAX_RESULTS_COUNT}) reached. Fix diagnostics or show
          only diagnostics for the current file to view more.
        </div>
      );
    }
    const selectedIndex = sortedRows.findIndex(
      row => row.data.description.diagnostic === selectedMessage,
    );
    return (
      <div
        className={classnames({
          'diagnostics-ui-table-container': true,
          'diagnostics-ui-table-container-empty': sortedRows.length === 0,
        })}>
        <Table
          ref={table => {
            this._table = table;
          }}
          collapsable={true}
          columns={this._getColumns()}
          emptyComponent={EmptyComponent}
          fixedHeader={true}
          maxBodyHeight="99999px"
          rows={sortedRows}
          sortable={true}
          onSort={this._handleSort}
          sortedColumn={sortedColumn}
          sortDescending={sortDescending}
          selectable={true}
          selectedIndex={selectedIndex}
          onSelect={this._handleSelectTableRow}
          onConfirm={this._handleConfirmTableRow}
          enableKeyboardNavigation={true}
        />
        {maxResultsMessage}
      </div>
    );
  }

  focus(): void {
    if (this._table != null) {
      this._table.focus();
    }
  }

  // TODO: Memoize this so we don't recompute unnecessarily.
  _getRows(
    diagnostics: Array<DiagnosticMessage>,
    showTraces: boolean,
  ): Array<Row<DisplayDiagnostic>> {
    return diagnostics.map(diagnostic => {
      const {dir, location} = getLocation(diagnostic);
      return {
        data: {
          classification: {
            kind: diagnostic.kind || 'lint',
            severity: diagnostic.type,
          },
          providerName: diagnostic.providerName,
          description: {
            showTraces,
            diagnostic,
            ...getMessageContent(diagnostic, showTraces),
          },
          dir,
          location,
          diagnostic,
        },
      };
    });
  }

  // TODO: Memoize this so we don't recompute unnecessarily.
  _sortRows(
    rows: Array<Row<DisplayDiagnostic>>,
    sortedColumn: $Keys<DisplayDiagnostic>,
    descending: boolean,
  ): Array<Row<DisplayDiagnostic>> {
    return sortDiagnostics(rows, sortedColumn, descending);
  }
}

const EmptyComponent = () =>
  <div className="diagnostics-ui-empty-component">No diagnostic messages</div>;

type Classification = {
  kind: DiagnosticMessageKind,
  severity: DiagnosticMessageType,
};

function TypeComponent(props: {data: Classification}): React.Element<any> {
  const classification = props.data;
  const iconName = getIconName(classification);
  return <Icon icon={iconName} />;
}

function getIconName(classification: Classification): IconName {
  const {kind, severity} = classification;
  if (kind === 'feedback') {
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
      throw new Error(`Invalid severity: ${severity}`);
  }
}

function getMessageContent(
  diagnostic: DiagnosticMessage,
  showTraces: boolean,
): {text: string, isPlainText: boolean} {
  let text = '';
  let isPlainText = true;
  const traces = diagnostic.trace || [];
  const allMessages: Array<{html?: string, text?: string}> = [
    diagnostic,
    ...traces,
  ];
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
  return {text: text.trim(), isPlainText};
}

function DescriptionComponent(props: {
  data: DescriptionField,
}): React.Element<any> {
  const {showTraces, diagnostic, text, isPlainText} = props.data;
  return showTraces && diagnostic.scope === 'file'
    ? DiagnosticsMessageNoHeader({
        message: diagnostic,
        goToLocation,
        fixer: () => {},
      })
    : DiagnosticsMessageText({
        preserveNewlines: showTraces,
        message: {text, html: isPlainText ? undefined : text},
      });
}

function DirComponent(props: {data: string}): React.Element<any> {
  return (
    // We're abusing `direction: rtl` here so we need the LRM to keep the slash on the right.
    <div className="nuclide-diagnostics-ui-path-cell">
      &lrm;{nuclideUri.normalizeDir(props.data)}&lrm;
    </div>
  );
}

function FilenameComponent(props: {data: ?Location}): React.Element<any> {
  const locationInFile = props.data && props.data.locationInFile;
  if (locationInFile == null) {
    // This is a project diagnostic.
    return <span>&mdash;</span>;
  }
  const {basename, line} = locationInFile;
  return (
    <span>
      {basename}
      <span className="nuclide-diagnostics-ui-line-number">
        :{line}
      </span>
    </span>
  );
}

function getLocation(
  diagnostic: DiagnosticMessage,
): {dir: string, location: ?Location} {
  const filePath =
    typeof diagnostic.filePath === 'string' ? diagnostic.filePath : null;
  const line = diagnostic.range ? diagnostic.range.start.row + 1 : 0;

  if (filePath == null) {
    return {
      dir: '', // TODO: Use current working root?
      location: null,
    };
  }

  const humanized = humanizePath(filePath);
  if (humanized.endsWith('/')) {
    // It's a directory.
    return {
      dir: humanized,
      location: {
        fullPath: filePath,
        locationInFile: null,
      },
    };
  }

  const {dir, base: basename} = nuclideUri.parsePath(humanized);
  return {
    dir,
    location: {
      fullPath: filePath,
      locationInFile: {basename, line},
    },
  };
}
