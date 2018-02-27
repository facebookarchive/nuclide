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

import type {
  AtomNotification,
  DebuggerConfigAction,
} from 'nuclide-debugger-common/types';
import type {ConnectableObservable} from 'rxjs';
import type {
  VsAdapterType,
  VSAdapterExecutableInfo,
} from 'nuclide-debugger-common/types';
import type {ProcessMessage} from 'nuclide-commons/process';

// eslint-disable-next-line rulesdir/no-unresolved
import {
  DebuggerRpcServiceBase,
  VsDebugSessionTranslator,
  VsAdapterSpawner,
} from 'nuclide-debugger-common';
import {Observable} from 'rxjs';

export class VSCodeDebuggerAdapterService extends DebuggerRpcServiceBase {
  _translator: ?VsDebugSessionTranslator;
  _adapterType: VsAdapterType;

  constructor(adapterType: VsAdapterType) {
    super(adapterType);
    this._adapterType = adapterType;
  }

  async debug(
    adapter: VSAdapterExecutableInfo,
    debugMode: DebuggerConfigAction,
    args: Object,
  ): Promise<string> {
    const translator = (this._translator = new VsDebugSessionTranslator(
      this._adapterType,
      adapter,
      debugMode,
      args,
      this.getClientCallback(),
      this.getLogger(),
    ));
    this.getSubscriptions().add(
      translator,
      translator.observeSessionEnd().subscribe(this.dispose.bind(this)),
      () => (this._translator = null),
    );
    await translator.initilize();
    return `${this._adapterType} debugger launched`;
  }

  async sendCommand(message: string): Promise<void> {
    if (this._translator == null) {
      this.getLogger().error(`No active session / translator: ${message}`);
    } else {
      this._translator.processCommand(JSON.parse(message));
    }
  }

  // Explicit override of service APIs for framrwork parser.

  getOutputWindowObservable(): ConnectableObservable<string> {
    return super.getOutputWindowObservable();
  }

  getAtomNotificationObservable(): ConnectableObservable<AtomNotification> {
    return super.getAtomNotificationObservable();
  }

  getServerMessageObservable(): ConnectableObservable<string> {
    return super.getServerMessageObservable();
  }

  async custom(request: string, args: any): Promise<any> {
    if (this._translator == null) {
      throw new Error(`No active session / translator: ${request}`);
    } else {
      return this._translator.getSession().custom(request, args);
    }
  }

  observeCustomEvents(): ConnectableObservable<any> {
    if (this._translator == null) {
      return Observable.throw(
        new Error('No active session / translator'),
      ).publish();
    } else {
      return this._translator
        .getSession()
        .observeCustomEvents()
        .publish();
    }
  }

  dispose(): Promise<void> {
    return super.dispose();
  }
}

export class VsRawAdapterSpawnerService extends VsAdapterSpawner {
  spawnAdapter(
    adapter: VSAdapterExecutableInfo,
  ): ConnectableObservable<ProcessMessage> {
    return super.spawnAdapter(adapter);
  }

  write(input: string): Promise<void> {
    return super.write(input);
  }

  dispose(): Promise<void> {
    return super.dispose();
  }
}
