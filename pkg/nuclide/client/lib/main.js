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
var localEventBus: ?NuclideLocalEventbus = null;
var {containsPath} = require('./utils');
var {isRemote} = require('nuclide-remote-uri');

module.exports = {
  getClient(path: string): ?NuclideClient {
    if (isRemote(path)) {
      var connection = RemoteConnection.getForUri(path);
      return connection ? connection.getClient() : null;
    } else {
      var localClient = null;
      if (!localEventBus) {
        var NuclideLocalEventbus = require('nuclide-server/lib/NuclideLocalEventbus');
        localEventBus = new NuclideLocalEventbus();
      }
      atom.project.getPaths().forEach(rootPath => {
        if (!containsPath(rootPath, path)) {
          return;
        }
        // Create a local client with its root as the working directory, if none already exists.
        if (!localClients[rootPath]) {
          var NuclideClient = require('nuclide-server/lib/NuclideClient');


          localClients[rootPath] = new NuclideClient(
            /*id: string*/ 'local',
            /*eventbus: NuclideLocalEventBus*/ localEventBus,
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
