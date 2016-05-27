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
      selectedSourceId: props.initialSelectedSourceId,
    };
    (this: any)._selectSource = this._selectSource.bind(this);
  }

  render(): React.Element {
    return (
      <ConsoleView {...this.props}
        records={filterRecords(this.props.records, this.state.selectedSourceId)}
        selectedSourceId={this.state.selectedSourceId}
        selectSource={this._selectSource}
      />
    );
  }

  _selectSource(sourceId: string): void {
    this.setState({selectedSourceId: sourceId});
  }

}

function filterRecords(records: Array<Record>, selectedSourceId: string): Array<Record> {
  return selectedSourceId === ''
    ? records
    : records.filter(record => record.sourceId === selectedSourceId);
}
