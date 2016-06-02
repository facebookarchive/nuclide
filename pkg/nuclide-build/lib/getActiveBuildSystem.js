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

exports.getActiveBuildSystem = getActiveBuildSystem;

function getActiveBuildSystem(state) {
  var activeBuildSystemId = state.activeBuildSystemId;

  return activeBuildSystemId == null ? null : state.buildSystems.get(activeBuildSystemId);
}