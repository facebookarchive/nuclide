"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RootPanel = void 0;

function _bindObservableAsProps() {
  const data = require("../../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _TaskButton() {
  const data = require("./TaskButton");

  _TaskButton = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _PanelComponentScroller() {
  const data = require("../../../../modules/nuclide-commons-ui/PanelComponentScroller");

  _PanelComponentScroller = function () {
    return data;
  };

  return data;
}

function _Selectors() {
  const data = require("./Selectors");

  _Selectors = function () {
    return data;
  };

  return data;
}

function _DeviceTable() {
  const data = require("./DeviceTable");

  _DeviceTable = function () {
    return data;
  };

  return data;
}

function _DevicePanel() {
  const data = require("./DevicePanel");

  _DevicePanel = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
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
class RootPanel extends React.Component {
  constructor(props) {
    super(props);

    this._getHostSelectorComponents = () => {
      return this.props.deviceTypeComponents.get('host_selector') || Immutable().List();
    };

    this._getDeviceTypeComponents = position => {
      const components = this.props.deviceTypeComponents.get(position);

      if (components == null) {
        return null;
      }

      const nodes = components.map(component => {
        const Type = component.type;
        return React.createElement(Type, {
          key: component.key
        });
      });
      return React.createElement("div", {
        className: `block nuclide-device-panel-components-${position}`
      }, nodes);
    };

    this._goToRootPanel = () => {
      this.props.setDevice(null);
    };

    if (!(props.hosts.length > 0)) {
      throw new Error("Invariant violation: \"props.hosts.length > 0\"");
    }
  }

  componentDidMount() {
    this.props.toggleDevicePolling(true);
  }

  componentWillUnmount() {
    this.props.toggleDevicePolling(false);
  }

  _createDeviceTable() {
    // eslint-disable-next-line eqeqeq
    if (this.props.deviceType === null) {
      return null;
    }

    return React.createElement(_DeviceTable().DeviceTable, {
      devices: this.props.devices,
      setDevice: this.props.setDevice,
      deviceTasks: this.props.deviceTasks
    });
  }

  _taskEventsToProps(task, taskEvent) {
    return {
      name: task.getName(),
      start: () => task.start(),
      cancel: () => task.cancel(),
      isRunning: taskEvent != null,
      progress: null
    };
  }

  _getTasks() {
    const tasks = Array.from(this.props.deviceTypeTasks).map(task => {
      const StreamedTaskButton = (0, _bindObservableAsProps().bindObservableAsProps)(task.getTaskEvents().distinctUntilChanged().map(taskEvent => this._taskEventsToProps(task, taskEvent)), _TaskButton().TaskButton);
      return React.createElement(StreamedTaskButton, {
        key: task.getName()
      });
    });

    if (tasks.length < 1) {
      return null;
    }

    return React.createElement("div", {
      className: "block nuclide-device-panel-tasks-container"
    }, tasks);
  }

  _getInnerPanel() {
    const {
      device
    } = this.props;

    if (device != null) {
      return React.createElement("div", {
        className: "block"
      }, React.createElement(_DevicePanel().DevicePanel, {
        infoTables: this.props.infoTables,
        appInfoTables: this.props.appInfoTables,
        processes: this.props.processes,
        processTasks: this.props.processTasks,
        deviceTasks: (0, _nullthrows().default)(this.props.deviceTasks.get(device.identifier)),
        goToRootPanel: this._goToRootPanel,
        toggleProcessPolling: this.props.toggleProcessPolling,
        isDeviceConnected: this.props.isDeviceConnected
      }));
    }

    return React.createElement("div", null, React.createElement(_Selectors().Selectors, {
      deviceType: this.props.deviceType,
      deviceTypes: this.props.deviceTypes,
      hosts: this.props.hosts,
      host: this.props.host,
      setDeviceType: this.props.setDeviceType,
      toggleDevicePolling: this.props.toggleDevicePolling,
      setHost: this.props.setHost,
      hostSelectorComponents: this._getHostSelectorComponents()
    }), this._getDeviceTypeComponents('above_table'), React.createElement("div", {
      className: "block"
    }, this._createDeviceTable()), this._getTasks(), this._getDeviceTypeComponents('below_table'));
  }

  render() {
    return React.createElement(_PanelComponentScroller().PanelComponentScroller, null, React.createElement("div", {
      className: "nuclide-device-panel-container"
    }, this._getInnerPanel()));
  }

}

exports.RootPanel = RootPanel;