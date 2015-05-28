'use babel';
/* @flow */

var BuckUtils = require('./BuckUtils');


class LocalBuckUtils extends BuckUtils {

  constructor() {
    super();
    this._buckProjectDirectoryForPath = {};
  }

  async getBuckProjectRoot(filePath: string): Promise<?string> {
    var directory = this._buckProjectDirectoryForPath[filePath];
    if (!directory) {
      var {findNearestFile} = require('nuclide-commons/lib/filesystem');
      var directory = await findNearestFile('.buckconfig', filePath);
      if (!directory) {
        return null;
      } else {
        this._buckProjectDirectoryForPath[filePath] = directory;
      }
    }
    return directory;
  }
}


module.exports = LocalBuckUtils;
