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

import invariant from 'assert';
import {getServiceByNuclideUri} from '../../client';

export function getFlowServiceByNuclideUri(file: NuclideUri): FlowService {
  const service = getServiceByNuclideUri('FlowService', file);
  invariant(service);
  return service;
}

export function getLocalFlowService(): FlowService {
  const service = getServiceByNuclideUri('FlowService', null);
  invariant(service);
  return service;
}
