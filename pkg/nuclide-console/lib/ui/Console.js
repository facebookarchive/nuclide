'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Executor, Record} from '../types';

import ConsoleView from './ConsoleView';
import escapeStringRegexp from 'escape-string-regexp';
import {React} from 'react-for-atom';

type Props = {
  records: Array<Record>;
  clearRecords: () => void;
  execute: (code: string) => void;
  currentExecutor: ?Executor;
  executors: Map<string, Executor>;
  initialSelectedSourceId: string;
  selectExecutor: (executorId: string) => void;
  sources: Array<{id: string; name: string}>;
};

type State = {
  filterText: string;
  enableRegExpFilter: boolean;
  selectedSourceId: string;
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
      selectedSourceId: props.initialSelectedSourceId,
    };
    (this: any)._selectSource = this._selectSource.bind(this);
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

  render(): React.Element {
    const {pattern, isValid} =
      this._getFilterPattern(this.state.filterText, this.state.enableRegExpFilter);

    const records = filterRecords(
      this.props.records,
      this.state.selectedSourceId,
      pattern,
    );

    return (
      <ConsoleView {...this.props}
        invalidFilterInput={!isValid}
        records={records}
        enableRegExpFilter={this.state.enableRegExpFilter}
        selectedSourceId={this.state.selectedSourceId}
        selectSource={this._selectSource}
        toggleRegExpFilter={this._toggleRegExpFilter}
        updateFilterText={this._updateFilterText}
      />
    );
  }

  _selectSource(sourceId: string): void {
    this.setState({selectedSourceId: sourceId});
  }

  _toggleRegExpFilter(): void {
    this.setState({enableRegExpFilter: !this.state.enableRegExpFilter});
  }

  _updateFilterText(filterText: string): void {
    this.setState({filterText});
  }

}

function filterRecords(
  records: Array<Record>,
  selectedSourceId: string,
  filterPattern: ?RegExp,
): Array<Record> {
  if (selectedSourceId === '' && filterPattern == null) { return records; }

  return records.filter(record => {
    // Only filter regular messages
    if (record.kind !== 'message') { return true; }

    const sourceMatches = selectedSourceId === '' || selectedSourceId === record.sourceId;
    const filterMatches = filterPattern == null || filterPattern.test(record.text);
    return sourceMatches && filterMatches;
  });
}
