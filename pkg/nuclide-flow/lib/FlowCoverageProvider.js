'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import invariant from 'assert';

import {getFlowServiceByNuclideUri} from './FlowServiceFactory';

export async function getCoverage(path: NuclideUri): Promise<?number> {
  const flowService = await getFlowServiceByNuclideUri(path);
  invariant(flowService != null);
  return await flowService.flowGetCoverage(path);
}
