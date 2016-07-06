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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _nuclideUiLibBindObservableAsProps2;

function _nuclideUiLibBindObservableAsProps() {
  return _nuclideUiLibBindObservableAsProps2 = require('../../nuclide-ui/lib/bindObservableAsProps');
}

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _getActiveBuildSystem2;

function _getActiveBuildSystem() {
  return _getActiveBuildSystem2 = require('./getActiveBuildSystem');
}

var _uiCreatePanelItem2;

function _uiCreatePanelItem() {
  return _uiCreatePanelItem2 = require('./ui/createPanelItem');
}

var _uiBuildToolbar2;

function _uiBuildToolbar() {
  return _uiBuildToolbar2 = require('./ui/BuildToolbar');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var Commands = (function () {
  function Commands(dispatch, getState) {
    _classCallCheck(this, Commands);

    this._dispatch = dispatch;
    this._getState = getState;

    this.runTask = this.runTask.bind(this);
    this.selectBuildSystem = this.selectBuildSystem.bind(this);
    this.selectTask = this.selectTask.bind(this);
    this.stopTask = this.stopTask.bind(this);
  }

  _createClass(Commands, [{
    key: 'createPanel',
    value: function createPanel(stateStream) {
      var _this = this;

      var props = stateStream.debounceTime(10).map(function (state) {
        var activeBuildSystem = (0, (_getActiveBuildSystem2 || _getActiveBuildSystem()).getActiveBuildSystem)(state);
        var getExtraUi = activeBuildSystem != null && activeBuildSystem.getExtraUi != null ? activeBuildSystem.getExtraUi.bind(activeBuildSystem) : null;
        return {
          buildSystemOptions: getBuildSystemOptions(state),
          activeBuildSystemId: activeBuildSystem && activeBuildSystem.id,
          getActiveBuildSystemIcon: function getActiveBuildSystemIcon() {
            return activeBuildSystem && activeBuildSystem.getIcon();
          },
          getExtraUi: getExtraUi,
          progress: state.taskStatus && state.taskStatus.progress,
          visible: state.visible,
          runTask: _this.runTask,
          activeTaskType: state.activeTaskType,
          selectBuildSystem: _this.selectBuildSystem,
          selectTask: _this.selectTask,
          stopTask: _this.stopTask,
          taskIsRunning: state.taskStatus != null,
          tasks: state.tasks
        };
      });

      var StatefulBuildToolbar = (0, (_nuclideUiLibBindObservableAsProps2 || _nuclideUiLibBindObservableAsProps()).bindObservableAsProps)(props, (_uiBuildToolbar2 || _uiBuildToolbar()).BuildToolbar);
      // $FlowIssue: bindObservableAsProps doesn't handle props exactly right.
      var item = (0, (_uiCreatePanelItem2 || _uiCreatePanelItem()).createPanelItem)((_reactForAtom2 || _reactForAtom()).React.createElement(StatefulBuildToolbar, null));
      var panel = atom.workspace.addTopPanel({ item: item });

      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).PANEL_CREATED,
        payload: { panel: panel }
      });
    }
  }, {
    key: 'destroyPanel',
    value: function destroyPanel() {
      var _getState = this._getState();

      var panel = _getState.panel;

      if (panel == null) {
        return;
      }
      panel.destroy();
      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).PANEL_DESTROYED,
        payload: { panel: panel }
      });
    }

    /**
     * Update the tasks to match the active build system.
     */
  }, {
    key: 'refreshTasks',
    value: function refreshTasks() {
      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).REFRESH_TASKS
      });
    }
  }, {
    key: 'registerBuildSystem',
    value: function registerBuildSystem(buildSystem) {
      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).REGISTER_BUILD_SYSTEM,
        payload: { buildSystem: buildSystem }
      });
    }
  }, {
    key: 'runTask',
    value: function runTask(taskType_) {
      var taskType = taskType_ || this._getState().activeTaskType;
      if (taskType == null) {
        return;
      }
      this.selectTask(taskType);
      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).RUN_TASK,
        payload: { taskType: taskType }
      });
    }
  }, {
    key: 'selectBuildSystem',
    value: function selectBuildSystem(id) {
      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).SELECT_BUILD_SYSTEM,
        payload: { id: id }
      });
    }
  }, {
    key: 'selectTask',
    value: function selectTask(taskType) {
      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).SELECT_TASK,
        payload: { taskType: taskType }
      });
    }
  }, {
    key: 'setToolbarVisibility',
    value: function setToolbarVisibility(visible) {
      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).TOOLBAR_VISIBILITY_UPDATED,
        payload: { visible: visible }
      });
    }
  }, {
    key: 'stopTask',
    value: function stopTask() {
      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).STOP_TASK
      });
    }
  }, {
    key: 'toggleToolbarVisibility',
    value: function toggleToolbarVisibility() {
      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).TOOLBAR_VISIBILITY_UPDATED,
        payload: {
          visible: !this._getState().visible
        }
      });
    }
  }, {
    key: 'unregisterBuildSystem',
    value: function unregisterBuildSystem(buildSystem) {
      this._dispatch({
        type: (_ActionTypes2 || _ActionTypes()).UNREGISTER_BUILD_SYSTEM,
        payload: {
          id: buildSystem.id
        }
      });
    }
  }]);

  return Commands;
})();

exports.Commands = Commands;

function getBuildSystemOptions(state) {
  // TODO: Sort alphabetically?
  return Array.from(state.buildSystems.values()).map(function (buildSystem) {
    return {
      value: buildSystem.id,
      label: buildSystem.name
    };
  });
}