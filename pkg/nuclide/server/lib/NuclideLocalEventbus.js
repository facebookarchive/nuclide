'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {EventEmitter} = require('events');

const {loadConfigsOfServiceWithoutServiceFramework} = require('./config');



class NuclideLocalEventbus extends EventEmitter {
  constructor(options = {}) {
    super();
    this._options = options;
    this._services = {};

    this._enabledServices = loadConfigsOfServiceWithoutServiceFramework();

    this._enabledServices.forEach((service_path) => {
      const {services} = require(service_path);
      for (const serviceId in services) {
        this._services[serviceId] = services[serviceId];
      }
    });

    // Run initialize after all services registered if exists.
    this._enabledServices.forEach((service_path) => {
      const {initialize} = require(service_path);
      if (initialize) {
        initialize(this);
      }
    });

    const {fsPromise} = require('nuclide-commons');

    // readFile and writeFile aren't exposed as services for performance optimization.
    this._services['/fs/readFile'] = {handler: fsPromise.readFile};
    this._services['/fs/writeFile'] = {handler: fsPromise.writeFile};
  }

  testConnection(): Promise<void> {
    return Promise.resolve();
  }

  async callMethod(
      serviceName: string,
      methodName: string,
      methodArgs: ?Array<any>,
      extraOptions: ?any
    ): Promise<string|any> {

    const serviceId = '/' + serviceName + '/' + methodName;
    // extend the default options with the extra options
    const service = this._services[serviceId];
    if (!service) {
      throw new Error('Cannot call a non registered local service with id: ' + serviceId);
    }
    return service.handler.apply(this, methodArgs);
  }

  callService(serviceName: string, args: Array<any>): Promise<any> {
    const serviceFunction = this._services[serviceName];
    if (!serviceFunction) {
      throw Error('No service registered with name: ' + serviceName);
    }
    return serviceFunction.handler.apply(this, args);
  }

  close(): void {
    this._enabledServices.forEach((service_path) => {
      const {shutdown} = require(service_path);
      if (shutdown) {
        shutdown(this);
      }
    });
  }
}

module.exports = NuclideLocalEventbus;
