'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import type {HackSearchService} from '../../hack-search-service';

import {getServiceByNuclideUri} from '../../client';

/**
 * @return HackSearchService for the specified directory if it is part of a Hack project.
 */
export async function getHackSearchService(
  directory: atom$Directory,
): Promise<?HackSearchService> {
  const directoryPath = directory.getPath();
  const service: ?HackSearchService = getServiceByNuclideUri('HackSearchService', directoryPath);
  if (service == null) {
    return null;
  }

  // Note that service being non-null only verifies that the nuclide-server that corresponds to the
  // directory has the HackSearchService registered: it does not guarantee that the specified
  // directory is searchable via Hack. As such, we have to perform a second check to make sure
  // that the specified directory belongs to a Hack project.
  if (await service.isAvailableForDirectoryHack(directoryPath)) {
    return service;
  } else {
    return null;
  }
}
