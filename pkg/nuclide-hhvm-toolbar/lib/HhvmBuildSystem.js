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

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
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

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var ArcBuildSystem = (function () {
  function ArcBuildSystem() {
    _classCallCheck(this, ArcBuildSystem);

    this.id = 'hhvm';
    this._model = this._getModel();
    this.name = this._model.getName();
  }

  _createClass(ArcBuildSystem, [{
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
        ArcToolbarModel = require('./fb/FbArcToolbarModel').FbArcToolbarModel;
      } catch (_) {
        ArcToolbarModel = require('./ArcToolbarModel').ArcToolbarModel;
      }
      return new ArcToolbarModel();
    }
  }, {
    key: 'observeTasks',
    value: function observeTasks(cb) {
      var _this = this;

      if (this._tasks == null) {
        this._tasks = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(this._model.getTasks()), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(this._model.onChange.bind(this._model)).map(function () {
          return _this._model.getTasks();
        }));
      }
      return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(this._tasks.subscribe({ next: cb }));
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
    key: 'runTask',
    value: function runTask(taskType) {
      if (!this._model.getTasks().some(function (task) {
        return task.type === taskType;
      })) {
        throw new Error('There\'s no hhvm task named "' + taskType + '"');
      }

      var run = getTaskRunFunction(this._model, taskType);
      var resultStream = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(run());

      // Currently, the `arc build` has no meaningul progress reporting,
      // So, we omit `observeProgress` and just use the indeterminate progress bar.
      return {
        cancel: function cancel() {
          // FIXME: How can we cancel tasks?
        },
        onDidError: function onDidError(cb) {
          return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(resultStream.subscribe({ error: cb }));
        },
        onDidComplete: function onDidComplete(cb) {
          return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(
          // Add an empty error handler to avoid the "Unhandled Error" message. (We're handling it
          // above via the onDidError interface.)
          resultStream.subscribe({ next: cb, error: function error() {} }));
        }
      };
    }
  }]);

  return ArcBuildSystem;
})();

exports.default = ArcBuildSystem;

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