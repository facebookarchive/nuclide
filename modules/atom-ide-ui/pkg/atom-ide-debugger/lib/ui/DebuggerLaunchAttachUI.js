"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../../../nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../../../../../nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _Tabs() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/Tabs"));

  _Tabs = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _AtomServiceContainer() {
  const data = require("../AtomServiceContainer");

  _AtomServiceContainer = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/* global localStorage */
// TODO those should be managed by the debugger store state
function setLastUsedDebugger(host, action, debuggerDisplayName) {
  const key = 'DEBUGGER_LAST_USED_' + host + '_' + action;
  localStorage.setItem(key, debuggerDisplayName);
}

function getLastUsedDebugger(host, action) {
  const key = 'DEBUGGER_LAST_USED_' + host + '_' + action;
  return localStorage.getItem(key);
} // Older published debugger packages did not provide `getTabName()`.
// TODO(most): Remove this once newer debugger versions get adoption.


function getTabName(provider) {
  var _provider$_debuggingT;

  if (typeof provider.getTabName === 'function') {
    return provider.getTabName();
  }

  return (_provider$_debuggingT = provider._debuggingTypeName) !== null && _provider$_debuggingT !== void 0 ? _provider$_debuggingT : '';
}

class DebuggerLaunchAttachUI extends React.Component {
  constructor(props) {
    super(props);

    this._setConfigValid = valid => {
      this.setState({
        configIsValid: valid
      });
    };

    this._disposables = new (_UniversalDisposable().default)();

    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this.state.configIsValid) {
          this._rememberTab(); // Close the dialog, but do it on the next tick so that the child
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
    const host = _nuclideUri().default.isRemote(this.props.connection) ? _nuclideUri().default.getHostname(this.props.connection) : 'local';

    if (this.state.selectedProviderTab != null) {
      setLastUsedDebugger(host, this.props.dialogMode, this.state.selectedProviderTab || '');
    }
  }

  UNSAFE_componentWillMount() {
    const host = _nuclideUri().default.isRemote(this.props.connection) ? _nuclideUri().default.getHostname(this.props.connection) : 'local';
    const selectedProvider = (this.props.providers.get(host) || []).find(p => getTabName(p) === this.props.initialSelectedTabName);

    if (selectedProvider != null) {
      setLastUsedDebugger(host, this.props.dialogMode, getTabName(selectedProvider));
    }

    this._filterProviders(host);

    this.setState({
      selectedProviderTab: getLastUsedDebugger(host, this.props.dialogMode)
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const host = _nuclideUri().default.isRemote(nextProps.connection) ? _nuclideUri().default.getHostname(nextProps.connection) : 'local';

    this._filterProviders(host);

    this.setState({
      selectedProviderTab: getLastUsedDebugger(host, nextProps.dialogMode)
    });
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  async _getProviderIfEnabled(provider) {
    const enabled = await provider.getCallbacksForAction(this.props.dialogMode).isEnabled();
    return enabled ? provider : null;
  }

  _filterProviders(key) {
    this.setState({
      enabledProviders: []
    });

    _RxMin.Observable.merge(...(this.props.providers.get(key) || []).map(provider => _RxMin.Observable.fromPromise(this._getProviderIfEnabled(provider)))).filter(provider => provider != null).map(provider => {
      if (!(provider != null)) {
        throw new Error("Invariant violation: \"provider != null\"");
      }

      const tabName = getTabName(provider);
      return {
        provider,
        tabName
      };
    }).scan((arr, provider) => arr.concat(provider), []).subscribe(enabledProviders => {
      this.setState({
        enabledProviders
      });
    });
  }

  _getTabsFromEnabledProviders(enabledProviders) {
    const tabs = this.state.enabledProviders.map(debuggerType => ({
      name: debuggerType.tabName,
      tabContent: React.createElement("span", {
        title: debuggerType.tabName,
        className: "debugger-provider-tab"
      }, debuggerType.tabName)
    })).sort((a, b) => a.name.localeCompare(b.name));
    return tabs;
  }

  setState(partialState, callback) {
    if (typeof partialState === 'function') {
      super.setState(partialState, callback);
    } else {
      const fullState = Object.assign({}, this.state, partialState);

      if (fullState.selectedProviderTab == null) {
        const tabs = this._getTabsFromEnabledProviders(fullState.enabledProviders);

        if (tabs.length > 0) {
          const firstTab = tabs[0];
          fullState.selectedProviderTab = firstTab.name;
        }
      }

      super.setState(fullState, callback);
    }
  }

  render() {
    const tabs = this._getTabsFromEnabledProviders(this.state.enabledProviders);

    let providerContent = null;

    if (tabs.length > 0) {
      let selectedTab = this.state.selectedProviderTab != null ? this.state.selectedProviderTab : this.state.enabledProviders[0].tabName;
      let provider = this.state.enabledProviders.find(p => p.tabName === selectedTab);

      if (provider == null) {
        provider = this.state.enabledProviders[0];
        selectedTab = provider.tabName;
      }

      const defaultConfig = selectedTab != null && selectedTab === this.props.initialSelectedTabName ? this.props.initialProviderConfig : null;
      const debuggerConfigPage = provider.provider.getCallbacksForAction(this.props.dialogMode).getComponent(selectedTab, valid => this._setConfigValid(valid), defaultConfig);
      providerContent = React.createElement("div", null, React.createElement(_Tabs().default, {
        className: "debugger-launch-attach-tabs",
        tabs: tabs,
        growable: true,
        activeTabName: this.state.selectedProviderTab,
        triggeringEvent: "onClick",
        onActiveTabChange: newTab => {
          this._setConfigValid(false);

          this.setState({
            selectedProviderTab: newTab.name
          });
        }
      }), React.createElement("div", {
        className: "debugger-launch-attach-tabcontent"
      }, debuggerConfigPage));
    } else {
      // No debugging providers available.
      providerContent = React.createElement("div", {
        className: "debugger-launch-attach-tabcontent"
      }, "No debuggers installed, look for available debuggers on", ' ', React.createElement("a", {
        href: "https://atom.io/packages/search?q=atom-ide-debugger-"
      }, "atom.io/packages"));
    }

    return React.createElement("div", {
      className: "padded debugger-launch-attach-container"
    }, (0, _AtomServiceContainer().isNuclideEnvironment)() ? React.createElement("h1", {
      className: "debugger-launch-attach-header"
    }, React.createElement("span", {
      className: "padded"
    }, this.props.dialogMode === 'attach' ? 'Attach debugger to ' : 'Launch debugger on '), React.createElement(_Dropdown().Dropdown, {
      className: "inline",
      options: this.props.connectionOptions,
      onChange: value => this.props.connectionChanged(value),
      size: "xs",
      value: this.props.connection
    })) : null, providerContent, React.createElement("div", {
      className: "debugger-launch-attach-actions"
    }, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
      onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'core:cancel')
    }, "Cancel"), React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      disabled: !this.state.configIsValid,
      onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'core:confirm')
    }, this.props.dialogMode === 'attach' ? 'Attach' : 'Launch'))));
  }

}

exports.default = DebuggerLaunchAttachUI;