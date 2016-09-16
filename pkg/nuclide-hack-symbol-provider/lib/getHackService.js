'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as HackService from '../../nuclide-hack-rpc/lib/HackService';

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {getHackEnvironmentDetails} from '../../nuclide-hack/lib/utils';

/**
 * @return HackService for the specified directory if it is part of a Hack project.
 */
export async function getHackService(
  directory: atom$Directory,
): Promise<?HackService> {
  const directoryPath = directory.getPath();
  return await getHackEnvironmentDetails(directoryPath);
}
