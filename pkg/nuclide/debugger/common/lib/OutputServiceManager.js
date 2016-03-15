'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rx';
import type OutputService from '../../../output/lib/OutputService';

let outputServiceApi: ?OutputService = null;

export function setOutputService(api: OutputService): void {
  outputServiceApi = api;
}

export function getOutputService(): ?OutputService {
  return outputServiceApi;
}

// TODO: refactor this function to work with other providers(like hhvm).
export function registerOutputWindowLogging(userOutputStream: Observable<string>): ?IDisposable {
  const api = getOutputService();
  let outputDisposable = null;
  if (api != null) {
    outputDisposable = api.registerOutputProvider({
      source: 'lldb debugger',
      messages: userOutputStream.map(message => JSON.parse(message)),
    });
  }
  return outputDisposable;
}
