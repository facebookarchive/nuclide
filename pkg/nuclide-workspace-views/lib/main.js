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

var _commonsAtomCreatePackage;

function _load_commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsAtomSyncAtomCommands;

function _load_commonsAtomSyncAtomCommands() {
  return _commonsAtomSyncAtomCommands = _interopRequireDefault(require('../../commons-atom/sync-atom-commands'));
}

var _commonsNodeReduxObservable;

function _load_commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable = require('../../commons-node/redux-observable');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _AppSerialization;

function _load_AppSerialization() {
  return _AppSerialization = _interopRequireWildcard(require('./AppSerialization'));
}

var _reduxActions;

function _load_reduxActions() {
  return _reduxActions = _interopRequireWildcard(require('./redux/Actions'));
}

var _reduxEpics;

function _load_reduxEpics() {
  return _reduxEpics = _interopRequireWildcard(require('./redux/Epics'));
}

var _reduxReducers;

function _load_reduxReducers() {
  return _reduxReducers = _interopRequireWildcard(require('./redux/Reducers'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var Activation = (function () {
  function Activation(rawState) {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom || _load_atom()).CompositeDisposable();
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
      return (_AppSerialization || _load_AppSerialization()).serialize(this._store.getState());
    }
  }, {
    key: 'provideWorkspaceViewsService',
    value: function provideWorkspaceViewsService() {
      var pkg = this; // eslint-disable-line consistent-this
      this._disposables.add(new (_atom || _load_atom()).Disposable(function () {
        pkg = null;
      }));

      return {
        registerFactory: function registerFactory(viewableFactory) {
          (0, (_assert || _load_assert()).default)(pkg != null, 'Viewables API used after deactivation');
          pkg._getStore().dispatch((_reduxActions || _load_reduxActions()).registerViewableFactory(viewableFactory));
          return new (_atom || _load_atom()).Disposable(function () {
            if (pkg != null) {
              pkg._getStore().dispatch((_reduxActions || _load_reduxActions()).unregisterViewableFactory(viewableFactory.id));
            }
          });
        },
        registerLocation: function registerLocation(locationFactory) {
          (0, (_assert || _load_assert()).default)(pkg != null, 'Viewables API used after deactivation');
          pkg._getStore().dispatch((_reduxActions || _load_reduxActions()).registerLocationFactory(locationFactory));
          return new (_atom || _load_atom()).Disposable(function () {
            if (pkg != null) {
              pkg._getStore().dispatch((_reduxActions || _load_reduxActions()).unregisterLocation(locationFactory.id));
            }
          });
        },
        getViewableFactories: function getViewableFactories(location) {
          (0, (_assert || _load_assert()).default)(pkg != null, 'Viewables API used after deactivation');
          return Array.from(pkg._getStore().getState().viewableFactories.values());
        },
        observeViewableFactories: function observeViewableFactories(location, cb) {
          (0, (_assert || _load_assert()).default)(pkg != null, 'Viewables API used after deactivation');
          return new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(
          // $FlowFixMe: Teach flow about Symbol.observable
          (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(pkg._getStore()).map(function (state) {
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
  var initialState = (_AppSerialization || _load_AppSerialization()).deserialize(rawState);
  var epics = Object.keys(_reduxEpics || _load_reduxEpics()).map(function (k) {
    return (_reduxEpics || _load_reduxEpics())[k];
  }).filter(function (epic) {
    return typeof epic === 'function';
  });
  var rootEpic = function rootEpic(actions, store) {
    return (0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray(epics))(actions, store)
    // Log errors and continue.
    .catch(function (err, stream) {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(err);
      return stream;
    });
  };
  var store = (0, (_redux || _load_redux()).createStore)((0, (_redux || _load_redux()).combineReducers)(_reduxReducers || _load_reduxReducers()), initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).createEpicMiddleware)(rootEpic)));

  var states = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(store);

  // Add a toggle command for every viewable provider. We avoid debouncing here so that commands
  // will immediately be available to packages after they register themselves.
  var disposables = new (_atom || _load_atom()).CompositeDisposable((0, (_commonsAtomSyncAtomCommands || _load_commonsAtomSyncAtomCommands()).default)(states.map(function (state) {
    return state.viewableFactories;
  }).distinctUntilChanged().map(function (viewableFactories) {
    return new Set(Array.from(viewableFactories.values()).filter(function (viewableFactory) {
      return viewableFactory.toggleCommand != null;
    }));
  }), function (viewableFactory) {
    return {
      'atom-workspace': _defineProperty({}, viewableFactory.toggleCommand, function (event) {
        var visible = event.detail == null ? undefined : event.detail.visible;
        store.dispatch((_reduxActions || _load_reduxActions()).toggleItemVisibility(viewableFactory.id, visible));
      })
    };
  }));

  return { store: store, disposables: disposables };
}

exports.default = (0, (_commonsAtomCreatePackage || _load_commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;