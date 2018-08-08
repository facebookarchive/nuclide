"use strict";

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */
jest.mock("../modules/nuclide-commons/analytics");
jest.mock('log4js');
global.NUCLIDE_DO_NOT_LOG = true;