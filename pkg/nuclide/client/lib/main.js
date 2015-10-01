'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*
 * nuclide-client is a Node package that can be loaded on the client (ideally also on the server).
 * In both environments, we want it to exist as a singleton. The ./service-manager.js file
 * in this package contains a cache of services, each of which should also be singletons for each
 * root/service pair. To this end, we use the singleton() utility in nuclide-commons to ensure that
 * only one instance of nuclide-client is loaded, serving as a clearinghouse for all service
 * loading, which is done via its getService() and getServiceByNuclideUri() methods.
 */
import type {NuclideUri} from 'nuclide-remote-uri';
import type NuclideClient from 'nuclide-server/lib/NuclideClient';
import type RemoteFile from 'nuclide-remote-connection/lib/RemoteFile';

type NuclideClientExports = {
  getClient(path: NuclideUri): ?NuclideClient;
  getFileForPath(filePath: NuclideUri): ?(File | RemoteFile);
  getService(serviceName: string, hostname: ?string, serviceOptions: ?any): ?any;
  getServiceByNuclideUri(
    serviceName: string,
    nuclideUri?: ?NuclideUri,
    serviceOptions?: ?any,
  ): ?any;
}

const NUCLIDE_CLIENT_EXPORTS_KEY = '_nuclide_client_exports';

const nuclideClientExports: NuclideClientExports = require('nuclide-commons').singleton.get(
  NUCLIDE_CLIENT_EXPORTS_KEY,
  () => require('./exports'),
);
module.exports = nuclideClientExports;
