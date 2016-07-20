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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.default = createConsoleGadget;

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

function createConsoleGadget(store) {
  var OutputGadget = (function (_React$Component) {
    _inherits(OutputGadget, _React$Component);

    _createClass(OutputGadget, null, [{
      key: 'gadgetId',
      value: 'nuclide-console',
      enumerable: true
    }, {
      key: 'defaultLocation',
      value: 'bottom',
      enumerable: true
    }]);

    function OutputGadget(props) {
      _classCallCheck(this, OutputGadget);

      _get(Object.getPrototypeOf(OutputGadget.prototype), 'constructor', this).call(this, props);
      this.state = {
        ready: false,
        currentExecutor: null,
        providers: new Map(),
        providerStatuses: new Map(),
        executors: new Map(),
        records: []
      };
    }

    _createClass(OutputGadget, [{
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

        // $FlowFixMe: How do we tell flow about Symbol.observable?
        this._statesSubscription = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.from(store).subscribe(function (state) {
          var currentExecutorId = (0, (_getCurrentExecutorId2 || _getCurrentExecutorId()).default)(state);
          var currentExecutor = currentExecutorId != null ? state.executors.get(currentExecutorId) : null;
          _this.setState({
            ready: true,
            currentExecutor: currentExecutor,
            executors: state.executors,
            providers: state.providers,
            providerStatuses: state.providerStatuses,
            records: state.records
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
        if (this._actionCreators == null) {
          this._actionCreators = {
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
        }
        return this._actionCreators;
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        if (!this.state.ready) {
          return (_reactForAtom2 || _reactForAtom()).React.createElement('span', null);
        }

        var sources = Array.from(this.state.providers.values()).map(function (source) {
          return {
            id: source.id,
            name: source.id,
            status: _this2.state.providerStatuses.get(source.id) || 'stopped',
            start: source.start != null ? source.start : undefined,
            stop: source.stop != null ? source.stop : undefined
          };
        });
        var actionCreators = this._getBoundActionCreators();
        // TODO(matthewwithanm): serialize and restore `initialSelectedSourceId`
        return (_reactForAtom2 || _reactForAtom()).React.createElement((_Console2 || _Console()).default, {
          execute: actionCreators.execute,
          selectExecutor: actionCreators.selectExecutor,
          clearRecords: actionCreators.clearRecords,
          currentExecutor: this.state.currentExecutor,
          initialSelectedSourceIds: sources.map(function (source) {
            return source.id;
          }),
          records: this.state.records,
          sources: sources,
          executors: this.state.executors,
          getProvider: function (id) {
            return _this2.state.providers.get(id);
          }
        });
      }
    }]);

    return OutputGadget;
  })((_reactForAtom2 || _reactForAtom()).React.Component);

  return OutputGadget;
}

module.exports = exports.default;