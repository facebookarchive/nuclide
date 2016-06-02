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

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeDefinitionService = consumeDefinitionService;
exports.serialize = serialize;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _CodePreviewState2;

function _CodePreviewState() {
  return _CodePreviewState2 = require('./CodePreviewState');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var currentService = null;

var DEFAULT_WIDTH = 300; // px
var DEFAULT_CONFIG = {
  width: DEFAULT_WIDTH,
  visible: false
};

var Activation = (function () {
  function Activation() {
    var _this = this;

    var config = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_CONFIG : arguments[0];

    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._state = new (_CodePreviewState2 || _CodePreviewState()).CodePreviewState(config.width, config.visible);
    this.updateService();
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-definition-preview:toggle', function () {
      return _this._state.toggle();
    }));
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-definition-preview:show', function () {
      return _this._state.show();
    }));
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-definition-preview:hide', function () {
      return _this._state.hide();
    }));
  }

  _createClass(Activation, [{
    key: 'updateService',
    value: function updateService() {
      this._state.setDefinitionService(currentService);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        width: this._state.getWidth(),
        visible: this._state.isVisible()
      };
    }
  }, {
    key: 'getDistractionFreeModeProvider',
    value: function getDistractionFreeModeProvider() {
      var _this2 = this;

      return {
        name: 'nuclide-definition-preview',
        isVisible: function isVisible() {
          return _this2._state.isVisible();
        },
        toggle: function toggle() {
          return _this2._state.toggle();
        }
      };
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function updateService() {
  if (activation != null) {
    activation.updateService();
  }
}

function consumeDefinitionService(service) {
  (0, (_assert2 || _assert()).default)(currentService == null);
  currentService = service;
  updateService();
  return new (_atom2 || _atom()).Disposable(function () {
    (0, (_assert2 || _assert()).default)(currentService === service);
    currentService = null;
    updateService();
  });
}

function serialize() {
  if (activation != null) {
    return activation.serialize();
  }
}

function getDistractionFreeModeProvider() {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.getDistractionFreeModeProvider();
}