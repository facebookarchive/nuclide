'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TizenFetcher = undefined;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../../nuclide-remote-connection');
}

var _AndroidTizenBaseFetcher;

function _load_AndroidTizenBaseFetcher() {
  return _AndroidTizenBaseFetcher = require('./AndroidTizenBaseFetcher');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class TizenFetcher extends (_AndroidTizenBaseFetcher || _load_AndroidTizenBaseFetcher()).AndroidTizenBaseFetcher {
  constructor() {
    super('tizen', host => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host));
  }
}
exports.TizenFetcher = TizenFetcher;