'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const {RemoteConnection} = require('./RemoteConnection');
const RemoteDirectory = require('./RemoteDirectory');
const RemoteFile = require('./RemoteFile');
const {SshHandshake, decorateSshConnectionDelegateWithTracking} = require('./SshHandshake');

/*
 * We want the services to exist as a singleton. The ./service-manager.js file
 * in this package contains a cache of services, each of which should also be singletons for each
 * root/service pair. To this end, we use the singleton() utility in nuclide-commons to ensure that
 * only one instance of service-manager is loaded, serving as a clearinghouse for all service
 * loading, which is done via its getService() and getServiceByNuclideUri() methods.
 */
const NUCLIDE_CLIENT_EXPORTS_KEY = '_nuclide_client_exports';
const nuclideClientExports = require('nuclide-commons').singleton.get(
  NUCLIDE_CLIENT_EXPORTS_KEY,
  () => {
    const {
      getService,
      getServiceByNuclideUri,
      getServiceLogger,
      getRemoteServiceByRemoteConnection,
    } = require('./service-manager');
    const {
      getClient,
      getFileForPath,
    } = require('./client');
    return {
      getClient,
      getFileForPath,
      getService,
      getServiceLogger,
      getServiceByNuclideUri,
      getRemoteServiceByRemoteConnection,
    };
  },
);

module.exports = {
  decorateSshConnectionDelegateWithTracking,
  RemoteConnection,
  RemoteFile,
  RemoteDirectory,
  SshHandshake,
  getClient: nuclideClientExports.getClient,
  getFileForPath: nuclideClientExports.getFileForPath,
  getService: nuclideClientExports.getService,
  getServiceLogger: nuclideClientExports.getServiceLogger,
  getServiceByNuclideUri: nuclideClientExports.getServiceByNuclideUri,
  getRemoteServiceByRemoteConnection: nuclideClientExports.getRemoteServiceByRemoteConnection,
};
