'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import featureConfig from '../../nuclide-feature-config';

export type PythonConfig = {
  pathToPython: string;
};

export function getPythonPath(): string {
  const config = ((featureConfig.get('nuclide-python'): any): PythonConfig);
  return config.pathToPython;
}
