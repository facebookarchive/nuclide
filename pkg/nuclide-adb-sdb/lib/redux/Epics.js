'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setCustomAdbPathEpic = setCustomAdbPathEpic;
exports.setCustomSdbPathEpic = setCustomSdbPathEpic;
exports.setAdbPortEpic = setAdbPortEpic;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../../nuclide-remote-connection');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function setCustomAdbPathEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_CUSTOM_ADB_PATH).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_CUSTOM_ADB_PATH)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_CUSTOM_ADB_PATH"');
    }

    (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(action.payload.host).registerCustomPath(action.payload.path);
  }).ignoreElements();
}

function setCustomSdbPathEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_CUSTOM_SDB_PATH).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_CUSTOM_SDB_PATH)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_CUSTOM_SDB_PATH"');
    }

    (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(action.payload.host).registerCustomPath(action.payload.path);
  }).ignoreElements();
}

function setAdbPortEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_ADB_PORT).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_ADB_PORT)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_ADB_PORT"');
    }

    (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(action.payload.host).addAdbPort(action.payload.port);
  }).ignoreElements();
}