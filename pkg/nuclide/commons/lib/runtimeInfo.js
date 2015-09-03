'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {assign} from './object';
import {
  getAtomVersion,
  getNuclideBuildNumber,
  isRunningInClient,
  isRunningInNuclide,
} from './clientInfo';
import {getOsType} from './systemInfo';
import environment from './environment';
import session from './session';

export type RuntimeInformation = {
  sessionId: string;
  user: string;
  osType: string;
  timestamp: number;
  isClient: boolean;
  isDevelopment: boolean;
  isRunningInNuclide: boolean;
  atomVersion: string;
  nuclideVersion: number;
  installerPackageVersion: number;
  serverVersion: number;
};

var cachedInformation = null;

function getCacheableRuntimeInformation(): RuntimeInformation {
  if (cachedInformation !== null) {
    return cachedInformation;
  }

  cachedInformation = {
    sessionId: '',
    user: environment.USER,
    osType: getOsType(),
    timestamp: 0,
    isClient: isRunningInClient(),
    atomVersion: isRunningInClient() ? getAtomVersion() : '',
    isRunningInNuclide: isRunningInNuclide(),
    nuclideVersion: isRunningInNuclide() ? getNuclideBuildNumber() : 0 ,
    // TODO (chenshen) fill following information.
    installerPackageVersion: 0,
    isDevelopment: false,
    serverVersion: 0,
  };

  return cachedInformation;
}

export function getRuntimeInformation(): RuntimeInformation {
  var runtimeInformation = assign({}, getCacheableRuntimeInformation());
  runtimeInformation.sessionId = session.id;
  runtimeInformation.timestamp = Date.now();
  return runtimeInformation;
}
