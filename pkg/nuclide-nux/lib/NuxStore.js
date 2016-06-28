Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var NUX_SAVED_STORE = 'nuclide-nux.saved-nux-data-store';

exports.NUX_SAVED_STORE = NUX_SAVED_STORE;

var NuxStore = (function () {
  function NuxStore() {
    _classCallCheck(this, NuxStore);

    this._nuxMap = new Map();
    this._emitter = new (_atom2 || _atom()).Emitter();
  }

  _createClass(NuxStore, [{
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
    }

    // Tries to load saved NUXes.
    // If none exist, will attempt to seed a NUX iff `_seedNux` is true.
  }, {
    key: 'initialize',
    value: function initialize() {
      // TODO [ @rageandqq | 05-25-16 ]: Replace with `IndexedDB` since `localStorage` is blocking
      this._nuxMap = new Map(JSON.parse(window.localStorage.getItem(NUX_SAVED_STORE)));
    }
  }, {
    key: 'addNewNux',
    value: function addNewNux(nux) {
      var nuxState = this._nuxMap.get(nux.id);
      if (nuxState) {
        return;
      }
      this._nuxMap.set(nux.id, false);
      this._emitter.emit('newNux', nux);
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      this._saveNuxState();
    }
  }, {
    key: '_saveNuxState',
    value: function _saveNuxState() {
      // TODO [ @rageandqq | 05-25-16 ]: Replace with `IndexedDB` since `localStorage` is blocking
      window.localStorage.setItem(NUX_SAVED_STORE,
      // $FlowIgnore -- Flow thinks the spread operator is incompatible with Maps
      JSON.stringify([].concat(_toConsumableArray(this._nuxMap))));
    }

    /**
     * Register a change handler that is invoked whenever the store changes.
     */
  }, {
    key: 'onNewNux',
    value: function onNewNux(callback) {
      return this._emitter.on('newNux', callback);
    }
  }, {
    key: 'onNuxCompleted',
    value: function onNuxCompleted(nuxModel) {
      if (!this._nuxMap.has(nuxModel.id)) {
        return;
      }
      this._nuxMap.set(nuxModel.id,
      /* completed */true);
      this._saveNuxState();
    }
  }]);

  return NuxStore;
})();

exports.NuxStore = NuxStore;

// Maps a Nux's unique ID to the boolean representing its viewed state