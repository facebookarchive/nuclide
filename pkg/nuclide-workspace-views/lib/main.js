/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {WorkspaceViewsService} from './types';

import createPackage from 'nuclide-commons-atom/createPackage';
import {getDocksWorkspaceViewsService} from 'nuclide-commons-atom/workspace-views-compat';

// TODO(matthewwithanm): Delete this (along with the services and package) and refactor to workspace
// API once docks land
class CompatActivation {
  provideWorkspaceViewsService(): WorkspaceViewsService {
    return getDocksWorkspaceViewsService();
  }
}

createPackage(module.exports, CompatActivation);
