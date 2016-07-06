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
exports.consumeNuclideContextView = consumeNuclideContextView;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _DefinitionPreviewView2;

function _DefinitionPreviewView() {
  return _DefinitionPreviewView2 = require('./DefinitionPreviewView');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

// Unique ID of this context provider
var PROVIDER_ID = 'nuclide-definition-preview';
var PROVIDER_TITLE = 'Definition Preview';

var Activation = (function () {
  function Activation() {
    _classCallCheck(this, Activation);

    this.provider = {
      getElementFactory: function getElementFactory() {
        return (_reactForAtom2 || _reactForAtom()).React.createFactory((_DefinitionPreviewView2 || _DefinitionPreviewView()).DefinitionPreviewView);
      },
      id: PROVIDER_ID,
      title: PROVIDER_TITLE,
      isEditorBased: true
    };
  }

  _createClass(Activation, [{
    key: 'getContextProvider',
    value: function getContextProvider() {
      return this.provider;
    }
  }, {
    key: 'setContextViewRegistration',
    value: function setContextViewRegistration(registration) {
      this.contextViewRegistration = registration;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this.contextViewRegistration != null) {
        this.contextViewRegistration.dispose();
      }
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function consumeNuclideContextView(contextView) {
  (0, (_assert2 || _assert()).default)(activation != null);
  var registration = contextView.registerProvider(activation.getContextProvider());
  activation.setContextViewRegistration(registration);
}