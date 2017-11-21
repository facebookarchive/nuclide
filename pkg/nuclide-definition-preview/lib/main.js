'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.consumeNuclideContextView = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let consumeNuclideContextView = exports.consumeNuclideContextView = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (contextView) {
    if (!(activation != null)) {
      throw new Error('Invariant violation: "activation != null"');
    }

    const registration = yield contextView.registerProvider(activation.getContextProvider());
    activation.setContextViewRegistration(registration);
  });

  return function consumeNuclideContextView(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.activate = activate;
exports.deactivate = deactivate;

var _DefinitionPreviewView;

function _load_DefinitionPreviewView() {
  return _DefinitionPreviewView = require('./DefinitionPreviewView');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Unique ID of this context provider
const PROVIDER_ID = 'nuclide-definition-preview'; /**
                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                   * All rights reserved.
                                                   *
                                                   * This source code is licensed under the license found in the LICENSE file in
                                                   * the root directory of this source tree.
                                                   *
                                                   * 
                                                   * @format
                                                   */

const PROVIDER_TITLE = 'Definition Preview';

class Activation {

  constructor() {
    // $FlowFixMe(>=0.53.0) Flow suppress
    this.provider = {
      getElementFactory: () => _react.createFactory((_DefinitionPreviewView || _load_DefinitionPreviewView()).DefinitionPreviewView),
      id: PROVIDER_ID,
      title: PROVIDER_TITLE
    };
  }

  getContextProvider() {
    return this.provider;
  }

  setContextViewRegistration(registration) {
    this.contextViewRegistration = registration;
  }

  dispose() {
    if (this.contextViewRegistration != null) {
      this.contextViewRegistration.dispose();
    }
  }
}

let activation = null;

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