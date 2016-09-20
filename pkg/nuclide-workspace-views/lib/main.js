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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsAtomSyncAtomCommands2;

function _commonsAtomSyncAtomCommands() {
  return _commonsAtomSyncAtomCommands2 = _interopRequireDefault(require('../../commons-atom/sync-atom-commands'));
}

var _commonsNodeReduxObservable2;

function _commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable2 = require('../../commons-node/redux-observable');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _AppSerialization2;

function _AppSerialization() {
  return _AppSerialization2 = _interopRequireWildcard(require('./AppSerialization'));
}

var _reduxActions2;

function _reduxActions() {
  return _reduxActions2 = _interopRequireWildcard(require('./redux/Actions'));
}

var _reduxEpics2;

function _reduxEpics() {
  return _reduxEpics2 = _interopRequireWildcard(require('./redux/Epics'));
}

var _reduxReducers2;

function _reduxReducers() {
  return _reduxReducers2 = _interopRequireWildcard(require('./redux/Reducers'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _redux2;

function _redux() {
  return _redux2 = require('redux');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var Activation = (function () {
  function Activation(rawState) {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._rawState = rawState;
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: '_getStore',
    value: function _getStore() {
      if (this._store == null) {
        var _createPackageStore = createPackageStore(this._rawState || {});

        var store = _createPackageStore.store;
        var disposables = _createPackageStore.disposables;

        this._rawState = null;
        this._store = store;
        this._disposables.add(disposables);
      }
      return this._store;
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return (_AppSerialization2 || _AppSerialization()).serialize(this._store.getState());
    }
  }, {
    key: 'provideWorkspaceViewsService',
    value: function provideWorkspaceViewsService() {
      var pkg = this; // eslint-disable-line consistent-this
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        pkg = null;
      }));

      return {
        registerFactory: function registerFactory(viewableFactory) {
          (0, (_assert2 || _assert()).default)(pkg != null, 'Viewables API used after deactivation');
          pkg._getStore().dispatch((_reduxActions2 || _reduxActions()).registerViewableFactory(viewableFactory));
          return new (_atom2 || _atom()).Disposable(function () {
            if (pkg != null) {
              pkg._getStore().dispatch((_reduxActions2 || _reduxActions()).unregisterViewableFactory(viewableFactory.id));
            }
          });
        },
        registerLocation: function registerLocation(locationFactory) {
          (0, (_assert2 || _assert()).default)(pkg != null, 'Viewables API used after deactivation');
          pkg._getStore().dispatch((_reduxActions2 || _reduxActions()).registerLocationFactory(locationFactory));
          return new (_atom2 || _atom()).Disposable(function () {
            if (pkg != null) {
              pkg._getStore().dispatch((_reduxActions2 || _reduxActions()).unregisterLocation(locationFactory.id));
            }
          });
        },
        getViewableFactories: function getViewableFactories(location) {
          (0, (_assert2 || _assert()).default)(pkg != null, 'Viewables API used after deactivation');
          return Array.from(pkg._getStore().getState().viewableFactories.values());
        },
        observeViewableFactories: function observeViewableFactories(location, cb) {
          (0, (_assert2 || _assert()).default)(pkg != null, 'Viewables API used after deactivation');
          return new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(
          // $FlowFixMe: Teach flow about Symbol.observable
          (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(pkg._getStore()).map(function (state) {
            return state.viewableFactories;
          }).distinctUntilChanged().map(function (viewableFactories) {
            return new Set(viewableFactories.values());
          }).subscribe(cb));
        }
      };
    }
  }]);

  return Activation;
})();

function createPackageStore(rawState) {
  var initialState = (_AppSerialization2 || _AppSerialization()).deserialize(rawState);
  var epics = Object.keys(_reduxEpics2 || _reduxEpics()).map(function (k) {
    return (_reduxEpics2 || _reduxEpics())[k];
  }).filter(function (epic) {
    return typeof epic === 'function';
  });
  var rootEpic = function rootEpic(actions, store) {
    return (0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray(epics))(actions, store)
    // Log errors and continue.
    .catch(function (err, stream) {
      (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error(err);
      return stream;
    });
  };
  var store = (0, (_redux2 || _redux()).createStore)((0, (_redux2 || _redux()).combineReducers)(_reduxReducers2 || _reduxReducers()), initialState, (0, (_redux2 || _redux()).applyMiddleware)((0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).createEpicMiddleware)(rootEpic)));

  var states = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(store);

  // Add a toggle command for every viewable provider. We avoid debouncing here so that commands
  // will immediately be available to packages after they register themselves.
  var disposables = new (_atom2 || _atom()).CompositeDisposable((0, (_commonsAtomSyncAtomCommands2 || _commonsAtomSyncAtomCommands()).default)(states.map(function (state) {
    return state.viewableFactories;
  }).distinctUntilChanged().map(function (viewableFactories) {
    return new Set(Array.from(viewableFactories.values()).filter(function (viewableFactory) {
      return viewableFactory.toggleCommand != null;
    }));
  }), function (viewableFactory) {
    return {
      'atom-workspace': _defineProperty({}, viewableFactory.toggleCommand, function (event) {
        var visible = event.detail == null ? undefined : event.detail.visible;
        store.dispatch((_reduxActions2 || _reduxActions()).toggleItemVisibility(viewableFactory.id, visible));
      })
    };
  }));

  return { store: store, disposables: disposables };
}

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;