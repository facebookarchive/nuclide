/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* global localStorage */

import LRUCache from 'lru-cache';
import {getArcanistServiceByNuclideUri} from '../nuclide-remote-connection';

const arcInfoCache = new LRUCache({max: 200});
const STORAGE_KEY = 'nuclide.last-arc-project-path';

/**
 * Cached wrapper around ArcanistService.findArcProjectIdAndDirectory.
 * The service also caches this, but since this is called so frequently we should
 * try to avoid going over the RPC layer as well.
 */
export function findArcProjectIdAndDirectory(src: string): Promise<?{
  projectId: string,
  directory: string,
}> {
  let cached = arcInfoCache.get(src);
  if (cached == null) {
    const arcService = getArcanistServiceByNuclideUri(src);
    cached = arcService.findArcProjectIdAndDirectory(src)
      .then(result => {
        // Store the path in local storage for `getLastProjectPath`.
        if (result != null) {
          localStorage.setItem(
            `${STORAGE_KEY}.${result.projectId}`,
            result.directory,
          );
        }
        return result;
      })
      .catch(err => {
        // Clear the cache if there's an error to enable retries.
        arcInfoCache.delete(src);
        return Promise.reject(err);
      });
    arcInfoCache.set(src, cached);
  }
  return cached;
}

export function getLastProjectPath(projectId: string): ?string {
  return localStorage.getItem(`${STORAGE_KEY}.${projectId}`);
}
