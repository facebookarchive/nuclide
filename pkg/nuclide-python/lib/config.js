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
  showGlobalVariables: boolean;
};

// config can be null in tests.
function getConfig(): ?PythonConfig {
  return ((featureConfig.get('nuclide-python'): any): ?PythonConfig);
}

export function getPythonPath(): string {
  const config = getConfig();
  return config == null ? 'python' : config.pathToPython;
}

export function getShowGlobalVariables(): boolean {
  const config = getConfig();
  return config == null ? true : config.showGlobalVariables;
}
