'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Commands from '../Commands';
import type {Gadget} from '../../../nuclide-gadgets/lib/types';
import type {AppState, OutputProvider, Record, Executor} from '../types';
import type Rx from 'rxjs';

import Console from './Console';
import {React} from 'react-for-atom';
import getCurrentExecutorId from '../getCurrentExecutorId';

type State = {
  currentExecutor: ?Executor;
  providers: Map<string, OutputProvider>;
  records: Array<Record>;
  executors: Map<string, Executor>;
};

export default function createConsoleGadget(
  state$: Rx.Observable<AppState>,
  commands: Commands,
): Gadget {

  class OutputGadget extends React.Component {
    state: State;

    static gadgetId = 'nuclide-console';
    static defaultLocation = 'bottom';

    _state$Subscription: rx$ISubscription;

    constructor(props: mixed) {
      super(props);
      this.state = {
        currentExecutor: null,
        providers: new Map(),
        executors: new Map(),
        records: [],
      };
    }

    getIconName(): string {
      return 'terminal';
    }

    getTitle(): string {
      return 'Console';
    }

    componentWillMount() {
      this._state$Subscription = state$.subscribe(state => {
        const currentExecutorId = getCurrentExecutorId(state);
        const currentExecutor =
          currentExecutorId != null ? state.executors.get(currentExecutorId) : null;
        this.setState({
          currentExecutor,
          executors: state.executors,
          providers: state.providers,
          records: state.records,
        });
      });
    }

    componentWillUnmount() {
      this._state$Subscription.unsubscribe();
    }

    render(): ?React.Element {
      const sources = Array.from(this.state.providers.values())
        .map(source => ({
          id: source.id,
          name: source.id,
        }));
      // TODO(matthewwithanm): serialize and restore `initialSelectedSourceId`
      return (
        <Console
          execute={code => commands.execute(code)}
          selectExecutor={commands.selectExecutor.bind(commands)}
          clearRecords={commands.clearRecords.bind(commands)}
          currentExecutor={this.state.currentExecutor}
          initialSelectedSourceId=""
          records={this.state.records}
          sources={sources}
          executors={this.state.executors}
        />
      );
    }

  }

  return ((OutputGadget: any): Gadget);
}
