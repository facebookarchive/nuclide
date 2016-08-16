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

var _DebuggerActions2;

function _DebuggerActions() {
  return _DebuggerActions2 = _interopRequireDefault(require('./DebuggerActions'));
}

var _nuclideDebuggerBase2;

function _nuclideDebuggerBase() {
  return _nuclideDebuggerBase2 = require('../../nuclide-debugger-base');
}

var _DebuggerStore2;

function _DebuggerStore() {
  return _DebuggerStore2 = require('./DebuggerStore');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibButtonToolbar2;

function _nuclideUiLibButtonToolbar() {
  return _nuclideUiLibButtonToolbar2 = require('../../nuclide-ui/lib/ButtonToolbar');
}

/**
 * View for setting up a new debugging session.
 */

var DebuggerSessionSelector = (function (_React$Component) {
  _inherits(DebuggerSessionSelector, _React$Component);

  function DebuggerSessionSelector(props) {
    _classCallCheck(this, DebuggerSessionSelector);

    _get(Object.getPrototypeOf(DebuggerSessionSelector.prototype), 'constructor', this).call(this, props);

    this.state = {
      processes: [],
      selectedProcess: null,
      debuggerStoreChangeListener: null
    };

    this._updateProcessList = this._updateProcessList.bind(this);
    this._renderProcessChoices = this._renderProcessChoices.bind(this);
    this._handleSelectProcess = this._handleSelectProcess.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }

  _createClass(DebuggerSessionSelector, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({
        debuggerStoreChangeListener: this.props.store.onChange(this._updateProcessList)
      });
      this._updateProcessList();
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
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'section',
        { className: 'padded' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'h2',
          null,
          'Attach to Process'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'form' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'form-group' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'select',
              {
                className: 'form-control',
                onChange: this._handleSelectProcess,
                value: this.state.selectedProcess == null ? '' : this.state.processes.indexOf(this.state.selectedProcess) },
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'option',
                { disabled: true },
                'Process ID'
              ),
              this._renderProcessChoices()
            )
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButtonToolbar2 || _nuclideUiLibButtonToolbar()).ButtonToolbar,
            { className: 'form-group' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
              {
                buttonType: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonTypes.PRIMARY,
                onClick: this._handleClick,
                disabled: this.state.selectedProcess === null },
              'Attach'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
              { onClick: this._updateProcessList },
              'Refresh List'
            )
          )
        )
      );
    }
  }, {
    key: '_updateProcessList',
    value: function _updateProcessList() {
      var _this = this;

      this.props.store.getProcessInfoList().then(function (processList) {
        _this.setState({
          processes: processList.sort(compareDebuggerProcessInfo) });
      });
    }
  }, {
    key: '_renderProcessChoices',
    value: function _renderProcessChoices() {
      return this.state.processes.map(function (item, index) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'option',
          { key: item.toString(), value: index },
          item.toString()
        );
      });
    }
  }, {
    key: '_handleSelectProcess',
    value: function _handleSelectProcess(e) {
      this.setState({
        selectedProcess: this.state.processes[e.target.value]
      });
    }
  }, {
    key: '_handleClick',
    value: function _handleClick(e) {
      if (this.state.selectedProcess) {
        // fire and forget.
        this.props.actions.startDebugging(this.state.selectedProcess);
      }
    }
  }]);

  return DebuggerSessionSelector;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = DebuggerSessionSelector;

function compareDebuggerProcessInfo(value, other) {
  var cmp = value.getServiceName().localeCompare(other.getServiceName());
  if (cmp === 0) {
    return value.compareDetails(other);
  } else {
    return cmp;
  }
}
module.exports = exports.default;