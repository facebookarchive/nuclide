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

import type {Definitions, FunctionType, Type} from './types';

var t = babel.types;

var promiseDotAllExpression = t.memberExpression(t.identifier('Promise'), t.identifier('all'));
var thenIdent = t.identifier('then');

var observableIdentifier = t.identifier('Observable');
var observableFromPromise = promiseExpression => t.callExpression(
  t.memberExpression(observableIdentifier, t.identifier('fromPromise')), [promiseExpression]);

var moduleDotExportsExpression = t.memberExpression(t.identifier('module'), t.identifier('exports'));
var clientIdentifier = t.identifier('_client');
var callRemoteFunctionExpression = t.memberExpression(clientIdentifier, t.identifier('callRemoteFunction'));

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
export default function generateProxy(defs: Definitions): string {
  // Initialized remoteModule to empty object.
  var statements = [t.assignmentExpression('=', remoteModule, emptyObject)];

  // Generate a remote proxy for each module-level function.
  defs.functions.forEach((func, name) => {
    var proxy = generateFunctionProxy(name, func);
    statements.push(t.assignmentExpression('=',
      t.memberExpression(remoteModule, t.identifier(name)), proxy));
  });

  // TODO: Generate proxies for remotable interfaces.

  // Return the remote module.
  statements.push(t.returnStatement(remoteModule));

  // Wrap the remoteModule construction in a function that takes a NuclideClient object as an argument.
  var func = t.arrowFunctionExpression([clientIdentifier], t.blockStatement(statements));
  var assignment = t.assignmentExpression('=', moduleDotExportsExpression, func);
  var program = t.program([
    t.expressionStatement(t.literal('use babel')),
    t.importDeclaration([
      t.importSpecifier(t.identifier('Observable'), t.identifier('Observable'))],
      t.literal('rx-lite')),
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
  var argumentsPromise = t.callExpression(promiseDotAllExpression,
    [t.arrayExpression(
      args.map((arg, i) => generateTransformStatement(arg, funcType.argumentTypes[i], true))
    )]
  );

  // Call the remoteFunctionCall method of the NuclideClient object.
  var rpcCallExpression = t.callExpression(callRemoteFunctionExpression, [
    t.literal(name),
    t.literal(funcType.returnType.kind),
    t.identifier('args'),
  ]);

  switch (funcType.returnType.kind) {
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
      var type = funcType.returnType.type;
      var transformer = t.arrowFunctionExpression([value],
        generateTransformStatement(value, type, false));

      rpcCallExpression = thenPromise(rpcCallExpression, transformer);
      break;
    case 'observable':
      rpcCallExpression = t.callExpression(
        t.memberExpression(
          observableFromPromise(argumentsPromise), t.identifier('flatMap')
        ),
        [t.arrowFunctionExpression([t.identifier('args')], rpcCallExpression)]
      );

      var value = t.identifier('value');
      var type = funcType.returnType.type;
      var transformer = t.arrowFunctionExpression([value],
        generateTransformStatement(value, type, false));

      rpcCallExpression = t.callExpression(
        t.memberExpression(rpcCallExpression, t.identifier('flatMap')), [transformer]);
      break;
    default:
      throw new Error(`Unkown return type ${funcType.returnType.kind}.`);
  }

  proxyStatments.push(t.returnStatement(rpcCallExpression));
  return t.arrowFunctionExpression(args, t.blockStatement(proxyStatments));
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
