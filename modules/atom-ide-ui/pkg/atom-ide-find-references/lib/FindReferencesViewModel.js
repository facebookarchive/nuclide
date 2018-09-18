"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FindReferencesViewModel = void 0;

var React = _interopRequireWildcard(require("react"));

function _renderReactRoot() {
  const data = require("../../../../nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _FindReferencesView() {
  const data = _interopRequireDefault(require("./view/FindReferencesView"));

  _FindReferencesView = function () {
    return data;
  };

  return data;
}

var _crypto = _interopRequireDefault(require("crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const FIND_REFERENCES_URI = 'atom://nuclide/find-references/';
const DEFAULT_LOCATION_SETTING = 'atom-ide-find-references.defaultLocationForPane';
const DEFAULT_PANE_LOCATION = 'bottom';

class FindReferencesViewModel {
  constructor(model) {
    // Generate a unique ID for each panel.
    this._id = (_crypto.default.randomBytes(8) || '').toString('hex') || '';
    this._model = model;
    this._element = (0, _renderReactRoot().renderReactRoot)(React.createElement(_FindReferencesView().default, {
      model: this._model
    }));
  }

  getTitle() {
    const symbol = this._model.getSymbolName();

    const title = this._model.getTitle();

    if (symbol.length > 0) {
      return `${title}: ${symbol}`;
    }

    return title;
  }

  getIconName() {
    return 'telescope';
  }

  getURI() {
    return FIND_REFERENCES_URI + this._id;
  }

  getDefaultLocation() {
    const paneLocation = _featureConfig().default.get(DEFAULT_LOCATION_SETTING);

    if (paneLocation === 'right' || paneLocation === 'bottom' || paneLocation === 'center' || paneLocation === 'left') {
      return paneLocation;
    }

    return DEFAULT_PANE_LOCATION;
  }

  getElement() {
    return this._element;
  }

}

exports.FindReferencesViewModel = FindReferencesViewModel;