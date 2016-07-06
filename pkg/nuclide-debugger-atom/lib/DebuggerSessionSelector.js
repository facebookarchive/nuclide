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

var _DebuggerProcessInfo2;

function _DebuggerProcessInfo() {
  return _DebuggerProcessInfo2 = _interopRequireDefault(require('./DebuggerProcessInfo'));
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
var DebuggerSessionSelector = (_reactForAtom2 || _reactForAtom()).React.createClass({
  propTypes: {
    actions: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_DebuggerActions2 || _DebuggerActions()).default).isRequired,
    store: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_DebuggerStore2 || _DebuggerStore()).DebuggerStore).isRequired
  },

  getInitialState: function getInitialState() {
    return {
      processes: [],
      selectedProcess: null,
      debuggerStoreChangeListener: null
    };
  },

  componentWillMount: function componentWillMount() {
    this.setState({
      debuggerStoreChangeListener: this.props.store.onChange(this._updateProcessList)
    });
    this._updateProcessList();
  },

  componentWillUnmount: function componentWillUnmount() {
    var listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
  },

  render: function render() {
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
              value: this.state.selectedProcess == null ? null : this.state.processes.indexOf(this.state.selectedProcess) },
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
  },

  _updateProcessList: function _updateProcessList() {
    var _this = this;

    this.props.store.getProcessInfoList().then(function (processList) {
      _this.setState({
        processes: processList.sort(compareDebuggerProcessInfo) });
    });
  },

  _renderProcessChoices: function _renderProcessChoices() {
    return this.state.processes.map(function (item, index) {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'option',
        { key: item.toString(), value: index },
        item.toString()
      );
    });
  },

  _handleSelectProcess: function _handleSelectProcess(e) {
    this.setState({
      selectedProcess: this.state.processes[e.target.value]
    });
  },

  _handleClick: function _handleClick(e) {
    if (this.state.selectedProcess) {
      // fire and forget.
      this.props.actions.startDebugging(this.state.selectedProcess);
    }
  }
});

function compareDebuggerProcessInfo(value, other) {
  var cmp = value.getServiceName().localeCompare(other.getServiceName());
  if (cmp === 0) {
    return value.compareDetails(other);
  } else {
    return cmp;
  }
}

module.exports = DebuggerSessionSelector;