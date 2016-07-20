Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _main2;

function _main() {
  return _main2 = require('./main');
}

var _TypeRegistry2;

function _TypeRegistry() {
  return _TypeRegistry2 = require('./TypeRegistry');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _builtinTypes2;

function _builtinTypes() {
  return _builtinTypes2 = require('./builtin-types');
}

var logger = require('../../nuclide-logging').getLogger();

// Maps from RpcContext to proxy

var ServiceRegistry = (function () {

  // Don't call directly, use factory methods below.

  function ServiceRegistry(marshalUri, unmarshalUri, services) {
    _classCallCheck(this, ServiceRegistry);

    this._typeRegistry = new (_TypeRegistry2 || _TypeRegistry()).TypeRegistry();
    this._functionsByName = new Map();
    this._classesByName = new Map();
    this._services = new Map();

    // NuclideUri type requires no transformations (it is done on the client side).
    this._typeRegistry.registerType('NuclideUri', (_builtinTypes2 || _builtinTypes()).builtinLocation, marshalUri, unmarshalUri);

    this.addServices(services);
  }

  // Create local service registry.

  _createClass(ServiceRegistry, [{
    key: 'addServices',
    value: function addServices(services) {
      services.forEach(this.addService, this);
    }
  }, {
    key: 'addService',
    value: function addService(service) {
      var _this = this;

      var preserveFunctionNames = service.preserveFunctionNames != null && service.preserveFunctionNames;
      logger.debug('Registering 3.0 service ' + service.name + '...');
      try {
        (function () {
          var factory = (0, (_main2 || _main()).createProxyFactory)(service.name, preserveFunctionNames, service.definition);
          // $FlowIssue - the parameter passed to require must be a literal string.
          var localImpl = require(service.implementation);
          _this._services.set(service.name, {
            name: service.name,
            factory: factory
          });

          // Register type aliases.
          factory.defs.forEach(function (definition) {
            var name = definition.name;
            switch (definition.kind) {
              case 'alias':
                logger.debug('Registering type alias ' + name + '...');
                if (definition.definition != null) {
                  _this._typeRegistry.registerAlias(name, definition.location, definition.definition);
                }
                break;
              case 'function':
                // Register module-level functions.
                var functionName = service.preserveFunctionNames ? name : service.name + '/' + name;
                _this._registerFunction(functionName, localImpl[name], definition.type);
                break;
              case 'interface':
                // Register interfaces.
                logger.debug('Registering interface ' + name + '...');
                _this._classesByName.set(name, {
                  localImplementation: localImpl[name],
                  definition: definition
                });

                _this._typeRegistry.registerType(name, definition.location, function (object, context) {
                  return context.marshal(name, object);
                }, function (objectId, context) {
                  return context.unmarshal(objectId, context.getService(service.name)[name]);
                });

                // Register all of the static methods as remote functions.
                definition.staticMethods.forEach(function (funcType, funcName) {
                  _this._registerFunction(name + '/' + funcName, localImpl[name][funcName], funcType);
                });
                break;
            }
          });
        })();
      } catch (e) {
        logger.error('Failed to load service ' + service.name + '. Stack Trace:\n' + e.stack);
        throw e;
      }
    }
  }, {
    key: '_registerFunction',
    value: function _registerFunction(name, localImpl, type) {
      logger.debug('Registering function ' + name + '...');
      if (this._functionsByName.has(name)) {
        throw new Error('Duplicate RPC function: ' + name);
      }
      this._functionsByName.set(name, {
        localImplementation: localImpl,
        type: type
      });
    }
  }, {
    key: 'getFunctionImplemention',
    value: function getFunctionImplemention(name) {
      var result = this._functionsByName.get(name);
      (0, (_assert2 || _assert()).default)(result);
      return result;
    }
  }, {
    key: 'getClassDefinition',
    value: function getClassDefinition(className) {
      var result = this._classesByName.get(className);
      (0, (_assert2 || _assert()).default)(result != null);
      return result;
    }
  }, {
    key: 'getTypeRegistry',
    value: function getTypeRegistry() {
      return this._typeRegistry;
    }
  }, {
    key: 'getServices',
    value: function getServices() {
      return this._services.values();
    }
  }, {
    key: 'hasService',
    value: function hasService(serviceName) {
      return this._services.has(serviceName);
    }
  }, {
    key: 'getService',
    value: function getService(serviceName) {
      var result = this._services.get(serviceName);
      (0, (_assert2 || _assert()).default)(result != null);
      return result;
    }
  }], [{
    key: 'createLocal',
    value: function createLocal(services) {
      return new ServiceRegistry(function (uri) {
        return uri;
      }, function (remotePath) {
        return remotePath;
      }, services);
    }

    // Create service registry for connections to a remote machine.
  }, {
    key: 'createRemote',
    value: function createRemote(hostname, services) {
      return new ServiceRegistry(function (remoteUri) {
        return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(remoteUri);
      }, function (path) {
        return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.createRemoteUri(hostname, path);
      }, services);
    }
  }]);

  return ServiceRegistry;
})();

exports.ServiceRegistry = ServiceRegistry;

/**
 * Store a mapping from function name to a structure holding both the local implementation and
 * the type definition of the function.
 */

/**
 * Store a mapping from a class name to a struct containing it's local constructor and it's
 * interface definition.
 */