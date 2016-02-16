'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import typeof * as FlowService from '../../flow-base';

import {getServiceByNuclideUri} from '../../client';

const FLOW_SERVICE = 'FlowService';

export function getFlowServiceByNuclideUri(file: NuclideUri): FlowService {
  return getServiceByNuclideUri(FLOW_SERVICE, file);
}

export function getLocalFlowService(): FlowService {
  return getServiceByNuclideUri(FLOW_SERVICE, null);
}
