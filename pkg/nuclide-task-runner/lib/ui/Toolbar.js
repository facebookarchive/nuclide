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

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
}

var _CommonControls;

function _load_CommonControls() {
  return _CommonControls = require('./CommonControls');
}

var _ProgressBar;

function _load_ProgressBar() {
  return _ProgressBar = require('./ProgressBar');
}

var _getTaskMetadata;

function _load_getTaskMetadata() {
  return _getTaskMetadata = require('../getTaskMetadata');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Toolbar extends _reactForAtom.React.Component {

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
        'No Task Selected'
      );
    }
  }

  _renderContents(activeTask) {
    if (this.props.showPlaceholder) {
      return _reactForAtom.React.createElement(Placeholder, null);
    }

    return _reactForAtom.React.createElement(
      'div',
      { style: { display: 'flex', flex: 1 } },
      _reactForAtom.React.createElement((_CommonControls || _load_CommonControls()).CommonControls, {
        activeTask: activeTask,
        getActiveTaskRunnerIcon: this.props.getActiveTaskRunnerIcon,
        taskRunnerInfo: this.props.taskRunnerInfo,
        runTask: this.props.runTask,
        selectTask: this.props.selectTask,
        taskIsRunning: this.props.taskIsRunning,
        taskLists: this.props.taskLists,
        stopTask: this.props.stopTask
      }),
      this._renderExtraUi(),
      _reactForAtom.React.createElement((_ProgressBar || _load_ProgressBar()).ProgressBar, {
        progress: this.props.progress,
        visible: this.props.taskIsRunning
      })
    );
  }

  render() {
    const activeTaskId = this.props.activeTaskId;
    const activeTask = activeTaskId == null ? null : (0, (_getTaskMetadata || _load_getTaskMetadata()).getTaskMetadata)(activeTaskId, this.props.taskLists);

    const className = (0, (_classnames || _load_classnames()).default)('nuclide-task-runner-toolbar', {
      disabled: this.props.disabled
    });

    return _reactForAtom.React.createElement(
      'div',
      { className: className },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-task-runner-toolbar-contents padded' },
        this._renderContents(activeTask)
      )
    );
  }

}

exports.Toolbar = Toolbar;
function Placeholder() {
  return (
    // Themes actually change the size of UI elements (sometimes even dynamically!) and can
    // therefore change the size of the toolbar! To try to ensure that the placholder has the same
    // height as the toolbar, we put a dummy button in it and hide it with CSS.
    _reactForAtom.React.createElement(
      (_Button || _load_Button()).Button,
      {
        className: 'nuclide-task-runner-placeholder',
        size: (_Button || _load_Button()).ButtonSizes.SMALL },
      'Seeing this button is a bug!'
    )
  );
}