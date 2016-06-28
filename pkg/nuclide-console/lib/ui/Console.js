'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Executor, Record, OutputProvider} from '../types';

import ConsoleView from './ConsoleView';
import escapeStringRegexp from 'escape-string-regexp';
import {React} from 'react-for-atom';

type Props = {
  records: Array<Record>;
  clearRecords: () => void;
  execute: (code: string) => void;
  currentExecutor: ?Executor;
  executors: Map<string, Executor>;
  getProvider: (id: string) => ?OutputProvider;
  initialSelectedSourceIds: Array<string>;
  selectExecutor: (executorId: string) => void;
  sources: Array<{id: string; name: string}>;
};

type State = {
  filterText: string;
  enableRegExpFilter: boolean;
  selectedSourceIds: Array<string>;
};

/**
 * A component that wraps ConsoleView to handle instance-specific record filtering state.
 */
export default class Console extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      filterText: '',
      enableRegExpFilter: false,
      selectedSourceIds: props.initialSelectedSourceIds,
    };
    (this: any)._selectSources = this._selectSources.bind(this);
    (this: any)._getExecutor = this._getExecutor.bind(this);
    (this: any)._updateFilterText = this._updateFilterText.bind(this);
    (this: any)._toggleRegExpFilter = this._toggleRegExpFilter.bind(this);
  }

  _getFilterPattern(filterText: string, isRegExp: boolean): {pattern: ?RegExp; isValid: boolean} {
    if (filterText === '') {
      return {pattern: null, isValid: true};
    }
    const source = isRegExp ? filterText : escapeStringRegexp(filterText);
    try {
      return {
        pattern: new RegExp(source, 'i'),
        isValid: true,
      };
    } catch (err) {
      return {
        pattern: null,
        isValid: false,
      };
    }
  }

  render(): React.Element<any> {
    const {pattern, isValid} =
      this._getFilterPattern(this.state.filterText, this.state.enableRegExpFilter);

    const records = filterRecords(
      this.props.records,
      this.state.selectedSourceIds,
      pattern,
      this.props.sources.length !== this.state.selectedSourceIds.length,
    );

    return (
      <ConsoleView {...this.props}
        invalidFilterInput={!isValid}
        records={records}
        enableRegExpFilter={this.state.enableRegExpFilter}
        getProvider={this.props.getProvider}
        selectedSourceIds={this.state.selectedSourceIds}
        selectSources={this._selectSources}
        toggleRegExpFilter={this._toggleRegExpFilter}
        updateFilterText={this._updateFilterText}
      />
    );
  }

  _selectSources(sourceIds: Array<string>): void {
    this.setState({selectedSourceIds: sourceIds});
  }

  _toggleRegExpFilter(): void {
    this.setState({enableRegExpFilter: !this.state.enableRegExpFilter});
  }

  _updateFilterText(filterText: string): void {
    this.setState({filterText});
  }

  _getExecutor(id: string): ?Executor {
    return this.props.executors.get(id);
  }

}

function filterRecords(
  records: Array<Record>,
  selectedSourceIds: Array<string>,
  filterPattern: ?RegExp,
  filterSources: boolean,
): Array<Record> {
  if (!filterSources && filterPattern == null) { return records; }

  return records.filter(record => {
    // Only filter regular messages
    if (record.kind !== 'message') { return true; }

    const sourceMatches = selectedSourceIds.indexOf(record.sourceId) !== -1;
    const filterMatches = filterPattern == null || filterPattern.test(record.text);
    return sourceMatches && filterMatches;
  });
}
