Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _TaskButton2;

function _TaskButton() {
  return _TaskButton2 = require('./TaskButton');
}

var _TaskRunnerButton2;

function _TaskRunnerButton() {
  return _TaskRunnerButton2 = require('./TaskRunnerButton');
}

var _ProgressBar2;

function _ProgressBar() {
  return _ProgressBar2 = require('./ProgressBar');
}

var _getTask2;

function _getTask() {
  return _getTask2 = require('../getTask');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var Toolbar = (function (_React$Component) {
  _inherits(Toolbar, _React$Component);

  function Toolbar() {
    _classCallCheck(this, Toolbar);

    _get(Object.getPrototypeOf(Toolbar.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Toolbar, [{
    key: 'render',
    value: function render() {
      var _this = this;

      if (!this.props.visible) {
        return null;
      }

      var activeTaskId = this.props.activeTaskId;
      var activeTask = activeTaskId == null ? null : (0, (_getTask2 || _getTask()).getTask)(activeTaskId, this.props.tasks);

      var ExtraUi = this.props.getExtraUi && this.props.getExtraUi();
      var ActiveTaskRunnerIcon = this.props.getActiveTaskRunnerIcon();
      var FallbackIcon = function FallbackIcon() {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          null,
          activeTask && activeTask.taskRunnerName
        );
      };
      var IconComponent = ActiveTaskRunnerIcon || FallbackIcon;
      var ButtonComponent = function ButtonComponent(props) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement((_TaskRunnerButton2 || _TaskRunnerButton()).TaskRunnerButton, _extends({}, props, { iconComponent: IconComponent }));
      };

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-task-runner-toolbar' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-task-runner-toolbar-contents padded' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'inline-block' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_TaskButton2 || _TaskButton()).TaskButton, {
              activeTask: activeTask,
              buttonComponent: ButtonComponent,
              taskRunnerInfo: this.props.taskRunnerInfo,
              runTask: this.props.runTask,
              selectTask: this.props.selectTask,
              taskIsRunning: this.props.taskIsRunning,
              tasks: this.props.tasks
            })
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'inline-block' },
            (_reactForAtom2 || _reactForAtom()).React.createElement('button', {
              className: 'btn btn-sm icon icon-primitive-square',
              disabled: !this.props.taskIsRunning || !activeTask || activeTask.cancelable === false,
              onClick: function () {
                _this.props.stopTask();
              }
            })
          ),
          ExtraUi && activeTask ? (_reactForAtom2 || _reactForAtom()).React.createElement(ExtraUi, { activeTaskType: activeTask.type }) : null
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_ProgressBar2 || _ProgressBar()).ProgressBar, {
          progress: this.props.progress,
          visible: this.props.taskIsRunning
        })
      );
    }
  }, {
    key: '_renderIcon',
    value: function _renderIcon() {
      var ActiveTaskRunnerIcon = this.props.getActiveTaskRunnerIcon();
      if (ActiveTaskRunnerIcon == null) {
        return;
      }
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-task-runner-system-icon-wrapper inline-block' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(ActiveTaskRunnerIcon, null)
      );
    }
  }]);

  return Toolbar;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.Toolbar = Toolbar;