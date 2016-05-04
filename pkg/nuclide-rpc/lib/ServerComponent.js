'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getProxy, getDefinitions} from '../../nuclide-service-parser';
import {TypeRegistry} from './TypeRegistry';
import type {
  FunctionType,
  Definition,
  InterfaceDefinition,
  Type,
} from '../../nuclide-service-parser/lib/types';
import invariant from 'assert';
import type {ConfigEntry} from './index';
import type {ObjectRegistry} from './ObjectRegistry';

const logger = require('../../nuclide-logging').getLogger();

export type FunctionImplementation = {localImplementation: Function; type: FunctionType};
export type ClassDefinition = {localImplementation: any; definition: InterfaceDefinition};

export class ServerComponent {
  _typeRegistry: TypeRegistry;

  /**
   * Store a mapping from function name to a structure holding both the local implementation and
   * the type definition of the function.
   */
  _functionsByName: Map<string, FunctionImplementation>;

  /**
   * Store a mapping from a class name to a struct containing it's local constructor and it's
   * interface definition.
   */
  _classesByName: Map<string, ClassDefinition>;

  constructor(services: Array<ConfigEntry>) {
    this._typeRegistry = new TypeRegistry();
    this._functionsByName = new Map();
    this._classesByName = new Map();

    // NuclideUri type requires no transformations (it is done on the client side).
    this._typeRegistry.registerType('NuclideUri', uri => uri, remotePath => remotePath);

    this.addServices(services);
  }

  addServices(services: Array<ConfigEntry>): void {
    services.forEach(this.addService, this);
  }

  addService(service: ConfigEntry): void {
    logger.debug(`Registering 3.0 service ${service.name}...`);
    try {
      const defs = getDefinitions(service.definition);
      // $FlowIssue - the parameter passed to require must be a literal string.
      const localImpl = require(service.implementation);
      // TODO: Remove the any cast once we have bi-directional marshalling.
      const proxy = getProxy(service.name, service.definition, (this: any));

      // Register type aliases.
      defs.forEach((definition: Definition) => {
        const name = definition.name;
        switch (definition.kind) {
          case 'alias':
            logger.debug(`Registering type alias ${name}...`);
            if (definition.definition != null) {
              this._typeRegistry.registerAlias(name, (definition.definition: Type));
            }
            break;
          case 'function':
            // Register module-level functions.
            this._registerFunction(`${service.name}/${name}`, localImpl[name], definition.type);
            break;
          case 'interface':
            // Register interfaces.
            logger.debug(`Registering interface ${name}...`);
            this._classesByName.set(name, {
              localImplementation: localImpl[name],
              definition,
            });

            this._typeRegistry.registerType(
              name,
              (object, context: ObjectRegistry) => context.marshal(name, object),
              (objectId, context: ObjectRegistry) => context.unmarshal(objectId, proxy[name]));

            // Register all of the static methods as remote functions.
            definition.staticMethods.forEach((funcType, funcName) => {
              this._registerFunction(`${name}/${funcName}`, localImpl[name][funcName], funcType);
            });
            break;
        }
      });

    } catch (e) {
      logger.error(`Failed to load service ${service.name}. Stack Trace:\n${e.stack}`);
      throw e;
    }
  }

  _registerFunction(name: string, localImpl: Function, type: FunctionType): void {
    logger.debug(`Registering function ${name}...`);
    if (this._functionsByName.has(name)) {
      throw new Error(`Duplicate RPC function: ${name}`);
    }
    this._functionsByName.set(name, {
      localImplementation: localImpl,
      type,
    });
  }

  getFunctionImplemention(name: string): FunctionImplementation {
    const result = this._functionsByName.get(name);
    invariant(result);
    return result;
  }

  getClassDefinition(className: string): ClassDefinition {
    const result = this._classesByName.get(className);
    invariant(result != null);
    return result;
  }

  getTypeRegistry(): TypeRegistry {
    return this._typeRegistry;
  }
}
