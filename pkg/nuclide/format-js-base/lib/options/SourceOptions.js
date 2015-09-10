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

export type SourceOptions = {
  moduleMap: ModuleMap,
  sourcePath?: AbsolutePath,
};
