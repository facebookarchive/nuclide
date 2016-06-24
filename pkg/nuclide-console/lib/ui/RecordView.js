'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Level, Record, Executor, OutputProvider} from '../types';

import CodeBlock from './CodeBlock';
import classnames from 'classnames';
import {React} from 'react-for-atom';
import {LazyNestedValueComponent} from '../../../nuclide-ui/lib/LazyNestedValueComponent';
import SimpleValueComponent from '../../../nuclide-ui/lib/SimpleValueComponent';
import invariant from 'assert';

type Props = {
  record: Record;
  showSourceLabel: boolean;
  getExecutor: (id: string) => ?Executor;
  getProvider: (id: string) => ?OutputProvider;
};

export default class RecordView extends React.Component {
  props: Props;

  _renderContent(record: Record): React.Element<any> {
    if (record.kind === 'request') {
      return <CodeBlock text={record.text} scopeName={record.scopeName} />;
    } else if (record.kind === 'response') {
      const {sourceId} = record;
      let simpleValueComponent = SimpleValueComponent;
      let getProperties;
      const executor = this.props.getExecutor(sourceId);
      if (executor != null) {
        if (executor.renderValue != null) {
          simpleValueComponent = executor.renderValue;
        }
        getProperties = executor.getProperties;
      }
      return (
        <LazyNestedValueComponent
          evaluationResult={record.result}
          fetchChildren={getProperties}
          simpleValueComponent={simpleValueComponent}
          shouldCacheChildren={true}
        />
      );
    } else if (record.result != null) {
      const provider = this.props.getProvider(record.sourceId);
      invariant(provider != null);
      const {getProperties, renderValue} = provider;
      const simpleValueComponent = renderValue || SimpleValueComponent;
      invariant(getProperties != null);
      return (
        <LazyNestedValueComponent
          evaluationResult={record.result}
          fetchChildren={getProperties}
          simpleValueComponent={simpleValueComponent}
          shouldCacheChildren={true}
        />
      );
    } else {
      // If there's not text, use a space to make sure the row doesn't collapse.
      const text = record.text || ' ';
      return <pre>{text}</pre>;
    }
  }

  render(): React.Element<any> {
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
          {this._renderContent(record)}
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
