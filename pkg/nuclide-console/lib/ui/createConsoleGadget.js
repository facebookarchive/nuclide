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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Console2;

function _Console() {
  return _Console2 = _interopRequireDefault(require('./Console'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _getCurrentExecutorId2;

function _getCurrentExecutorId() {
  return _getCurrentExecutorId2 = _interopRequireDefault(require('../getCurrentExecutorId'));
}

function createConsoleGadget(state$, commands) {
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
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this = this;

        this._state$Subscription = state$.subscribe(function (state) {
          var currentExecutorId = (0, (_getCurrentExecutorId2 || _getCurrentExecutorId()).default)(state);
          var currentExecutor = currentExecutorId != null ? state.executors.get(currentExecutorId) : null;
          _this.setState({
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
        this._state$Subscription.unsubscribe();
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var sources = Array.from(this.state.providers.values()).map(function (source) {
          // $FlowFixMe
          var status = _this2.state.providerStatuses.get(source.id);
          return {
            id: source.id,
            name: source.id,
            status: status,
            start: source.start != null ? source.start : undefined,
            stop: source.stop != null ? source.stop : undefined
          };
        });
        // TODO(matthewwithanm): serialize and restore `initialSelectedSourceId`
        return (_reactForAtom2 || _reactForAtom()).React.createElement((_Console2 || _Console()).default, {
          execute: function (code) {
            return commands.execute(code);
          },
          selectExecutor: commands.selectExecutor.bind(commands),
          clearRecords: commands.clearRecords.bind(commands),
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