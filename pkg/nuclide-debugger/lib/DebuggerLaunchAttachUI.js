'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerLaunchAttachUI = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireDefault(require('react'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _Tabs;

function _load_Tabs() {
  return _Tabs = _interopRequireDefault(require('../../nuclide-ui/Tabs'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebuggerLaunchAttachUI extends _react.default.Component {

  constructor(props) {
    super(props);

    this._setConfigValid = valid => {
      this.setState({
        configIsValid: valid
      });
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this.state.configIsValid) {
          this._rememberTab();

          // Close the dialog, but do it on the next tick so that the child
          // component gets to handle the event first (and start the debugger).
          process.nextTick(this.props.dialogCloser);
        }
      }
    }), atom.commands.add('atom-workspace', {
      'core:cancel': () => {
        this._rememberTab();
        this.props.dialogCloser();
      }
    }));

    this.state = {
      selectedProviderTab: null,
      configIsValid: false,
      enabledProviders: []
    };
  }

  _rememberTab() {
    // Remember the last tab the user used for this connection when the "launch/attach"
    // button is clicked.
    const host = (_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.connection) : 'local';
    if (this.state.selectedProviderTab != null) {
      (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).setLastUsedDebugger)(host, this.props.dialogMode, this.state.selectedProviderTab || '');
    }
  }

  componentWillMount() {
    const host = (_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.connection) : 'local';

    this._filterProviders();
    this.setState({
      selectedProviderTab: (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).getLastUsedDebugger)(host, this.props.dialogMode)
    });
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _filterProviders() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const enabled = yield (0, (_promise || _load_promise()).asyncFilter)(_this.props.providers, function (provider) {
        return provider.getCallbacksForAction(_this.props.dialogMode).isEnabled();
      });

      const enabledProviders = [].concat(...enabled.map(function (provider) {
        return provider.getCallbacksForAction(_this.props.dialogMode).getDebuggerTypeNames().map(function (debuggerName) {
          return {
            provider,
            debuggerName
          };
        });
      }));

      _this.setState({
        enabledProviders
      });
    })();
  }

  render() {
    const displayName = (_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.connection) : 'localhost';

    const tabs = this.state.enabledProviders.map(debuggerType => ({
      name: debuggerType.debuggerName,
      tabContent: _react.default.createElement(
        'span',
        { title: debuggerType.debuggerName },
        debuggerType.debuggerName
      )
    })).sort((a, b) => a.name.localeCompare(b.name));

    let providerContent = null;
    if (tabs.length > 0) {
      let selectedTab = this.state.selectedProviderTab != null ? this.state.selectedProviderTab : this.state.enabledProviders[0].debuggerName;
      let provider = this.state.enabledProviders.find(p => p.debuggerName === selectedTab);
      if (provider == null) {
        provider = this.state.enabledProviders[0];
        selectedTab = provider.debuggerName;
      }

      const debuggerConfigPage = provider.provider.getCallbacksForAction(this.props.dialogMode).getComponent(selectedTab, valid => this._setConfigValid(valid));

      providerContent = _react.default.createElement(
        'div',
        null,
        _react.default.createElement((_Tabs || _load_Tabs()).default, {
          className: 'nuclide-debugger-launch-attach-tabs',
          tabs: tabs,
          activeTabName: this.state.selectedProviderTab,
          triggeringEvent: 'onClick',
          onActiveTabChange: newTab => {
            this._setConfigValid(false);
            this.setState({ selectedProviderTab: newTab.name });
          }
        }),
        _react.default.createElement(
          'div',
          { className: 'nuclide-debugger-launch-attach-tabcontent' },
          debuggerConfigPage
        )
      );

      if (this.state.selectedProviderTab == null) {
        // Select the first tab.
        this.setState({ selectedProviderTab: tabs[0].name });
      }
    } else {
      // No debugging providers available.
      providerContent = _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-launch-attach-tabcontent' },
        'There are no debuggers available.'
      );
    }

    return _react.default.createElement(
      'div',
      { className: 'padded nuclide-debugger-launch-attach-container' },
      _react.default.createElement(
        'h1',
        { className: 'nuclide-debugger-launch-attach-header' },
        this.props.dialogMode === 'attach' ? 'Attach debugger to ' : 'Launch debugger on ',
        _react.default.createElement(
          'span',
          {
            className: 'nuclide-debugger-launch-connection',
            title: 'Click to change the connection to be used for debugging.',
            onClick: () => this.props.chooseConnection() },
          displayName
        ),
        _react.default.createElement(
          'span',
          null,
          ':'
        )
      ),
      providerContent,
      _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-launch-attach-actions' },
        _react.default.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            {
              onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'core:cancel') },
            'Cancel'
          ),
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            {
              buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
              disabled: !this.state.configIsValid,
              onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'core:confirm') },
            this.props.dialogMode === 'attach' ? 'Attach' : 'Launch'
          )
        )
      )
    );
  }
}
exports.DebuggerLaunchAttachUI = DebuggerLaunchAttachUI; /**
                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                          * All rights reserved.
                                                          *
                                                          * This source code is licensed under the license found in the LICENSE file in
                                                          * the root directory of this source tree.
                                                          *
                                                          * 
                                                          * @format
                                                          */