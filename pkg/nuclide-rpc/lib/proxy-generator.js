'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;
exports.generateProxy = generateProxy;

var _babelTypes;

function _load_babelTypes() {
  return _babelTypes = _interopRequireWildcard(require('babel-types'));
}

var _babelGenerator;

function _load_babelGenerator() {
  return _babelGenerator = _interopRequireDefault(require('babel-generator'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const thenIdent = (_babelTypes || _load_babelTypes()).identifier('then');

const observableIdentifier = (_babelTypes || _load_babelTypes()).identifier('Observable');
const idIdentifier = (_babelTypes || _load_babelTypes()).identifier('id');

const moduleDotExportsExpression = (_babelTypes || _load_babelTypes()).memberExpression((_babelTypes || _load_babelTypes()).identifier('module'), (_babelTypes || _load_babelTypes()).identifier('exports'));
const clientIdentifier = (_babelTypes || _load_babelTypes()).identifier('_client');

// Functions that are implemented at the connection layer.
const callRemoteFunctionExpression = (_babelTypes || _load_babelTypes()).memberExpression(clientIdentifier, (_babelTypes || _load_babelTypes()).identifier('callRemoteFunction'));
const callRemoteMethodExpression = (_babelTypes || _load_babelTypes()).memberExpression(clientIdentifier, (_babelTypes || _load_babelTypes()).identifier('callRemoteMethod'));
const createRemoteObjectExpression = (_babelTypes || _load_babelTypes()).memberExpression(clientIdentifier, (_babelTypes || _load_babelTypes()).identifier('createRemoteObject'));
const disposeRemoteObjectExpression = (_babelTypes || _load_babelTypes()).memberExpression(clientIdentifier, (_babelTypes || _load_babelTypes()).identifier('disposeRemoteObject'));

const remoteModule = (_babelTypes || _load_babelTypes()).identifier('remoteModule');
const emptyObject = (_babelTypes || _load_babelTypes()).objectExpression([]);

const clientDotMarshalExpression = (_babelTypes || _load_babelTypes()).memberExpression(clientIdentifier, (_babelTypes || _load_babelTypes()).identifier('marshal'));
const clientDotUnmarshalExpression = (_babelTypes || _load_babelTypes()).memberExpression(clientIdentifier, (_babelTypes || _load_babelTypes()).identifier('unmarshal'));
const marshalCall = (...args) => (_babelTypes || _load_babelTypes()).callExpression(clientDotMarshalExpression, args);
const unmarshalCall = (...args) => (_babelTypes || _load_babelTypes()).callExpression(clientDotUnmarshalExpression, args);

const clientDotMarshalArgsExpression = (_babelTypes || _load_babelTypes()).memberExpression(clientIdentifier, (_babelTypes || _load_babelTypes()).identifier('marshalArguments'));
// const clientDotUnmarshalArgsExpression
//   = t.memberExpression(clientIdentifier, t.identifier('unmarshalArguments'));

/**
 * Helper function that generates statments that can be used to marshal all of the
 * arguments to a function.
 * @param argumentTypes - An array of the types of the function's arguments.
 * @returns An expression representing a promise that resolves to an array of the arguments.
 */
const marshalArgsCall = params => (_babelTypes || _load_babelTypes()).callExpression(clientDotMarshalArgsExpression, [(_babelTypes || _load_babelTypes()).callExpression((_babelTypes || _load_babelTypes()).memberExpression((_babelTypes || _load_babelTypes()).identifier('Array'), (_babelTypes || _load_babelTypes()).identifier('from')), [(_babelTypes || _load_babelTypes()).identifier('arguments')]), objectToLiteral(params)]);

// const unmarshalArgsCall = params => t.callExpression(clientDotUnmarshalArgsExpression, [
//   t.arguments,
//   objectToLiteral(params),
// ]);

// Generates `Object.defineProperty(module.exports, name, {value: …})`
const objectDefinePropertyCall = (name, value) => (_babelTypes || _load_babelTypes()).callExpression((_babelTypes || _load_babelTypes()).memberExpression((_babelTypes || _load_babelTypes()).identifier('Object'), (_babelTypes || _load_babelTypes()).identifier('defineProperty')), [moduleDotExportsExpression, (_babelTypes || _load_babelTypes()).stringLiteral(name), (_babelTypes || _load_babelTypes()).objectExpression([(_babelTypes || _load_babelTypes()).objectProperty((_babelTypes || _load_babelTypes()).identifier('value'), value)])]);

const dependenciesNodes = names => {
  return {
    // let name0, ... nameN;
    declaration: (_babelTypes || _load_babelTypes()).variableDeclaration('let', names.map(name => (_babelTypes || _load_babelTypes()).variableDeclarator((_babelTypes || _load_babelTypes()).identifier(name)))),
    // function() { name0 = arguments[0]; ... nameN = arguments[N]; }
    injectionCall: (_babelTypes || _load_babelTypes()).functionExpression(null, [], (_babelTypes || _load_babelTypes()).blockStatement(names.map((name, i) => (_babelTypes || _load_babelTypes()).expressionStatement((_babelTypes || _load_babelTypes()).assignmentExpression('=', (_babelTypes || _load_babelTypes()).identifier(name), (_babelTypes || _load_babelTypes()).memberExpression((_babelTypes || _load_babelTypes()).identifier('arguments'), (_babelTypes || _load_babelTypes()).numericLiteral(i),
    /* computed: */true))))))
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
  const statements = [];

  // Declare remoteModule as empty object.
  statements.push((_babelTypes || _load_babelTypes()).variableDeclaration('const', [(_babelTypes || _load_babelTypes()).variableDeclarator((_babelTypes || _load_babelTypes()).identifier('remoteModule'), emptyObject)]));

  Object.keys(defs).forEach(defName => {
    const definition = defs[defName];
    const name = definition.name;
    switch (definition.kind) {
      case 'function':
        const functionName = preserveFunctionNames ? name : `${serviceName}/${name}`;
        // Generate a remote proxy for each module-level function.
        statements.push((_babelTypes || _load_babelTypes()).expressionStatement((_babelTypes || _load_babelTypes()).assignmentExpression('=', (_babelTypes || _load_babelTypes()).memberExpression(remoteModule, (_babelTypes || _load_babelTypes()).identifier(name)), generateFunctionProxy(functionName, definition.type))));
        break;
      case 'interface':
        // Generate a remote proxy for each remotable interface.
        statements.push((_babelTypes || _load_babelTypes()).expressionStatement((_babelTypes || _load_babelTypes()).assignmentExpression('=', (_babelTypes || _load_babelTypes()).memberExpression(remoteModule, (_babelTypes || _load_babelTypes()).identifier(name)), generateInterfaceProxy(definition))));
        break;
      case 'alias':
        // nothing
        break;
    }
  });

  // Return the remote module.
  statements.push((_babelTypes || _load_babelTypes()).returnStatement(remoteModule));

  // Node module dependencies are added via the `inject` function, instead of
  // requiring them. This eliminates having to worry about module resolution.
  // In turn, that makes colocating the definition and the constructed proxy
  // easier for internal and external services.
  const deps = dependenciesNodes(['Observable']);

  // Wrap the remoteModule construction in a function that takes a RpcConnection
  // object as an argument.
  const func = (_babelTypes || _load_babelTypes()).arrowFunctionExpression([clientIdentifier], (_babelTypes || _load_babelTypes()).blockStatement(statements));
  const assignment = (_babelTypes || _load_babelTypes()).assignmentExpression('=', moduleDotExportsExpression, func);
  const program = (_babelTypes || _load_babelTypes()).program([
  // !!!This module is not transpiled!!!
  (_babelTypes || _load_babelTypes()).expressionStatement((_babelTypes || _load_babelTypes()).stringLiteral('use strict')), deps.declaration, (_babelTypes || _load_babelTypes()).expressionStatement(assignment), (_babelTypes || _load_babelTypes()).expressionStatement(objectDefinePropertyCall('inject', deps.injectionCall)), (_babelTypes || _load_babelTypes()).expressionStatement(objectDefinePropertyCall('defs', objectToLiteral(defs)))]);

  // Use Babel to generate code from the AST.
  return (0, (_babelGenerator || _load_babelGenerator()).default)(program).code;
}

/**
 * Generate a remote proxy for a module-level function.
 * @param func - The FunctionDefinition object that represents the functions API.
 * @returns The proxy function (as an arrow function) that should be assigned to
 *   a property of the remote module.
 */
function generateFunctionProxy(name, funcType) {
  // _client.callRemoteFunction(name, kind, args)
  const callExpression = (_babelTypes || _load_babelTypes()).callExpression(callRemoteFunctionExpression, [(_babelTypes || _load_babelTypes()).stringLiteral(name), (_babelTypes || _load_babelTypes()).stringLiteral(funcType.returnType.kind), (_babelTypes || _load_babelTypes()).identifier('args')]);

  // Promise.all(...).then(args => { return ...)
  const argumentsPromise = marshalArgsCall(funcType.argumentTypes);

  const result = generateUnmarshalResult(funcType.returnType, argumentsPromise, (_babelTypes || _load_babelTypes()).arrowFunctionExpression([(_babelTypes || _load_babelTypes()).identifier('args')], (_babelTypes || _load_babelTypes()).blockStatement([(_babelTypes || _load_babelTypes()).returnStatement(callExpression)])));

  // function(arg0, ... argN) { return ... }
  const args = funcType.argumentTypes.map((arg, i) => (_babelTypes || _load_babelTypes()).identifier(`arg${i}`));
  return (_babelTypes || _load_babelTypes()).functionExpression(null, args, (_babelTypes || _load_babelTypes()).blockStatement([(_babelTypes || _load_babelTypes()).returnStatement(result)]));
}

/**
 * Generate a remote proxy for an interface.
 * @param def - The InterfaceDefinition object that encodes all if the interface's operations.
 * @returns An anonymous ClassExpression node that can be assigned to a module property.
 */
function generateInterfaceProxy(def) {
  const methodDefinitions = [];

  // Generate proxies for static methods.
  Object.keys(def.staticMethods).forEach(methodName => {
    const funcType = def.staticMethods[methodName];
    const funcProxy = generateFunctionProxy(`${def.name}/${methodName}`, funcType);
    methodDefinitions.push((_babelTypes || _load_babelTypes()).classMethod('method', (_babelTypes || _load_babelTypes()).identifier(methodName), funcProxy.params, funcProxy.body,
    /* computed: */false,
    /* static: */true));
  });

  // Generate constructor proxy.
  if (def.constructorArgs != null) {
    methodDefinitions.push(generateRemoteConstructor(def.name, def.constructorArgs));
  }

  // Generate proxies for instance methods.
  const thisType = {
    kind: 'named',
    location: def.location,
    name: def.name
  };
  Object.keys(def.instanceMethods).forEach(methodName => {
    const funcType = def.instanceMethods[methodName];
    // dispose method is generated custom at the end
    if (methodName === 'dispose') {
      return;
    }
    const methodDefinition = generateRemoteDispatch(methodName, thisType, funcType);
    methodDefinitions.push(methodDefinition);
  });

  // Generate the dispose method.
  methodDefinitions.push(generateDisposeMethod());

  return (_babelTypes || _load_babelTypes()).classExpression(null, null, (_babelTypes || _load_babelTypes()).classBody(methodDefinitions), []);
}

/**
 * Helper function that generates a remote constructor proxy.
 * @param className - The name of the interface.
 * @param constructorArgs - The types of the arguments to the constructor.
 * @returns A MethodDefinition node that can be added to a ClassBody.
 */
function generateRemoteConstructor(className, constructorArgs) {
  // arg0, .... argN
  const args = constructorArgs.map((arg, i) => (_babelTypes || _load_babelTypes()).identifier(`arg${i}`));
  // [arg0, ... argN]
  const argsArray = (_babelTypes || _load_babelTypes()).arrayExpression(args);
  // [argType0, ... argTypeN]
  const argTypes = (_babelTypes || _load_babelTypes()).arrayExpression(constructorArgs.map(objectToLiteral));

  // client.createRemoteObject(className, this, [arg0, arg1, .... argN], [argType0 ... argTypeN])
  const rpcCallExpression = (_babelTypes || _load_babelTypes()).callExpression(createRemoteObjectExpression, [(_babelTypes || _load_babelTypes()).stringLiteral(className), (_babelTypes || _load_babelTypes()).thisExpression(), argsArray, argTypes]);

  // constructor(arg0, arg1, ..., argN) { ... }
  return (_babelTypes || _load_babelTypes()).classMethod('constructor', (_babelTypes || _load_babelTypes()).identifier('constructor'), args, (_babelTypes || _load_babelTypes()).blockStatement([(_babelTypes || _load_babelTypes()).expressionStatement(rpcCallExpression)]));
}

/**
 * Helper function that generates a proxy for an instance method of an interface.
 * @param methodName - The name of the method.
 * @param funcType - The type information for the function.
 * @returns A MethodDefinition node that can be added to a ClassBody
 */
function generateRemoteDispatch(methodName, thisType, funcType) {
  // _client.callRemoteMethod(this, methodName, returnType, args)
  const remoteMethodCall = (_babelTypes || _load_babelTypes()).callExpression(callRemoteMethodExpression, [idIdentifier, (_babelTypes || _load_babelTypes()).stringLiteral(methodName), (_babelTypes || _load_babelTypes()).stringLiteral(funcType.returnType.kind), (_babelTypes || _load_babelTypes()).identifier('args')]);

  // Promise.all([argumentsPromise, idPromise])
  const argumentsPromise = marshalArgsCall(funcType.argumentTypes);
  const promiseAll = (_babelTypes || _load_babelTypes()).callExpression((_babelTypes || _load_babelTypes()).memberExpression((_babelTypes || _load_babelTypes()).identifier('Promise'), (_babelTypes || _load_babelTypes()).identifier('all')), [(_babelTypes || _load_babelTypes()).arrayExpression([argumentsPromise, generateTransformStatement((_babelTypes || _load_babelTypes()).thisExpression(), thisType, true)])]);

  // ... .then(([args, id]) => callRemoteMethod)
  const result = generateUnmarshalResult(funcType.returnType, promiseAll, (_babelTypes || _load_babelTypes()).arrowFunctionExpression([(_babelTypes || _load_babelTypes()).arrayPattern([(_babelTypes || _load_babelTypes()).identifier('args'), idIdentifier])], remoteMethodCall));

  // methodName(arg0, ... argN) { return ... }
  const funcTypeArgs = funcType.argumentTypes.map((arg, i) => (_babelTypes || _load_babelTypes()).identifier(`arg${i}`));
  return (_babelTypes || _load_babelTypes()).classMethod('method', (_babelTypes || _load_babelTypes()).identifier(methodName), funcTypeArgs, (_babelTypes || _load_babelTypes()).blockStatement([(_babelTypes || _load_babelTypes()).returnStatement(result)]));
}

function generateUnmarshalResult(returnType, argsExpression, callExpression) {
  switch (returnType.kind) {
    case 'void':
      return thenPromise(argsExpression, callExpression);
    case 'promise':
      const promiseTransformer = generateValueTransformer(returnType.type);
      return thenPromise(thenPromise(argsExpression, callExpression), promiseTransformer);
    case 'observable':
      // Observable.fromPromise(argsExpression)
      const argsObservable = (_babelTypes || _load_babelTypes()).callExpression((_babelTypes || _load_babelTypes()).memberExpression(observableIdentifier, (_babelTypes || _load_babelTypes()).identifier('fromPromise')), [argsExpression]);
      // ... .switchMap(callExpression)
      const callObservable = (_babelTypes || _load_babelTypes()).callExpression((_babelTypes || _load_babelTypes()).memberExpression(argsObservable, (_babelTypes || _load_babelTypes()).identifier('switchMap')), [callExpression]);

      // Map the events through the appropriate marshaller. We use concatMap instead of
      // flatMap to ensure that the order doesn't change, in case one event takes especially long
      // to marshal.
      //
      // ... .concatMap(value => _client.unmarshal(value, returnType))
      const observableTransformer = generateValueTransformer(returnType.type);
      const unmarshalledObservable = (_babelTypes || _load_babelTypes()).callExpression((_babelTypes || _load_babelTypes()).memberExpression(callObservable, (_babelTypes || _load_babelTypes()).identifier('concatMap')), [observableTransformer]);

      // And finally, convert to a ConnectableObservable with publish.
      return (_babelTypes || _load_babelTypes()).callExpression((_babelTypes || _load_babelTypes()).memberExpression(unmarshalledObservable, (_babelTypes || _load_babelTypes()).identifier('publish')), []);
    default:
      throw new Error(`Unkown return type ${returnType.kind}.`);
  }
}

// value => _client.unmarshal(value, type)
function generateValueTransformer(type) {
  const value = (_babelTypes || _load_babelTypes()).identifier('value');
  return (_babelTypes || _load_babelTypes()).arrowFunctionExpression([value], (_babelTypes || _load_babelTypes()).blockStatement([(_babelTypes || _load_babelTypes()).returnStatement(generateTransformStatement(value, type, false))]));
}

/**
 * Helper method that generates the dispose method for a class. The dispose method
 * calls `_client.disposeRemoteObject` with the object's id as a parameter.
 * @returns A MethodDefinition node that can be attached to a class body.
 */
function generateDisposeMethod() {
  // return _client.disposeRemoteObject(this);
  const returnStatement = (_babelTypes || _load_babelTypes()).returnStatement((_babelTypes || _load_babelTypes()).callExpression(disposeRemoteObjectExpression, [(_babelTypes || _load_babelTypes()).thisExpression()]));

  // dispose() { ... }
  return (_babelTypes || _load_babelTypes()).classMethod('method', (_babelTypes || _load_babelTypes()).identifier('dispose'), [], (_babelTypes || _load_babelTypes()).blockStatement([returnStatement]));
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
  const convertArgs = [id, objectToLiteral(type)];

  // If the type is parameterized, we send the parameters as an optional fourth argument.
  // flowlint-next-line sketchy-null-mixed:off
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
  if (typeof obj === 'string') {
    return (_babelTypes || _load_babelTypes()).stringLiteral(obj);
  } else if (typeof obj === 'number') {
    return (_babelTypes || _load_babelTypes()).numericLiteral(obj);
  } else if (typeof obj === 'boolean') {
    return (_babelTypes || _load_babelTypes()).booleanLiteral(obj);
  } else if (obj === null) {
    return (_babelTypes || _load_babelTypes()).nullLiteral();
  } else if (obj === undefined) {
    // undefined
    return (_babelTypes || _load_babelTypes()).identifier('undefined');
  } else if (Array.isArray(obj)) {
    // [...]
    return (_babelTypes || _load_babelTypes()).arrayExpression(obj.map(elem => objectToLiteral(elem)));
  } else if (obj instanceof Map) {
    return (_babelTypes || _load_babelTypes()).newExpression((_babelTypes || _load_babelTypes()).identifier('Map'), obj.size ? // new Map([...])
    [objectToLiteral(Array.from(obj.entries()))] : // new Map()
    []);
  } else if (typeof obj === 'object') {
    // {a: 1, b: 2}
    return (_babelTypes || _load_babelTypes()).objectExpression(Object.keys(obj).map(key => (_babelTypes || _load_babelTypes()).objectProperty((_babelTypes || _load_babelTypes()).isValidIdentifier(key) ? (_babelTypes || _load_babelTypes()).identifier(key) : (_babelTypes || _load_babelTypes()).stringLiteral(key), objectToLiteral(obj[key]))));
  }

  throw new Error(`Cannot convert unknown type ${typeof obj} to literal.`);
}

/**
 * Helper function that `.then`s on a promise.
 * @param promiseExpression - An expression that will evaluate to a promise.
 * @param functionExpression - A function to pass as an argument to `.then`
 * @returns A CallExpression node that `.then`s on the provided promise.
 */
function thenPromise(promiseExpression, functionExpression) {
  return (_babelTypes || _load_babelTypes()).callExpression((_babelTypes || _load_babelTypes()).memberExpression(promiseExpression, thenIdent), [functionExpression]);
}

/** Export private functions for unit-testing. */
const __test__ = exports.__test__ = {
  generateTransformStatement,
  objectToLiteral
};