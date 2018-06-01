/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

export const getLogger = (): log4js$Logger => {
  return {
    debug: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    info: jest.fn(),
    isLevelEnabled: jest.fn(),
    // $FlowFixMe
    level: jest.fn(),
    log: jest.fn(),
    mark: jest.fn(),
    removeLevel: jest.fn(),
    setLevel: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
  };
};
