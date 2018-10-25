"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertToSandcastleHost = convertToSandcastleHost;

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