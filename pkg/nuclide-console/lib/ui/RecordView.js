/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Level, Record, Executor, OutputProvider} from '../types';

import classnames from 'classnames';
import React from 'react';
import {LazyNestedValueComponent} from '../../../nuclide-ui/LazyNestedValueComponent';
import SimpleValueComponent from '../../../nuclide-ui/SimpleValueComponent';
import shallowEqual from 'shallowequal';
import {TextRenderer} from '../../../nuclide-ui/TextRenderer';

type Props = {
  record: Record,
  showSourceLabel: boolean,
  getExecutor: (id: string) => ?Executor,
  getProvider: (id: string) => ?OutputProvider,
};

const URL_REGEX = /(https?:\/\/[\S]+)/i;
const ONE_DAY = 1000 * 60 * 60 * 24;
export default class RecordView extends React.Component {
  props: Props;

  _renderContent(record: Record): React.Element<any> {
    if (record.kind === 'request') {
      // TODO: We really want to use a text editor to render this so that we can get syntax
      // highlighting, but they're just too expensive. Figure out a less-expensive way to get syntax
      // highlighting.
      return <pre>{record.text || ' '}</pre>;
    } else if (record.kind === 'response') {
      const executor = this.props.getExecutor(record.sourceId);
      return this._renderNestedValueComponent(record, executor);
    } else if (record.data != null) {
      const provider = this.props.getProvider(record.sourceId);
      return this._renderNestedValueComponent(record, provider);
    } else {
      // If there's not text, use a space to make sure the row doesn't collapse.
      const text = record.text || ' ';
      return <pre>{parseText(text)}</pre>;
    }
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return !shallowEqual(this.props, nextProps);
  }

  _renderNestedValueComponent(
    record: Record,
    provider: ?OutputProvider | ?Executor,
  ): React.Element<any> {
    const getProperties = provider == null ? null : provider.getProperties;
    const type = record.data == null ? null : record.data.type;
    const simpleValueComponent = getComponent(type);
    return (
      <LazyNestedValueComponent
        className="nuclide-console-lazy-nested-value"
        evaluationResult={record.data}
        fetchChildren={getProperties}
        simpleValueComponent={simpleValueComponent}
        shouldCacheChildren={true}
        expansionStateId={this}
      />
    );
  }

  render(): React.Element<any> {
    const {record} = this.props;
    const {
      level,
      kind,
      timestamp,
      sourceId,
    } = record;
    const classNames = classnames(
      'nuclide-console-record',
      `level-${level || 'log'}`,
      {
        request: kind === 'request',
        response: kind === 'response',
      },
    );

    const iconName = getIconName(record);
    const icon = iconName ? <span className={`icon icon-${iconName}`} /> : null;
    const sourceLabel = this.props.showSourceLabel
      ? (
        <span
          className={`nuclide-console-record-source-label ${getHighlightClassName(level)}`}>
          {sourceId}
        </span>
      )
      : null;
    let renderedTimestamp;
    if (timestamp != null) {
      const timestampLabel = (Date.now() - timestamp) > ONE_DAY
        ? timestamp.toLocaleString()
        : timestamp.toLocaleTimeString();
      renderedTimestamp = (
        <div className="nuclide-console-record-timestamp">
          {timestampLabel}
        </div>
      );
    }
    return (
      <div className={classNames}>
        {icon}
        <div className="nuclide-console-record-content-wrapper">
          {this._renderContent(record)}
        </div>
        {sourceLabel}
        {renderedTimestamp}
      </div>
    );
  }
}

function getComponent(type: ?string): ReactClass<any> {
  switch (type) {
    case 'text': return props => TextRenderer(props.evaluationResult);
    case 'boolean':
    case 'string':
    case 'number':
    case 'object':
    default: return SimpleValueComponent;
  }
}

function getHighlightClassName(level: Level): string {
  switch (level) {
    case 'info': return 'highlight-info';
    case 'success': return 'highlight-success';
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
    case 'success':
      return 'check';
    case 'warning':
      return 'alert';
    case 'error':
      return 'stop';
  }
}

function parseText(text: string): Array<string | React.Element<any>> {
  return text.split(URL_REGEX).map((chunk, i) => {
    // Since we're splitting on the URL regex, every other piece will be a URL.
    const isURL = i % 2 !== 0;
    return isURL
      ? <a key={`d${i}`} href={chunk} target="_blank">{chunk}</a>
      : chunk;
  });
}
