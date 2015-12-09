'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import type {FileSystemService} from '../../server/lib/services/FileSystemServiceType';

const FILE_SYSTEM_SERVICE = 'FileSystemService';

// TODO: Remove this once all services have been moved to framework v3.
import {
  getFileForPath,
  getService,
  getServiceLogger,
  getServiceByNuclideUri,
} from '../../remote-connection';

module.exports = {
  getFileForPath,
  getService,
  getServiceLogger,
  getServiceByNuclideUri,

  getFileSystemServiceByNuclideUri(uri: NuclideUri): FileSystemService {
    return getServiceByNuclideUri(FILE_SYSTEM_SERVICE, uri);
  },
};
