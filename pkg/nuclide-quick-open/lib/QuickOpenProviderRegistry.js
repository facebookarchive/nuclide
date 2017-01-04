/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  Provider,
  ProviderType,
} from './types';

import {Emitter} from 'atom';
import {getLogger} from '../../nuclide-logging';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

function isValidProvider(provider): boolean {
  return (
    typeof provider.getProviderType === 'function' &&
    typeof provider.getName === 'function' && typeof provider.getName() === 'string' &&
    typeof provider.isRenderable === 'function' &&
    typeof provider.executeQuery === 'function' &&
    typeof provider.getTabTitle === 'function'
  );
}

export default class QuickOpenProviderRegistry {
  _emitter: Emitter;
  _subscriptions: UniversalDisposable;
  _registeredProviders: {[key: ProviderType]: Map<string, Provider>};

  constructor() {
    this._emitter = new Emitter();
    this._subscriptions = new UniversalDisposable();
    this._registeredProviders = {
      GLOBAL: new Map(),
      DIRECTORY: new Map(),
    };
  }

  getProviders(): Array<Provider> {
    return [
      // $FlowIssue: Iterator is spreadable.
      ...this._registeredProviders.GLOBAL.values(),
      // $FlowIssue: Iterator is spreadable.
      ...this._registeredProviders.DIRECTORY.values(),
    ];
  }

  getGlobalProviders(): Array<Provider> {
    return Array.from(this._registeredProviders.GLOBAL.values());
  }

  getDirectoryProviders(): Array<Provider> {
    return Array.from(this._registeredProviders.DIRECTORY.values());
  }

  getProviderByName(serviceName: string): ?Provider {
    return this._registeredProviders.GLOBAL.get(serviceName)
        || this._registeredProviders.DIRECTORY.get(serviceName);
  }

  isProviderGlobal(serviceName: string): boolean {
    return this._registeredProviders.GLOBAL.has(serviceName);
  }

  observeProviders(callback: (service: Provider) => void): IDisposable {
    for (const provider of this.getProviders()) {
      callback(provider);
    }
    return this.onDidAddProvider(callback);
  }

  onDidAddProvider(callback: (service: Provider) => void): IDisposable {
    return this._emitter.on('did-add-provider', callback);
  }

  onDidRemoveProvider(callback: (service: Provider) => void): IDisposable {
    return this._emitter.on('did-remove-provider', callback);
  }

  addProvider(service: Provider): IDisposable {
    const serviceName = service.getName && service.getName() || '<unknown>';
    if (!isValidProvider(service)) {
      getLogger().error(`Quick-open provider ${serviceName} is not a valid provider`);
    }

    const registry = this._registeredProviders[service.getProviderType()];
    registry.set(serviceName, service);
    const disposable = new UniversalDisposable(
      () => {
        registry.delete(serviceName);
        this._emitter.emit('did-remove-provider', service);
      },
    );
    this._subscriptions.add(disposable);
    this._emitter.emit('did-add-provider', service);

    return disposable;
  }

  dispose(): void {
    this._emitter.dispose();
    this._subscriptions.dispose();
  }
}
