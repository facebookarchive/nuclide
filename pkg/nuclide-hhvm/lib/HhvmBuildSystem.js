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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _commonsAtomHhvmIcon2;

function _commonsAtomHhvmIcon() {
  return _commonsAtomHhvmIcon2 = _interopRequireDefault(require('../../commons-atom/HhvmIcon'));
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _commonsNodeTasks2;

function _commonsNodeTasks() {
  return _commonsNodeTasks2 = require('../../commons-node/tasks');
}

var _nuclideUiBindObservableAsProps2;

function _nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps2 = require('../../nuclide-ui/bindObservableAsProps');
}

var _HhvmDebug2;

function _HhvmDebug() {
  return _HhvmDebug2 = require('./HhvmDebug');
}

var _HhvmToolbar2;

function _HhvmToolbar() {
  return _HhvmToolbar2 = _interopRequireDefault(require('./HhvmToolbar'));
}

var _ProjectStore2;

function _ProjectStore() {
  return _ProjectStore2 = _interopRequireDefault(require('./ProjectStore'));
}

var HhvmBuildSystem = (function () {
  function HhvmBuildSystem() {
    _classCallCheck(this, HhvmBuildSystem);

    this.id = 'hhvm';
    this.name = 'HHVM';
    this._projectStore = new (_ProjectStore2 || _ProjectStore()).default();
  }

  _createClass(HhvmBuildSystem, [{
    key: 'dispose',
    value: function dispose() {
      this._projectStore.dispose();
    }
  }, {
    key: 'observeTaskList',
    value: function observeTaskList(callback) {
      var _this = this;

      return new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(this.getTaskList()), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(this._projectStore.onChange.bind(this._projectStore)).map(function () {
        return _this.getTaskList();
      })).subscribe(callback));
    }
  }, {
    key: 'getExtraUi',
    value: function getExtraUi() {
      if (this._extraUi == null) {
        var projectStore = this._projectStore;
        var subscription = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(projectStore.onChange.bind(projectStore));
        this._extraUi = (0, (_nuclideUiBindObservableAsProps2 || _nuclideUiBindObservableAsProps()).bindObservableAsProps)(subscription.startWith(null).mapTo({ projectStore: projectStore }), (_HhvmToolbar2 || _HhvmToolbar()).default);
      }
      return this._extraUi;
    }
  }, {
    key: 'getTaskList',
    value: function getTaskList() {
      var disabled = this._projectStore.getProjectType() !== 'Hhvm';
      return [{
        type: 'debug',
        label: 'Debug',
        description: 'Debug a HHVM project',
        disabled: disabled,
        priority: 1, // Take precedence over the Arcanist build toolbar.
        runnable: !disabled,
        cancelable: false,
        icon: 'plug'
      }];
    }
  }, {
    key: 'getIcon',
    value: function getIcon() {
      return (_commonsAtomHhvmIcon2 || _commonsAtomHhvmIcon()).default;
    }
  }, {
    key: 'runTask',
    value: function runTask(taskName) {
      return (0, (_commonsNodeTasks2 || _commonsNodeTasks()).taskFromObservable)((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise((0, (_HhvmDebug2 || _HhvmDebug()).debug)(this._projectStore.getDebugMode(), this._projectStore.getCurrentFilePath(), this._projectStore.getDebugTarget())).ignoreElements());
    }
  }, {
    key: 'setProjectRoot',
    value: function setProjectRoot(projectRoot) {
      // TODO: ProjectStore should use the CWD rather than the current file.
    }
  }]);

  return HhvmBuildSystem;
})();

exports.default = HhvmBuildSystem;
module.exports = exports.default;