"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shortenHostname = shortenHostname;
exports.convertToSandcastleHost = convertToSandcastleHost;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function shortenHostname(hostOrUri) {
  let result = hostOrUri;

  if (_nuclideUri().default.isRemote(result)) {
    result = _nuclideUri().default.getHostname(result);
  }

  if (result.endsWith('.facebook.com')) {
    result = result.slice(0, -13);
  }

  if (result.startsWith('our.')) {
    result = result.slice(4);
  }

  if (result.startsWith('svcscm.')) {
    result = result.slice(7);
  }

  if (result.startsWith('twsvcscm.')) {
    result = result.slice(9);
  }

  return result;
}

function convertToSandcastleHost(fbHost, scHost) {
  let prefix = '';

  if (fbHost.endsWith('intern.facebook.com')) {
    prefix = fbHost.slice(0, -20);
  } else if (fbHost.endsWith('facebook.com')) {
    prefix = fbHost.slice(0, -13);
  } // Replace leading 'our' with the prefix (prefix does not trail with '.').


  if (scHost.startsWith('our.')) {
    return prefix + scHost.slice(3);
  }

  return scHost;
}