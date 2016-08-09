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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _PaneLocation2;

function _PaneLocation() {
  return _PaneLocation2 = require('./PaneLocation');
}

var _PanelLocation2;

function _PanelLocation() {
  return _PanelLocation2 = require('./PanelLocation');
}

var _PanelLocationIds2;

function _PanelLocationIds() {
  return _PanelLocationIds2 = _interopRequireDefault(require('./PanelLocationIds'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

// This package doesn't actually serialize its own state. The reason is that we want to centralize
// that so that we can (eventually) associate them with profiles or workspace configurations.

var Activation = (function () {
  function Activation() {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeWorkspaceViewsService',
    value: function consumeWorkspaceViewsService(api) {
      var _disposables;

      (_disposables = this._disposables).add.apply(_disposables, [api.registerLocation({ id: 'pane', create: function create() {
          return new (_PaneLocation2 || _PaneLocation()).PaneLocation();
        } })].concat(_toConsumableArray((_PanelLocationIds2 || _PanelLocationIds()).default.map(function (id) {
        return api.registerLocation({
          id: id,
          create: function create(serializedState) {
            var location = new (_PanelLocation2 || _PanelLocation()).PanelLocation(id, serializedState || undefined);
            location.initialize();
            return location;
          }
        });
      }))));
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;