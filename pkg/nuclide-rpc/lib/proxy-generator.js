'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as t from 'babel-core/lib/types';
import generate from 'babel-core/lib/generation';

import type {
  Definitions,
  FunctionType,
  NamedType,
  Type,
  InterfaceDefinition,
} from './types';

const promiseDotAllExpression = t.memberExpression(t.identifier('Promise'), t.identifier('all'));
const thenIdent = t.identifier('then');

const observableIdentifier = t.identifier('Observable');
const idIdentifier = t.identifier('id');

const moduleDotExportsExpression =
  t.memberExpression(t.identifier('module'), t.identifier('exports'));
const clientIdentifier = t.identifier('_client');

// Functions that are implemented at the connection layer.
const callRemoteFunctionExpression =
  t.memberExpression(clientIdentifier, t.identifier('callRemoteFunction'));
const callRemoteMethodExpression =
  t.memberExpression(clientIdentifier, t.identifier('callRemoteMethod'));
const createRemoteObjectExpression =
  t.memberExpression(clientIdentifier, t.identifier('createRemoteObject'));
const disposeRemoteObjectExpression =
  t.memberExpression(clientIdentifier, t.identifier('disposeRemoteObject'));

const remoteModule = t.identifier('remoteModule');
const emptyObject = t.objectExpression([]);

const clientDotMarshalExpression
  = t.memberExpression(clientIdentifier, t.identifier('marshal'));
const clientDotUnmarshalExpression
  = t.memberExpression(clientIdentifier, t.identifier('unmarshal'));
const marshalCall = (...args) => t.callExpression(clientDotMarshalExpression, args);
const unmarshalCall = (...args) => t.callExpression(clientDotUnmarshalExpression, args);

/**
 * Given the parsed result of a definition file, generate a remote proxy module
 * that exports the definition's API, but internally calls RPC functions. The function
 * does not return the proxy module directly, but rather returns a 'factory' method
 * that should be called with a RpcConnection object. This factory method returns the
 * remote module with the client object 'closed over,' and used to make the RPC calls.
 * @param defs - The result of parsing the definition file.
 * @returns The proxy factory method.
 */
export function generateProxy(serviceName: string, defs: Definitions): string {
  const statements = [];

  // Declare remoteModule as empty object.
  statements.push(
    t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier('remoteModule'), emptyObject),
    ])
  );

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

  // Wrap the remoteModule construction in a function that takes a RpcConnection object as
  // an argument. `require` calls will resolve as if made by a file that is a sibling to
  // this module's `lib/main.js`.
  const func = t.arrowFunctionExpression([clientIdentifier], t.blockStatement(statements));
  const assignment = t.assignmentExpression('=', moduleDotExportsExpression, func);
  const program = t.program([
    t.expressionStatement(t.literal('use babel')),
    t.importDeclaration([
      t.importSpecifier(t.identifier('Observable'), t.identifier('Observable'))],
      t.literal('rxjs')),
    t.importDeclaration([
      t.importSpecifier(t.identifier('trackTiming'), t.identifier('trackTiming'))],
      t.literal('../../nuclide-analytics')),
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
  // _client.callRemoteFunction(name, kind, args)
  const callExpression = t.callExpression(callRemoteFunctionExpression, [
    t.literal(name),
    t.literal(funcType.returnType.kind),
    t.identifier('args'),
  ]);

  // Promise.all(...).then(args => ...)
  const argumentsPromise = generateArgumentConversionPromise(funcType.argumentTypes);
  const marshalArgsAndCall = thenPromise(argumentsPromise, t.arrowFunctionExpression(
    [t.identifier('args')],
    callExpression,
  ));

  const result = generateUnmarshalResult(funcType.returnType, marshalArgsAndCall);

  // function(arg0, ... argN) { return ... }
  const args = funcType.argumentTypes.map((arg, i) => t.identifier(`arg${i}`));
  return t.functionExpression(null, args, t.blockStatement(
    [t.returnStatement(result)]
  ));
}

/**
 * Helper function that generates statments that can be used to marshal all of the
 * arguments to a function.
 * @param argumentTypes - An array of the types of the function's arguments.
 * @returns An expression representing a promise that resolves to an array of the arguments.
 */
function generateArgumentConversionPromise(argumentTypes: Array<Type>): Array<any> {
  // Convert all of the arguments into marshaled form.
  const args = argumentTypes.map((arg, i) => t.identifier(`arg${i}`));
  return t.callExpression(promiseDotAllExpression,
    [t.arrayExpression(
      args.map((arg, i) => generateTransformStatement(arg, argumentTypes[i], true))
    )]
  );
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
  const thisType: NamedType = {
    kind: 'named',
    location: def.location,
    name: def.name,
  };
  def.instanceMethods.forEach((funcType, methodName) => {
    // dispose method is generated custom at the end
    if (methodName === 'dispose') {
      return;
    }

    const methodDefinition = generateRemoteDispatch(methodName, thisType, funcType);

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

  // arg0, .... argN
  const args = constructorArgs.map((arg, i) => t.identifier(`arg${i}`));
  // [arg0, ... argN]
  const argsArray = t.arrayExpression(args);
  // [argType0, ... argTypeN]
  const argTypes = t.arrayExpression(constructorArgs.map(objectToLiteral));

  // client.createRemoteObject(className, this, [arg0, arg1, .... argN], [argType0 ... argTypeN])
  const rpcCallExpression = t.callExpression(
    createRemoteObjectExpression,
    [
      t.literal(className),
      t.thisExpression(),
      argsArray,
      argTypes,
    ]
  );

  // constructor(arg0, arg1, ..., argN) { ... }
  const constructor = t.FunctionExpression(null, args, t.blockStatement([rpcCallExpression]));
  return t.methodDefinition(t.identifier('constructor'), constructor, 'constructor', false, false);
}

/**
 * Helper function that generates a proxy for an instance method of an interface.
 * @param methodName - The name of the method.
 * @param funcType - The type information for the function.
 * @returns A MethodDefinition node that can be added to a ClassBody
 */
function generateRemoteDispatch(methodName: string, thisType: NamedType, funcType: FunctionType) {
  // _client.callRemoteMethod(this, methodName, returnType, args)
  const remoteMethodCall = t.callExpression(callRemoteMethodExpression, [
    idIdentifier,
    t.literal(methodName),
    t.literal(funcType.returnType.kind),
    t.identifier('args')]);

  // _client.marshal(this, thisType).then(id => ... )
  const idThenCall = thenPromise(
    generateTransformStatement(
      t.thisExpression(),
      thisType,
      true),
    t.arrowFunctionExpression([idIdentifier], remoteMethodCall));

  // Promise.all(...).then(args => ...)
  const argumentsPromise = generateArgumentConversionPromise(funcType.argumentTypes);
  const marshallThenCall = thenPromise(argumentsPromise, t.arrowFunctionExpression(
    [t.identifier('args')],
    idThenCall,
  ));

  // methodName(arg0, ... argN) { return ... }
  const funcTypeArgs = funcType.argumentTypes.map((arg, i) => t.identifier(`arg${i}`));
  const funcExpression = t.functionExpression(null, funcTypeArgs, t.blockStatement([
    t.returnStatement(generateUnmarshalResult(funcType.returnType, marshallThenCall))]));
  return t.methodDefinition(t.identifier(methodName), funcExpression, 'method', false, false);
}

function generateUnmarshalResult(returnType: Type, rpcCallExpression) {
  switch (returnType.kind) {
    case 'void':
      return rpcCallExpression;
    case 'promise':
      const promiseTransformer = generateValueTransformer(returnType.type);
      return thenPromise(rpcCallExpression, promiseTransformer);
    case 'observable':
      // rpcCallExpression is a call which returns Promise<Observable<unmarshalled result>>

      // Observable.fromPromise(rpcCallExpression)
      const callObservable = t.callExpression(
            t.memberExpression(observableIdentifier, t.identifier('fromPromise')),
            [rpcCallExpression]);
      // ... .flatMap(id => id)
      const unmarshalledValues = t.callExpression(
        t.memberExpression(callObservable, t.identifier('concatMap')),
        [t.arrowFunctionExpression([idIdentifier], idIdentifier)]);

      // Finally, we map the events through the appropriate marshaller. We use concatMap instead of
      // flatMap to ensure that the order doesn't change, in case one event takes especially long
      // to marshal.
      //
      // ... .concatMap(value => _client.unmarshal(value, returnType))
      const observableTransformer = generateValueTransformer(returnType.type);
      return t.callExpression(
        t.memberExpression(unmarshalledValues, t.identifier('concatMap')), [observableTransformer]);
    default:
      throw new Error(`Unkown return type ${returnType.kind}.`);
  }
}

// value => _client.unmarshal(value, type)
function generateValueTransformer(type: Type) {
  const value = t.identifier('value');
  return t.arrowFunctionExpression([value],
    generateTransformStatement(value, type, false));
}

/**
 * Helper method that generates the dispose method for a class. The dispose method
 * calls `_client.disposeRemoteObject` with the object's id as a parameter.
 * @returns A MethodDefinition node that can be attached to a class body.
 */
function generateDisposeMethod() {
  // return _client.disposeRemoteObject(this);
  const returnStatement = t.returnStatement(
    t.callExpression(disposeRemoteObjectExpression, [t.thisExpression()]));

  // dispose() { ... }
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
  const convertArgs = [id, objectToLiteral(type)];

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
export const __test__ = {
  generateTransformStatement,
};
