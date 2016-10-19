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

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeTasks;

function _load_commonsNodeTasks() {
  return _commonsNodeTasks = require('../../commons-node/tasks');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _uiCreateExtraUiComponent;

function _load_uiCreateExtraUiComponent() {
  return _uiCreateExtraUiComponent = require('./ui/createExtraUiComponent');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var ArcBuildSystem = (function () {
  function ArcBuildSystem() {
    _classCallCheck(this, ArcBuildSystem);

    this.id = 'arcanist';
    this._outputMessages = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._model = this._getModel();
    this.name = this._model.getName();
    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._outputMessages);
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
        this._tasks = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(this._model.getTaskList()), (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(this._model.onChange.bind(this._model)).map(function () {
          return _this._model.getTaskList();
        }));
      }
      return new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._tasks.subscribe({ next: cb }));
    }
  }, {
    key: 'getExtraUi',
    value: function getExtraUi() {
      if (this._extraUi == null) {
        this._extraUi = (0, (_uiCreateExtraUiComponent || _load_uiCreateExtraUiComponent()).createExtraUiComponent)(this._model);
      }
      return this._extraUi;
    }
  }, {
    key: 'getIcon',
    value: function getIcon() {
      return ArcIcon;
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
      return (0, (_commonsNodeTasks || _load_commonsNodeTasks()).taskFromObservable)(taskFunction());
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
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

var ArcIcon = function ArcIcon() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'span',
    null,
    'arc'
  );
};
module.exports = exports.default;