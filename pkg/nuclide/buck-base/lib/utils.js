'use babel';
/* @flow */

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
