'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This code implements the NuclideFs client.  It uses the request module to
 * make XHR requests to the NuclideFS service.  It is a Promise based API.
 */

type NuclideClientOptions = {
  cwd: ?string;
};

class NuclideClient {
  _id: string;
  _options: NuclideClientOptions;
  eventbus: NuclideEventbus;

  constructor(id: string, eventbus: NuclideEventbus, options: ?NuclideClientOptions = {}) {
    this._id = id;
    this.eventbus = eventbus;
    this._options = options;
    this._searchProviders = {};
  }

  getID() {
    return this._id;
  }

  // Resolves if the connection looks healthy.
  // Will reject quickly if the connection looks unhealthy.
  testConnection(): Promise<void> {
    return this.eventbus.testConnection();
  }

  // Delegate RPC functions to the NuclideRemoteEventbus class.
  callRemoteFunction(...args: Array<any>): any {
    return this.eventbus.callRemoteFunction.apply(this.eventbus, args);
  }
  createRemoteObject(...args: Array<any>): Promise<number> {
    return this.eventbus.createRemoteObject.apply(this.eventbus, args);
  }
  callRemoteMethod(...args: Array<any>): any {
    return this.eventbus.callRemoteMethod.apply(this.eventbus, args);
  }
  disposeRemoteObject(...args: Array<any>): Promise<void> {
    return this.eventbus.disposeRemoteObject.apply(this.eventbus, args);
  }

  // Delegate marshalling to the NuclideRemoteEventbus class.
  marshal(...args): any {
    return this.eventbus.marshal(...args);
  }
  unmarshal(...args): any {
    return this.eventbus.unmarshal(...args);
  }
  registerType(...args): void {
    return this.eventbus.registerType(...args);
  }

  close() : void {
    if (this.eventbus) {
      this.eventbus.close();
      this.eventbus = null;
    }
  }
}

module.exports = NuclideClient;
