'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConsoleContainer = exports.WORKSPACE_VIEW_URI = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../../commons-atom/viewableFromReactElement');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _getCurrentExecutorId;

function _load_getCurrentExecutorId() {
  return _getCurrentExecutorId = _interopRequireDefault(require('../getCurrentExecutorId'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../redux/Actions'));
}

var _Console;

function _load_Console() {
  return _Console = _interopRequireDefault(require('./Console'));
}

var _escapeStringRegexp;

function _load_escapeStringRegexp() {
  return _escapeStringRegexp = _interopRequireDefault(require('escape-string-regexp'));
}

var _react = _interopRequireDefault(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/console';

const INITIAL_RECORD_HEIGHT = 21;

// NOTE: We're not accounting for the "store" prop being changed.
class ConsoleContainer extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleDisplayableRecordHeightChange = this._handleDisplayableRecordHeightChange.bind(this);
    this._selectSources = this._selectSources.bind(this);
    this._toggleRegExpFilter = this._toggleRegExpFilter.bind(this);
    this._updateFilterText = this._updateFilterText.bind(this);
    this._resetAllFilters = this._resetAllFilters.bind(this);
    this._createPaste = this._createPaste.bind(this);
    const {
      initialFilterText,
      initialEnableRegExpFilter,
      initialUnselectedSourceIds
    } = props;
    this.state = {
      ready: false,
      currentExecutor: null,
      providers: new Map(),
      providerStatuses: new Map(),
      executors: new Map(),
      displayableRecords: [],
      history: [],
      sources: [],
      filterText: initialFilterText == null ? '' : initialFilterText,
      enableRegExpFilter: Boolean(initialEnableRegExpFilter),
      unselectedSourceIds: initialUnselectedSourceIds == null ? [] : initialUnselectedSourceIds
    };
    this._nextRecordId = 0;
    this._displayableRecords = new WeakMap();
    this._stateChanges = new _rxjsBundlesRxMinJs.Subject();
    this._titleChanges = this._stateChanges.map(() => this.state).distinctUntilChanged().map(() => this.getTitle()).distinctUntilChanged();
  }

  // Associates Records with their display state (height, expansionStateId).


  componentDidUpdate() {
    this._stateChanges.next();
  }

  getIconName() {
    return 'terminal';
  }

  getTitle() {
    // If there's only one source selected, use its name in the tab title.
    if (this.state.sources.length - this.state.unselectedSourceIds.length === 1) {
      const selectedSource = this.state.sources.find(source => this.state.unselectedSourceIds.indexOf(source.id) === -1);
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
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._titleChanges.subscribe(callback));
  }

  componentDidMount() {
    // $FlowFixMe: How do we tell flow about Symbol.observable?
    this._statesSubscription = _rxjsBundlesRxMinJs.Observable.from(this.props.store).audit(() => (_observable || _load_observable()).nextAnimationFrame).subscribe(state => {
      const currentExecutorId = (0, (_getCurrentExecutorId || _load_getCurrentExecutorId()).default)(state);
      const currentExecutor = currentExecutorId != null ? state.executors.get(currentExecutorId) : null;
      this.setState({
        ready: true,
        currentExecutor,
        executors: state.executors,
        providers: state.providers,
        providerStatuses: state.providerStatuses,
        displayableRecords: this._toDisplayableRecords(state.records),
        history: state.history,
        sources: getSources(state)
      });
    });
  }

  componentWillUnmount() {
    this._statesSubscription.unsubscribe();
  }

  copy() {
    return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.default.createElement(ConsoleContainer, {
      store: this.props.store,
      createPasteFunction: this.props.createPasteFunction,
      initialFilterText: this.state.filterText,
      initialEnableRegExpFilter: this.state.enableRegExpFilter,
      initialUnselectedSourceIds: this.state.unselectedSourceIds
    }));
  }

  _getBoundActionCreators() {
    if (this._actionCreators == null) {
      const { store } = this.props;
      this._actionCreators = {
        execute: code => {
          store.dispatch((_Actions || _load_Actions()).execute(code));
        },
        selectExecutor: executorId => {
          store.dispatch((_Actions || _load_Actions()).selectExecutor(executorId));
        },
        clearRecords: () => {
          store.dispatch((_Actions || _load_Actions()).clearRecords());
        }
      };
    }
    return this._actionCreators;
  }

  _resetAllFilters() {
    this._selectSources(this.state.sources.map(s => s.id));
    this._updateFilterText('');
  }

  _createPaste() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this.props.createPasteFunction == null) {
        return;
      }

      const { displayableRecords } = _this._getFilterInfo();
      const lines = displayableRecords.filter(function (displayable) {
        return displayable.record.kind === 'message' || displayable.record.kind === 'request' || displayable.record.kind === 'response';
      }).map(function (displayable) {
        const record = displayable.record;
        const level = record.level != null ? record.level.toString().toUpperCase() : 'LOG';
        const timestamp = record.timestamp.toLocaleString();
        return `[${level}][${record.sourceId}][${timestamp}]\t ${record.text}`;
      }).join('\n');

      if (lines === '') {
        // Can't create an empty paste!
        atom.notifications.addWarning('There is nothing in your console to Paste! Check your console filters and try again.');
        return;
      }

      atom.notifications.addInfo('Creating Paste...');

      if (!(_this.props.createPasteFunction != null)) {
        throw new Error('Invariant violation: "this.props.createPasteFunction != null"');
      }

      const uri = yield _this.props.createPasteFunction(lines, {
        title: 'Nuclide Console Paste'
      }, 'console paste');

      atom.notifications.addSuccess(`Created Paste at ${uri}`);
    })();
  }

  _getFilterInfo() {
    const { pattern, isValid } = this._getFilterPattern(this.state.filterText, this.state.enableRegExpFilter);

    const selectedSourceIds = this.state.sources.map(source => source.id).filter(sourceId => this.state.unselectedSourceIds.indexOf(sourceId) === -1);

    const displayableRecords = filterRecords(this.state.displayableRecords, selectedSourceIds, pattern, this.state.sources.length !== selectedSourceIds.length);

    return {
      isValid,
      selectedSourceIds,
      displayableRecords
    };
  }

  render() {
    if (!this.state.ready) {
      return _react.default.createElement('span', null);
    }

    const actionCreators = this._getBoundActionCreators();
    const {
      isValid,
      selectedSourceIds,
      displayableRecords
    } = this._getFilterInfo();
    const filteredRecordCount = this.state.displayableRecords.length - displayableRecords.length;

    const createPaste = this.props.createPasteFunction != null ? this._createPaste : null;

    return _react.default.createElement((_Console || _load_Console()).default, {
      invalidFilterInput: !isValid,
      execute: actionCreators.execute,
      selectExecutor: actionCreators.selectExecutor,
      clearRecords: actionCreators.clearRecords,
      createPaste: createPaste,
      currentExecutor: this.state.currentExecutor,
      unselectedSourceIds: this.state.unselectedSourceIds,
      filterText: this.state.filterText,
      enableRegExpFilter: this.state.enableRegExpFilter,
      displayableRecords: displayableRecords,
      filteredRecordCount: filteredRecordCount,
      history: this.state.history,
      sources: this.state.sources,
      selectedSourceIds: selectedSourceIds,
      selectSources: this._selectSources,
      executors: this.state.executors,
      getProvider: id => this.state.providers.get(id),
      toggleRegExpFilter: this._toggleRegExpFilter,
      updateFilterText: this._updateFilterText,
      onDisplayableRecordHeightChange: this._handleDisplayableRecordHeightChange,
      resetAllFilters: this._resetAllFilters
    });
  }

  serialize() {
    const { filterText, enableRegExpFilter, unselectedSourceIds } = this.state;
    return {
      deserializer: 'nuclide.ConsoleContainer',
      filterText,
      enableRegExpFilter,
      unselectedSourceIds
    };
  }

  _selectSources(selectedSourceIds) {
    const sourceIds = this.state.sources.map(source => source.id);
    const unselectedSourceIds = sourceIds.filter(sourceId => selectedSourceIds.indexOf(sourceId) === -1);
    this.setState({ unselectedSourceIds });
  }

  _toggleRegExpFilter() {
    this.setState({ enableRegExpFilter: !this.state.enableRegExpFilter });
  }

  _updateFilterText(filterText) {
    this.setState({ filterText });
  }

  _getFilterPattern(filterText, isRegExp) {
    if (filterText === '') {
      return { pattern: null, isValid: true };
    }
    const source = isRegExp ? filterText : (0, (_escapeStringRegexp || _load_escapeStringRegexp()).default)(filterText);
    try {
      return {
        pattern: new RegExp(source, 'i'),
        isValid: true
      };
    } catch (err) {
      return {
        pattern: null,
        isValid: false
      };
    }
  }

  _handleDisplayableRecordHeightChange(recordId, newHeight, callback) {
    const newDisplayableRecords = [];
    this.state.displayableRecords.forEach(displayableRecord => {
      if (displayableRecord.id === recordId) {
        // Update the changed record.
        const newDisplayableRecord = Object.assign({}, displayableRecord, {
          height: newHeight
        });
        newDisplayableRecords.push(newDisplayableRecord);
        this._displayableRecords.set(displayableRecord.record, newDisplayableRecord);
      } else {
        newDisplayableRecords.push(displayableRecord);
      }
    });
    this.setState({
      displayableRecords: newDisplayableRecords
    }, callback);
  }

  /**
   * Transforms the Records from the store into DisplayableRecords. This caches the result
   * per-ConsoleContainer instance because the same record can have different heights in different
   * containers.
   */
  _toDisplayableRecords(records) {
    return records.map(record => {
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
    });
  }
}

exports.ConsoleContainer = ConsoleContainer;
function getSources(state) {
  // Convert the providers to a map of sources.
  const mapOfSources = new Map(Array.from(state.providers.entries()).map(([k, provider]) => {
    const source = {
      id: provider.id,
      name: provider.id,
      status: state.providerStatuses.get(provider.id) || 'stopped',
      start: typeof provider.start === 'function' ? provider.start : undefined,
      stop: typeof provider.stop === 'function' ? provider.stop : undefined
    };
    return [k, source];
  }));

  // Some providers may have been unregistered, but still have records. Add sources for them too.
  // TODO: Iterating over all the records to get this every time we get a new record is inefficient.
  for (let i = 0, len = state.records.length; i < len; i++) {
    const record = state.records[i];
    if (!mapOfSources.has(record.sourceId)) {
      mapOfSources.set(record.sourceId, {
        id: record.sourceId,
        name: record.sourceId,
        status: 'stopped',
        start: undefined,
        stop: undefined
      });
    }
  }

  return Array.from(mapOfSources.values());
}

function filterRecords(displayableRecords, selectedSourceIds, filterPattern, filterSources) {
  if (!filterSources && filterPattern == null) {
    return displayableRecords;
  }

  return displayableRecords.filter(({ record }) => {
    // Only filter regular messages
    if (record.kind !== 'message') {
      return true;
    }

    const sourceMatches = selectedSourceIds.indexOf(record.sourceId) !== -1;
    return sourceMatches && (filterPattern == null || filterPattern.test(record.text));
  });
}