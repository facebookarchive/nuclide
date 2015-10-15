'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from 'nuclide-remote-uri';
import type {FileSystemService} from 'nuclide-server/lib/services/FileSystemServiceType';

const FILE_SYSTEM_SERVICE = 'FileSystemService';

// TODO: Remove this once all services have been moved to framework v3.
import {
  getClient,
  getFileForPath,
  getService,
  getServiceLogger,
  getServiceByNuclideUri,
} from 'nuclide-remote-connection';

module.exports = {
  getClient,
  getFileForPath,
  getService,
  getServiceLogger,
  getServiceByNuclideUri,

  getFileSystemServiceByNuclideUri(uri: NuclideUri): FileSystemService {
    return getServiceByNuclideUri(FILE_SYSTEM_SERVICE, uri);
  },
};
