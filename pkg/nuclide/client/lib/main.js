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
var defaultLocalClient: ?NuclideClient = null;
var {containsPathSync} = require('./utils');
var {isRemote} = require('nuclide-remote-uri');

module.exports = {
  getClient(path: string): NuclideClient {
    if (isRemote(path)) {
      var connection = RemoteConnection.getForUri(path);
      return connection ? connection.getClient() : null;
    } else {
      if (!localEventBus) {
        var NuclideLocalEventbus = require('nuclide-server/lib/NuclideLocalEventbus');
        localEventBus = new NuclideLocalEventbus();
      }
      if (!defaultLocalClient) {
        var NuclideClient = require('nuclide-server/lib/NuclideClient');
        defaultLocalClient = new NuclideClient('local', localEventBus);
      }
      // Return a default local client with no working directory if Atom was started to edit a single file
      // with a command like: $ atom file.php
      var localClient = defaultLocalClient;
      atom.project.getPaths().forEach(rootPath => {
        if (!containsPathSync(rootPath, path)) {
          return;
        }
        // Create a local client with its root as the working directory, if none already exists.
        if (!localClients[rootPath]) {
          var NuclideClient = require('nuclide-server/lib/NuclideClient');
          localClients[rootPath] = new NuclideClient(
            /*id: string*/ 'local/' + rootPath,
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
