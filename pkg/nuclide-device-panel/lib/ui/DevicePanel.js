"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePanel = void 0;

function _bindObservableAsProps() {
  const data = require("../../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _AppInfoTable() {
  const data = require("./AppInfoTable");

  _AppInfoTable = function () {
    return data;
  };

  return data;
}

function _InfoTable() {
  const data = require("./InfoTable");

  _InfoTable = function () {
    return data;
  };

  return data;
}

function _ProcessTable() {
  const data = require("./ProcessTable");

  _ProcessTable = function () {
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

function _LoadingSpinner() {
  const data = require("../../../../modules/nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

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
class DevicePanel extends React.Component {
  _createInfoTables() {
    if (this.props.infoTables.isError) {
      return [React.createElement("div", {
        className: "block",
        key: "infoTableError"
      }, // $FlowFixMe
      this.props.infoTables.error)];
    } else if (this.props.infoTables.isPending) {
      return [React.createElement(_LoadingSpinner().LoadingSpinner, {
        size: "EXTRA_SMALL",
        key: "infoTableLoading"
      })];
    } else {
      return Array.from(this.props.infoTables.value.entries()).map(([title, infoTable]) => React.createElement("div", {
        className: "block",
        key: title
      }, React.createElement(_InfoTable().InfoTable, {
        title: title,
        table: infoTable
      })));
    }
  }

  _createAppInfoTables() {
    const appInfoTables = this.props.appInfoTables;

    if (appInfoTables.isError) {
      return [React.createElement("div", {
        className: "block",
        key: "infoTableError"
      }, // $FlowFixMe
      appInfoTables.error)];
    } else if (appInfoTables.isPending) {
      return [React.createElement(_LoadingSpinner().LoadingSpinner, {
        size: "EXTRA_SMALL",
        key: "infoTableLoading"
      })];
    } else {
      return Array.from(appInfoTables.value.entries()).map(([appName, appInfoRows]) => React.createElement("div", {
        className: "block",
        key: appName
      }, React.createElement(_AppInfoTable().AppInfoTable, {
        title: appName,
        rows: appInfoRows
      })));
    }
  }

  _createProcessTable() {
    return React.createElement("div", {
      className: "block",
      key: "process-table"
    }, React.createElement(_ProcessTable().ProcessTable, {
      processes: this.props.processes,
      processTasks: this.props.processTasks,
      toggleProcessPolling: this.props.toggleProcessPolling
    }));
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
    const tasks = Array.from(this.props.deviceTasks).map(task => {
      const StreamedTaskButton = (0, _bindObservableAsProps().bindObservableAsProps)(task.getTaskEvents().distinctUntilChanged().map(taskEvent => this._taskEventsToProps(task, taskEvent)), _TaskButton().TaskButton);
      return React.createElement(StreamedTaskButton, {
        key: task.getName()
      });
    });
    return React.createElement("div", {
      className: "block nuclide-device-panel-tasks-container"
    }, tasks);
  }

  _getBackButton() {
    return React.createElement("div", {
      className: "block"
    }, React.createElement("span", null, React.createElement("a", {
      className: "nuclide-device-panel-text-with-icon",
      onClick: () => this.props.goToRootPanel()
    }, React.createElement(_Icon().Icon, {
      icon: "chevron-left"
    }, "Choose another device"))));
  }

  _getStatus() {
    if (this.props.isDeviceConnected) {
      return null;
    }

    return React.createElement("div", {
      className: "block"
    }, React.createElement("span", {
      className: "nuclide-device-panel-text-with-icon nuclide-device-panel-disconnected-icon"
    }, React.createElement(_Icon().Icon, {
      icon: "primitive-dot"
    }, "Disconnected")));
  }

  render() {
    return React.createElement("div", null, this._getBackButton(), this._getStatus(), this._getTasks(), this._createInfoTables(), this._createAppInfoTables(), this._createProcessTable());
  }

}

exports.DevicePanel = DevicePanel;