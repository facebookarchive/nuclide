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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

// NOTE: We're not accounting for the "store" prop being changed.

var ConsoleContainer = (function (_React$Component) {
  _inherits(ConsoleContainer, _React$Component);

  function ConsoleContainer(props) {
    _classCallCheck(this, ConsoleContainer);

    _get(Object.getPrototypeOf(ConsoleContainer.prototype), 'constructor', this).call(this, props);
    this.state = {
      ready: false,
      currentExecutor: null,
      providers: new Map(),
      providerStatuses: new Map(),
      executors: new Map(),
      records: [],
      sources: []
    };
  }

  _createClass(ConsoleContainer, [{
    key: 'getIconName',
    value: function getIconName() {
      return 'terminal';
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return 'Console';
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var raf = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
        window.requestAnimationFrame(observer.complete.bind(observer));
      });
      // $FlowFixMe: How do we tell flow about Symbol.observable?
      this._statesSubscription = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.from(this.props.store).audit(function () {
        return raf;
      }).subscribe(function (state) {
        var currentExecutorId = (0, (_getCurrentExecutorId2 || _getCurrentExecutorId()).default)(state);
        var currentExecutor = currentExecutorId != null ? state.executors.get(currentExecutorId) : null;
        _this.setState({
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
    key: '_getBoundActionCreators',
    value: function _getBoundActionCreators() {
      var _this2 = this;

      if (this._actionCreators == null) {
        (function () {
          var store = _this2.props.store;

          _this2._actionCreators = {
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
      var _this3 = this;

      if (!this.state.ready) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement('span', null);
      }

      var actionCreators = this._getBoundActionCreators();
      // TODO(matthewwithanm): serialize and restore `initialSelectedSourceId`
      return (_reactForAtom2 || _reactForAtom()).React.createElement((_Console2 || _Console()).default, {
        execute: actionCreators.execute,
        selectExecutor: actionCreators.selectExecutor,
        clearRecords: actionCreators.clearRecords,
        currentExecutor: this.state.currentExecutor,
        initialUnselectedSourceIds: [],
        records: this.state.records,
        sources: this.state.sources,
        executors: this.state.executors,
        getProvider: function (id) {
          return _this3.state.providers.get(id);
        }
      });
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
      start: provider.start != null ? provider.start : undefined,
      stop: provider.stop != null ? provider.stop : undefined
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
        name: record.sourceName || record.sourceId,
        status: 'stopped',
        start: undefined,
        stop: undefined
      });
    }
  }

  return Array.from(mapOfSources.values());
}