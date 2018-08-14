"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NuclideArtilleryTrace = void 0;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */
class NuclideArtilleryTrace {
  static begin(categoryName, eventName) {
    return new NuclideArtilleryTrace();
  }

  end() {}

}

exports.NuclideArtilleryTrace = NuclideArtilleryTrace;