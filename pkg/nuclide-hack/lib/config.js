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

type HackConfig = {
  hhClientPath: string;
  useIdeConnection: boolean;
};

export const HACK_CONFIG_PATH = 'nuclide-hack';
export const SHOW_TYPE_COVERAGE_CONFIG_PATH = HACK_CONFIG_PATH + '.showTypeCoverage';

export function getConfig(): HackConfig {
  return (featureConfig.get(HACK_CONFIG_PATH): any);
}
