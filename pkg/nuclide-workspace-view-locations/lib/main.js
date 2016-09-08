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
    this._panelLocations = new Map();
    this._initialPanelVisibility = new Map();
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeWorkspaceViewsService',
    value: function consumeWorkspaceViewsService(api) {
      var _disposables,
          _this = this;

      (_disposables = this._disposables).add.apply(_disposables, [api.registerLocation({ id: 'pane', create: function create() {
          return new (_PaneLocation2 || _PaneLocation()).PaneLocation();
        } })].concat(_toConsumableArray((_PanelLocationIds2 || _PanelLocationIds()).default.map(function (id) {
        return api.registerLocation({
          id: id,
          create: function create(serializedState_) {
            var serializedState = serializedState_ == null ? {} : serializedState_;
            var initialVisibility = _this._initialPanelVisibility.get(id);
            if (initialVisibility != null) {
              serializedState.visible = initialVisibility;
            }
            var location = new (_PanelLocation2 || _PanelLocation()).PanelLocation(id, serializedState);
            location.initialize();
            _this._panelLocations.set(id, location);
            return location;
          }
        });
      }))));
    }

    /**
     * Provide an interface to DSF for each panel. Because the services are asynchronous, we have to
     * account for the posibility that the panel hasn't yet been created (and we can't just create it
     * early beccause we need the serialized state which we get asynchronously as well). In that case,
     * store the visiblity DSF wants and use it when we create the panel later.
     */
  }, {
    key: 'provideDistractionFreeModeProvider',
    value: function provideDistractionFreeModeProvider() {
      var _this2 = this;

      this._initialPanelVisibility = new Map((_PanelLocationIds2 || _PanelLocationIds()).default.map(function (id) {
        return [id, false];
      }));
      return (_PanelLocationIds2 || _PanelLocationIds()).default.map(function (id) {
        return {
          name: 'nuclide-workspace-view-locations:' + id,
          isVisible: function isVisible() {
            var location = _this2._panelLocations.get(id);
            return location == null ? Boolean(_this2._initialPanelVisibility.get(id)) : location.isVisible();
          },
          toggle: function toggle() {
            var location = _this2._panelLocations.get(id);
            if (location == null) {
              // We haven't created the panel yet. Store the visibility value so we can use it once we
              // do.
              var prevVisibility = _this2._initialPanelVisibility.get(id);
              _this2._initialPanelVisibility.set(id, !prevVisibility);
            } else {
              location.toggle();
            }
          }
        };
      });
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;

// The initial visiblity of each panel. A null/undefined value signifies that the serialized
// visibility should be used.