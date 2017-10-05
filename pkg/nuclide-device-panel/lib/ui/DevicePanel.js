'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePanel = undefined;

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _DeviceTask;

function _load_DeviceTask() {
  return _DeviceTask = require('../DeviceTask');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _react = _interopRequireWildcard(require('react'));

var _InfoTable;

function _load_InfoTable() {
  return _InfoTable = require('./InfoTable');
}

var _ProcessTable;

function _load_ProcessTable() {
  return _ProcessTable = require('./ProcessTable');
}

var _TaskButton;

function _load_TaskButton() {
  return _TaskButton = require('./TaskButton');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class DevicePanel extends _react.Component {
  _createInfoTables() {
    if (this.props.infoTables.isError) {
      return [_react.createElement(
        'div',
        { className: 'block', key: 'infoTableError' },

        // $FlowFixMe
        this.props.infoTables.error
      )];
    } else if (this.props.infoTables.isPending) {
      return [_react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'EXTRA_SMALL', key: 'infoTableLoading' })];
    } else {
      return Array.from(this.props.infoTables.value.entries()).map(([title, infoTable]) => _react.createElement(
        'div',
        { className: 'block', key: title },
        _react.createElement((_InfoTable || _load_InfoTable()).InfoTable, { title: title, table: infoTable })
      ));
    }
  }

  _createProcessTable() {
    return _react.createElement(
      'div',
      { className: 'block', key: 'process-table' },
      _react.createElement((_ProcessTable || _load_ProcessTable()).ProcessTable, {
        processes: this.props.processes,
        processTasks: this.props.processTasks,
        toggleProcessPolling: this.props.toggleProcessPolling
      })
    );
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
      const StreamedTaskButton = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(task.getTaskEvents().distinctUntilChanged().map(taskEvent => this._taskEventsToProps(task, taskEvent)), (_TaskButton || _load_TaskButton()).TaskButton);
      return _react.createElement(StreamedTaskButton, { key: task.getName() });
    });
    return _react.createElement(
      'div',
      { className: 'block nuclide-device-panel-tasks-container' },
      tasks
    );
  }

  _getBackButton() {
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'span',
        null,
        _react.createElement(
          'a',
          {
            className: 'nuclide-device-panel-text-with-icon',
            onClick: () => this.props.goToRootPanel() },
          _react.createElement(
            (_Icon || _load_Icon()).Icon,
            { icon: 'chevron-left' },
            'Choose another device'
          )
        )
      )
    );
  }
  _getStatus() {
    if (this.props.isDeviceConnected) {
      return null;
    }

    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'span',
        { className: 'nuclide-device-panel-text-with-icon nuclide-device-panel-disconnected-icon' },
        _react.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'primitive-dot' },
          'Disconnected'
        )
      )
    );
  }

  render() {
    return _react.createElement(
      'div',
      null,
      this._getBackButton(),
      this._getStatus(),
      this._getTasks(),
      this._createInfoTables(),
      this._createProcessTable()
    );
  }
}
exports.DevicePanel = DevicePanel;