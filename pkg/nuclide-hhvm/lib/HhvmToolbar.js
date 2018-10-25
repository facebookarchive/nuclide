"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _AtomInput() {
  const data = require("../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
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

function _Dropdown() {
  const data = require("../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _HhvmToolbarSettings() {
  const data = require("./HhvmToolbarSettings");

  _HhvmToolbarSettings = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _electron = require("electron");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class HhvmToolbar extends React.Component {
  constructor(props) {
    super(props);

    this._handleDropdownChange = value => {
      if (this.props.projectStore.getSticky()) {
        this.props.projectStore.setSticky(false);
      }

      this.props.projectStore.setDebugMode(value);
    };

    this._handleTargetBoxChange = value => {
      this.props.projectStore.setDebugTarget(value);
    };

    this._disposables = new (_UniversalDisposable().default)();
    this.state = Object.assign({}, this._getState(), {
      settingsVisible: false
    });

    this._disposables.add((0, _event().observableFromSubscribeFunction)(this.props.projectStore.onChange.bind(this.props.projectStore)).subscribe(() => {
      this.setState(Object.assign({}, this._getState()));
    }));
  }

  _getState() {
    return {
      stickyScript: this.props.projectStore.getSticky(),
      useTerminal: this.props.projectStore.getUseTerminal(),
      debugMode: this.props.projectStore.getDebugMode(),
      launchTarget: this.props.projectStore.getLaunchTarget()
    };
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const {
      stickyScript,
      useTerminal,
      settingsVisible,
      debugMode,
      launchTarget
    } = this.state;
    const isDebugScript = debugMode !== 'webserver';

    const openFn = () => {
      const browserUri = launchTarget;
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
      options: this.props.debugOptions,
      value: debugMode,
      onChange: this._handleDropdownChange,
      size: "sm"
    }), React.createElement("div", {
      className: "inline-block",
      style: {
        width: '300px'
      }
    }, React.createElement(_AtomInput().AtomInput, {
      value: launchTarget,
      onDidChange: this._handleTargetBoxChange,
      onConfirm: openFn,
      disabled: stickyScript,
      size: "sm"
    })), debugMode !== 'webserver' ? React.createElement(_Button().Button, {
      className: "icon icon-gear",
      size: _Button().ButtonSizes.SMALL,
      title: "Advanced settings",
      style: {
        'margin-right': '3px'
      },
      onClick: () => this._showSettings()
    }) : null, settingsVisible ? React.createElement(_HhvmToolbarSettings().HhvmToolbarSettings, {
      projectStore: this.props.projectStore,
      onDismiss: () => this._hideSettings()
    }) : null, React.createElement("div", {
      className: "inline-block"
    }, !isDebugScript ? React.createElement(_Button().Button, {
      size: "SMALL",
      onClick: openFn
    }, "Open In Browser") : React.createElement(_Checkbox().Checkbox, {
      checked: stickyScript,
      className: "nuclide-hhvm-be-sticky-control",
      label: "Sticky",
      onChange: isChecked => {
        this.props.projectStore.setSticky(isChecked);
      },
      disabled: !this.props.projectStore.isCurrentSettingDebuggable(),
      tooltip: {
        title: this.props.projectStore.isCurrentSettingDebuggable() ? 'When checked, the target script will not change when switching to another editor tab' : 'The current HHVM debug settings are not valid.'
      }
    }), debugMode === 'script' ? React.createElement(_Checkbox().Checkbox, {
      checked: useTerminal,
      className: "nuclide-hhvm-use-terminal-control",
      label: "Run in Terminal",
      onChange: isChecked => {
        this.props.projectStore.setUseTerminal(isChecked);
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

}

exports.default = HhvmToolbar;