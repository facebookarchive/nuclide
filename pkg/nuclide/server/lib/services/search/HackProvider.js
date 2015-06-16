'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AbstractProvider = require('./AbstractProvider');

class HackProvider extends AbstractProvider {
  constructor(server) {
    super();
    this._server = server;
  }

  async query(cwd: string, queryString: string) {
    var searchPostfix;

    switch (queryString[0]) {
      case '@':
        searchPostfix = '-function';
        queryString = queryString.substring(1);
        break;
      case '#':
        searchPostfix = '-class';
        queryString = queryString.substring(1);
        break;
      case '%':
        searchPostfix = '-constant';
        queryString = queryString.substring(1);
        break;
    }

    // TODO: ideally we can use some sort of client object here.
    return this._server.callService('/hack/getSearchResults', [queryString, undefined, searchPostfix, {cwd}]);
  }

  async isAvailable(cwd: string): Promise<boolean> {
    var {asyncExecute, fsPromise} = require('nuclide-commons');

    //TODO(most): when asyncExecute stops throwing on non-zero exit revisit this try
    try {
      var [{stdout}, nearestPath] = await Promise.all([
        asyncExecute('which', ['hh_client']),
        fsPromise.findNearestFile('.hhconfig', cwd),
      ]);
      if (stdout.trim() && nearestPath) {
        return true;
      }
    } catch (e) {
      return false;
    }

    return false;
  }
}

module.exports = HackProvider;
