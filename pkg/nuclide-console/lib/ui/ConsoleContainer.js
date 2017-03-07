/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Viewable} from '../../../nuclide-workspace-views/lib/types';
import type {
  AppState,
  Executor,
  OutputProvider,
  OutputProviderStatus,
  Record,
  Source,
  Store,
} from '../types';

import {viewableFromReactElement} from '../../../commons-atom/viewableFromReactElement';
import UniversalDisposable from '../../../commons-node/UniversalDisposable';
import {nextAnimationFrame} from '../../../commons-node/observable';
import getCurrentExecutorId from '../getCurrentExecutorId';
import * as Actions from '../redux/Actions';
import Console from './Console';
import escapeStringRegexp from 'escape-string-regexp';
import React from 'react';
import {Observable, Subject} from 'rxjs';

type Props = {
  store: Store,
  initialFilterText?: string,
  initialEnableRegExpFilter?: boolean,
  initialUnselectedSourceIds?: Array<string>,
};

type State = {
  //
  // State shared between all Console instances
  //

  currentExecutor: ?Executor,
  providers: Map<string, OutputProvider>,
  providerStatuses: Map<string, OutputProviderStatus>,
  ready: boolean,
  records: Array<Record>,
  history: Array<string>,
  sources: Array<Source>,
  executors: Map<string, Executor>,

  //
  // State unique to this particular Console instance
  //

  filterText: string,
  enableRegExpFilter: boolean,
  unselectedSourceIds: Array<string>,
};

type BoundActionCreators = {
  execute: (code: string) => void,
  selectExecutor: (executorId: string) => void,
  clearRecords: () => void,
};

export const WORKSPACE_VIEW_URI = 'atom://nuclide/console';

// NOTE: We're not accounting for the "store" prop being changed.
export class ConsoleContainer extends React.Component {
  props: Props;
  state: State;

  _actionCreators: BoundActionCreators;
  _statesSubscription: rxjs$ISubscription;
  _stateChanges: Subject<void>;
  _titleChanges: Observable<string>;

  constructor(props: Props) {
    super(props);
    (this: any)._selectSources = this._selectSources.bind(this);
    (this: any)._toggleRegExpFilter = this._toggleRegExpFilter.bind(this);
    (this: any)._updateFilterText = this._updateFilterText.bind(this);
    const {initialFilterText, initialEnableRegExpFilter, initialUnselectedSourceIds} = props;
    this.state = {
      ready: false,
      currentExecutor: null,
      providers: new Map(),
      providerStatuses: new Map(),
      executors: new Map(),
      records: [],
      history: [],
      sources: [],
      filterText: initialFilterText == null ? '' : initialFilterText,
      enableRegExpFilter: Boolean(initialEnableRegExpFilter),
      unselectedSourceIds: initialUnselectedSourceIds == null ? [] : initialUnselectedSourceIds,
    };
    this._stateChanges = new Subject();
    this._titleChanges = this._stateChanges
      .map(() => this.state)
      .distinctUntilChanged()
      .map(() => this.getTitle())
      .distinctUntilChanged();
  }

  componentDidUpdate(): void {
    this._stateChanges.next();
  }

  getIconName(): string {
    return 'terminal';
  }

  getTitle(): string {
    // If there's only one source selected, use its name in the tab title.
    if (this.state.sources.length - this.state.unselectedSourceIds.length === 1) {
      const selectedSource = this.state.sources
        .find(source => this.state.unselectedSourceIds.indexOf(source.id) === -1);
      if (selectedSource) {
        return `Console: ${selectedSource.name}`;
      }
    }
    return 'Console';
  }

  getDefaultLocation(): string {
    return 'bottom-panel';
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  onDidChangeTitle(callback: (title: string) => mixed): IDisposable {
    return new UniversalDisposable(this._titleChanges.subscribe(callback));
  }

  componentDidMount() {
    // $FlowFixMe: How do we tell flow about Symbol.observable?
    this._statesSubscription = Observable.from(this.props.store)
      .audit(() => nextAnimationFrame)
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
          history: state.history,
          sources: getSources(state),
        });
      });
  }

  componentWillUnmount() {
    this._statesSubscription.unsubscribe();
  }

  copy(): Viewable {
    return viewableFromReactElement(
      <ConsoleContainer
        store={this.props.store}
        initialFilterText={this.state.filterText}
        initialEnableRegExpFilter={this.state.enableRegExpFilter}
        initialUnselectedSourceIds={this.state.unselectedSourceIds}
      />,
    );
  }

  _getBoundActionCreators(): BoundActionCreators {
    if (this._actionCreators == null) {
      const {store} = this.props;
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

    const {pattern, isValid} =
      this._getFilterPattern(this.state.filterText, this.state.enableRegExpFilter);

    const selectedSourceIds = this.state.sources
      .map(source => source.id)
      .filter(sourceId => this.state.unselectedSourceIds.indexOf(sourceId) === -1);

    const records = filterRecords(
      this.state.records,
      selectedSourceIds,
      pattern,
      this.state.sources.length !== selectedSourceIds.length,
    );

    // TODO(matthewwithanm): serialize and restore `initialSelectedSourceId`
    return (
      <Console
        invalidFilterInput={!isValid}
        execute={actionCreators.execute}
        selectExecutor={actionCreators.selectExecutor}
        clearRecords={actionCreators.clearRecords}
        currentExecutor={this.state.currentExecutor}
        unselectedSourceIds={this.state.unselectedSourceIds}
        filterText={this.state.filterText}
        enableRegExpFilter={this.state.enableRegExpFilter}
        records={records}
        history={this.state.history}
        sources={this.state.sources}
        selectedSourceIds={selectedSourceIds}
        selectSources={this._selectSources}
        executors={this.state.executors}
        getProvider={id => this.state.providers.get(id)}
        toggleRegExpFilter={this._toggleRegExpFilter}
        updateFilterText={this._updateFilterText}
      />
    );
  }

  serialize(): mixed {
    return {
      deserializer: 'nuclide.ConsoleContainer',
    };
  }

  _selectSources(selectedSourceIds: Array<string>): void {
    const sourceIds = this.state.sources.map(source => source.id);
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
          start: typeof provider.start === 'function' ? provider.start : undefined,
          stop: typeof provider.stop === 'function' ? provider.stop : undefined,
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
          name: record.sourceId,
          status: 'stopped',
          start: undefined,
          stop: undefined,
        },
      );
    }
  }

  return Array.from(mapOfSources.values());
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
    return sourceMatches && (filterPattern == null || filterPattern.test(record.text));
  });
}
