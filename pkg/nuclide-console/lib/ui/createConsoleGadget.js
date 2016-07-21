'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Gadget} from '../../../nuclide-gadgets/lib/types';
import type {
  AppState,
  Executor,
  OutputProvider,
  OutputProviderStatus,
  Record,
  Source,
  Store,
} from '../types';

import getCurrentExecutorId from '../getCurrentExecutorId';
import * as Actions from '../redux/Actions';
import Console from './Console';
import {React} from 'react-for-atom';
import {Observable} from 'rxjs';

type State = {
  currentExecutor: ?Executor,
  providers: Map<string, OutputProvider>,
  providerStatuses: Map<string, OutputProviderStatus>,
  ready: boolean,
  records: Array<Record>,
  sources: Array<Source>,
  executors: Map<string, Executor>,
};

type BoundActionCreators = {
  execute: (code: string) => void,
  selectExecutor: (executorId: string) => void,
  clearRecords: () => void,
};

export default function createConsoleGadget(store: Store): Gadget {

  class OutputGadget extends React.Component {
    state: State;

    static gadgetId = 'nuclide-console';
    static defaultLocation = 'bottom';

    _actionCreators: BoundActionCreators;
    _statesSubscription: rx$ISubscription;

    constructor(props: mixed) {
      super(props);
      this.state = {
        ready: false,
        currentExecutor: null,
        providers: new Map(),
        providerStatuses: new Map(),
        executors: new Map(),
        records: [],
        sources: [],
      };
    }

    getIconName(): string {
      return 'terminal';
    }

    getTitle(): string {
      return 'Console';
    }

    componentDidMount() {
      const raf = Observable.create(observer => {
        window.requestAnimationFrame(observer.complete.bind(observer));
      });
      // $FlowFixMe: How do we tell flow about Symbol.observable?
      this._statesSubscription = Observable.from(store)
        .audit(() => raf)
        .subscribe(state => {
          const currentExecutorId = getCurrentExecutorId(state);
          const currentExecutor =
            currentExecutorId != null ? state.executors.get(currentExecutorId) : null;
          this.setState({
            ready: true,
            currentExecutor,
            executors: state.executors,
            providers: state.providers,
            providerStatuses: state.providerStatuses,
            records: state.records,
            sources: getSources(state),
          });
        });
    }

    componentWillUnmount() {
      this._statesSubscription.unsubscribe();
    }

    _getBoundActionCreators(): BoundActionCreators {
      if (this._actionCreators == null) {
        this._actionCreators = {
          execute: code => { store.dispatch(Actions.execute(code)); },
          selectExecutor: executorId => { store.dispatch(Actions.selectExecutor(executorId)); },
          clearRecords: () => { store.dispatch(Actions.clearRecords()); },
        };
      }
      return this._actionCreators;
    }

    render(): ?React.Element<any> {
      if (!this.state.ready) { return <span />; }

      const actionCreators = this._getBoundActionCreators();
      // TODO(matthewwithanm): serialize and restore `initialSelectedSourceId`
      return (
        <Console
          execute={actionCreators.execute}
          selectExecutor={actionCreators.selectExecutor}
          clearRecords={actionCreators.clearRecords}
          currentExecutor={this.state.currentExecutor}
          initialUnselectedSourceIds={[]}
          records={this.state.records}
          sources={this.state.sources}
          executors={this.state.executors}
          getProvider={id => this.state.providers.get(id)}
        />
      );
    }

  }

  return ((OutputGadget: any): Gadget);
}

function getSources(state: AppState): Array<Source> {
  // Convert the providers to a map of sources.
  const mapOfSources = new Map(
    Array.from(state.providers.entries()).map(
      ([k, provider]) => {
        const source = {
          id: provider.id,
          name: provider.id,
          status: state.providerStatuses.get(provider.id) || 'stopped',
          start: provider.start != null ? provider.start : undefined,
          stop: provider.stop != null ? provider.stop : undefined,
        };
        return [k, source];
      },
    ),
  );

  // Some providers may have been unregistered, but still have records. Add sources for them too.
  // TODO: Iterating over all the records to get this every time we get a new record is inefficient.
  for (let i = 0, len = state.records.length; i < len; i++) {
    const record = state.records[i];
    if (!mapOfSources.has(record.sourceId)) {
      mapOfSources.set(
        record.sourceId,
        {
          id: record.sourceId,
          name: record.sourceName || record.sourceId,
          status: 'stopped',
          start: undefined,
          stop: undefined,
        },
      );
    }
  }

  return Array.from(mapOfSources.values());
}
