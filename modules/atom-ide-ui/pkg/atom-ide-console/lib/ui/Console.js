"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Console = exports.WORKSPACE_VIEW_URI = void 0;

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

function _Model() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/Model"));

  _Model = function () {
    return data;
  };

  return data;
}

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../../../nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _renderReactRoot() {
  const data = require("../../../../../nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _memoizeUntilChanged() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/memoizeUntilChanged"));

  _memoizeUntilChanged = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _RegExpFilter() {
  const data = require("../../../../../nuclide-commons-ui/RegExpFilter");

  _RegExpFilter = function () {
    return data;
  };

  return data;
}

function _getCurrentExecutorId() {
  const data = _interopRequireDefault(require("../getCurrentExecutorId"));

  _getCurrentExecutorId = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _ConsoleView() {
  const data = _interopRequireDefault(require("./ConsoleView"));

  _ConsoleView = function () {
    return data;
  };

  return data;
}

function _immutable() {
  const data = require("immutable");

  _immutable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/* eslint-env browser */
// Other Nuclide packages (which cannot import this) depend on this URI. If this
// needs to be changed, grep for CONSOLE_VIEW_URI and ensure that the URIs match.
const WORKSPACE_VIEW_URI = 'atom://nuclide/console';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;
const ERROR_TRANSCRIBING_MESSAGE = "// Nuclide couldn't find the right text to display";
const INITIAL_RECORD_HEIGHT = 21;
/**
 * An Atom "view model" for the console. This object is responsible for creating a stateful view
 * (via `getElement()`). That view is bound to both global state (from the store) and view-specific
 * state (from this instance's `_model`).
 */

class Console {
  // Associates Records with their display state (height, expansionStateId).
  constructor(options) {
    this._getSourcesMemoized = (0, _memoizeUntilChanged().default)(getSources, opts => opts, (a, b) => (0, _shallowequal().default)(a, b));

    this._resetAllFilters = () => {
      this._selectSources(this._getSources().map(s => s.id));

      this._model.setState({
        filterText: ''
      });
    };

    this._createPaste = async () => {
      const displayableRecords = this._getDisplayableRecords();

      const createPasteImpl = this._store.getState().createPasteFunction;

      if (createPasteImpl == null) {
        return;
      }

      return createPaste(createPasteImpl, displayableRecords);
    };

    this._selectSources = selectedSourceIds => {
      const sourceIds = this._getSources().map(source => source.id);

      const unselectedSourceIds = sourceIds.filter(sourceId => selectedSourceIds.indexOf(sourceId) === -1);

      this._model.setState({
        unselectedSourceIds
      });
    };

    this._updateFilter = change => {
      const {
        text,
        isRegExp
      } = change;

      this._model.setState({
        filterText: text,
        enableRegExpFilter: isRegExp
      });
    };

    this._handleDisplayableRecordHeightChange = (recordId, newHeight, callback) => {
      const {
        records
      } = this._store.getState();

      const nextDisplayableRecords = Array(records.size);
      records.forEach((record, i) => {
        let displayableRecord = this._toDisplayableRecord(record);

        if (displayableRecord.id === recordId) {
          // Update the record with the new height.
          displayableRecord = Object.assign({}, displayableRecord, {
            height: newHeight
          });

          this._displayableRecords.set(record, displayableRecord);
        }

        nextDisplayableRecords[i] = displayableRecord;
      });

      this._model.setState({
        displayableRecords: nextDisplayableRecords
      });

      requestAnimationFrame(callback);
    };

    const {
      store,
      initialFilterText,
      initialEnableRegExpFilter,
      initialUnselectedSourceIds
    } = options;
    this._model = new (_Model().default)({
      displayableRecords: [],
      filterText: initialFilterText == null ? '' : initialFilterText,
      enableRegExpFilter: Boolean(initialEnableRegExpFilter),
      unselectedSourceIds: initialUnselectedSourceIds == null ? [] : initialUnselectedSourceIds
    });
    this._store = store;
    this._nextRecordId = 0;
    this._displayableRecords = new WeakMap();
    this._destroyed = new _RxMin.ReplaySubject(1);
    this._titleChanges = _RxMin.Observable.combineLatest(this._model.toObservable(), // $FlowIssue: Flow doesn't know about Symbol.observable
    _RxMin.Observable.from(store)).takeUntil(this._destroyed).map(() => this.getTitle()).distinctUntilChanged().share();
  }

  getIconName() {
    return 'nuclicon-console';
  } // Get the pane item's title. If there's only one source selected, we'll use that to make a more
  // descriptive title.


  getTitle() {
    const enabledProviderCount = this._store.getState().providers.size;

    const {
      unselectedSourceIds
    } = this._model.state; // Calling `_getSources()` is (currently) expensive because it needs to search all the records
    // for sources that have been disabled but still have records. We try to avoid calling it if we
    // already know that there's more than one selected source.

    if (enabledProviderCount - unselectedSourceIds.length > 1) {
      return 'Console';
    } // If there's only one source selected, use its name in the tab title.


    const sources = this._getSources();

    if (sources.length - unselectedSourceIds.length === 1) {
      const selectedSource = sources.find(source => unselectedSourceIds.indexOf(source.id) === -1);

      if (selectedSource) {
        return `Console: ${selectedSource.name}`;
      }
    }

    return 'Console';
  }

  getDefaultLocation() {
    return 'bottom';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  onDidChangeTitle(callback) {
    return new (_UniversalDisposable().default)(this._titleChanges.subscribe(callback));
  }

  _getSources() {
    const {
      providers,
      providerStatuses,
      records
    } = this._store.getState();

    return this._getSourcesMemoized({
      providers,
      providerStatuses,
      records
    });
  } // Memoize `getSources()`. Unfortunately, since we look for unrepresented sources in the record
  // list, this still needs to be called whenever the records change.
  // TODO: Consider removing records when their source is removed. This will likely require adding
  // the ability to enable and disable sources so, for example, when the debugger is no longer
  // active, it still remains in the source list.


  destroy() {
    this._destroyed.next();
  }

  copy() {
    return new Console({
      store: this._store,
      initialFilterText: this._model.state.filterText,
      initialEnableRegExpFilter: this._model.state.enableRegExpFilter,
      initialUnselectedSourceIds: this._model.state.unselectedSourceIds
    });
  }

  _getBoundActionCreators() {
    if (this._actionCreators == null) {
      this._actionCreators = {
        execute: code => {
          this._store.dispatch(Actions().execute(code));
        },
        selectExecutor: executorId => {
          this._store.dispatch(Actions().selectExecutor(executorId));
        },
        clearRecords: () => {
          this._store.dispatch(Actions().clearRecords());
        }
      };
    }

    return this._actionCreators;
  }

  _getFilterInfo() {
    const {
      pattern,
      invalid
    } = (0, _RegExpFilter().getFilterPattern)(this._model.state.filterText, this._model.state.enableRegExpFilter);

    const sources = this._getSources();

    const selectedSourceIds = sources.map(source => source.id).filter(sourceId => this._model.state.unselectedSourceIds.indexOf(sourceId) === -1);
    const filteredRecords = filterRecords(this._getDisplayableRecords(), selectedSourceIds, pattern, sources.length !== selectedSourceIds.length);
    return {
      invalid,
      selectedSourceIds,
      filteredRecords
    };
  }

  getElement() {
    if (this._element != null) {
      return this._element;
    }

    const actionCreators = this._getBoundActionCreators();

    const props = _RxMin.Observable.combineLatest(this._model.toObservable(), // $FlowIssue: Flow doesn't know about Symbol.observable
    _RxMin.Observable.from(this._store)) // Don't re-render when the console isn't visible.
    .let((0, _observable().toggle)((0, _observePaneItemVisibility().default)(this))).audit(() => _observable().nextAnimationFrame).map(([localState, globalState]) => {
      const {
        invalid,
        selectedSourceIds,
        filteredRecords
      } = this._getFilterInfo();

      const currentExecutorId = (0, _getCurrentExecutorId().default)(globalState);
      const currentExecutor = currentExecutorId != null ? globalState.executors.get(currentExecutorId) : null;
      return {
        invalidFilterInput: invalid,
        execute: actionCreators.execute,
        selectExecutor: actionCreators.selectExecutor,
        clearRecords: actionCreators.clearRecords,
        createPaste: globalState.createPasteFunction == null ? null : this._createPaste,
        watchEditor: globalState.watchEditor,
        currentExecutor,
        unselectedSourceIds: localState.unselectedSourceIds,
        filterText: localState.filterText,
        enableRegExpFilter: localState.enableRegExpFilter,
        displayableRecords: filteredRecords,
        filteredRecordCount: globalState.records.size - filteredRecords.length,
        history: globalState.history,
        sources: this._getSources(),
        selectedSourceIds,
        selectSources: this._selectSources,
        executors: globalState.executors,
        getProvider: id => globalState.providers.get(id),
        updateFilter: this._updateFilter,
        onDisplayableRecordHeightChange: this._handleDisplayableRecordHeightChange,
        resetAllFilters: this._resetAllFilters,
        fontSize: globalState.fontSize
      };
    });

    const StatefulConsoleView = (0, _bindObservableAsProps().bindObservableAsProps)(props, _ConsoleView().default);
    return this._element = (0, _renderReactRoot().renderReactRoot)(React.createElement(StatefulConsoleView, null));
  }

  serialize() {
    const {
      filterText,
      enableRegExpFilter,
      unselectedSourceIds
    } = this._model.state;
    return {
      deserializer: 'nuclide.Console',
      filterText,
      enableRegExpFilter,
      unselectedSourceIds
    };
  }

  /** Unselects the sources from the given IDs */
  unselectSources(ids) {
    const newIds = ids.filter(id => !this._model.state.unselectedSourceIds.includes(id));

    this._model.setState({
      unselectedSourceIds: this._model.state.unselectedSourceIds.concat(newIds)
    });
  }

  _getDisplayableRecords() {
    const {
      records
    } = this._store.getState();

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


  _toDisplayableRecord(record) {
    const displayableRecord = this._displayableRecords.get(record);

    if (displayableRecord != null) {
      return displayableRecord;
    }

    const newDisplayableRecord = {
      id: this._nextRecordId++,
      record,
      height: INITIAL_RECORD_HEIGHT,
      expansionStateId: {}
    };

    this._displayableRecords.set(record, newDisplayableRecord);

    return newDisplayableRecord;
  }

}

exports.Console = Console;

function getSources(options) {
  const {
    providers,
    providerStatuses,
    records
  } = options; // Convert the providers to a map of sources.

  const mapOfSources = new Map(Array.from(providers.entries()).map(([k, provider]) => {
    const source = {
      id: provider.id,
      name: provider.name,
      status: providerStatuses.get(provider.id) || 'stopped',
      start: typeof provider.start === 'function' ? provider.start : undefined,
      stop: typeof provider.stop === 'function' ? provider.stop : undefined
    };
    return [k, source];
  })); // Some providers may have been unregistered, but still have records. Add sources for them too.
  // TODO: Iterating over all the records to get this every time we get a new record is inefficient.

  records.forEach((record, i) => {
    if (!mapOfSources.has(record.sourceId)) {
      mapOfSources.set(record.sourceId, {
        id: record.sourceId,
        name: record.sourceId,
        status: 'stopped',
        start: undefined,
        stop: undefined
      });
    }
  });
  return Array.from(mapOfSources.values());
}

function filterRecords(displayableRecords, selectedSourceIds, filterPattern, filterSources) {
  if (!filterSources && filterPattern == null) {
    return displayableRecords;
  }

  return displayableRecords.filter(({
    record
  }) => {
    // Only filter regular messages
    if (record.kind !== 'message') {
      return true;
    }

    const sourceMatches = selectedSourceIds.indexOf(record.sourceId) !== -1;
    return sourceMatches && (filterPattern == null || filterPattern.test(record.text));
  });
}

async function serializeRecordObject(executor, visited, data, text, level) {
  const getText = record => {
    let indent = '';

    for (let i = 0; i < level; i++) {
      indent += '\t';
    }

    return indent + (record.description != null ? record.description : record.value != null ? record.value : '');
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
    return serializeRecordObject(executor, visited, childProp.value, '', level + 1);
  });
  return getText(data) + '\n' + (await Promise.all(serializedProps)).join('\n');
}

async function createPaste(createPasteImpl, records) {
  const linePromises = records.filter(displayable => displayable.record.kind === 'message' || displayable.record.kind === 'request' || displayable.record.kind === 'response').map(async displayable => {
    const record = displayable.record;
    const level = record.level != null ? record.level.toString().toUpperCase() : 'LOG';
    const timestamp = record.timestamp.toLocaleString();
    let text = record.text || record.data && record.data.value || ERROR_TRANSCRIBING_MESSAGE;

    if (record.kind === 'response' && record.data != null && record.data.objectId != null && record.data.objectId !== '') {
      const executor = record.executor;

      if (executor != null) {
        // If the record has a data object, and the object has an ID,
        // recursively expand the nodes of the object and serialize it
        // for the paste.
        text = await serializeRecordObject(executor, new Set(), record.data, '', 0);
      }
    }

    return `[${level}][${record.sourceId}][${timestamp}]\t ${text}`;
  });
  const lines = (await Promise.all(linePromises)).join('\n');

  if (lines === '') {
    // Can't create an empty paste!
    atom.notifications.addWarning('There is nothing in your console to Paste! Check your console filters and try again.');
    return;
  }

  atom.notifications.addInfo('Creating Paste...');

  try {
    const uri = await createPasteImpl(lines, {
      title: 'Nuclide Console Paste'
    }, 'console paste');
    atom.notifications.addSuccess(`Created Paste at ${uri}`);
  } catch (error) {
    if (error.stdout == null) {
      atom.notifications.addError(`Failed to create paste: ${String(error.message || error)}`);
      return;
    }

    const errorMessages = error.stdout.trim().split('\n').map(JSON.parse).map(e => e.message);
    atom.notifications.addError('Failed to create paste', {
      detail: errorMessages.join('\n'),
      dismissable: true
    });
  }
}