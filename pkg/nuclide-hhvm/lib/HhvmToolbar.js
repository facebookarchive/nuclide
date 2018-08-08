"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _electron = require("electron");

function _constants() {
  const data = require("../../nuclide-hack-common/lib/constants.js");

  _constants = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("../../../modules/nuclide-commons-ui/Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _HhvmToolbarSettings() {
  const data = require("./HhvmToolbarSettings");

  _HhvmToolbarSettings = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const WEB_SERVER_OPTION = {
  label: 'Attach to WebServer',
  value: 'webserver'
};
const SCRIPT_OPTION = {
  label: 'Launch Script',
  value: 'script'
};
const DEBUG_OPTIONS = [WEB_SERVER_OPTION, SCRIPT_OPTION];
const NO_LAUNCH_DEBUG_OPTIONS = [WEB_SERVER_OPTION];

class HhvmToolbar extends React.Component {
  constructor(props) {
    super(props);

    this._updateLastScriptCommand = command => {
      if (this.props.projectStore.getDebugMode() !== 'webserver') {
        if (this.state.stickyScript) {
          this.props.projectStore.setStickyCommand(command, true);
        } else {
          this.props.projectStore.updateLastScriptCommand(command);
        }
      }
    };

    this._handleDropdownChange = value => {
      this.props.projectStore.setDebugMode(value);

      this._suggestTargetIfCustomDebugMode(value);
    };

    this.state = {
      stickyScript: false,
      useTerminal: false,
      settingsVisible: false
    };
  }

  _getMenuItems() {
    const additionalOptions = [];

    try {
      // $FlowFB: This is suppressed elsewhere, so vary the filename.
      const helpers = require("./fb-hhvm.js");

      additionalOptions.push(...helpers.getAdditionalLaunchOptions());
    } catch (e) {}

    return this._isTargetLaunchable(this.props.projectStore.getCurrentFilePath()) ? DEBUG_OPTIONS.concat(additionalOptions) : NO_LAUNCH_DEBUG_OPTIONS;
  }

  _isTargetLaunchable(targetFilePath) {
    if (targetFilePath.endsWith('.php') || targetFilePath.endsWith('.hh')) {
      return true;
    }

    return atom.workspace.getTextEditors().some(editor => {
      const editorPath = editor.getPath();

      if (editorPath != null && editorPath.endsWith(targetFilePath)) {
        const grammar = editor.getGrammar();
        return _constants().HACK_GRAMMARS.indexOf(grammar.scopeName) >= 0;
      }

      return false;
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Reset selected item to webserver if target is not launchable anymore.
    // TODO[jeffreytan]: this is ugly, refactor to make it more elegant.
    const store = this.props.projectStore;

    if (store.getDebugMode() === 'script' && !this.state.stickyScript && !this._isTargetLaunchable(store.getCurrentFilePath())) {
      store.setDebugMode('webserver');
    }

    this._suggestTargetIfCustomDebugMode(store.getDebugMode());

    (0, _nullthrows().default)(this._debugTarget).setText(store.getDebugTarget());
  }

  render() {
    const store = this.props.projectStore;
    const isDebugScript = store.getDebugMode() !== 'webserver';
    const isDisabled = !isDebugScript;
    const value = store.getDebugTarget();

    const openFn = () => {
      const browserUri = (this._debugTarget != null ? this._debugTarget.getText() : store.getDebugTarget()) || '';
      const address = browserUri.trim().toLowerCase();

      if (!address.startsWith('http://') && !address.startsWith('https://')) {
        _electron.shell.openExternal('https://' + browserUri);
      } else {
        _electron.shell.openExternal(browserUri);
      }
    };

    return React.createElement("div", {
      className: "hhvm-toolbar"
    }, React.createElement(_Dropdown().Dropdown, {
      className: "inline-block",
      options: this._getMenuItems(),
      value: store.getDebugMode(),
      onChange: this._handleDropdownChange,
      ref: dropdown => {
        this._dropdown = dropdown;
      },
      size: "sm"
    }), React.createElement("div", {
      className: "inline-block",
      style: {
        width: '300px'
      }
    }, React.createElement(_AtomInput().AtomInput, {
      ref: input => {
        this._debugTarget = input;
      },
      value: value,
      onDidChange: isDisabled ? () => {} : this._updateLastScriptCommand,
      onConfirm: openFn,
      size: "sm"
    })), store.getDebugMode() !== 'webserver' ? React.createElement(_Button().Button, {
      className: "icon icon-gear",
      size: _Button().ButtonSizes.SMALL,
      title: "Advanced settings",
      style: {
        'margin-right': '3px'
      },
      onClick: () => this._showSettings()
    }) : null, this.state.settingsVisible ? React.createElement(_HhvmToolbarSettings().HhvmToolbarSettings, {
      projectStore: this.props.projectStore,
      onDismiss: () => this._hideSettings()
    }) : null, React.createElement("div", {
      className: "inline-block"
    }, !isDebugScript ? React.createElement(_Button().Button, {
      size: "SMALL",
      onClick: openFn
    }, "Open In Browser") : React.createElement(_Checkbox().Checkbox, {
      checked: this.state.stickyScript,
      className: "nuclide-hhvm-be-sticky-control",
      label: "Sticky",
      onChange: isChecked => {
        this.props.projectStore.setStickyCommand((0, _nullthrows().default)(this._debugTarget).getText(), isChecked);
        this.setState({
          stickyScript: isChecked
        });
      },
      tooltip: {
        title: 'When checked, the target script will not change when switching to another editor tab'
      }
    }), store.getDebugMode() === 'script' ? React.createElement(_Checkbox().Checkbox, {
      checked: this.state.useTerminal,
      className: "nuclide-hhvm-use-terminal-control",
      label: "Run in Terminal",
      onChange: isChecked => {
        this.props.projectStore.setUseTerminal(isChecked);
        this.setState({
          useTerminal: isChecked
        });
      },
      tooltip: {
        title: "When checked, the target script's STDIN and STDOUT will be redirected to a new Nuclide Terminal pane"
      }
    }) : null));
  }

  _showSettings() {
    this.setState({
      settingsVisible: true
    });
  }

  _hideSettings() {
    this.setState({
      settingsVisible: false
    });
  }

  _suggestTargetIfCustomDebugMode(debugMode) {
    const store = this.props.projectStore; // If a custom debug mode is selected, suggest a debug target for the user.

    if (DEBUG_OPTIONS.find(option => option.value === debugMode) == null) {
      try {
        // $FlowFB
        const helpers = require("./fb-hhvm");

        const suggestedTarget = helpers.suggestDebugTargetName(debugMode, store.getCurrentFilePath());
        store.updateLastScriptCommand(suggestedTarget != null ? suggestedTarget : '');
      } catch (e) {}
    } else {
      store.updateLastScriptCommand('');
    }
  }

}

exports.default = HhvmToolbar;