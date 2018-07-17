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

/* eslint-env browser */

import type {
  ConsolePersistedState,
  DisplayableRecord,
  OutputProviderStatus,
  Record,
  Source,
  Store,
  SourceInfo,
} from '../types';
import type {CreatePasteFunction} from '../types';
import type {RegExpFilterChange} from 'nuclide-commons-ui/RegExpFilter';
import type {Executor} from '../types';

import observePaneItemVisibility from 'nuclide-commons-atom/observePaneItemVisibility';
import Model from 'nuclide-commons/Model';
import shallowEqual from 'shallowequal';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import memoizeUntilChanged from 'nuclide-commons/memoizeUntilChanged';
import {toggle} from 'nuclide-commons/observable';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {nextAnimationFrame} from 'nuclide-commons/observable';
import {getFilterPattern} from 'nuclide-commons-ui/RegExpFilter';
import getCurrentExecutorId from '../getCurrentExecutorId';
import * as Actions from '../redux/Actions';
import ConsoleView from './ConsoleView';
import {List} from 'immutable';
import * as React from 'react';
import {Observable, ReplaySubject} from 'rxjs';

type Options = {
  store: Store,
  initialFilterText?: string,
  initialEnableRegExpFilter?: boolean,
  initialUnselectedSourceIds?: Array<string>,
};

//
// State unique to this particular Console instance
//
type State = {
  displayableRecords: Array<DisplayableRecord>,
  filterText: string,
  enableRegExpFilter: boolean,
  unselectedSourceIds: Array<string>,
};

type BoundActionCreators = {
  execute: (code: string) => void,
  selectExecutor: (executorId: string) => void,
  clearRecords: () => void,
};

// Other Nuclide packages (which cannot import this) depend on this URI. If this
// needs to be changed, grep for CONSOLE_VIEW_URI and ensure that the URIs match.
export const WORKSPACE_VIEW_URI = 'atom://nuclide/console';

const ERROR_TRANSCRIBING_MESSAGE =
  "// Nuclide couldn't find the right text to display";
const INITIAL_RECORD_HEIGHT = 21;

/**
 * An Atom "view model" for the console. This object is responsible for creating a stateful view
 * (via `getElement()`). That view is bound to both global state (from the store) and view-specific
 * state (from this instance's `_model`).
 */
export class Console {
  _actionCreators: BoundActionCreators;

  // Associates Records with their display state (height, expansionStateId).
  _displayableRecords: WeakMap<Record, DisplayableRecord>;

  _nextRecordId: number;
  _titleChanges: Observable<string>;
  _model: Model<State>;
  _store: Store;
  _element: ?HTMLElement;
  _destroyed: ReplaySubject<void>;

  constructor(options: Options) {
    const {
      store,
      initialFilterText,
      initialEnableRegExpFilter,
      initialUnselectedSourceIds,
    } = options;
    this._model = new Model({
      displayableRecords: [],
      filterText: initialFilterText == null ? '' : initialFilterText,
      enableRegExpFilter: Boolean(initialEnableRegExpFilter),
      unselectedSourceIds:
        initialUnselectedSourceIds == null ? [] : initialUnselectedSourceIds,
    });

    this._store = store;
    this._nextRecordId = 0;
    this._displayableRecords = new WeakMap();
    this._destroyed = new ReplaySubject(1);

    this._titleChanges = Observable.combineLatest(
      this._model.toObservable(),
      // $FlowIssue: Flow doesn't know about Symbol.observable
      Observable.from(store),
    )
      .takeUntil(this._destroyed)
      .map(() => this.getTitle())
      .distinctUntilChanged()
      .share();
  }

  getIconName(): string {
    return 'nuclicon-console';
  }

  // Get the pane item's title. If there's only one source selected, we'll use that to make a more
  // descriptive title.
  getTitle(): string {
    const enabledProviderCount = this._store.getState().providers.size;
    const {unselectedSourceIds} = this._model.state;

    // Calling `_getSources()` is (currently) expensive because it needs to search all the records
    // for sources that have been disabled but still have records. We try to avoid calling it if we
    // already know that there's more than one selected source.
    if (enabledProviderCount - unselectedSourceIds.length > 1) {
      return 'Console';
    }

    // If there's only one source selected, use its name in the tab title.
    const sources = this._getSources();
    if (sources.length - unselectedSourceIds.length === 1) {
      const selectedSource = sources.find(
        source => unselectedSourceIds.indexOf(source.id) === -1,
      );
      if (selectedSource) {
        return `Console: ${selectedSource.name}`;
      }
    }

    return 'Console';
  }

  getDefaultLocation(): string {
    return 'bottom';
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  onDidChangeTitle(callback: (title: string) => mixed): IDisposable {
    return new UniversalDisposable(this._titleChanges.subscribe(callback));
  }

  _getSources(): Array<Source> {
    const {providers, providerStatuses, records} = this._store.getState();
    return this._getSourcesMemoized({providers, providerStatuses, records});
  }

  // Memoize `getSources()`. Unfortunately, since we look for unrepresented sources in the record
  // list, this still needs to be called whenever the records change.
  // TODO: Consider removing records when their source is removed. This will likely require adding
  // the ability to enable and disable sources so, for example, when the debugger is no longer
  // active, it still remains in the source list.
  _getSourcesMemoized = memoizeUntilChanged(
    getSources,
    opts => opts,
    (a, b) => shallowEqual(a, b),
  );

  destroy(): void {
    this._destroyed.next();
  }

  copy(): Console {
    return new Console({
      store: this._store,
      initialFilterText: this._model.state.filterText,
      initialEnableRegExpFilter: this._model.state.enableRegExpFilter,
      initialUnselectedSourceIds: this._model.state.unselectedSourceIds,
    });
  }

  _getBoundActionCreators(): BoundActionCreators {
    if (this._actionCreators == null) {
      this._actionCreators = {
        execute: code => {
          this._store.dispatch(Actions.execute(code));
        },
        selectExecutor: executorId => {
          this._store.dispatch(Actions.selectExecutor(executorId));
        },
        clearRecords: () => {
          this._store.dispatch(Actions.clearRecords());
        },
      };
    }
    return this._actionCreators;
  }

  _resetAllFilters = (): void => {
    this._selectSources(this._getSources().map(s => s.id));
    this._model.setState({filterText: ''});
  };

  _createPaste = async (): Promise<void> => {
    const displayableRecords = this._getDisplayableRecords();
    const createPasteImpl = this._store.getState().createPasteFunction;
    if (createPasteImpl == null) {
      return;
    }
    return createPaste(createPasteImpl, displayableRecords);
  };

  _getFilterInfo(): {
    invalid: boolean,
    selectedSourceIds: Array<string>,
    filteredRecords: Array<DisplayableRecord>,
  } {
    const {pattern, invalid} = getFilterPattern(
      this._model.state.filterText,
      this._model.state.enableRegExpFilter,
    );
    const sources = this._getSources();
    const selectedSourceIds = sources
      .map(source => source.id)
      .filter(
        sourceId =>
          this._model.state.unselectedSourceIds.indexOf(sourceId) === -1,
      );

    const filteredRecords = filterRecords(
      this._getDisplayableRecords(),
      selectedSourceIds,
      pattern,
      sources.length !== selectedSourceIds.length,
    );

    return {
      invalid,
      selectedSourceIds,
      filteredRecords,
    };
  }

  getElement(): HTMLElement {
    if (this._element != null) {
      return this._element;
    }

    const actionCreators = this._getBoundActionCreators();
    const props = Observable.combineLatest(
      this._model.toObservable(),
      // $FlowIssue: Flow doesn't know about Symbol.observable
      Observable.from(this._store),
    )
      // Don't re-render when the console isn't visible.
      .let(toggle(observePaneItemVisibility(this)))
      .audit(() => nextAnimationFrame)
      .map(([localState, globalState]) => {
        const {
          invalid,
          selectedSourceIds,
          filteredRecords,
        } = this._getFilterInfo();

        const currentExecutorId = getCurrentExecutorId(globalState);
        const currentExecutor =
          currentExecutorId != null
            ? globalState.executors.get(currentExecutorId)
            : null;

        return {
          invalidFilterInput: invalid,
          execute: actionCreators.execute,
          selectExecutor: actionCreators.selectExecutor,
          clearRecords: actionCreators.clearRecords,
          createPaste:
            globalState.createPasteFunction == null ? null : this._createPaste,
          watchEditor: globalState.watchEditor,
          currentExecutor,
          unselectedSourceIds: localState.unselectedSourceIds,
          filterText: localState.filterText,
          enableRegExpFilter: localState.enableRegExpFilter,
          displayableRecords: filteredRecords,
          filteredRecordCount:
            globalState.records.size - filteredRecords.length,
          history: globalState.history,
          sources: this._getSources(),
          selectedSourceIds,
          selectSources: this._selectSources,
          executors: globalState.executors,
          getProvider: id => globalState.providers.get(id),
          updateFilter: this._updateFilter,
          onDisplayableRecordHeightChange: this
            ._handleDisplayableRecordHeightChange,
          resetAllFilters: this._resetAllFilters,
          fontSize: globalState.fontSize,
        };
      });

    const StatefulConsoleView = bindObservableAsProps(props, ConsoleView);
    return (this._element = renderReactRoot(<StatefulConsoleView />));
  }

  serialize(): ConsolePersistedState {
    const {
      filterText,
      enableRegExpFilter,
      unselectedSourceIds,
    } = this._model.state;
    return {
      deserializer: 'nuclide.Console',
      filterText,
      enableRegExpFilter,
      unselectedSourceIds,
    };
  }

  _selectSources = (selectedSourceIds: Array<string>): void => {
    const sourceIds = this._getSources().map(source => source.id);
    const unselectedSourceIds = sourceIds.filter(
      sourceId => selectedSourceIds.indexOf(sourceId) === -1,
    );
    this._model.setState({unselectedSourceIds});
  };

  /** Unselects the sources from the given IDs */
  unselectSources(ids: Array<string>): void {
    const newIds = ids.filter(
      id => !this._model.state.unselectedSourceIds.includes(id),
    );
    this._model.setState({
      unselectedSourceIds: this._model.state.unselectedSourceIds.concat(newIds),
    });
  }

  _updateFilter = (change: RegExpFilterChange): void => {
    const {text, isRegExp} = change;
    this._model.setState({
      filterText: text,
      enableRegExpFilter: isRegExp,
    });
  };

  _handleDisplayableRecordHeightChange = (
    recordId: number,
    newHeight: number,
    callback: () => void,
  ): void => {
    const {records} = this._store.getState();
    const nextDisplayableRecords = Array(records.size);
    records.forEach((record, i) => {
      let displayableRecord = this._toDisplayableRecord(record);
      if (displayableRecord.id === recordId) {
        // Update the record with the new height.
        displayableRecord = {
          ...displayableRecord,
          height: newHeight,
        };
        this._displayableRecords.set(record, displayableRecord);
      }
      nextDisplayableRecords[i] = displayableRecord;
    });

    this._model.setState({displayableRecords: nextDisplayableRecords});
    requestAnimationFrame(callback);
  };

  _getDisplayableRecords(): Array<DisplayableRecord> {
    const {records} = this._store.getState();
    const displayableRecords = Array(records.size);
    records.forEach((record, i) => {
      displayableRecords[i] = this._toDisplayableRecord(record);
    });
    return displayableRecords;
  }

  /**
   * Transforms the Records from the store into DisplayableRecords. This caches the result
   * per-Console instance because the same record can have different heights in different
   * containers.
   */
  _toDisplayableRecord(record: Record): DisplayableRecord {
    const displayableRecord = this._displayableRecords.get(record);
    if (displayableRecord != null) {
      return displayableRecord;
    }
    const newDisplayableRecord = {
      id: this._nextRecordId++,
      record,
      height: INITIAL_RECORD_HEIGHT,
      expansionStateId: {},
    };
    this._displayableRecords.set(record, newDisplayableRecord);
    return newDisplayableRecord;
  }
}

function getSources(options: {
  records: List<Record>,
  providers: Map<string, SourceInfo>,
  providerStatuses: Map<string, OutputProviderStatus>,
}): Array<Source> {
  const {providers, providerStatuses, records} = options;

  // Convert the providers to a map of sources.
  const mapOfSources = new Map(
    Array.from(providers.entries()).map(([k, provider]) => {
      const source = {
        id: provider.id,
        name: provider.name,
        status: providerStatuses.get(provider.id) || 'stopped',
        start:
          typeof provider.start === 'function' ? provider.start : undefined,
        stop: typeof provider.stop === 'function' ? provider.stop : undefined,
      };
      return [k, source];
    }),
  );

  // Some providers may have been unregistered, but still have records. Add sources for them too.
  // TODO: Iterating over all the records to get this every time we get a new record is inefficient.
  records.forEach((record, i) => {
    if (!mapOfSources.has(record.sourceId)) {
      mapOfSources.set(record.sourceId, {
        id: record.sourceId,
        name: record.sourceId,
        status: 'stopped',
        start: undefined,
        stop: undefined,
      });
    }
  });

  return Array.from(mapOfSources.values());
}

function filterRecords(
  displayableRecords: Array<DisplayableRecord>,
  selectedSourceIds: Array<string>,
  filterPattern: ?RegExp,
  filterSources: boolean,
): Array<DisplayableRecord> {
  if (!filterSources && filterPattern == null) {
    return displayableRecords;
  }

  return displayableRecords.filter(({record}) => {
    // Only filter regular messages
    if (record.kind !== 'message') {
      return true;
    }

    const sourceMatches = selectedSourceIds.indexOf(record.sourceId) !== -1;
    return (
      sourceMatches &&
      (filterPattern == null || filterPattern.test(record.text))
    );
  });
}

async function serializeRecordObject(
  executor: Executor,
  visited: Set<string>,
  data: {
    objectId?: string,
    description?: string,
    value?: string,
  },
  text: string,
  level: number,
): Promise<string> {
  const getText = record => {
    let indent = '';
    for (let i = 0; i < level; i++) {
      indent += '\t';
    }
    return (
      indent +
      (record.description != null
        ? record.description
        : record.value != null
          ? record.value
          : '')
    );
  };

  if (data.objectId == null) {
    // Leaf node.
    return text + getText(data);
  }

  const id = data.objectId;
  if (visited.has(id)) {
    // Guard against cycles.
    return text;
  }

  visited.add(id);

  if (executor.getProperties == null) {
    return text;
  }

  const childProperties = (await executor.getProperties(id).toPromise()) || [];
  const serializedProps = childProperties.map(childProp => {
    return serializeRecordObject(
      executor,
      visited,
      childProp.value,
      '',
      level + 1,
    );
  });
  return getText(data) + '\n' + (await Promise.all(serializedProps)).join('\n');
}

async function createPaste(
  createPasteImpl: CreatePasteFunction,
  records: Array<DisplayableRecord>,
): Promise<void> {
  const linePromises = records
    .filter(
      displayable =>
        displayable.record.kind === 'message' ||
        displayable.record.kind === 'request' ||
        displayable.record.kind === 'response',
    )
    .map(async displayable => {
      const record = displayable.record;
      const level =
        record.level != null ? record.level.toString().toUpperCase() : 'LOG';
      const timestamp = record.timestamp.toLocaleString();
      let text =
        record.text ||
        (record.data && record.data.value) ||
        ERROR_TRANSCRIBING_MESSAGE;

      if (
        record.kind === 'response' &&
        record.data != null &&
        record.data.objectId != null &&
        record.data.objectId !== ''
      ) {
        const executor = record.executor;
        if (executor != null) {
          // If the record has a data object, and the object has an ID,
          // recursively expand the nodes of the object and serialize it
          // for the paste.
          text = await serializeRecordObject(
            executor,
            new Set(),
            record.data,
            '',
            0,
          );
        }
      }

      return `[${level}][${record.sourceId}][${timestamp}]\t ${text}`;
    });

  const lines = (await Promise.all(linePromises)).join('\n');

  if (lines === '') {
    // Can't create an empty paste!
    atom.notifications.addWarning(
      'There is nothing in your console to Paste! Check your console filters and try again.',
    );
    return;
  }

  atom.notifications.addInfo('Creating Paste...');

  try {
    const uri = await createPasteImpl(
      lines,
      {
        title: 'Nuclide Console Paste',
      },
      'console paste',
    );
    atom.notifications.addSuccess(`Created Paste at ${uri}`);
  } catch (error) {
    if (error.stdout == null) {
      atom.notifications.addError(
        `Failed to create paste: ${String(error.message || error)}`,
      );
      return;
    }
    const errorMessages = error.stdout
      .trim()
      .split('\n')
      .map(JSON.parse)
      .map(e => e.message);
    atom.notifications.addError('Failed to create paste', {
      detail: errorMessages.join('\n'),
      dismissable: true,
    });
  }
}
