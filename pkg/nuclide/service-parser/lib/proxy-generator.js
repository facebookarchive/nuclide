'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as babel from 'babel-core';
import generate from 'babel-core/lib/generation';

import type {
  Definitions,
  FunctionType,
  Type,
  InterfaceDefinition,
} from './types';

var t = babel.types;

var promiseDotAllExpression = t.memberExpression(t.identifier('Promise'), t.identifier('all'));
var thenIdent = t.identifier('then');

var observableIdentifier = t.identifier('Observable');

var moduleDotExportsExpression =
  t.memberExpression(t.identifier('module'), t.identifier('exports'));
var clientIdentifier = t.identifier('_client');

// Functions that are implemented at the connection layer.
var callRemoteFunctionExpression =
  t.memberExpression(clientIdentifier, t.identifier('callRemoteFunction'));
var callRemoteMethodExpression =
  t.memberExpression(clientIdentifier, t.identifier('callRemoteMethod'));
var createRemoteObjectExpression =
  t.memberExpression(clientIdentifier, t.identifier('createRemoteObject'));
var disposeRemoteObjectExpression =
  t.memberExpression(clientIdentifier, t.identifier('disposeRemoteObject'));

var thisDotIdPromiseExpression = t.memberExpression(t.thisExpression(), t.identifier('_idPromise'));

var remoteModule = t.identifier('remoteModule');
var emptyObject = t.objectExpression([]);

var clientDotMarshalExpression = t.memberExpression(clientIdentifier, t.identifier('marshal'));
var clientDotUnmarshalExpression = t.memberExpression(clientIdentifier, t.identifier('unmarshal'));
var marshalCall = (...args) => t.callExpression(clientDotMarshalExpression, args);
var unmarshalCall = (...args) => t.callExpression(clientDotUnmarshalExpression, args);

/**
 * Given the parsed result of a definition file, generate a remote proxy module
 * that exports the definition's API, but internally calls RPC functions. The function
 * does not return the proxy module directly, but rather returns a 'factory' method
 * that should be called with a NuclideClient object. This factory method returns the
 * remote module with the client object 'closed over,' and used to make the RPC calls.
 * @param defs - The result of parsing the definition file.
 * @returns The proxy factory method.
 */
export default function generateProxy(serviceName: string, defs: Definitions): string {
  // Initialized remoteModule to empty object.
  var statements = [t.assignmentExpression('=', remoteModule, emptyObject)];

  defs.forEach(definition => {
    const name = definition.name;
    switch (definition.kind) {
      case 'function':
        // Generate a remote proxy for each module-level function.
        statements.push(t.assignmentExpression('=',
          t.memberExpression(remoteModule, t.identifier(name)),
          generateFunctionProxy(`${serviceName}/${name}`, definition.type)));
        break;
      case 'interface':
        // Generate a remote proxy for each remotable interface.
        statements.push(t.assignmentExpression('=',
          t.memberExpression(remoteModule, t.identifier(name)),
          generateInterfaceProxy(definition)));
        break;
      case 'alias':
        // nothing
        break;
    }
  });

  // Return the remote module.
  statements.push(t.returnStatement(remoteModule));

  // Wrap the remoteModule construction in a function that takes a NuclideClient object as
  // an argument.
  var func = t.arrowFunctionExpression([clientIdentifier], t.blockStatement(statements));
  var assignment = t.assignmentExpression('=', moduleDotExportsExpression, func);
  var program = t.program([
    t.expressionStatement(t.literal('use babel')),
    t.importDeclaration([
      t.importSpecifier(t.identifier('Observable'), t.identifier('Observable'))],
      t.literal('rx')),
    t.importDeclaration([
      t.importSpecifier(t.identifier('trackTiming'), t.identifier('trackTiming'))],
      t.literal('nuclide-analytics')),
    assignment,
  ]);

  // Use Babel to generate code from the AST.
  return generate(program).code;
}

/**
 * Generate a remote proxy for a module-level function.
 * @param func - The FunctionDefinition object that represents the functions API.
 * @returns The proxy function (as an arrow function) that should be assigned to
 *   a property of the remote module.
 */
function generateFunctionProxy(name: string, funcType: FunctionType): any {
  var proxyStatments = [];

  // Convert all of the arguments into marshaled form. `argumentsPromise` will resolve
  // to an array of the converted arguments.
  var args = funcType.argumentTypes.map((arg, i) => t.identifier(`arg${i}`));
  var argumentsPromise = generateArgumentConversionPromise(funcType.argumentTypes);

  // Call the remoteFunctionCall method of the NuclideClient object.
  var args = funcType.argumentTypes.map((arg, i) => t.identifier(`arg${i}`));
  var rpcCallExpression = t.callExpression(callRemoteFunctionExpression, [
    t.literal(name),
    t.literal(funcType.returnType.kind),
    t.identifier('args'),
  ]);

  var returnType = funcType.returnType;
  switch (returnType.kind) {
    case 'void':
      rpcCallExpression = thenPromise(argumentsPromise, t.arrowFunctionExpression(
        [t.identifier('args')],
        rpcCallExpression,
      ));
      break;
    case 'promise':
      rpcCallExpression = thenPromise(argumentsPromise, t.arrowFunctionExpression(
        [t.identifier('args')],
        rpcCallExpression,
      ));

      var value = t.identifier('value');
      var type = returnType.type;
      var transformer = t.arrowFunctionExpression([value],
        generateTransformStatement(value, type, false));

      rpcCallExpression = thenPromise(rpcCallExpression, transformer);
      break;
    case 'observable':
      // generateArgumentConversionObservable will return an observable that emits the transformed
      // array of arguments. We concatMap this array through the RPC call, which will return the
      // stream of events.
      rpcCallExpression = t.callExpression(
        t.memberExpression(
          generateArgumentConversionObservable(funcType.argumentTypes), t.identifier('concatMap')
        ),
        [t.arrowFunctionExpression([t.identifier('args')], rpcCallExpression)]
      );

      // We then map the incoming events through the appropriate marshaller. We use concatMap
      // instead of flatMap, since concatMap ensures that the order of the events doesn't change.
      var value = t.identifier('value');
      var type = returnType.type;
      var transformer = t.arrowFunctionExpression([value],
        generateTransformStatement(value, type, false));
      rpcCallExpression = t.callExpression(
        t.memberExpression(rpcCallExpression, t.identifier('concatMap')), [transformer]);
      break;
    default:
      throw new Error(`Unkown return type ${returnType.kind}.`);
  }

  proxyStatments.push(t.returnStatement(rpcCallExpression));
  return t.functionExpression(null, args, t.blockStatement(proxyStatments));
}

/**
 * Helper function that generates statments that can be used to marshal all of the
 * arguments to a function.
 * @param argumentTypes - An array of the types of the function's arguments.
 * @returns An expression representing a promise that resolves to an array of the arguments.
 */
function generateArgumentConversionPromise(argumentTypes: Array<Type>): Array<any> {
  // Convert all of the arguments into marshaled form.
  var args = argumentTypes.map((arg, i) => t.identifier(`arg${i}`));
  return t.callExpression(promiseDotAllExpression,
    [t.arrayExpression(
      args.map((arg, i) => generateTransformStatement(arg, argumentTypes[i], true))
    )]
  );
}

/**
 * Helper function that generates an Observable that emits an array of converted arguments.
 * @param argumentTypes - An array of the types of the function's arguments.
 * @returns An expression that represents an Observable that emits an array of converted arguments.
 * Example: `Observable.concat(_client.marshal(...), _client.marshal(...)).toArray()`
 */
function generateArgumentConversionObservable(argumentTypes: Array<Type>): Array<any> {
  // Create identifiers that represent all of the arguments.
  var args = argumentTypes.map((arg, i) => t.identifier(`arg${i}`));

  // We create an initial observable by concatenating (http://rxmarbles.com/#concat) all of
  // the marshalling promises. Concatenation takes multiple streams (Promises in this case), and
  // returns one stream where all the elements of the input streams are emitted. Concat preserves
  // order, ensuring that all of stream's elements are emitted before the next stream's can emit.
  var argumentsObservable = t.callExpression(
      t.memberExpression(observableIdentifier, t.identifier('concat')),
      args.map((arg, i) => generateTransformStatement(arg, argumentTypes[i], true)));

  // Once we have a stream of the arguments, we can use toArray(), which returns an observable that
  // waits for the stream to complete, and emits one event with all of the elements as an array.
  return t.callExpression(t.memberExpression(argumentsObservable, t.identifier('toArray')), []);
}

/**
 * Generate a remote proxy for an interface.
 * @param name - The name of the interface.
 * @param def - The InterfaceDefinition object that encodes all if the interface's operations.
 * @returns An anonymous ClassExpression node that can be assigned to a module property.
 */
function generateInterfaceProxy(def: InterfaceDefinition): any {
  const name = def.name;
  const methodDefinitions = [];

  // Generate proxies for static methods.
  def.staticMethods.forEach((funcType, methodName) => {
    methodDefinitions.push(t.methodDefinition(
      t.identifier(methodName),
      generateFunctionProxy(`${name}/${methodName}`, funcType),
      'method',
      false,
      true
    ));
  });

  // Generate constructor proxy.
  methodDefinitions.push(generateRemoteConstructor(name, def.constructorArgs));

  // Generate proxies for instance methods.
  def.instanceMethods.forEach((funcType, methodName) => {
    var methodDefinition = generateRemoteDispatch(methodName, funcType);

    // Add trackTiming decorator to instance method that returns a promise.
    if (funcType.returnType.kind === 'promise') {
      methodDefinition.decorators = [
        t.decorator(
          t.callExpression(
            t.identifier('trackTiming'),
            [t.literal(`${name}.${methodName}`)],
          ),
        ),
      ];
    }

    methodDefinitions.push(methodDefinition);
  });

  // Generate the dispose method.
  methodDefinitions.push(generateDisposeMethod());

  return t.classExpression(null, t.classBody(methodDefinitions), null);
}

/**
 * Helper function that generates a remote constructor proxy.
 * @param className - The name of the interface.
 * @param constructorArgs - The types of the arguments to the constructor.
 * @returns A MethodDefinition node that can be added to a ClassBody.
 */
function generateRemoteConstructor(className: string, constructorArgs: Array<Type>) {
  // Convert constructor arguments.
  var args = constructorArgs.map((arg, i) => t.identifier(`arg${i}`));
  var argumentsPromise = generateArgumentConversionPromise(constructorArgs);

  // Make an RPC call that will return the id of the remote object.
  var rpcCallExpression = t.callExpression(createRemoteObjectExpression, [
    t.literal(className),
    t.identifier('args'),
  ]);
  rpcCallExpression = thenPromise(argumentsPromise, t.arrowFunctionExpression(
    [t.identifier('args')], rpcCallExpression));

  // Set a promise that resolves when the id of the remotable object is known.
  rpcCallExpression = t.assignmentExpression('=', thisDotIdPromiseExpression, rpcCallExpression);

  var constructor = t.FunctionExpression(null, args, t.blockStatement([rpcCallExpression]));
  return t.methodDefinition(t.identifier('constructor'), constructor, 'constructor', false, false);
}

/**
 * Helper function that generates a proxy for an instance method of an interface.
 * @param methodName - The name of the method.
 * @param funcType - The type information for the function.
 * @returns A MethodDefinition node that can be added to a ClassBody
 */
function generateRemoteDispatch(methodName: string, funcType: FunctionType) {
  // First, convert the arguments.
  var args = funcType.argumentTypes.map((arg, i) => t.identifier(`arg${i}`));
  var argumentsPromise = generateArgumentConversionPromise(funcType.argumentTypes);

  var id = t.identifier('id');
  var value = t.identifier('value');

  var remoteMethodCall = t.callExpression(callRemoteMethodExpression, [
    id, t.literal(methodName), t.literal(funcType.returnType.kind), t.identifier('args')]);
  var rpcCallExpression = thenPromise(thisDotIdPromiseExpression, t.arrowFunctionExpression(
    [id], remoteMethodCall));

  rpcCallExpression = thenPromise(argumentsPromise, t.arrowFunctionExpression(
    [t.identifier('args')],
    rpcCallExpression,
  ));

  var returnType = funcType.returnType;
  switch (returnType.kind) {
    case 'void':
      break;
    case 'promise':
      var transformer = t.arrowFunctionExpression([value],
        generateTransformStatement(value, returnType.type, false));
      rpcCallExpression = thenPromise(rpcCallExpression, transformer);
      break;
    case 'observable':
      var argumentsObservable = generateArgumentConversionObservable(funcType.argumentTypes);

      // We need to resolve both the transformed arguments and the object id before making the RPC.
      // We can use forkJoin - https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/forkjoin.md.
      // This will resolve to an Observable that emits an array with [id, args] as the two elements.
      var idAndArgumentsObservable = t.callExpression(t.memberExpression(observableIdentifier,
        t.identifier('forkJoin')), [thisDotIdPromiseExpression, argumentsObservable]);

      // Once we resolve both the id and the transformed arguments, we can map them to then RPC
      // call, which then returns the observable of data that we actually want to return.
      rpcCallExpression = t.callExpression(
        t.memberExpression(idAndArgumentsObservable, t.identifier('concatMap')),
        [t.arrowFunctionExpression([
          t.arrayPattern([t.identifier('id'), t.identifier('args')]),
        ], remoteMethodCall)]
      );

      // Finally, we map the events through the appropriate marshaller. We use concatMap instead of
      // flatMap to ensure that the order doesn't change, in case one event takes especially long
      // to marshal.
      var transformer = t.arrowFunctionExpression([value],
        generateTransformStatement(value, returnType.type, false));
      rpcCallExpression = t.callExpression(
        t.memberExpression(rpcCallExpression, t.identifier('concatMap')), [transformer]);
      break;
    default:
      throw new Error(`Unkown return type ${returnType.kind}.`);
  }

  var args = funcType.argumentTypes.map((arg, i) => t.identifier(`arg${i}`));
  var funcExpression = t.functionExpression(null, args, t.blockStatement([
    t.returnStatement(rpcCallExpression)]));

  return t.methodDefinition(t.identifier(methodName), funcExpression, 'method', false, false);
}

/**
 * Helper method that generates the dispose method for a class. The dispose method
 * replaces `this._idPromise` with a thenable object that throws error when used,
 * as well as calls `_client.disposeRemoteObject` with the object's id as a parameter.
 * @returns A MethodDefinition node that can be attached to a class body.
 */
function generateDisposeMethod() {
  var id = t.identifier('id');

  // Replace `idPromise` with thenable object that throws error.
  const disposedError = t.newExpression(t.identifier('Error'),
    [t.literal('This Remote Object has been disposed.')]);
  const throwErrorFunction = t.functionExpression(null, [], t.blockStatement([
    t.throwStatement(disposedError),
  ]));
  const thenableErrorObject =
    t.objectExpression([t.Property('init', t.identifier('then'), throwErrorFunction)]);
  const replaceIdPromise = t.expressionStatement(t.assignmentExpression('=',
    thisDotIdPromiseExpression, thenableErrorObject));

  // Call `_client.disposeRemoteObject`.
  var rpcCallExpression = t.callExpression(disposeRemoteObjectExpression, [id]);

  // Wrap these statements in a `.then` on `idPromise`, so that they can execute after the
  // id has been determined.
  rpcCallExpression = t.callExpression(
    t.memberExpression(thisDotIdPromiseExpression, t.identifier('then')),
    [t.arrowFunctionExpression([id], t.blockStatement([
      replaceIdPromise,
      t.returnStatement(rpcCallExpression),
    ]))]
  );
  var returnStatement = t.returnStatement(rpcCallExpression);

  return t.methodDefinition(t.identifier('dispose'),
    t.functionExpression(null, [], t.blockStatement([returnStatement])), 'method', false, false);
}

/**
 * Helper function that generates a transformation statement for an object. This ammounts to
 * a call either to _client.marshal or _client.unmarshal.
 * @param id {Identifier} The identifier of the value to convert.
 * @param type {Type} The type of the value to convert.
 * @param marshal {boolean} - If true, then we are trying to marshal the value. If false, then
 *   we are trying to unmarshal.
 */
function generateTransformStatement(id: any, type: Type, marshal: boolean): any {
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
function objectToLiteral(obj: any): any {
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return t.literal(obj);
  } else if (obj instanceof Array) {
    return t.arrayExpression(obj.map(elem => objectToLiteral(elem)));
  } else if (typeof obj === 'object') {
    return t.objectExpression(Object.keys(obj).map(key => {
      return t.Property('init', t.identifier(key), objectToLiteral(obj[key]));
    }));
  }

  throw new Error(`Cannot convert unkown type ${typeof obj} to literal.`);
}

/**
 * Helper function that `.then`s on a promise.
 * @param promiseExpression - An expression that will evaluate to a promise.
 * @param functionExpression - A function to pass as an argument to `.then`
 * @returns A CallExpression node that `.then`s on the provided promise.
 */
function thenPromise(promiseExpression, functionExpression): any {
  return t.callExpression(t.memberExpression(promiseExpression, thenIdent),
    [functionExpression]);
}

/** Export private functions for unit-testing. */
export var __test__ = {
  generateTransformStatement,
};
