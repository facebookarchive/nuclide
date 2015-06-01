'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {getService, getServiceByNuclideUri} = require('./service-manager');
var localClients: {[rootPath: string]: NuclideClient} = {};
var {RemoteConnection} = require('nuclide-remote-connection');

module.exports = {
  getClient(path: string): ?NuclideClient {
    if (path.startsWith('nuclide://')) {
      var connection = RemoteConnection.getForUri(path);
      return connection ? connection.getClient() : null;
    } else {
      var localClient = null;
      atom.project.getPaths().forEach(rootPath => {
        if (!path.startsWith(rootPath)) {
          return;
        }
        // Create a local client with its root as the working directory, if none already exists.
        if (!localClients[rootPath]) {
          var NuclideClient = require('nuclide-server/lib/NuclideClient');
          var NuclideLocalEventbus = require('nuclide-server/lib/NuclideLocalEventbus');
          var eventbus = new NuclideLocalEventbus();

          localClients[rootPath] = new NuclideClient(
            /*id: string*/ 'local',
            /*eventbus: NuclideLocalEventBus*/ eventbus,
            /*options: NuclideClientOptions*/ {cwd: rootPath}
          );
        }
        localClient = localClients[rootPath];
      });
      return localClient;
    }
  },
  getService,
  getServiceByNuclideUri,
};
