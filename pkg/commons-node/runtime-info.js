'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  getOsType,
  getAtomVersion,
  getNuclideVersion,
  isDevelopment,
  isRunningInClient,
} from './system-info';
import userInfo from './userInfo';
import uuid from 'uuid';

export type RuntimeInformation = {
  sessionId: string,
  user: string,
  osType: string,
  timestamp: number,
  isClient: boolean,
  isDevelopment: boolean,
  atomVersion: string,
  nuclideVersion: string,
  installerPackageVersion: number,
  serverVersion: number,
  uptime: number,
};

let cachedInformation = null;

function getCacheableRuntimeInformation(): RuntimeInformation {
  if (cachedInformation !== null) {
    return cachedInformation;
  }

  cachedInformation = {
    sessionId: uuid.v4(),
    user: userInfo().username,
    osType: getOsType(),
    timestamp: 0,
    isClient: isRunningInClient(),
    isDevelopment: isDevelopment(),
    atomVersion: isRunningInClient() ? getAtomVersion() : '',
    nuclideVersion: getNuclideVersion(),
    installerPackageVersion: 0,
    uptime: 0,
    // TODO (chenshen) fill following information.
    serverVersion: 0,
  };

  return cachedInformation;
}

export function getRuntimeInformation(): RuntimeInformation {
  const runtimeInformation = {
    ...getCacheableRuntimeInformation(),
    timestamp: Date.now(),
    uptime: Math.floor(process.uptime() * 1000),
  };
  return runtimeInformation;
}
