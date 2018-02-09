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

import type {DatatipService} from 'atom-ide-ui';
import type {ConsoleService, RegisterExecutorFunction} from 'atom-ide-ui';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

type raiseNativeNotificationFunc = ?(
  title: string,
  body: string,
  timeout: number,
  raiseIfAtomHasFocus: boolean,
) => ?IDisposable;

let _raiseNativeNotification: ?raiseNativeNotificationFunc = null;
let _registerExecutor: ?RegisterExecutorFunction = null;
let _datatipService: ?DatatipService = null;
let _createConsole: ?ConsoleService = null;

export function setConsoleService(createConsole: ConsoleService): IDisposable {
  _createConsole = createConsole;
  return new UniversalDisposable(() => {
    _createConsole = null;
  });
}

export function getConsoleService(): ?ConsoleService {
  return _createConsole;
}

export function setConsoleRegisterExecutor(
  registerExecutor: RegisterExecutorFunction,
): IDisposable {
  _registerExecutor = registerExecutor;
  return new UniversalDisposable(() => {
    _registerExecutor = null;
  });
}

export function getConsoleRegisterExecutor(): ?RegisterExecutorFunction {
  return _registerExecutor;
}

export function setDatatipService(datatipService: DatatipService): IDisposable {
  _datatipService = datatipService;
  return new UniversalDisposable(() => {
    _datatipService = null;
  });
}

export function getDatatipService(): ?DatatipService {
  return _datatipService;
}

export function setNotificationService(
  raiseNativeNotification: raiseNativeNotificationFunc,
): void {
  _raiseNativeNotification = raiseNativeNotification;
}

export function getNotificationService(): ?raiseNativeNotificationFunc {
  return _raiseNativeNotification;
}
