'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RootPanel = undefined;

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../../../modules/nuclide-commons-ui/bindObservableAsProps');
}

var _TaskButton;

function _load_TaskButton() {
  return _TaskButton = require('./TaskButton');
}

var _react = _interopRequireWildcard(require('react'));

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('../../../../modules/nuclide-commons-ui/PanelComponentScroller');
}

var _Selectors;

function _load_Selectors() {
  return _Selectors = require('./Selectors');
}

var _DeviceTable;

function _load_DeviceTable() {
  return _DeviceTable = require('./DeviceTable');
}

var _DevicePanel;

function _load_DevicePanel() {
  return _DevicePanel = require('./DevicePanel');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class RootPanel extends _react.Component {
  constructor(props) {
    super(props);

    this._getHostSelectorComponents = () => {
      return this.props.deviceTypeComponents.get('host_selector') || (_immutable || _load_immutable()).List();
    };

    this._getDeviceTypeComponents = position => {
      const components = this.props.deviceTypeComponents.get(position);
      if (components == null) {
        return null;
      }
      const nodes = components.map(component => {
        const Type = component.type;
        return _react.createElement(Type, { key: component.key });
      });

      return _react.createElement(
        'div',
        { className: `block nuclide-device-panel-components-${position}` },
        nodes
      );
    };

    this._goToRootPanel = () => {
      this.props.setDevice(null);
    };

    if (!(props.hosts.length > 0)) {
      throw new Error('Invariant violation: "props.hosts.length > 0"');
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
    return _react.createElement((_DeviceTable || _load_DeviceTable()).DeviceTable, {
      devices: this.props.devices,
      device: this.props.device,
      setDevice: this.props.setDevice
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
      const StreamedTaskButton = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(task.getTaskEvents().distinctUntilChanged().map(taskEvent => this._taskEventsToProps(task, taskEvent)), (_TaskButton || _load_TaskButton()).TaskButton);
      return _react.createElement(StreamedTaskButton, { key: task.getName() });
    });
    if (tasks.length < 1) {
      return null;
    }
    return _react.createElement(
      'div',
      { className: 'block nuclide-device-panel-tasks-container' },
      tasks
    );
  }

  _getInnerPanel() {
    if (this.props.device != null) {
      return _react.createElement(
        'div',
        { className: 'block' },
        _react.createElement((_DevicePanel || _load_DevicePanel()).DevicePanel, {
          infoTables: this.props.infoTables,
          appInfoTables: this.props.appInfoTables,
          processes: this.props.processes,
          processTasks: this.props.processTasks,
          deviceTasks: this.props.deviceTasks,
          goToRootPanel: this._goToRootPanel,
          toggleProcessPolling: this.props.toggleProcessPolling,
          isDeviceConnected: this.props.isDeviceConnected
        })
      );
    }

    return _react.createElement(
      'div',
      null,
      _react.createElement((_Selectors || _load_Selectors()).Selectors, {
        deviceType: this.props.deviceType,
        deviceTypes: this.props.deviceTypes,
        hosts: this.props.hosts,
        host: this.props.host,
        setDeviceType: this.props.setDeviceType,
        toggleDevicePolling: this.props.toggleDevicePolling,
        setHost: this.props.setHost,
        hostSelectorComponents: this._getHostSelectorComponents()
      }),
      this._getDeviceTypeComponents('above_table'),
      _react.createElement(
        'div',
        { className: 'block' },
        this._createDeviceTable()
      ),
      this._getTasks(),
      this._getDeviceTypeComponents('below_table')
    );
  }

  render() {
    return _react.createElement(
      (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
      null,
      _react.createElement(
        'div',
        { className: 'nuclide-device-panel-container' },
        this._getInnerPanel()
      )
    );
  }
}
exports.RootPanel = RootPanel; /**
                                * Copyright (c) 2015-present, Facebook, Inc.
                                * All rights reserved.
                                *
                                * This source code is licensed under the license found in the LICENSE file in
                                * the root directory of this source tree.
                                *
                                * 
                                * @format
                                */