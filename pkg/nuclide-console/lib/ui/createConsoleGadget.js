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
import type {AppState, OutputProvider, OutputProviderStatus, Record, Executor} from '../types';
import type Rx from 'rxjs';

import Console from './Console';
import {React} from 'react-for-atom';
import getCurrentExecutorId from '../getCurrentExecutorId';

type State = {
  currentExecutor: ?Executor;
  providers: Map<string, OutputProvider>;
  providerStatuses: Map<string, OutputProviderStatus>;
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
        providerStatuses: new Map(),
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
          providerStatuses: state.providerStatuses,
          records: state.records,
        });
      });
    }

    componentWillUnmount() {
      this._state$Subscription.unsubscribe();
    }

    render(): ?React.Element<any> {
      const sources = Array.from(this.state.providers.values())
        .map((source: OutputProvider) => {
          // $FlowFixMe
          const status: OutputProviderStatus = this.state.providerStatuses.get(source.id);
          return {
            id: source.id,
            name: source.id,
            status,
            start: source.start != null ? source.start : undefined,
            stop: source.stop != null ? source.stop : undefined,
          };
        });
      // TODO(matthewwithanm): serialize and restore `initialSelectedSourceId`
      return (
        <Console
          execute={code => commands.execute(code)}
          selectExecutor={commands.selectExecutor.bind(commands)}
          clearRecords={commands.clearRecords.bind(commands)}
          currentExecutor={this.state.currentExecutor}
          initialSelectedSourceIds={sources.map(source => source.id)}
          records={this.state.records}
          sources={sources}
          executors={this.state.executors}
          getProvider={id => this.state.providers.get(id)}
        />
      );
    }

  }

  return ((OutputGadget: any): Gadget);
}
