/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import nuclideUri from 'nuclide-commons/nuclideUri';

export class FallbackToRpcError extends Error {}

export function rejectArchivePaths(fullPath: NuclideUri, operation: string) {
  if (nuclideUri.isInArchive(fullPath)) {
    throw new Error(
      `The '${operation}' operation does not support archive paths like '${fullPath}'`,
    );
  }
}
