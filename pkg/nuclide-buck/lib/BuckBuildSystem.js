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

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var _uiBuckIcon2;

function _uiBuckIcon() {
  return _uiBuckIcon2 = require('./ui/BuckIcon');
}

var _BuckToolbarStore2;

function _BuckToolbarStore() {
  return _BuckToolbarStore2 = _interopRequireDefault(require('./BuckToolbarStore'));
}

var _BuckToolbarActions2;

function _BuckToolbarActions() {
  return _BuckToolbarActions2 = _interopRequireDefault(require('./BuckToolbarActions'));
}

var _uiCreateExtraUiComponent2;

function _uiCreateExtraUiComponent() {
  return _uiCreateExtraUiComponent2 = require('./ui/createExtraUiComponent');
}

var _rxjs2;

function _rxjs() {
  return _rxjs2 = require('rxjs');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _flux2;

function _flux() {
  return _flux2 = require('flux');
}

var BuckBuildSystem = (function () {
  function BuckBuildSystem(initialState) {
    _classCallCheck(this, BuckBuildSystem);

    this.id = 'buck';
    this.name = 'Buck';
    this._initialState = initialState;
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
  }

  /**
   * BuckToolbarActions and BuckToolbarStore implement an older version of the Flux pattern which puts
   * a lot of the async work into the store. Therefore, it's not very easy to tie the action to the
   * result. To get around this without having to rewrite the whole thing in one go, we just use the
   * store API directly.
   */

  _createClass(BuckBuildSystem, [{
    key: 'observeTasks',
    value: function observeTasks(cb) {
      var _this = this;

      if (this._tasks == null) {
        (function () {
          var _getFlux2 = _this._getFlux();

          var store = _getFlux2.store;

          _this._tasks = (_rxjs2 || _rxjs()).Observable.concat((_rxjs2 || _rxjs()).Observable.of(store.getTasks()), (_nuclideCommons2 || _nuclideCommons()).event.observableFromSubscribeFunction(store.subscribe.bind(store)).map(function () {
            return store.getTasks();
          }));
        })();
      }
      return new (_nuclideCommons2 || _nuclideCommons()).DisposableSubscription(this._tasks.subscribe({ next: cb }));
    }
  }, {
    key: 'getExtraUi',
    value: function getExtraUi() {
      if (this._extraUi == null) {
        var _getFlux3 = this._getFlux();

        var _store = _getFlux3.store;
        var _actions = _getFlux3.actions;

        this._extraUi = (0, (_uiCreateExtraUiComponent2 || _uiCreateExtraUiComponent()).createExtraUiComponent)(_store, _actions);
      }
      return this._extraUi;
    }
  }, {
    key: 'getIcon',
    value: function getIcon() {
      if (this._icon == null) {
        this._icon = (_uiBuckIcon2 || _uiBuckIcon()).BuckIcon;
      }
      return this._icon;
    }

    /**
     * Lazily create the flux stuff.
     */
  }, {
    key: '_getFlux',
    value: function _getFlux() {
      if (this._flux == null) {
        // Set up flux stuff.
        var dispatcher = new (_flux2 || _flux()).Dispatcher();
        var flux = {
          store: new (_BuckToolbarStore2 || _BuckToolbarStore()).default(dispatcher, this._initialState),
          actions: new (_BuckToolbarActions2 || _BuckToolbarActions()).default(dispatcher)
        };
        this._disposables.add(flux.store);
        this._flux = flux;
      }
      return this._flux;
    }
  }, {
    key: 'runTask',
    value: function runTask(taskType) {
      var _getFlux4 = this._getFlux();

      var store = _getFlux4.store;

      if (!store.getTasks().some(function (task) {
        return task.type === taskType;
      })) {
        throw new Error('There\'s no Buck task named "' + taskType + '"');
      }

      var run = getTaskRunFunction(store, taskType);
      var resultStream = (_rxjs2 || _rxjs()).Observable.fromPromise(run());

      // Currently, the BuckToolbarStore's progress reporting is pretty useless so we omit
      // `observeProgress` and just use the indeterminate progress bar.
      return {
        cancel: function cancel() {
          // FIXME: How can we cancel Buck tasks?
        },
        onDidError: function onDidError(cb) {
          return new (_nuclideCommons2 || _nuclideCommons()).DisposableSubscription(resultStream.subscribe({ error: cb }));
        },
        onDidComplete: function onDidComplete(cb) {
          return new (_nuclideCommons2 || _nuclideCommons()).DisposableSubscription(
          // Add an empty error handler to avoid the "Unhandled Error" message. (We're handling it
          // above via the onDidError interface.)
          resultStream.subscribe({ next: cb, error: function error() {} }));
        }
      };
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      // If we haven't had to load and create the Flux stuff yet, don't do it now.
      if (this._flux == null) {
        return;
      }
      var store = this._flux.store;

      return {
        buildTarget: store.getBuildTarget(),
        isReactNativeServerMode: store.isReactNativeServerMode()
      };
    }
  }]);

  return BuckBuildSystem;
})();

exports.BuckBuildSystem = BuckBuildSystem;
function getTaskRunFunction(store, taskType) {
  switch (taskType) {
    case 'build':
      return function () {
        return store._doBuild('build', false);
      };
    case 'run':
      return function () {
        return store._doBuild('install', false);
      };
    case 'test':
      return function () {
        return store._doBuild('test', false);
      };
    case 'debug':
      return function () {
        return store._doDebug();
      };
    default:
      throw new Error('Invalid task type: ' + taskType);
  }
}