'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {EventEmitter} = require('events');
var path = require('path');
var {loadConfigsOfServiceWithoutServiceFramework} = require('./config');

var idIncrement = 0;

class NuclideLocalEventbus extends EventEmitter {
  constructor(options = {}) {
    super();
    // Servces can use the eventbus API like: `this.publish(eventName, {})`.
    this.publish = this.broadcast = this.emit;
    this.subscribe = this.on;
    this.subscribeOnce = this.once;
    this.unsubscribe = this.removeListener;
    this._eventEmitters = {};
    this._options = options;
    this._services = {};

    this._enabledServices = loadConfigsOfServiceWithoutServiceFramework();

    this._enabledServices.forEach((service_path) => {
      var {services} = require(service_path);
      for (var serviceId in services) {
        this._services[serviceId] = services[serviceId];
      }
    });

    // Run initialize after all services registered if exists.
    this._enabledServices.forEach((service_path) => {
      var {initialize} = require(service_path);
      if (initialize) {
        initialize(this);
      }
    });

    var {fsPromise} = require('nuclide-commons');

    // readFile and writeFile aren't exposed as services for performance optimization.
    this._services['/fs/readFile'] = {handler: fsPromise.readFile};
    this._services['/fs/writeFile'] = {handler: fsPromise.writeFile};
  }

  async callMethod(
      serviceName: string,
      methodName: string,
      methodArgs: ?Array<any>,
      extraOptions: ?any
    ): Promise<string|any> {

    var serviceId = '/' + serviceName + '/' + methodName;
    // extend the default options with the extra options
    var service = this._services[serviceId];
    if (!service) {
      throw new Error('Cannot call a non registered local service with id: ' + serviceId);
    }
    return service.handler.apply(this, methodArgs);
  }

  callService(serviceName: string, args: Array<any>): Promise<any> {
    var serviceFunction = this._services[serviceName];
    if (!serviceFunction) {
      throw Error('No service registered with name: ' + serviceName);
    }
    return serviceFunction.handler.apply(this, args);
  }

  async subscribeToChannel(channel: string, handler: (event: ?any) => void): Promise<Disposable> {
    this.on(channel, handler);
    return {
      dispose: () => this.removeListener(channel, handler),
    };
  }

  consumeStream(streamId: number): Promise<Stream> {
    var streamEvents = ['data', 'error', 'close', 'end'];
    return this.consumeEventEmitter(streamId, streamEvents, ['end']);
  }

  consumeEventEmitter(id: number): Promise<EventEmitter> {
   return Promise.resolve(this.getEventEmitter(id));
  }

  registerEventEmitter(eventEmitter: EventEmitter): number {
    var id = ++idIncrement;
    this._eventEmitters[id] = eventEmitter;
    return id;
  }

  getEventEmitter(id: number): EventEmitter {
    return this._eventEmitters[id];
  }

  close(): void {
    this._enabledServices.forEach((service_path) => {
      var {shutdown} = require(service_path);
      if (shutdown) {
        shutdown(this);
      }
    });
  }
}

module.exports = NuclideLocalEventbus;
