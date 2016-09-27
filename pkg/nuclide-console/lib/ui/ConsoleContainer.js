Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomViewableFromReactElement2;

function _commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement2 = require('../../../commons-atom/viewableFromReactElement');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../../commons-node/UniversalDisposable'));
}

var _getCurrentExecutorId2;

function _getCurrentExecutorId() {
  return _getCurrentExecutorId2 = _interopRequireDefault(require('../getCurrentExecutorId'));
}

var _reduxActions2;

function _reduxActions() {
  return _reduxActions2 = _interopRequireWildcard(require('../redux/Actions'));
}

var _Console2;

function _Console() {
  return _Console2 = _interopRequireDefault(require('./Console'));
}

var _escapeStringRegexp2;

function _escapeStringRegexp() {
  return _escapeStringRegexp2 = _interopRequireDefault(require('escape-string-regexp'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

// NOTE: We're not accounting for the "store" prop being changed.

var ConsoleContainer = (function (_React$Component) {
  _inherits(ConsoleContainer, _React$Component);

  function ConsoleContainer(props) {
    var _this = this;

    _classCallCheck(this, ConsoleContainer);

    _get(Object.getPrototypeOf(ConsoleContainer.prototype), 'constructor', this).call(this, props);
    this._selectSources = this._selectSources.bind(this);
    this._toggleRegExpFilter = this._toggleRegExpFilter.bind(this);
    this._updateFilterText = this._updateFilterText.bind(this);
    var initialFilterText = props.initialFilterText;
    var initialEnableRegExpFilter = props.initialEnableRegExpFilter;
    var initialUnselectedSourceIds = props.initialUnselectedSourceIds;

    this.state = {
      ready: false,
      currentExecutor: null,
      providers: new Map(),
      providerStatuses: new Map(),
      executors: new Map(),
      records: [],
      sources: [],
      filterText: initialFilterText == null ? '' : initialFilterText,
      enableRegExpFilter: Boolean(initialEnableRegExpFilter),
      unselectedSourceIds: initialUnselectedSourceIds == null ? [] : initialUnselectedSourceIds
    };
    this._stateChanges = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Subject();
    this._titleChanges = this._stateChanges.map(function () {
      return _this.state;
    }).distinctUntilChanged().map(function () {
      return _this.getTitle();
    }).distinctUntilChanged();
  }

  _createClass(ConsoleContainer, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._stateChanges.next();
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return 'terminal';
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      var _this2 = this;

      // If there's only one source selected, use its name in the tab title.
      if (this.state.sources.length - this.state.unselectedSourceIds.length === 1) {
        var selectedSource = this.state.sources.find(function (source) {
          return _this2.state.unselectedSourceIds.indexOf(source.id) === -1;
        });
        if (selectedSource) {
          return 'Console: ' + selectedSource.name;
        }
      }
      return 'Console';
    }
  }, {
    key: 'onDidChangeTitle',
    value: function onDidChangeTitle(callback) {
      return new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(this._titleChanges.subscribe(callback));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      var raf = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.create(function (observer) {
        window.requestAnimationFrame(observer.complete.bind(observer));
      });
      // $FlowFixMe: How do we tell flow about Symbol.observable?
      this._statesSubscription = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(this.props.store).audit(function () {
        return raf;
      }).subscribe(function (state) {
        var currentExecutorId = (0, (_getCurrentExecutorId2 || _getCurrentExecutorId()).default)(state);
        var currentExecutor = currentExecutorId != null ? state.executors.get(currentExecutorId) : null;
        _this3.setState({
          ready: true,
          currentExecutor: currentExecutor,
          executors: state.executors,
          providers: state.providers,
          providerStatuses: state.providerStatuses,
          records: state.records,
          sources: getSources(state)
        });
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._statesSubscription.unsubscribe();
    }
  }, {
    key: 'copy',
    value: function copy() {
      return (0, (_commonsAtomViewableFromReactElement2 || _commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom2 || _reactForAtom()).React.createElement(ConsoleContainer, {
        store: this.props.store,
        initialFilterText: this.state.filterText,
        initialEnableRegExpFilter: this.state.enableRegExpFilter,
        initialUnselectedSourceIds: this.state.unselectedSourceIds
      }));
    }
  }, {
    key: '_getBoundActionCreators',
    value: function _getBoundActionCreators() {
      var _this4 = this;

      if (this._actionCreators == null) {
        (function () {
          var store = _this4.props.store;

          _this4._actionCreators = {
            execute: function execute(code) {
              store.dispatch((_reduxActions2 || _reduxActions()).execute(code));
            },
            selectExecutor: function selectExecutor(executorId) {
              store.dispatch((_reduxActions2 || _reduxActions()).selectExecutor(executorId));
            },
            clearRecords: function clearRecords() {
              store.dispatch((_reduxActions2 || _reduxActions()).clearRecords());
            }
          };
        })();
      }
      return this._actionCreators;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      if (!this.state.ready) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement('span', null);
      }

      var actionCreators = this._getBoundActionCreators();

      var _getFilterPattern2 = this._getFilterPattern(this.state.filterText, this.state.enableRegExpFilter);

      var pattern = _getFilterPattern2.pattern;
      var isValid = _getFilterPattern2.isValid;

      var selectedSourceIds = this.state.sources.map(function (source) {
        return source.id;
      }).filter(function (sourceId) {
        return _this5.state.unselectedSourceIds.indexOf(sourceId) === -1;
      });

      var records = filterRecords(this.state.records, selectedSourceIds, pattern, this.state.sources.length !== selectedSourceIds.length);

      // TODO(matthewwithanm): serialize and restore `initialSelectedSourceId`
      return (_reactForAtom2 || _reactForAtom()).React.createElement((_Console2 || _Console()).default, {
        invalidFilterInput: !isValid,
        execute: actionCreators.execute,
        selectExecutor: actionCreators.selectExecutor,
        clearRecords: actionCreators.clearRecords,
        currentExecutor: this.state.currentExecutor,
        unselectedSourceIds: this.state.unselectedSourceIds,
        filterText: this.state.filterText,
        enableRegExpFilter: this.state.enableRegExpFilter,
        records: records,
        sources: this.state.sources,
        selectedSourceIds: selectedSourceIds,
        selectSources: this._selectSources,
        executors: this.state.executors,
        getProvider: function (id) {
          return _this5.state.providers.get(id);
        },
        toggleRegExpFilter: this._toggleRegExpFilter,
        updateFilterText: this._updateFilterText
      });
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        deserializer: 'nuclide.ConsoleContainer'
      };
    }
  }, {
    key: '_selectSources',
    value: function _selectSources(selectedSourceIds) {
      var sourceIds = this.state.sources.map(function (source) {
        return source.id;
      });
      var unselectedSourceIds = sourceIds.filter(function (sourceId) {
        return selectedSourceIds.indexOf(sourceId) === -1;
      });
      this.setState({ unselectedSourceIds: unselectedSourceIds });
    }
  }, {
    key: '_toggleRegExpFilter',
    value: function _toggleRegExpFilter() {
      this.setState({ enableRegExpFilter: !this.state.enableRegExpFilter });
    }
  }, {
    key: '_updateFilterText',
    value: function _updateFilterText(filterText) {
      this.setState({ filterText: filterText });
    }
  }, {
    key: '_getFilterPattern',
    value: function _getFilterPattern(filterText, isRegExp) {
      if (filterText === '') {
        return { pattern: null, isValid: true };
      }
      var source = isRegExp ? filterText : (0, (_escapeStringRegexp2 || _escapeStringRegexp()).default)(filterText);
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
  }]);

  return ConsoleContainer;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.ConsoleContainer = ConsoleContainer;

function getSources(state) {
  // Convert the providers to a map of sources.
  var mapOfSources = new Map(Array.from(state.providers.entries()).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var k = _ref2[0];
    var provider = _ref2[1];

    var source = {
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
  for (var i = 0, len = state.records.length; i < len; i++) {
    var record = state.records[i];
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

  return records.filter(function (record) {
    // Only filter regular messages
    if (record.kind !== 'message') {
      return true;
    }

    var sourceMatches = selectedSourceIds.indexOf(record.sourceId) !== -1;
    return sourceMatches && (filterPattern == null || filterPattern.test(record.text));
  });
}

//
// State shared between all Console instances
//

//
// State unique to this particular Console instance
//