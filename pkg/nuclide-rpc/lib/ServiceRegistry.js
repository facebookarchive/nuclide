"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServiceRegistry = void 0;

function _main() {
  const data = require("./main");

  _main = function () {
    return data;
  };

  return data;
}

function _TypeRegistry() {
  const data = require("./TypeRegistry");

  _TypeRegistry = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-rpc');

class ServiceRegistry {
  /**
   * Store a mapping from function name to a structure holding both the local implementation and
   * the type definition of the function.
   */

  /**
   * Store a mapping from a class name to a struct containing it's local constructor and it's
   * interface definition.
   */
  // Cache the configs for lazy loading.
  constructor(predefinedTypes, services, protocol = _config().SERVICE_FRAMEWORK3_PROTOCOL, options = {}) {
    this._protocol = protocol;
    this._typeRegistry = new (_TypeRegistry().TypeRegistry)(predefinedTypes);
    this._predefinedTypes = predefinedTypes.map(predefinedType => predefinedType.typeName);
    this._functionsByName = new Map();
    this._classesByName = new Map();
    this._services = new Map();
    this._serviceConfigs = new Map(services.map(service => [service.name, service]));

    if (options.lazy !== true) {
      services.map(service => this.addService(service));
    }
  }

  getProtocol() {
    return this._protocol;
  }

  addService(service) {
    const preserveFunctionNames = service.preserveFunctionNames != null && service.preserveFunctionNames;

    try {
      const factory = (0, _main().createProxyFactory)(service.name, preserveFunctionNames, service.definition, this._predefinedTypes);
      const serviceDefinition = {
        name: service.name,
        factory
      };

      this._services.set(service.name, serviceDefinition); // Register type aliases.


      const defs = factory.defs;
      Object.keys(defs).forEach(defName => {
        const definition = defs[defName];
        const name = definition.name;

        switch (definition.kind) {
          case 'alias':
            if (definition.definition != null) {
              this._typeRegistry.registerAlias(name, definition.location, definition.definition);
            }

            break;

          case 'function':
            // Register module-level functions.
            const functionName = service.preserveFunctionNames ? name : `${service.name}/${name}`;

            this._registerFunction(functionName, service.implementation, impl => impl[name], definition.type);

            break;

          case 'interface':
            // Register interfaces.
            this._registerClass(name, service.implementation, impl => impl[name], definition);

            this._typeRegistry.registerType(name, definition.location, (object, context) => context.marshal(name, object), (objectId, context) => context.unmarshal(objectId, name, context.getService(service.name)[name])); // Register all of the static methods as remote functions.


            Object.keys(definition.staticMethods).forEach(methodName => {
              this._registerFunction(`${name}/${methodName}`, service.implementation, impl => impl[name][methodName], definition.staticMethods[methodName]);
            });
            break;
        }
      });
      return serviceDefinition;
    } catch (e) {
      logger.error(`Failed to load service ${service.name}. Stack Trace:\n${e.stack}`);
      throw e;
    }
  }

  _registerFunction(name, id, accessor, type) {
    if (this._functionsByName.has(name)) {
      throw new Error(`Duplicate RPC function: ${name}`);
    }

    let impl;

    this._functionsByName.set(name, {
      getLocalImplementation() {
        if (impl == null) {
          // $FlowIgnore
          impl = accessor(require(id));
        }

        return impl;
      },

      type
    });
  }

  _registerClass(name, id, accessor, definition) {
    let impl;

    this._classesByName.set(name, {
      getLocalImplementation() {
        if (impl == null) {
          // $FlowIgnore
          impl = accessor(require(id));
        }

        return impl;
      },

      definition
    });
  }

  getFunctionImplemention(name) {
    const result = this._functionsByName.get(name);

    if (!result) {
      throw new Error("Invariant violation: \"result\"");
    }

    return result;
  }

  getClassDefinition(className) {
    const result = this._classesByName.get(className);

    if (!(result != null)) {
      throw new Error("Invariant violation: \"result != null\"");
    }

    return result;
  }

  getTypeRegistry() {
    return this._typeRegistry;
  }

  getService(serviceName) {
    let result = this._services.get(serviceName);

    if (result == null) {
      const config = this._serviceConfigs.get(serviceName);

      if (!(config != null)) {
        throw new Error(`Service ${serviceName} does not exist`);
      }

      result = this.addService(config);
    }

    return result;
  }

}

exports.ServiceRegistry = ServiceRegistry;