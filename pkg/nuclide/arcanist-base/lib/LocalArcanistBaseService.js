'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var ArcanistBaseService = require('./ArcanistBaseService');

var ARC_CONFIG_FILE_NAME = '.arcconfig';

class LocalArcanistBaseService extends ArcanistBaseService {
  _arcConfigDirectoryMap: Map<NuclideUri, ?NuclideUri>;
  _arcProjectMap: Map<?NuclideUri, ?Object>;

  constructor() {
    super();
    this._arcConfigDirectoryMap = new Map();
    this._arcProjectMap = new Map();
  }

  async findArcConfigDirectory(fileName: NuclideUri): Promise<?NuclideUri> {
    if (!this._arcConfigDirectoryMap.has(fileName)) {
      var findNearestFile = require('nuclide-commons').findNearestFile;
      var result = await findNearestFile(ARC_CONFIG_FILE_NAME, fileName);
      this._arcConfigDirectoryMap.set(fileName, result);
    }
    return this._arcConfigDirectoryMap.get(fileName);
  }

  async readArcConfig(fileName: NuclideUri): Promise<?Object> {
    var arcConfigDirectory = await this.findArcConfigDirectory(fileName);
    if (!arcConfigDirectory) {
       return null;
    }
    if (!this._arcProjectMap.has(arcConfigDirectory)) {
      var path = require('path');
      var arcconfigFile = path.join(arcConfigDirectory, ARC_CONFIG_FILE_NAME);
      var result = JSON.parse(
        await require('nuclide-commons').readFile(arcconfigFile));
      this._arcProjectMap.set(arcConfigDirectory, result);
    }
    return this._arcProjectMap.get(arcConfigDirectory);
  }

  async findArcProjectIdOfPath(fileName: NuclideUri): Promise<?string> {
    var project = await this.readArcConfig(fileName);
    return project ? project['project_id'] : null;
  }

  async getProjectRelativePath(fileName: NuclideUri): Promise<?string> {
    var arcPath = await this.findArcConfigDirectory(fileName);
    var path = require('path');
    return arcPath && fileName ? path.relative(arcPath, fileName) : null;
  }
}

module.exports = LocalArcanistBaseService;
