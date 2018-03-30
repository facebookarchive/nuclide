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
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import typeof * as VSCodeDebuggerAdapterService from 'nuclide-debugger-vsps/VSCodeDebuggerAdapterService';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as VSCodeDebuggerAdapterServiceLocal from 'nuclide-debugger-vsps/VSCodeDebuggerAdapterService';

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
let _terminalService: ?nuclide$TerminalApi = null;
let _rpcService: ?nuclide$RpcService = null;

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

export function setTerminalService(
  terminalService: nuclide$TerminalApi,
): IDisposable {
  _terminalService = terminalService;
  return new UniversalDisposable(() => {
    _terminalService = null;
  });
}

export function getTerminalService(): ?nuclide$TerminalApi {
  return _terminalService;
}

export function setRpcService(rpcService: nuclide$RpcService): IDisposable {
  _rpcService = rpcService;
  return new UniversalDisposable(() => {
    _rpcService = null;
  });
}

export function getVSCodeDebuggerAdapterServiceByNuclideUri(
  uri: NuclideUri,
): VSCodeDebuggerAdapterService {
  if (_rpcService != null) {
    return _rpcService.getServiceByNuclideUri(
      'VSCodeDebuggerAdapterService',
      uri,
    );
  } else {
    return VSCodeDebuggerAdapterServiceLocal;
  }
}
