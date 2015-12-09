'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import type {FuzzyFileSearchService} from '../../fuzzy-file-search-service';

import {getServiceByNuclideUri} from '../../client';

/**
 * @return FuzzyFileSearchService for the specified directory if it is part of a Hack project.
 */
export async function getFuzzyFileSearchService(
  directory: atom$Directory,
): Promise<?FuzzyFileSearchService> {
  const directoryPath = directory.getPath();
  const service: ?FuzzyFileSearchService = getServiceByNuclideUri(
    'FuzzyFileSearchService', directoryPath);
  return service;
}
