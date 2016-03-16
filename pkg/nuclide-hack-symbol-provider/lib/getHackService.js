'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as HackService from '../../nuclide-hack-base/lib/HackService';

import {getServiceByNuclideUri} from '../../nuclide-client';

/**
 * @return HackService for the specified directory if it is part of a Hack project.
 */
export async function getHackService(
  directory: atom$Directory,
): Promise<?HackService> {
  const directoryPath = directory.getPath();
  const service: ?HackService = getServiceByNuclideUri('HackService', directoryPath);
  if (service == null) {
    return null;
  }

  // Note that service being non-null only verifies that the nuclide-server that corresponds to the
  // directory has the HackService registered: it does not guarantee that the specified
  // directory is searchable via Hack. As such, we have to perform a second check to make sure
  // that the specified directory belongs to a Hack project.
  if (await service.isAvailableForDirectoryHack(directoryPath)) {
    return service;
  } else {
    return null;
  }
}
