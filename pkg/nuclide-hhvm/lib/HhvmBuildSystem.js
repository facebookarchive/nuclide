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

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _commonsNodeTasks;

function _load_commonsNodeTasks() {
  return _commonsNodeTasks = require('../../commons-node/tasks');
}

var _nuclideUiBindObservableAsProps;

function _load_nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _HhvmIcon;

function _load_HhvmIcon() {
  return _HhvmIcon = _interopRequireDefault(require('./HhvmIcon'));
}

var _HhvmDebug;

function _load_HhvmDebug() {
  return _HhvmDebug = require('./HhvmDebug');
}

var _HhvmToolbar;

function _load_HhvmToolbar() {
  return _HhvmToolbar = _interopRequireDefault(require('./HhvmToolbar'));
}

var _ProjectStore;

function _load_ProjectStore() {
  return _ProjectStore = _interopRequireDefault(require('./ProjectStore'));
}

var HhvmBuildSystem = (function () {
  function HhvmBuildSystem() {
    _classCallCheck(this, HhvmBuildSystem);

    this.id = 'hhvm';
    this.name = 'HHVM';
    this._projectStore = new (_ProjectStore || _load_ProjectStore()).default();
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

      return new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(this.getTaskList()), (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(this._projectStore.onChange.bind(this._projectStore)).map(function () {
        return _this.getTaskList();
      })).subscribe(callback));
    }
  }, {
    key: 'getExtraUi',
    value: function getExtraUi() {
      if (this._extraUi == null) {
        var projectStore = this._projectStore;
        var subscription = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(projectStore.onChange.bind(projectStore));
        this._extraUi = (0, (_nuclideUiBindObservableAsProps || _load_nuclideUiBindObservableAsProps()).bindObservableAsProps)(subscription.startWith(null).mapTo({ projectStore: projectStore }), (_HhvmToolbar || _load_HhvmToolbar()).default);
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
      return (_HhvmIcon || _load_HhvmIcon()).default;
    }
  }, {
    key: 'runTask',
    value: function runTask(taskName) {
      return (0, (_commonsNodeTasks || _load_commonsNodeTasks()).taskFromObservable)((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise((0, (_HhvmDebug || _load_HhvmDebug()).debug)(this._projectStore.getDebugMode(), this._projectStore.getCurrentFilePath(), this._projectStore.getDebugTarget())).ignoreElements());
    }
  }, {
    key: 'setProjectRoot',
    value: function setProjectRoot(projectRoot) {
      this._projectStore.setProjectRoot(projectRoot == null ? null : projectRoot.getPath());
    }
  }]);

  return HhvmBuildSystem;
})();

exports.default = HhvmBuildSystem;
module.exports = exports.default;