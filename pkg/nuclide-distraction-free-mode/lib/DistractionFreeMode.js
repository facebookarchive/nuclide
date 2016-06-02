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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var DistractionFreeMode = (function () {
  function DistractionFreeMode(state) {
    _classCallCheck(this, DistractionFreeMode);

    this._providers = new Set();
    this._restoreState = null;
    if (state != null && state.restoreState != null) {
      this._deserializationState = new Set(state.restoreState);
    }
  }

  _createClass(DistractionFreeMode, [{
    key: 'serialize',
    value: function serialize() {
      var restoreState = null;
      if (this._restoreState != null) {
        restoreState = Array.from(this._restoreState, function (provider) {
          return provider.name;
        });
      }
      return {
        restoreState: restoreState
      };
    }
  }, {
    key: 'consumeDistractionFreeModeProvider',
    value: function consumeDistractionFreeModeProvider(provider) {
      var _this = this;

      this._providers.add(provider);
      if (this._deserializationState != null && this._deserializationState.has(provider.name)) {
        this._addToRestoreState(provider);
      }
      return new (_atom2 || _atom()).Disposable(function () {
        _this._providers.delete(provider);
      });
    }
  }, {
    key: 'toggleDistractionFreeMode',
    value: function toggleDistractionFreeMode() {
      // Once the user has interacted with distraction-free mode it would be weird if another package
      // loading triggered a change in the state.
      this._deserializationState = null;
      if (this._shouldRestore()) {
        this._exitDistractionFreeMode();
      } else {
        this._enterDistractionFreeMode();
      }
    }
  }, {
    key: '_addToRestoreState',
    value: function _addToRestoreState(provider) {
      var restoreState = this._restoreState;
      if (restoreState == null) {
        this._restoreState = restoreState = new Set();
      }
      restoreState.add(provider);
    }
  }, {
    key: '_shouldRestore',
    value: function _shouldRestore() {
      if (this._restoreState == null) {
        return false;
      }
      for (var provider of this._providers) {
        if (provider.isVisible()) {
          // If the user has manually shown any provider they have probably forgotten they are in
          // distraction-free mode, and intend to enter it.
          return false;
        }
      }
      return true;
    }
  }, {
    key: '_enterDistractionFreeMode',
    value: function _enterDistractionFreeMode() {
      // This will be non-null if the user has entered distraction-free mode without toggling it off,
      // but has manually opened one or more of the providers. In that case, we want to re-enter
      // distraction-free mode, hiding the currently-visible providers, but when we exit we want to
      // restore both the previously-hidden providers and the currently-visible providers.
      var newRestoreState = this._restoreState;
      if (newRestoreState == null) {
        newRestoreState = new Set();
      }
      for (var provider of this._providers) {
        if (provider.isVisible()) {
          provider.toggle();
          newRestoreState.add(provider);
        }
      }
      this._restoreState = newRestoreState;
    }
  }, {
    key: '_exitDistractionFreeMode',
    value: function _exitDistractionFreeMode() {
      var restoreState = this._restoreState;
      (0, (_assert2 || _assert()).default)(restoreState != null);
      for (var provider of restoreState) {
        if (!provider.isVisible()) {
          provider.toggle();
        }
      }
      this._restoreState = null;
    }
  }]);

  return DistractionFreeMode;
})();

exports.DistractionFreeMode = DistractionFreeMode;

// Non-null iff we have entered distraction-free mode without explicitly exiting it. See
// _shouldRestore() and _enterDistractionFreeMode() for a more detailed explanation.

// Set of names for providers that were hidden when Nuclide last exited, but have not yet been
// consumed.