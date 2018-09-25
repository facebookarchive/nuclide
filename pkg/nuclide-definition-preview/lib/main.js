"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeNuclideContextView = consumeNuclideContextView;

function _DefinitionPreviewView() {
  const data = require("./DefinitionPreviewView");

  _DefinitionPreviewView = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// Unique ID of this context provider
const PROVIDER_ID = 'nuclide-definition-preview';
const PROVIDER_TITLE = 'Definition Preview';

class Activation {
  constructor() {
    // $FlowFixMe(>=0.53.0) Flow suppress
    this.provider = {
      getElementFactory: () => React.createFactory(_DefinitionPreviewView().DefinitionPreviewView),
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

async function consumeNuclideContextView(contextView) {
  if (!(activation != null)) {
    throw new Error("Invariant violation: \"activation != null\"");
  }

  const registration = await contextView.registerProvider(activation.getContextProvider());
  activation.setContextViewRegistration(registration);
}