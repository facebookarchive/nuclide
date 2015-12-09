'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This is a workaround that should be removed when Atom 2.0 comes out.
 * See t6913624.
 */

import type {HgRepositoryDescription} from '../../../source-control-helpers';

export function getHgRepository(directoryPath: string): Promise<HgRepositoryDescription> {
  const {findHgRepository} = require('../../../source-control-helpers');
  return Promise.resolve(findHgRepository(directoryPath));
}
