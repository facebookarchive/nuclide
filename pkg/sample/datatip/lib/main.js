'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DatatipProvider} from '../../../nuclide/datatip-interfaces';

import {datatip} from './SampleDatatip';

const PACKAGE_NAME = 'sample-datatip';

export function createDatatipProvider(): DatatipProvider {
  return {
    // show the sample datatip for every type of file
    validForScope: (scope: string) => true,
    providerName: PACKAGE_NAME,
    inclusionPriority: 1,
    datatip,
  };
}
