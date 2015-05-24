'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

var {getService, getServiceByNuclideUri} = require('./service-manager');
var localClient: ?NuclideLocalClient = null;
var {RemoteConnection} = require('nuclide-remote-connection');

module.exports = {
  getClient(path: string): ?NuclideClient {
    if (path.startsWith('nuclide://')) {
      var connection = RemoteConnection.getForUri(path);
      return connection ? connection.getClient() : null;
    } else {
      if (!localClient) {
        var NuclideClient = require('nuclide-server/lib/NuclideClient');
        var NuclideLocalEventbus = require('nuclide-server/lib/NuclideLocalEventbus');
        var eventbus = new NuclideLocalEventbus();
        localClient = new NuclideClient('local', eventbus);
      }
      return localClient;
    }
  },
  getService,
  getServiceByNuclideUri,
};
