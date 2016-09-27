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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeTasks2;

function _commonsNodeTasks() {
  return _commonsNodeTasks2 = require('../../commons-node/tasks');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _uiHhvmIcon2;

function _uiHhvmIcon() {
  return _uiHhvmIcon2 = _interopRequireDefault(require('./ui/HhvmIcon'));
}

var _uiCreateExtraUiComponent2;

function _uiCreateExtraUiComponent() {
  return _uiCreateExtraUiComponent2 = require('./ui/createExtraUiComponent');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var HhvmBuildSystem = (function () {
  function HhvmBuildSystem() {
    _classCallCheck(this, HhvmBuildSystem);

    this.id = 'hhvm';
    this._outputMessages = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Subject();
    this._model = this._getModel();
    this.name = this._model.getName();
    this._disposables = new (_atom2 || _atom()).CompositeDisposable(new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(this._outputMessages));
  }

  _createClass(HhvmBuildSystem, [{
    key: 'setCwdApi',
    value: function setCwdApi(cwdApi) {
      this._cwdApi = cwdApi;
      this._model.setCwdApi(cwdApi);
    }
  }, {
    key: '_getModel',
    value: function _getModel() {
      var ArcToolbarModel = undefined;
      try {
        // $FlowFB
        ArcToolbarModel = require('./fb/FbArcToolbarModel').FbArcToolbarModel;
      } catch (_) {
        ArcToolbarModel = require('./ArcToolbarModel').ArcToolbarModel;
      }
      return new ArcToolbarModel(this._outputMessages);
    }
  }, {
    key: 'observeTaskList',
    value: function observeTaskList(cb) {
      var _this = this;

      if (this._tasks == null) {
        this._tasks = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(this._model.getTaskList()), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(this._model.onChange.bind(this._model)).map(function () {
          return _this._model.getTaskList();
        }));
      }
      return new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(this._tasks.subscribe({ next: cb }));
    }
  }, {
    key: 'getExtraUi',
    value: function getExtraUi() {
      if (this._extraUi == null) {
        this._extraUi = (0, (_uiCreateExtraUiComponent2 || _uiCreateExtraUiComponent()).createExtraUiComponent)(this._model);
      }
      return this._extraUi;
    }
  }, {
    key: 'getIcon',
    value: function getIcon() {
      return (_uiHhvmIcon2 || _uiHhvmIcon()).default;
    }
  }, {
    key: 'getOutputMessages',
    value: function getOutputMessages() {
      return this._outputMessages;
    }
  }, {
    key: 'runTask',
    value: function runTask(taskType) {
      if (!this._model.getTaskList().some(function (task) {
        return task.type === taskType;
      })) {
        throw new Error('There\'s no hhvm task named "' + taskType + '"');
      }

      var taskFunction = getTaskRunFunction(this._model, taskType);
      return (0, (_commonsNodeTasks2 || _commonsNodeTasks()).taskFromObservable)(taskFunction());
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return HhvmBuildSystem;
})();

exports.default = HhvmBuildSystem;

function getTaskRunFunction(model, taskType) {
  switch (taskType) {
    case 'build':
      return function () {
        return model.arcBuild();
      };
    default:
      throw new Error('Invalid task type: ' + taskType);
  }
}
module.exports = exports.default;