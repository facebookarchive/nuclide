'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Toolbar = undefined;

var _TaskButton;

function _load_TaskButton() {
  return _TaskButton = require('./TaskButton');
}

var _ProgressBar;

function _load_ProgressBar() {
  return _ProgressBar = require('./ProgressBar');
}

var _getTaskMetadata;

function _load_getTaskMetadata() {
  return _getTaskMetadata = require('../getTaskMetadata');
}

var _reactForAtom = require('react-for-atom');

let Toolbar = exports.Toolbar = class Toolbar extends _reactForAtom.React.Component {

  _renderExtraUi() {
    if (this.props.activeTaskId) {
      const ExtraUi = this.props.getExtraUi && this.props.getExtraUi();
      return ExtraUi ? _reactForAtom.React.createElement(ExtraUi, { activeTaskType: this.props.activeTaskId.type }) : null;
    }
    const runnerCount = this.props.taskRunnerInfo.length;
    if (runnerCount === 0) {
      return _reactForAtom.React.createElement(
        'span',
        null,
        'Please install and enable a task runner'
      );
    } else {
      const waitingForTasks = !Array.from(this.props.taskLists.values()).some(taskList => taskList.length > 0);
      if (waitingForTasks) {
        if (runnerCount === 1) {
          const runnerName = this.props.taskRunnerInfo[0].name;
          return _reactForAtom.React.createElement(
            'span',
            null,
            'Waiting for tasks from ',
            runnerName,
            '...'
          );
        }
        return _reactForAtom.React.createElement(
          'span',
          null,
          'Waiting for tasks from ',
          runnerCount,
          ' task runners...'
        );
      }
      return _reactForAtom.React.createElement(
        'span',
        null,
        'No available tasks'
      );
    }
  }

  render() {
    const activeTaskId = this.props.activeTaskId;
    const activeTask = activeTaskId == null ? null : (0, (_getTaskMetadata || _load_getTaskMetadata()).getTaskMetadata)(activeTaskId, this.props.taskLists);

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-task-runner-toolbar' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-task-runner-toolbar-contents padded' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'inline-block' },
          _reactForAtom.React.createElement((_TaskButton || _load_TaskButton()).TaskButton, {
            activeTask: activeTask,
            getActiveTaskRunnerIcon: this.props.getActiveTaskRunnerIcon,
            taskRunnerInfo: this.props.taskRunnerInfo,
            runTask: this.props.runTask,
            selectTask: this.props.selectTask,
            taskIsRunning: this.props.taskIsRunning,
            taskLists: this.props.taskLists
          })
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'inline-block' },
          _reactForAtom.React.createElement('button', {
            className: 'btn btn-sm icon icon-primitive-square',
            disabled: !this.props.taskIsRunning || !activeTask || activeTask.cancelable === false,
            onClick: () => {
              this.props.stopTask();
            }
          })
        ),
        this._renderExtraUi()
      ),
      _reactForAtom.React.createElement((_ProgressBar || _load_ProgressBar()).ProgressBar, {
        progress: this.props.progress,
        visible: this.props.taskIsRunning
      })
    );
  }

};