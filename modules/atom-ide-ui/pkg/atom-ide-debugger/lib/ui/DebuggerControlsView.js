"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _TruncatedButton() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/TruncatedButton"));

  _TruncatedButton = function () {
    return data;
  };

  return data;
}

function _DebuggerSteppingComponent() {
  const data = _interopRequireDefault(require("./DebuggerSteppingComponent"));

  _DebuggerSteppingComponent = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _DebuggerControllerView() {
  const data = _interopRequireDefault(require("./DebuggerControllerView"));

  _DebuggerControllerView = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const DEVICE_PANEL_URL = 'atom://nuclide/devices';

class DebuggerControlsView extends React.PureComponent {
  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable().default)();
    this.state = {
      mode: props.service.getDebuggerMode(),
      hasDevicePanelService: false
    };
  }

  componentDidMount() {
    const {
      service
    } = this.props;

    this._disposables.add((0, _event().observableFromSubscribeFunction)(service.onDidChangeMode.bind(service)).subscribe(mode => this.setState({
      mode
    })), atom.packages.serviceHub.consume('nuclide.devices', '0.0.0', provider => this.setState({
      hasDevicePanelService: true
    })));
  }

  componentWillUnmount() {
    this._dispose();
  }

  _dispose() {
    this._disposables.dispose();
  }

  render() {
    const {
      service,
      passesMultiGK
    } = this.props;
    const {
      mode
    } = this.state;
    const debuggerStoppedNotice = mode !== _constants().DebuggerMode.STOPPED ? null : React.createElement("div", {
      className: "debugger-pane-content"
    }, React.createElement("div", {
      className: "debugger-state-notice"
    }, React.createElement("span", null, "The debugger is not attached.")));
    const debuggerRunningNotice = mode !== _constants().DebuggerMode.RUNNING ? null : React.createElement("div", {
      className: "debugger-pane-content"
    }, React.createElement("div", {
      className: "debugger-state-notice"
    }, (service.viewModel.focusedProcess == null || service.viewModel.focusedProcess.configuration.processName == null ? 'The debug target' : service.viewModel.focusedProcess.configuration.processName) + ' is currently running.'));
    const debuggerNotice = mode !== _constants().DebuggerMode.STOPPED && !passesMultiGK ? null : React.createElement("div", {
      className: "padded"
    }, React.createElement(_TruncatedButton().default, {
      onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:show-attach-dialog'),
      icon: "nuclicon-debugger",
      label: "Attach debugger..."
    }), React.createElement(_TruncatedButton().default, {
      onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:show-launch-dialog'),
      icon: "nuclicon-debugger",
      label: "Launch debugger..."
    }), this.state.hasDevicePanelService ? React.createElement(_TruncatedButton().default, {
      onClick: () => (0, _goToLocation().goToLocation)(DEVICE_PANEL_URL),
      icon: "device-mobile",
      label: "Manage devices..."
    }) : null);
    return React.createElement("div", {
      className: "debugger-container-new"
    }, React.createElement("div", {
      className: "debugger-section-header"
    }, React.createElement(_DebuggerControllerView().default, {
      service: service
    })), React.createElement("div", {
      className: "debugger-section-header debugger-controls-section"
    }, React.createElement(_DebuggerSteppingComponent().default, {
      service: service
    })), debuggerRunningNotice, debuggerStoppedNotice, debuggerNotice);
  }

}

exports.default = DebuggerControlsView;