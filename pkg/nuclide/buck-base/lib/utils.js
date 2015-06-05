'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {

  /**
   * This is designed to be used with the output of `BuckProject.build()`.
   * If the report is malformed, the behavior of this method is unspecified.
   */
  isBuildSuccessful(buildReport: Object): boolean {
    var results = buildReport['results'];
    if (!results) {
      // Malformed report.
      return false;
    }

    for (var buildTarget in results) {
      if (results[buildTarget]['success'] === false) {
        return false;
      }
    }
    return true;
  },
};
