'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Level, Record} from '../types';

import CodeBlock from './CodeBlock';
import classnames from 'classnames';
import {React} from 'react-for-atom';

type Props = {
  record: Record;
  showSourceLabel: boolean;
};

export default class RecordView extends React.Component {
  props: Props;

  render(): React.Element {
    const {record} = this.props;
    const classNames = classnames(
      'nuclide-console-record',
      `level-${record.level || 'log'}`,
      {
        request: record.kind === 'request',
        response: record.kind === 'response',
      },
    );

    const iconName = getIconName(record);
    const icon = iconName ? <span className={`icon icon-${iconName}`} /> : null;
    const sourceLabel = this.props.showSourceLabel
      ? (
        <span
          className={`nuclide-console-record-source-label ${getHighlightClassName(record.level)}`}>
          {record.sourceId}
        </span>
      )
      : null;

    return (
      <div className={classNames}>
        {icon}
        <div className="nuclide-console-record-content-wrapper">
          {sourceLabel}
          {renderContent(record)}
        </div>
      </div>
    );
  }

}

function getHighlightClassName(level: Level): string {
  switch (level) {
    case 'info': return 'highlight-info';
    case 'warning': return 'highlight-warning';
    case 'error': return 'highlight-error';
    default: return 'highlight';
  }
}

function renderContent(record: Record): React.Element {
  if (record.kind === 'request') {
    return <CodeBlock text={record.text} scopeName={record.scopeName} />;
  }

  // If there's not text, use a space to make sure the row doesn't collapse.
  const text = record.text || ' ';
  return <pre>{text}</pre>;
}

function getIconName(record: Record): ?string {
  switch (record.kind) {
    case 'request':
      return 'chevron-right';
    case 'response':
      return 'arrow-small-left';
  }
  switch (record.level) {
    case 'info':
      return 'info';
    case 'warning':
      return 'alert';
    case 'error':
      return 'stop';
  }
}
