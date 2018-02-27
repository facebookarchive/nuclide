'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FindReferencesViewModel = undefined;

var _react = _interopRequireWildcard(require('react'));

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('nuclide-commons-ui/renderReactRoot');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _FindReferencesView;

function _load_FindReferencesView() {
  return _FindReferencesView = _interopRequireDefault(require('./view/FindReferencesView'));
}

var _crypto = _interopRequireDefault(require('crypto'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const FIND_REFERENCES_URI = 'atom://nuclide/find-references/'; /**
                                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                                * All rights reserved.
                                                                *
                                                                * This source code is licensed under the BSD-style license found in the
                                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                                *
                                                                * 
                                                                * @format
                                                                */

const DEFAULT_LOCATION_SETTING = 'atom-ide-find-references.defaultLocationForPane';
const DEFAULT_PANE_LOCATION = 'bottom';

class FindReferencesViewModel {

  constructor(model) {
    // Generate a unique ID for each panel.
    this._id = (_crypto.default.randomBytes(8) || '').toString('hex') || '';
    this._model = model;
    this._element = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement((_FindReferencesView || _load_FindReferencesView()).default, { model: this._model }));
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
    const paneLocation = (_featureConfig || _load_featureConfig()).default.get(DEFAULT_LOCATION_SETTING);
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