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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiLibSplitButtonDropdown2;

function _nuclideUiLibSplitButtonDropdown() {
  return _nuclideUiLibSplitButtonDropdown2 = require('../../../nuclide-ui/lib/SplitButtonDropdown');
}

var _BuildSystemButton2;

function _BuildSystemButton() {
  return _BuildSystemButton2 = require('./BuildSystemButton');
}

var _ProgressBar2;

function _ProgressBar() {
  return _ProgressBar2 = require('./ProgressBar');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var BuildToolbar = (function (_React$Component) {
  _inherits(BuildToolbar, _React$Component);

  function BuildToolbar() {
    _classCallCheck(this, BuildToolbar);

    _get(Object.getPrototypeOf(BuildToolbar.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(BuildToolbar, [{
    key: 'render',
    value: function render() {
      var _this = this;

      if (!this.props.visible || this.props.activeBuildSystemId == null) {
        return null;
      }

      // If there are no tasks, just show "Run" (but have it disabled). It's just less weird than
      // some kind of placeholder.
      var taskOptions = this.props.tasks.length === 0 ? [{ value: null, label: 'Run', icon: 'triangle-right' }] : this.props.tasks.map(function (task) {
        return {
          value: task.type,
          label: task.label,
          icon: task.icon
        };
      });

      var activeBuildSystemIcon = this.props.getActiveBuildSystemIcon();
      // Default to the first task if no task is currently active.
      var activeTaskType = this.props.activeTaskType || this.props.tasks[0] && this.props.tasks[0].type;
      var activeTask = this.props.tasks.find(function (task) {
        return task.type === activeTaskType;
      });
      var ExtraUi = this.props.getExtraUi && this.props.getExtraUi();

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-build-toolbar' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-build-toolbar-contents padded' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_BuildSystemButton2 || _BuildSystemButton()).BuildSystemButton, {
            icon: activeBuildSystemIcon,
            value: this.props.activeBuildSystemId,
            options: this.props.buildSystemOptions,
            disabled: this.props.taskIsRunning,
            onChange: function (value) {
              _this.props.selectBuildSystem(value);
            }
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'inline-block' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibSplitButtonDropdown2 || _nuclideUiLibSplitButtonDropdown()).SplitButtonDropdown, {
              value: activeTaskType,
              options: taskOptions,
              onChange: function (value) {
                _this.props.selectTask(value);
              },
              onConfirm: function () {
                _this.props.runTask(activeTaskType);
              },
              confirmDisabled: this.props.taskIsRunning || !activeTask || !activeTask.enabled,
              changeDisabled: this.props.taskIsRunning
            })
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'inline-block' },
            (_reactForAtom2 || _reactForAtom()).React.createElement('button', {
              className: 'btn icon icon-primitive-square',
              disabled: !this.props.taskIsRunning || !activeTask || activeTask.cancelable === false,
              onClick: function () {
                _this.props.stopTask();
              }
            })
          ),
          ExtraUi ? (_reactForAtom2 || _reactForAtom()).React.createElement(ExtraUi, null) : null
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_ProgressBar2 || _ProgressBar()).ProgressBar, {
          progress: this.props.progress,
          visible: this.props.taskIsRunning
        })
      );
    }
  }]);

  return BuildToolbar;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.BuildToolbar = BuildToolbar;