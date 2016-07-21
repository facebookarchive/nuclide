'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Executor, Record, OutputProvider, Source} from '../types';

import ConsoleView from './ConsoleView';
import escapeStringRegexp from 'escape-string-regexp';
import {React} from 'react-for-atom';

type Props = {
  records: Array<Record>,
  clearRecords: () => void,
  execute: (code: string) => void,
  currentExecutor: ?Executor,
  executors: Map<string, Executor>,
  getProvider: (id: string) => ?OutputProvider,
  initialUnselectedSourceIds: Array<string>,
  selectExecutor: (executorId: string) => void,
  sources: Array<Source>,
};

type State = {
  filterText: string,
  enableRegExpFilter: boolean,

  // A blacklist of sources. We must use a blacklist so that newly registered sources will be
  // selected by default. It's not enough to just add them to the selection at registration time
  // because that would clobber serialization--though we aren't currently doing any :(
  unselectedSourceIds: Array<string>,
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
      unselectedSourceIds: props.initialUnselectedSourceIds,
    };
    (this: any)._selectSources = this._selectSources.bind(this);
    (this: any)._getExecutor = this._getExecutor.bind(this);
    (this: any)._updateFilterText = this._updateFilterText.bind(this);
    (this: any)._toggleRegExpFilter = this._toggleRegExpFilter.bind(this);
  }

  _getFilterPattern(filterText: string, isRegExp: boolean): {pattern: ?RegExp, isValid: boolean} {
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

    const selectedSourceIds = this.props.sources
      .map(source => source.id)
      .filter(sourceId => this.state.unselectedSourceIds.indexOf(sourceId) === -1);

    const records = filterRecords(
      this.props.records,
      selectedSourceIds,
      pattern,
      this.props.sources.length !== selectedSourceIds.length,
    );

    return (
      <ConsoleView {...this.props}
        invalidFilterInput={!isValid}
        records={records}
        enableRegExpFilter={this.state.enableRegExpFilter}
        getProvider={this.props.getProvider}
        selectedSourceIds={selectedSourceIds}
        selectSources={this._selectSources}
        toggleRegExpFilter={this._toggleRegExpFilter}
        updateFilterText={this._updateFilterText}
      />
    );
  }

  _selectSources(selectedSourceIds: Array<string>): void {
    const sourceIds = this.props.sources.map(source => source.id);
    const unselectedSourceIds = sourceIds
      .filter(sourceId => selectedSourceIds.indexOf(sourceId) === -1);
    this.setState({unselectedSourceIds});
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
