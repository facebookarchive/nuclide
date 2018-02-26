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

import invariant from 'assert';
import electron from 'electron';
import {Observable} from 'rxjs';

const {ipcRenderer} = electron;
invariant(ipcRenderer != null, 'must be in renderer process');

const CHANNEL = 'nuclide-url-open';

export type DeepLinkMessage = {
  message: string,
  params: DeepLinkParams,
};

export type DeepLinkParams = {[key: string]: string | Array<string>};

export function observeDeepLinks(): Observable<DeepLinkMessage> {
  return Observable.fromEvent(ipcRenderer, CHANNEL, (event, data) => data);
}

export function sendDeepLink(
  browserWindow: electron$BrowserWindow,
  path: string,
  params: Object,
): void {
  browserWindow.webContents.send(CHANNEL, {message: path, params});
  browserWindow.focus();
}
