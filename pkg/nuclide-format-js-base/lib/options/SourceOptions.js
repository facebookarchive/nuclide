'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AbsolutePath} from '../types/common';
import type ModuleMap from '../state/ModuleMap';
import type {TransformKey} from '../types/transforms';

export type SourceOptions = {
  moduleMap: ModuleMap,
  sourcePath?: AbsolutePath,
  /**
   * The set of transforms to blacklist.
   */
  blacklist?: Set<TransformKey>,
};
