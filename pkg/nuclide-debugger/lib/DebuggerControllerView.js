Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _BreakpointStoreJs;

function _load_BreakpointStoreJs() {
  return _BreakpointStoreJs = _interopRequireDefault(require('./BreakpointStore.js'));
}

var _DebuggerActions;

function _load_DebuggerActions() {
  return _DebuggerActions = _interopRequireDefault(require('./DebuggerActions'));
}

var _DebuggerInspector;

function _load_DebuggerInspector() {
  return _DebuggerInspector = _interopRequireDefault(require('./DebuggerInspector'));
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _Bridge;

function _load_Bridge() {
  return _Bridge = _interopRequireDefault(require('./Bridge'));
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

function getStateFromStore(store) {
  return {
    processSocket: store.getProcessSocket()
  };
}

var DebuggerControllerView = (function (_React$Component) {
  _inherits(DebuggerControllerView, _React$Component);

  function DebuggerControllerView(props) {
    _classCallCheck(this, DebuggerControllerView);

    _get(Object.getPrototypeOf(DebuggerControllerView.prototype), 'constructor', this).call(this, props);
    this.state = getStateFromStore(props.store);

    this._handleClickClose = this._handleClickClose.bind(this);
    this._updateStateFromStore = this._updateStateFromStore.bind(this);
  }

  _createClass(DebuggerControllerView, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({
        debuggerStoreChangeListener: this.props.store.onChange(this._updateStateFromStore)
      });
      this._updateStateFromStore();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var listener = this.state.debuggerStoreChangeListener;
      if (listener != null) {
        listener.dispose();
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var listener = this.state.debuggerStoreChangeListener;
      if (listener != null) {
        listener.dispose();
      }
      this.setState({
        debuggerStoreChangeListener: nextProps.store.onChange(this._updateStateFromStore)
      });
      this._updateStateFromStore(nextProps.store);
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.processSocket) {
        return (_reactForAtom || _load_reactForAtom()).React.createElement((_DebuggerInspector || _load_DebuggerInspector()).default, {
          actions: this.props.actions,
          bridge: this.props.bridge,
          breakpointStore: this.props.breakpointStore,
          socket: this.state.processSocket,
          showOldView: this.props.showOldView,
          toggleOldView: this.props.toggleOldView
        });
      }
      if (this.props.store.getDebuggerMode() === 'starting') {
        return (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'padded' },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiButton || _load_nuclideUiButton()).Button, {
            title: 'Close',
            icon: 'x',
            className: 'nuclide-debugger-root-close-button',
            onClick: this._handleClickClose
          }),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'p',
            null,
            'Starting Debugger'
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement('progress', { className: 'starting' })
        );
      }
      return null;
    }
  }, {
    key: '_handleClickClose',
    value: function _handleClickClose() {
      this.props.actions.stopDebugging();
    }
  }, {
    key: '_updateStateFromStore',
    value: function _updateStateFromStore(store) {
      if (store != null) {
        this.setState(getStateFromStore(store));
      } else {
        this.setState(getStateFromStore(this.props.store));
      }
    }
  }]);

  return DebuggerControllerView;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = DebuggerControllerView;
module.exports = exports.default;