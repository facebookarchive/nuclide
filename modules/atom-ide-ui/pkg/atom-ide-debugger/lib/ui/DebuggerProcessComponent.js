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

import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import type {IDebugService, IProcess} from '../types';

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import * as React from 'react';
import {TreeList} from 'nuclide-commons-ui/Tree';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {fastDebounce} from 'nuclide-commons/observable';
import ProcessTreeNode from './ProcessTreeNode';

type Props = {
  service: IDebugService,
};

type State = {
  processList: Array<IProcess>,
  filter: ?string,
};

export default class DebuggerProcessComponent extends React.PureComponent<
  Props,
  State,
> {
  _disposables: UniversalDisposable;
  _treeView: ?TreeList;

  constructor(props: Props) {
    super(props);

    this._disposables = new UniversalDisposable();
    this.state = {
      processList: this.props.service.getModel().getProcesses(),
      filter: null,
    };
  }

  componentDidMount(): void {
    const {service} = this.props;
    const model = service.getModel();
    this._disposables.add(
      observableFromSubscribeFunction(model.onDidChangeProcesses.bind(model))
        .let(fastDebounce(150))
        .subscribe(() => {
          this.setState({
            processList: model.getProcesses(),
          });
        }),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  render(): React.Node {
    const {processList, filter} = this.state;
    const {service} = this.props;
    let filterRegEx = null;
    try {
      if (filter != null) {
        filterRegEx = new RegExp(filter, 'ig');
      }
    } catch (_) {}
    const processElements = processList.map((process, processIndex) => {
      const {adapterType, processName} = process.configuration;
      return process == null ? (
        'No processes are currently being debugged'
      ) : (
        <ProcessTreeNode
          title={processName != null ? processName : adapterType}
          filter={filter}
          filterRegEx={filterRegEx}
          key={process.getId()}
          childItems={process.getAllThreads()}
          process={process}
          service={service}
        />
      );
    });

    return (
      <div>
        <AtomInput
          placeholderText="Filter threads..."
          value={this.state.filter || ''}
          size="sm"
          className="debugger-thread-filter-box"
          onDidChange={text => {
            this.setState({
              filter: text,
            });
          }}
          autofocus={false}
        />
        <TreeList showArrows={true}>{processElements}</TreeList>
      </div>
    );
  }
}
