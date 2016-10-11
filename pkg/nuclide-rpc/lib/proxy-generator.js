Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.generateProxy = generateProxy;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _babelCoreLibTypes;

function _load_babelCoreLibTypes() {
  return _babelCoreLibTypes = _interopRequireWildcard(require('babel-core/lib/types'));
}

var _babelCoreLibGeneration;

function _load_babelCoreLibGeneration() {
  return _babelCoreLibGeneration = _interopRequireDefault(require('babel-core/lib/generation'));
}

var thenIdent = (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('then');

var observableIdentifier = (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('Observable');
var idIdentifier = (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('id');

var moduleDotExportsExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('module'), (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('exports'));
var clientIdentifier = (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('_client');

// Functions that are implemented at the connection layer.
var callRemoteFunctionExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(clientIdentifier, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('callRemoteFunction'));
var callRemoteMethodExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(clientIdentifier, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('callRemoteMethod'));
var createRemoteObjectExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(clientIdentifier, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('createRemoteObject'));
var disposeRemoteObjectExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(clientIdentifier, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('disposeRemoteObject'));

var remoteModule = (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('remoteModule');
var emptyObject = (_babelCoreLibTypes || _load_babelCoreLibTypes()).objectExpression([]);

var clientDotMarshalExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(clientIdentifier, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('marshal'));
var clientDotUnmarshalExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(clientIdentifier, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('unmarshal'));
var marshalCall = function marshalCall() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression(clientDotMarshalExpression, args);
};
var unmarshalCall = function unmarshalCall() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression(clientDotUnmarshalExpression, args);
};

var clientDotMarshalArgsExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(clientIdentifier, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('marshalArguments'));
// const clientDotUnmarshalArgsExpression
//   = t.memberExpression(clientIdentifier, t.identifier('unmarshalArguments'));

/**
 * Helper function that generates statments that can be used to marshal all of the
 * arguments to a function.
 * @param argumentTypes - An array of the types of the function's arguments.
 * @returns An expression representing a promise that resolves to an array of the arguments.
 */
var marshalArgsCall = function marshalArgsCall(params) {
  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression(clientDotMarshalArgsExpression, [(_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('Array'), (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('from')), [(_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('arguments')]), objectToLiteral(params)]);
};

// const unmarshalArgsCall = params => t.callExpression(clientDotUnmarshalArgsExpression, [
//   t.arguments,
//   objectToLiteral(params),
// ]);

// Generates `trackOperationTiming(eventName, () => { return operation; })`
var trackOperationTimingCall = function trackOperationTimingCall(eventName, operation) {
  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('trackOperationTiming'), [(_babelCoreLibTypes || _load_babelCoreLibTypes()).literal(eventName), (_babelCoreLibTypes || _load_babelCoreLibTypes()).arrowFunctionExpression([], (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement([(_babelCoreLibTypes || _load_babelCoreLibTypes()).returnStatement(operation)]))]);
};

// Generates `Object.defineProperty(module.exports, name, {value: …})`
var objectDefinePropertyCall = function objectDefinePropertyCall(name, value) {
  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('Object'), (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('defineProperty')), [moduleDotExportsExpression, (_babelCoreLibTypes || _load_babelCoreLibTypes()).literal(name), (_babelCoreLibTypes || _load_babelCoreLibTypes()).objectExpression([(_babelCoreLibTypes || _load_babelCoreLibTypes()).property('init', (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('value'), value)])]);
};

var dependenciesNodes = function dependenciesNodes(names) {
  return {
    // let name0, ... nameN;
    declaration: (_babelCoreLibTypes || _load_babelCoreLibTypes()).variableDeclaration('let', names.map(function (name) {
      return (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier(name);
    })),
    // function() { name0 = arguments[0]; ... nameN = arguments[N]; }
    injectionCall: (_babelCoreLibTypes || _load_babelCoreLibTypes()).functionExpression(null, [], (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement(names.map(function (name, i) {
      return (_babelCoreLibTypes || _load_babelCoreLibTypes()).expressionStatement((_babelCoreLibTypes || _load_babelCoreLibTypes()).assignmentExpression('=', (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier(name), (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('arguments'), (_babelCoreLibTypes || _load_babelCoreLibTypes()).literal(i))));
    })))
  };
};

/**
 * Given the parsed result of a definition file, generate a remote proxy module
 * that exports the definition's API, but internally calls RPC functions. The function
 * does not return the proxy module directly, but rather returns a 'factory' method
 * that should be called with a RpcConnection object. This factory method returns the
 * remote module with the client object 'closed over,' and used to make the RPC calls.
 * @param defs - The result of parsing the definition file.
 * @returns The proxy factory method.
 */

function generateProxy(serviceName, preserveFunctionNames, defs) {
  var statements = [];

  // Declare remoteModule as empty object.
  statements.push((_babelCoreLibTypes || _load_babelCoreLibTypes()).variableDeclaration('const', [(_babelCoreLibTypes || _load_babelCoreLibTypes()).variableDeclarator((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('remoteModule'), emptyObject)]));

  defs.forEach(function (definition) {
    var name = definition.name;
    switch (definition.kind) {
      case 'function':
        var functionName = preserveFunctionNames ? name : serviceName + '/' + name;
        // Generate a remote proxy for each module-level function.
        statements.push((_babelCoreLibTypes || _load_babelCoreLibTypes()).expressionStatement((_babelCoreLibTypes || _load_babelCoreLibTypes()).assignmentExpression('=', (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(remoteModule, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier(name)), generateFunctionProxy(functionName, definition.type))));
        break;
      case 'interface':
        // Generate a remote proxy for each remotable interface.
        statements.push((_babelCoreLibTypes || _load_babelCoreLibTypes()).expressionStatement((_babelCoreLibTypes || _load_babelCoreLibTypes()).assignmentExpression('=', (_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(remoteModule, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier(name)), generateInterfaceProxy(definition))));
        break;
      case 'alias':
        // nothing
        break;
    }
  });

  // Return the remote module.
  statements.push((_babelCoreLibTypes || _load_babelCoreLibTypes()).returnStatement(remoteModule));

  // Node module dependencies are added via the `inject` function, instead of
  // requiring them. This eliminates having to worry about module resolution.
  // In turn, that makes colocating the definition and the constructed proxy
  // easier for internal and external services.
  var deps = dependenciesNodes(['Observable', 'trackOperationTiming']);

  // Wrap the remoteModule construction in a function that takes a RpcConnection
  // object as an argument.
  var func = (_babelCoreLibTypes || _load_babelCoreLibTypes()).arrowFunctionExpression([clientIdentifier], (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement(statements));
  var assignment = (_babelCoreLibTypes || _load_babelCoreLibTypes()).assignmentExpression('=', moduleDotExportsExpression, func);
  var program = (_babelCoreLibTypes || _load_babelCoreLibTypes()).program([
  // !!!This module is not transpiled!!!
  (_babelCoreLibTypes || _load_babelCoreLibTypes()).expressionStatement((_babelCoreLibTypes || _load_babelCoreLibTypes()).literal('use strict')), deps.declaration, (_babelCoreLibTypes || _load_babelCoreLibTypes()).expressionStatement(assignment), (_babelCoreLibTypes || _load_babelCoreLibTypes()).expressionStatement(objectDefinePropertyCall('inject', deps.injectionCall)), (_babelCoreLibTypes || _load_babelCoreLibTypes()).expressionStatement(objectDefinePropertyCall('defs', objectToLiteral(defs)))]);

  // Use Babel to generate code from the AST.
  return (0, (_babelCoreLibGeneration || _load_babelCoreLibGeneration()).default)(program).code;
}

/**
 * Generate a remote proxy for a module-level function.
 * @param func - The FunctionDefinition object that represents the functions API.
 * @returns The proxy function (as an arrow function) that should be assigned to
 *   a property of the remote module.
 */
function generateFunctionProxy(name, funcType) {
  // _client.callRemoteFunction(name, kind, args)
  var callExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression(callRemoteFunctionExpression, [(_babelCoreLibTypes || _load_babelCoreLibTypes()).literal(name), (_babelCoreLibTypes || _load_babelCoreLibTypes()).literal(funcType.returnType.kind), (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('args')]);

  // Promise.all(...).then(args => { return ...)
  var argumentsPromise = marshalArgsCall(funcType.argumentTypes);
  var marshalArgsAndCall = thenPromise(argumentsPromise, (_babelCoreLibTypes || _load_babelCoreLibTypes()).arrowFunctionExpression([(_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('args')], (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement([(_babelCoreLibTypes || _load_babelCoreLibTypes()).returnStatement(callExpression)])));

  var result = generateUnmarshalResult(funcType.returnType, marshalArgsAndCall);

  // function(arg0, ... argN) { return ... }
  var args = funcType.argumentTypes.map(function (arg, i) {
    return (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('arg' + i);
  });
  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).functionExpression(null, args, (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement([(_babelCoreLibTypes || _load_babelCoreLibTypes()).returnStatement(result)]));
}

/**
 * Generate a remote proxy for an interface.
 * @param def - The InterfaceDefinition object that encodes all if the interface's operations.
 * @returns An anonymous ClassExpression node that can be assigned to a module property.
 */
function generateInterfaceProxy(def) {
  var methodDefinitions = [];

  // Generate proxies for static methods.
  def.staticMethods.forEach(function (funcType, methodName) {
    methodDefinitions.push((_babelCoreLibTypes || _load_babelCoreLibTypes()).methodDefinition((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier(methodName), generateFunctionProxy(def.name + '/' + methodName, funcType), 'method', false, true));
  });

  // Generate constructor proxy.
  if (def.constructorArgs != null) {
    methodDefinitions.push(generateRemoteConstructor(def.name, def.constructorArgs));
  }

  // Generate proxies for instance methods.
  var thisType = {
    kind: 'named',
    location: def.location,
    name: def.name
  };
  def.instanceMethods.forEach(function (funcType, methodName) {
    // dispose method is generated custom at the end
    if (methodName === 'dispose') {
      return;
    }
    var methodDefinition = generateRemoteDispatch(methodName, thisType, funcType);
    methodDefinitions.push(methodDefinition);
  });

  // Generate the dispose method.
  methodDefinitions.push(generateDisposeMethod());

  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).classExpression(null, (_babelCoreLibTypes || _load_babelCoreLibTypes()).classBody(methodDefinitions), null);
}

/**
 * Helper function that generates a remote constructor proxy.
 * @param className - The name of the interface.
 * @param constructorArgs - The types of the arguments to the constructor.
 * @returns A MethodDefinition node that can be added to a ClassBody.
 */
function generateRemoteConstructor(className, constructorArgs) {

  // arg0, .... argN
  var args = constructorArgs.map(function (arg, i) {
    return (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('arg' + i);
  });
  // [arg0, ... argN]
  var argsArray = (_babelCoreLibTypes || _load_babelCoreLibTypes()).arrayExpression(args);
  // [argType0, ... argTypeN]
  var argTypes = (_babelCoreLibTypes || _load_babelCoreLibTypes()).arrayExpression(constructorArgs.map(objectToLiteral));

  // client.createRemoteObject(className, this, [arg0, arg1, .... argN], [argType0 ... argTypeN])
  var rpcCallExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression(createRemoteObjectExpression, [(_babelCoreLibTypes || _load_babelCoreLibTypes()).literal(className), (_babelCoreLibTypes || _load_babelCoreLibTypes()).thisExpression(), argsArray, argTypes]);

  // constructor(arg0, arg1, ..., argN) { ... }
  var constructor = (_babelCoreLibTypes || _load_babelCoreLibTypes()).FunctionExpression(null, args, (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement([rpcCallExpression]));
  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).methodDefinition((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('constructor'), constructor, 'constructor', false, false);
}

/**
 * Helper function that generates a proxy for an instance method of an interface.
 * @param methodName - The name of the method.
 * @param funcType - The type information for the function.
 * @returns A MethodDefinition node that can be added to a ClassBody
 */
function generateRemoteDispatch(methodName, thisType, funcType) {
  // _client.callRemoteMethod(this, methodName, returnType, args)
  var remoteMethodCall = (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression(callRemoteMethodExpression, [idIdentifier, (_babelCoreLibTypes || _load_babelCoreLibTypes()).literal(methodName), (_babelCoreLibTypes || _load_babelCoreLibTypes()).literal(funcType.returnType.kind), (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('args')]);

  // _client.marshal(this, thisType).then(id => { return ... })
  var idThenCall = thenPromise(generateTransformStatement((_babelCoreLibTypes || _load_babelCoreLibTypes()).thisExpression(), thisType, true), (_babelCoreLibTypes || _load_babelCoreLibTypes()).arrowFunctionExpression([idIdentifier], (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement([(_babelCoreLibTypes || _load_babelCoreLibTypes()).returnStatement(remoteMethodCall)])));

  // Promise.all(...).then(args => { return ... })
  var argumentsPromise = marshalArgsCall(funcType.argumentTypes);
  var marshallThenCall = thenPromise(argumentsPromise, (_babelCoreLibTypes || _load_babelCoreLibTypes()).arrowFunctionExpression([(_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('args')], (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement([(_babelCoreLibTypes || _load_babelCoreLibTypes()).returnStatement(idThenCall)])));

  // methodName(arg0, ... argN) { return ... }
  var funcTypeArgs = funcType.argumentTypes.map(function (arg, i) {
    return (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('arg' + i);
  });
  var result = generateUnmarshalResult(funcType.returnType, marshallThenCall);
  var funcExpression = (_babelCoreLibTypes || _load_babelCoreLibTypes()).functionExpression(null, funcTypeArgs, (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement([
  // Wrap in trackOperationTiming if result returns a promise.
  (_babelCoreLibTypes || _load_babelCoreLibTypes()).returnStatement(funcType.returnType.kind === 'promise' ? trackOperationTimingCall(thisType.name + '.' + methodName, result) : result)]));

  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).methodDefinition((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier(methodName), funcExpression, 'method', false, false);
}

function generateUnmarshalResult(returnType, rpcCallExpression) {
  switch (returnType.kind) {
    case 'void':
      return rpcCallExpression;
    case 'promise':
      var promiseTransformer = generateValueTransformer(returnType.type);
      return thenPromise(rpcCallExpression, promiseTransformer);
    case 'observable':
      // rpcCallExpression is a call which returns Promise<Observable<unmarshalled result>>

      // Observable.fromPromise(rpcCallExpression)
      var callObservable = (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(observableIdentifier, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('fromPromise')), [rpcCallExpression]);
      // ... .flatMap(id => id)
      var unmarshalledValues = (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(callObservable, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('concatMap')), [(_babelCoreLibTypes || _load_babelCoreLibTypes()).arrowFunctionExpression([idIdentifier], idIdentifier)]);

      // Map the events through the appropriate marshaller. We use concatMap instead of
      // flatMap to ensure that the order doesn't change, in case one event takes especially long
      // to marshal.
      //
      // ... .concatMap(value => _client.unmarshal(value, returnType))
      var observableTransformer = generateValueTransformer(returnType.type);
      var unmarshalledObservable = (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(unmarshalledValues, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('concatMap')), [observableTransformer]);

      // And finally, convert to a ConnectableObservable with publish.
      return (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(unmarshalledObservable, (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('publish')), []);
    default:
      throw new Error('Unkown return type ' + returnType.kind + '.');
  }
}

// value => _client.unmarshal(value, type)
function generateValueTransformer(type) {
  var value = (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('value');
  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).arrowFunctionExpression([value], (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement([(_babelCoreLibTypes || _load_babelCoreLibTypes()).returnStatement(generateTransformStatement(value, type, false))]));
}

/**
 * Helper method that generates the dispose method for a class. The dispose method
 * calls `_client.disposeRemoteObject` with the object's id as a parameter.
 * @returns A MethodDefinition node that can be attached to a class body.
 */
function generateDisposeMethod() {
  // return _client.disposeRemoteObject(this);
  var returnStatement = (_babelCoreLibTypes || _load_babelCoreLibTypes()).returnStatement((_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression(disposeRemoteObjectExpression, [(_babelCoreLibTypes || _load_babelCoreLibTypes()).thisExpression()]));

  // dispose() { ... }
  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).methodDefinition((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('dispose'), (_babelCoreLibTypes || _load_babelCoreLibTypes()).functionExpression(null, [], (_babelCoreLibTypes || _load_babelCoreLibTypes()).blockStatement([returnStatement])), 'method', false, false);
}

/**
 * Helper function that generates a transformation statement for an object. This ammounts to
 * a call either to _client.marshal or _client.unmarshal.
 * @param id {Identifier} The identifier of the value to convert.
 * @param type {Type} The type of the value to convert.
 * @param marshal {boolean} - If true, then we are trying to marshal the value. If false, then
 *   we are trying to unmarshal.
 */
function generateTransformStatement(id, type, marshal) {
  // The first argument is the value to be marshalled or unmarshalled.
  // The second argument is the type object, which encodes all of the information required
  // to marshal / unmarshal the value.
  var convertArgs = [id, objectToLiteral(type)];

  // If the type is parameterized, we send the parameters as an optional fourth argument.
  if (type.param) {
    convertArgs.push(objectToLiteral(type.param));
  }

  // Return the appropriate call.
  return (marshal ? marshalCall : unmarshalCall).apply(this, convertArgs);
}

/**
 * Takes an object, and recursively converts it to a Babel AST literal node. This handles strings,
 * numbers, booleans, basic objects, and Arrays. This cannot handle circular references.
 * @param obj - The object to convert.
 * @returns A babel AST node.
 */
function objectToLiteral(obj) {
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || obj === null) {
    // abc, 123, true, false, null
    return (_babelCoreLibTypes || _load_babelCoreLibTypes()).literal(obj);
  } else if (obj === undefined) {
    // undefined
    return (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('undefined');
  } else if (Array.isArray(obj)) {
    // [...]
    return (_babelCoreLibTypes || _load_babelCoreLibTypes()).arrayExpression(obj.map(function (elem) {
      return objectToLiteral(elem);
    }));
  } else if (obj instanceof Map) {
    return (_babelCoreLibTypes || _load_babelCoreLibTypes()).newExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier('Map'), obj.size
    // new Map([...])
    ? [objectToLiteral(Array.from(obj.entries()))]
    // new Map()
    : null);
  } else if (typeof obj === 'object') {
    // {a: 1, b: 2}
    return (_babelCoreLibTypes || _load_babelCoreLibTypes()).objectExpression(Object.keys(obj).map(function (key) {
      return (_babelCoreLibTypes || _load_babelCoreLibTypes()).property('init', (_babelCoreLibTypes || _load_babelCoreLibTypes()).identifier(key), objectToLiteral(obj[key]));
    }));
  }

  throw new Error('Cannot convert unknown type ' + typeof obj + ' to literal.');
}

/**
 * Helper function that `.then`s on a promise.
 * @param promiseExpression - An expression that will evaluate to a promise.
 * @param functionExpression - A function to pass as an argument to `.then`
 * @returns A CallExpression node that `.then`s on the provided promise.
 */
function thenPromise(promiseExpression, functionExpression) {
  return (_babelCoreLibTypes || _load_babelCoreLibTypes()).callExpression((_babelCoreLibTypes || _load_babelCoreLibTypes()).memberExpression(promiseExpression, thenIdent), [functionExpression]);
}

/** Export private functions for unit-testing. */
var __test__ = {
  generateTransformStatement: generateTransformStatement,
  objectToLiteral: objectToLiteral
};
exports.__test__ = __test__;