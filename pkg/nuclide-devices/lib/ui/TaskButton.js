'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskButton = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _react = _interopRequireDefault(require('react'));

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

class TaskButton extends _react.default.Component {

  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = { isRunning: this.props.task.task.isRunning() };
    this._startTask = this._startTask.bind(this);
    this._cancelTask = this._cancelTask.bind(this);
    this._subscribeToTask();
  }

  _subscribeToTask() {
    const task = this.props.task;
    this._disposables.add(task.task.onDidComplete(() => {
      this.setState({ isRunning: false });
      atom.notifications.addSuccess(`Device task '${task.name}' succeeded.`);
    }));
    this._disposables.add(task.task.onDidError(() => {
      this.setState({ isRunning: false });
      atom.notifications.addError(`Device task '${task.name}' failed.`);
    }));
  }

  _getLabel() {
    const name = this.props.task.name;
    if (!this.state.isRunning) {
      return name;
    }
    return _react.default.createElement(
      'i',
      null,
      'Running \'',
      name,
      '\'... Click to cancel'
    );
  }

  _startTask() {
    this.props.task.task.start();
    this.setState({ isRunning: true });
  }

  _cancelTask() {
    this.props.task.task.cancel();
    this.setState({ isRunning: false });
    atom.notifications.addInfo(`Device task '${this.props.task.name}' was cancelled.`);
  }

  render() {
    return _react.default.createElement(
      (_Button || _load_Button()).Button,
      {
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        onClick: this.state.isRunning ? this._cancelTask : this._startTask,
        key: this.props.task.name },
      this._getLabel()
    );
  }
}
exports.TaskButton = TaskButton;