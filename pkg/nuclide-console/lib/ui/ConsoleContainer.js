'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConsoleContainer = exports.WORKSPACE_VIEW_URI = undefined;

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../../commons-atom/viewableFromReactElement');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../commons-node/UniversalDisposable'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../../commons-node/observable');
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

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/console';

// NOTE: We're not accounting for the "store" prop being changed.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class ConsoleContainer extends _react.default.Component {

  constructor(props) {
    super(props);
    this._selectSources = this._selectSources.bind(this);
    this._toggleRegExpFilter = this._toggleRegExpFilter.bind(this);
    this._updateFilterText = this._updateFilterText.bind(this);
    const { initialFilterText, initialEnableRegExpFilter, initialUnselectedSourceIds } = props;
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
      unselectedSourceIds: initialUnselectedSourceIds == null ? [] : initialUnselectedSourceIds
    };
    this._stateChanges = new _rxjsBundlesRxMinJs.Subject();
    this._titleChanges = this._stateChanges.map(() => this.state).distinctUntilChanged().map(() => this.getTitle()).distinctUntilChanged();
  }

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
    return 'bottom-panel';
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
        records: state.records,
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

  render() {
    if (!this.state.ready) {
      return _react.default.createElement('span', null);
    }

    const actionCreators = this._getBoundActionCreators();

    const { pattern, isValid } = this._getFilterPattern(this.state.filterText, this.state.enableRegExpFilter);

    const selectedSourceIds = this.state.sources.map(source => source.id).filter(sourceId => this.state.unselectedSourceIds.indexOf(sourceId) === -1);

    const records = filterRecords(this.state.records, selectedSourceIds, pattern, this.state.sources.length !== selectedSourceIds.length);

    // TODO(matthewwithanm): serialize and restore `initialSelectedSourceId`
    return _react.default.createElement((_Console || _load_Console()).default, {
      invalidFilterInput: !isValid,
      execute: actionCreators.execute,
      selectExecutor: actionCreators.selectExecutor,
      clearRecords: actionCreators.clearRecords,
      currentExecutor: this.state.currentExecutor,
      unselectedSourceIds: this.state.unselectedSourceIds,
      filterText: this.state.filterText,
      enableRegExpFilter: this.state.enableRegExpFilter,
      records: records,
      history: this.state.history,
      sources: this.state.sources,
      selectedSourceIds: selectedSourceIds,
      selectSources: this._selectSources,
      executors: this.state.executors,
      getProvider: id => this.state.providers.get(id),
      toggleRegExpFilter: this._toggleRegExpFilter,
      updateFilterText: this._updateFilterText
    });
  }

  serialize() {
    return {
      deserializer: 'nuclide.ConsoleContainer'
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

function filterRecords(records, selectedSourceIds, filterPattern, filterSources) {
  if (!filterSources && filterPattern == null) {
    return records;
  }

  return records.filter(record => {
    // Only filter regular messages
    if (record.kind !== 'message') {
      return true;
    }

    const sourceMatches = selectedSourceIds.indexOf(record.sourceId) !== -1;
    return sourceMatches && (filterPattern == null || filterPattern.test(record.text));
  });
}