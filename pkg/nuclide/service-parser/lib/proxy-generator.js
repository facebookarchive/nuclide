Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = generateProxy;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _babelCore = require('babel-core');

var babel = _interopRequireWildcard(_babelCore);

var _babelCoreLibGeneration = require('babel-core/lib/generation');

var _babelCoreLibGeneration2 = _interopRequireDefault(_babelCoreLibGeneration);

var t = babel.types;

var promiseDotAllExpression = t.memberExpression(t.identifier('Promise'), t.identifier('all'));
var thenIdent = t.identifier('then');

var observableIdentifier = t.identifier('Observable');

var moduleDotExportsExpression = t.memberExpression(t.identifier('module'), t.identifier('exports'));
var clientIdentifier = t.identifier('_client');

// Functions that are implemented at the connection layer.
var callRemoteFunctionExpression = t.memberExpression(clientIdentifier, t.identifier('callRemoteFunction'));
var callRemoteMethodExpression = t.memberExpression(clientIdentifier, t.identifier('callRemoteMethod'));
var createRemoteObjectExpression = t.memberExpression(clientIdentifier, t.identifier('createRemoteObject'));
var disposeRemoteObjectExpression = t.memberExpression(clientIdentifier, t.identifier('disposeRemoteObject'));

var thisDotIdPromiseExpression = t.memberExpression(t.thisExpression(), t.identifier('_idPromise'));

var remoteModule = t.identifier('remoteModule');
var emptyObject = t.objectExpression([]);

var clientDotMarshalExpression = t.memberExpression(clientIdentifier, t.identifier('marshal'));
var clientDotUnmarshalExpression = t.memberExpression(clientIdentifier, t.identifier('unmarshal'));
var marshalCall = function marshalCall() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return t.callExpression(clientDotMarshalExpression, args);
};
var unmarshalCall = function unmarshalCall() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return t.callExpression(clientDotUnmarshalExpression, args);
};

/**
 * Given the parsed result of a definition file, generate a remote proxy module
 * that exports the definition's API, but internally calls RPC functions. The function
 * does not return the proxy module directly, but rather returns a 'factory' method
 * that should be called with a ClientComponent object. This factory method returns the
 * remote module with the client object 'closed over,' and used to make the RPC calls.
 * @param defs - The result of parsing the definition file.
 * @returns The proxy factory method.
 */

function generateProxy(serviceName, defs) {
  // Initialized remoteModule to empty object.
  var statements = [t.assignmentExpression('=', remoteModule, emptyObject)];

  defs.forEach(function (definition) {
    var name = definition.name;
    switch (definition.kind) {
      case 'function':
        // Generate a remote proxy for each module-level function.
        statements.push(t.assignmentExpression('=', t.memberExpression(remoteModule, t.identifier(name)), generateFunctionProxy(serviceName + '/' + name, definition.type)));
        break;
      case 'interface':
        // Generate a remote proxy for each remotable interface.
        statements.push(t.assignmentExpression('=', t.memberExpression(remoteModule, t.identifier(name)), generateInterfaceProxy(definition)));
        break;
      case 'alias':
        // nothing
        break;
    }
  });

  // Return the remote module.
  statements.push(t.returnStatement(remoteModule));

  // Wrap the remoteModule construction in a function that takes a ClientComponent object as
  // an argument. `require` calls will resolve as if made by a file that is a sibling to
  // this module's `lib/main.js`.
  var func = t.arrowFunctionExpression([clientIdentifier], t.blockStatement(statements));
  var assignment = t.assignmentExpression('=', moduleDotExportsExpression, func);
  var program = t.program([t.expressionStatement(t.literal('use babel')), t.importDeclaration([t.importSpecifier(t.identifier('Observable'), t.identifier('Observable'))], t.literal('rx')), t.importDeclaration([t.importSpecifier(t.identifier('trackTiming'), t.identifier('trackTiming'))], t.literal('../../analytics')), assignment]);

  // Use Babel to generate code from the AST.
  return (0, _babelCoreLibGeneration2['default'])(program).code;
}

/**
 * Generate a remote proxy for a module-level function.
 * @param func - The FunctionDefinition object that represents the functions API.
 * @returns The proxy function (as an arrow function) that should be assigned to
 *   a property of the remote module.
 */
function generateFunctionProxy(name, funcType) {
  var proxyStatments = [];

  // Convert all of the arguments into marshaled form. `argumentsPromise` will resolve
  // to an array of the converted arguments.
  var args = funcType.argumentTypes.map(function (arg, i) {
    return t.identifier('arg' + i);
  });
  var argumentsPromise = generateArgumentConversionPromise(funcType.argumentTypes);

  // Call the remoteFunctionCall method of the ClientComponent object.
  var rpcCallExpression = t.callExpression(callRemoteFunctionExpression, [t.literal(name), t.literal(funcType.returnType.kind), t.identifier('args')]);

  var value = undefined,
      transformer = undefined,
      type = undefined;
  var returnType = funcType.returnType;
  switch (returnType.kind) {
    case 'void':
      rpcCallExpression = thenPromise(argumentsPromise, t.arrowFunctionExpression([t.identifier('args')], rpcCallExpression));
      break;
    case 'promise':
      rpcCallExpression = thenPromise(argumentsPromise, t.arrowFunctionExpression([t.identifier('args')], rpcCallExpression));

      value = t.identifier('value');
      type = returnType.type;
      transformer = t.arrowFunctionExpression([value], generateTransformStatement(value, type, false));

      rpcCallExpression = thenPromise(rpcCallExpression, transformer);
      break;
    case 'observable':
      // generateArgumentConversionObservable will return an observable that emits the transformed
      // array of arguments. We concatMap this array through the RPC call, which will return the
      // stream of events.
      rpcCallExpression = t.callExpression(t.memberExpression(generateArgumentConversionObservable(funcType.argumentTypes), t.identifier('concatMap')), [t.arrowFunctionExpression([t.identifier('args')], rpcCallExpression)]);

      // We then map the incoming events through the appropriate marshaller. We use concatMap
      // instead of flatMap, since concatMap ensures that the order of the events doesn't change.
      value = t.identifier('value');
      type = returnType.type;
      transformer = t.arrowFunctionExpression([value], generateTransformStatement(value, type, false));
      rpcCallExpression = t.callExpression(t.memberExpression(rpcCallExpression, t.identifier('concatMap')), [transformer]);
      break;
    default:
      throw new Error('Unkown return type ' + returnType.kind + '.');
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
function generateArgumentConversionPromise(argumentTypes) {
  // Convert all of the arguments into marshaled form.
  var args = argumentTypes.map(function (arg, i) {
    return t.identifier('arg' + i);
  });
  return t.callExpression(promiseDotAllExpression, [t.arrayExpression(args.map(function (arg, i) {
    return generateTransformStatement(arg, argumentTypes[i], true);
  }))]);
}

/**
 * Helper function that generates an Observable that emits an array of converted arguments.
 * @param argumentTypes - An array of the types of the function's arguments.
 * @returns An expression that represents an Observable that emits an array of converted arguments.
 * Example: `Observable.concat(_client.marshal(...), _client.marshal(...)).toArray()`
 */
function generateArgumentConversionObservable(argumentTypes) {
  // Create identifiers that represent all of the arguments.
  var args = argumentTypes.map(function (arg, i) {
    return t.identifier('arg' + i);
  });

  // We create an initial observable by concatenating (http://rxmarbles.com/#concat) all of
  // the marshalling promises. Concatenation takes multiple streams (Promises in this case), and
  // returns one stream where all the elements of the input streams are emitted. Concat preserves
  // order, ensuring that all of stream's elements are emitted before the next stream's can emit.
  var argumentsObservable = t.callExpression(t.memberExpression(observableIdentifier, t.identifier('concat')), args.map(function (arg, i) {
    return generateTransformStatement(arg, argumentTypes[i], true);
  }));

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
function generateInterfaceProxy(def) {
  var name = def.name;
  var methodDefinitions = [];

  // Generate proxies for static methods.
  def.staticMethods.forEach(function (funcType, methodName) {
    methodDefinitions.push(t.methodDefinition(t.identifier(methodName), generateFunctionProxy(name + '/' + methodName, funcType), 'method', false, true));
  });

  // Generate constructor proxy.
  methodDefinitions.push(generateRemoteConstructor(name, def.constructorArgs));

  // Generate proxies for instance methods.
  def.instanceMethods.forEach(function (funcType, methodName) {
    var methodDefinition = generateRemoteDispatch(methodName, funcType);

    // Add trackTiming decorator to instance method that returns a promise.
    if (funcType.returnType.kind === 'promise') {
      methodDefinition.decorators = [t.decorator(t.callExpression(t.identifier('trackTiming'), [t.literal(name + '.' + methodName)]))];
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
function generateRemoteConstructor(className, constructorArgs) {
  // Convert constructor arguments.
  var args = constructorArgs.map(function (arg, i) {
    return t.identifier('arg' + i);
  });
  var argumentsPromise = generateArgumentConversionPromise(constructorArgs);

  // Make an RPC call that will return the id of the remote object.
  var rpcCallExpression = t.callExpression(createRemoteObjectExpression, [t.literal(className), t.identifier('args')]);
  rpcCallExpression = thenPromise(argumentsPromise, t.arrowFunctionExpression([t.identifier('args')], rpcCallExpression));

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
function generateRemoteDispatch(methodName, funcType) {
  // First, convert the arguments.
  var argumentsPromise = generateArgumentConversionPromise(funcType.argumentTypes);

  var id = t.identifier('id');
  var value = t.identifier('value');

  var remoteMethodCall = t.callExpression(callRemoteMethodExpression, [id, t.literal(methodName), t.literal(funcType.returnType.kind), t.identifier('args')]);
  var rpcCallExpression = thenPromise(thisDotIdPromiseExpression, t.arrowFunctionExpression([id], remoteMethodCall));

  rpcCallExpression = thenPromise(argumentsPromise, t.arrowFunctionExpression([t.identifier('args')], rpcCallExpression));

  var returnType = funcType.returnType;
  switch (returnType.kind) {
    case 'void':
      break;
    case 'promise':
      var promiseTransformer = t.arrowFunctionExpression([value], generateTransformStatement(value, returnType.type, false));
      rpcCallExpression = thenPromise(rpcCallExpression, promiseTransformer);
      break;
    case 'observable':
      var argumentsObservable = generateArgumentConversionObservable(funcType.argumentTypes);

      // We need to resolve both the transformed arguments and the object id before making the RPC.
      // We can use forkJoin - https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/forkjoin.md.
      // This will resolve to an Observable that emits an array with [id, args] as the two elements.
      var idAndArgumentsObservable = t.callExpression(t.memberExpression(observableIdentifier, t.identifier('forkJoin')), [thisDotIdPromiseExpression, argumentsObservable]);

      // Once we resolve both the id and the transformed arguments, we can map them to then RPC
      // call, which then returns the observable of data that we actually want to return.
      rpcCallExpression = t.callExpression(t.memberExpression(idAndArgumentsObservable, t.identifier('concatMap')), [t.arrowFunctionExpression([t.arrayPattern([t.identifier('id'), t.identifier('args')])], remoteMethodCall)]);

      // Finally, we map the events through the appropriate marshaller. We use concatMap instead of
      // flatMap to ensure that the order doesn't change, in case one event takes especially long
      // to marshal.
      var observableTransformer = t.arrowFunctionExpression([value], generateTransformStatement(value, returnType.type, false));
      rpcCallExpression = t.callExpression(t.memberExpression(rpcCallExpression, t.identifier('concatMap')), [observableTransformer]);
      break;
    default:
      throw new Error('Unkown return type ' + returnType.kind + '.');
  }

  var funcTypeArgs = funcType.argumentTypes.map(function (arg, i) {
    return t.identifier('arg' + i);
  });
  var funcExpression = t.functionExpression(null, funcTypeArgs, t.blockStatement([t.returnStatement(rpcCallExpression)]));

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
  var disposedError = t.newExpression(t.identifier('Error'), [t.literal('This Remote Object has been disposed.')]);
  var throwErrorFunction = t.functionExpression(null, [], t.blockStatement([t.throwStatement(disposedError)]));
  var thenableErrorObject = t.objectExpression([t.Property('init', t.identifier('then'), throwErrorFunction)]);
  var replaceIdPromise = t.expressionStatement(t.assignmentExpression('=', thisDotIdPromiseExpression, thenableErrorObject));

  // Call `_client.disposeRemoteObject`.
  var rpcCallExpression = t.callExpression(disposeRemoteObjectExpression, [id]);

  // Wrap these statements in a `.then` on `idPromise`, so that they can execute after the
  // id has been determined.
  rpcCallExpression = t.callExpression(t.memberExpression(thisDotIdPromiseExpression, t.identifier('then')), [t.arrowFunctionExpression([id], t.blockStatement([replaceIdPromise, t.returnStatement(rpcCallExpression)]))]);
  var returnStatement = t.returnStatement(rpcCallExpression);

  return t.methodDefinition(t.identifier('dispose'), t.functionExpression(null, [], t.blockStatement([returnStatement])), 'method', false, false);
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
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return t.literal(obj);
  } else if (obj instanceof Array) {
    return t.arrayExpression(obj.map(function (elem) {
      return objectToLiteral(elem);
    }));
  } else if (typeof obj === 'object') {
    return t.objectExpression(Object.keys(obj).map(function (key) {
      return t.Property('init', t.identifier(key), objectToLiteral(obj[key]));
    }));
  }

  throw new Error('Cannot convert unkown type ' + typeof obj + ' to literal.');
}

/**
 * Helper function that `.then`s on a promise.
 * @param promiseExpression - An expression that will evaluate to a promise.
 * @param functionExpression - A function to pass as an argument to `.then`
 * @returns A CallExpression node that `.then`s on the provided promise.
 */
function thenPromise(promiseExpression, functionExpression) {
  return t.callExpression(t.memberExpression(promiseExpression, thenIdent), [functionExpression]);
}

/** Export private functions for unit-testing. */
var __test__ = {
  generateTransformStatement: generateTransformStatement
};
exports.__test__ = __test__;
//# sourceMappingURL=data:application/json;base64,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Iid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCAqIGFzIGJhYmVsIGZyb20gJ2JhYmVsLWNvcmUnO1xuaW1wb3J0IGdlbmVyYXRlIGZyb20gJ2JhYmVsLWNvcmUvbGliL2dlbmVyYXRpb24nO1xuXG5pbXBvcnQgdHlwZSB7XG4gIERlZmluaXRpb25zLFxuICBGdW5jdGlvblR5cGUsXG4gIFR5cGUsXG4gIEludGVyZmFjZURlZmluaXRpb24sXG59IGZyb20gJy4vdHlwZXMnO1xuXG5jb25zdCB0ID0gYmFiZWwudHlwZXM7XG5cbmNvbnN0IHByb21pc2VEb3RBbGxFeHByZXNzaW9uID0gdC5tZW1iZXJFeHByZXNzaW9uKHQuaWRlbnRpZmllcignUHJvbWlzZScpLCB0LmlkZW50aWZpZXIoJ2FsbCcpKTtcbmNvbnN0IHRoZW5JZGVudCA9IHQuaWRlbnRpZmllcigndGhlbicpO1xuXG5jb25zdCBvYnNlcnZhYmxlSWRlbnRpZmllciA9IHQuaWRlbnRpZmllcignT2JzZXJ2YWJsZScpO1xuXG5jb25zdCBtb2R1bGVEb3RFeHBvcnRzRXhwcmVzc2lvbiA9XG4gIHQubWVtYmVyRXhwcmVzc2lvbih0LmlkZW50aWZpZXIoJ21vZHVsZScpLCB0LmlkZW50aWZpZXIoJ2V4cG9ydHMnKSk7XG5jb25zdCBjbGllbnRJZGVudGlmaWVyID0gdC5pZGVudGlmaWVyKCdfY2xpZW50Jyk7XG5cbi8vIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbXBsZW1lbnRlZCBhdCB0aGUgY29ubmVjdGlvbiBsYXllci5cbmNvbnN0IGNhbGxSZW1vdGVGdW5jdGlvbkV4cHJlc3Npb24gPVxuICB0Lm1lbWJlckV4cHJlc3Npb24oY2xpZW50SWRlbnRpZmllciwgdC5pZGVudGlmaWVyKCdjYWxsUmVtb3RlRnVuY3Rpb24nKSk7XG5jb25zdCBjYWxsUmVtb3RlTWV0aG9kRXhwcmVzc2lvbiA9XG4gIHQubWVtYmVyRXhwcmVzc2lvbihjbGllbnRJZGVudGlmaWVyLCB0LmlkZW50aWZpZXIoJ2NhbGxSZW1vdGVNZXRob2QnKSk7XG5jb25zdCBjcmVhdGVSZW1vdGVPYmplY3RFeHByZXNzaW9uID1cbiAgdC5tZW1iZXJFeHByZXNzaW9uKGNsaWVudElkZW50aWZpZXIsIHQuaWRlbnRpZmllcignY3JlYXRlUmVtb3RlT2JqZWN0JykpO1xuY29uc3QgZGlzcG9zZVJlbW90ZU9iamVjdEV4cHJlc3Npb24gPVxuICB0Lm1lbWJlckV4cHJlc3Npb24oY2xpZW50SWRlbnRpZmllciwgdC5pZGVudGlmaWVyKCdkaXNwb3NlUmVtb3RlT2JqZWN0JykpO1xuXG5jb25zdCB0aGlzRG90SWRQcm9taXNlRXhwcmVzc2lvbiA9XG4gIHQubWVtYmVyRXhwcmVzc2lvbih0LnRoaXNFeHByZXNzaW9uKCksIHQuaWRlbnRpZmllcignX2lkUHJvbWlzZScpKTtcblxuY29uc3QgcmVtb3RlTW9kdWxlID0gdC5pZGVudGlmaWVyKCdyZW1vdGVNb2R1bGUnKTtcbmNvbnN0IGVtcHR5T2JqZWN0ID0gdC5vYmplY3RFeHByZXNzaW9uKFtdKTtcblxuY29uc3QgY2xpZW50RG90TWFyc2hhbEV4cHJlc3Npb25cbiAgPSB0Lm1lbWJlckV4cHJlc3Npb24oY2xpZW50SWRlbnRpZmllciwgdC5pZGVudGlmaWVyKCdtYXJzaGFsJykpO1xuY29uc3QgY2xpZW50RG90VW5tYXJzaGFsRXhwcmVzc2lvblxuICA9IHQubWVtYmVyRXhwcmVzc2lvbihjbGllbnRJZGVudGlmaWVyLCB0LmlkZW50aWZpZXIoJ3VubWFyc2hhbCcpKTtcbmNvbnN0IG1hcnNoYWxDYWxsID0gKC4uLmFyZ3MpID0+IHQuY2FsbEV4cHJlc3Npb24oY2xpZW50RG90TWFyc2hhbEV4cHJlc3Npb24sIGFyZ3MpO1xuY29uc3QgdW5tYXJzaGFsQ2FsbCA9ICguLi5hcmdzKSA9PiB0LmNhbGxFeHByZXNzaW9uKGNsaWVudERvdFVubWFyc2hhbEV4cHJlc3Npb24sIGFyZ3MpO1xuXG4vKipcbiAqIEdpdmVuIHRoZSBwYXJzZWQgcmVzdWx0IG9mIGEgZGVmaW5pdGlvbiBmaWxlLCBnZW5lcmF0ZSBhIHJlbW90ZSBwcm94eSBtb2R1bGVcbiAqIHRoYXQgZXhwb3J0cyB0aGUgZGVmaW5pdGlvbidzIEFQSSwgYnV0IGludGVybmFsbHkgY2FsbHMgUlBDIGZ1bmN0aW9ucy4gVGhlIGZ1bmN0aW9uXG4gKiBkb2VzIG5vdCByZXR1cm4gdGhlIHByb3h5IG1vZHVsZSBkaXJlY3RseSwgYnV0IHJhdGhlciByZXR1cm5zIGEgJ2ZhY3RvcnknIG1ldGhvZFxuICogdGhhdCBzaG91bGQgYmUgY2FsbGVkIHdpdGggYSBDbGllbnRDb21wb25lbnQgb2JqZWN0LiBUaGlzIGZhY3RvcnkgbWV0aG9kIHJldHVybnMgdGhlXG4gKiByZW1vdGUgbW9kdWxlIHdpdGggdGhlIGNsaWVudCBvYmplY3QgJ2Nsb3NlZCBvdmVyLCcgYW5kIHVzZWQgdG8gbWFrZSB0aGUgUlBDIGNhbGxzLlxuICogQHBhcmFtIGRlZnMgLSBUaGUgcmVzdWx0IG9mIHBhcnNpbmcgdGhlIGRlZmluaXRpb24gZmlsZS5cbiAqIEByZXR1cm5zIFRoZSBwcm94eSBmYWN0b3J5IG1ldGhvZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2VuZXJhdGVQcm94eShzZXJ2aWNlTmFtZTogc3RyaW5nLCBkZWZzOiBEZWZpbml0aW9ucyk6IHN0cmluZyB7XG4gIC8vIEluaXRpYWxpemVkIHJlbW90ZU1vZHVsZSB0byBlbXB0eSBvYmplY3QuXG4gIGNvbnN0IHN0YXRlbWVudHMgPSBbdC5hc3NpZ25tZW50RXhwcmVzc2lvbignPScsIHJlbW90ZU1vZHVsZSwgZW1wdHlPYmplY3QpXTtcblxuICBkZWZzLmZvckVhY2goZGVmaW5pdGlvbiA9PiB7XG4gICAgY29uc3QgbmFtZSA9IGRlZmluaXRpb24ubmFtZTtcbiAgICBzd2l0Y2ggKGRlZmluaXRpb24ua2luZCkge1xuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAvLyBHZW5lcmF0ZSBhIHJlbW90ZSBwcm94eSBmb3IgZWFjaCBtb2R1bGUtbGV2ZWwgZnVuY3Rpb24uXG4gICAgICAgIHN0YXRlbWVudHMucHVzaCh0LmFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JyxcbiAgICAgICAgICB0Lm1lbWJlckV4cHJlc3Npb24ocmVtb3RlTW9kdWxlLCB0LmlkZW50aWZpZXIobmFtZSkpLFxuICAgICAgICAgIGdlbmVyYXRlRnVuY3Rpb25Qcm94eShgJHtzZXJ2aWNlTmFtZX0vJHtuYW1lfWAsIGRlZmluaXRpb24udHlwZSkpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbnRlcmZhY2UnOlxuICAgICAgICAvLyBHZW5lcmF0ZSBhIHJlbW90ZSBwcm94eSBmb3IgZWFjaCByZW1vdGFibGUgaW50ZXJmYWNlLlxuICAgICAgICBzdGF0ZW1lbnRzLnB1c2godC5hc3NpZ25tZW50RXhwcmVzc2lvbignPScsXG4gICAgICAgICAgdC5tZW1iZXJFeHByZXNzaW9uKHJlbW90ZU1vZHVsZSwgdC5pZGVudGlmaWVyKG5hbWUpKSxcbiAgICAgICAgICBnZW5lcmF0ZUludGVyZmFjZVByb3h5KGRlZmluaXRpb24pKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAvLyBub3RoaW5nXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gUmV0dXJuIHRoZSByZW1vdGUgbW9kdWxlLlxuICBzdGF0ZW1lbnRzLnB1c2godC5yZXR1cm5TdGF0ZW1lbnQocmVtb3RlTW9kdWxlKSk7XG5cbiAgLy8gV3JhcCB0aGUgcmVtb3RlTW9kdWxlIGNvbnN0cnVjdGlvbiBpbiBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBDbGllbnRDb21wb25lbnQgb2JqZWN0IGFzXG4gIC8vIGFuIGFyZ3VtZW50LiBgcmVxdWlyZWAgY2FsbHMgd2lsbCByZXNvbHZlIGFzIGlmIG1hZGUgYnkgYSBmaWxlIHRoYXQgaXMgYSBzaWJsaW5nIHRvXG4gIC8vIHRoaXMgbW9kdWxlJ3MgYGxpYi9tYWluLmpzYC5cbiAgY29uc3QgZnVuYyA9IHQuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW2NsaWVudElkZW50aWZpZXJdLCB0LmJsb2NrU3RhdGVtZW50KHN0YXRlbWVudHMpKTtcbiAgY29uc3QgYXNzaWdubWVudCA9IHQuYXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtb2R1bGVEb3RFeHBvcnRzRXhwcmVzc2lvbiwgZnVuYyk7XG4gIGNvbnN0IHByb2dyYW0gPSB0LnByb2dyYW0oW1xuICAgIHQuZXhwcmVzc2lvblN0YXRlbWVudCh0LmxpdGVyYWwoJ3VzZSBiYWJlbCcpKSxcbiAgICB0LmltcG9ydERlY2xhcmF0aW9uKFtcbiAgICAgIHQuaW1wb3J0U3BlY2lmaWVyKHQuaWRlbnRpZmllcignT2JzZXJ2YWJsZScpLCB0LmlkZW50aWZpZXIoJ09ic2VydmFibGUnKSldLFxuICAgICAgdC5saXRlcmFsKCdyeCcpKSxcbiAgICB0LmltcG9ydERlY2xhcmF0aW9uKFtcbiAgICAgIHQuaW1wb3J0U3BlY2lmaWVyKHQuaWRlbnRpZmllcigndHJhY2tUaW1pbmcnKSwgdC5pZGVudGlmaWVyKCd0cmFja1RpbWluZycpKV0sXG4gICAgICB0LmxpdGVyYWwoJy4uLy4uL2FuYWx5dGljcycpKSxcbiAgICBhc3NpZ25tZW50LFxuICBdKTtcblxuICAvLyBVc2UgQmFiZWwgdG8gZ2VuZXJhdGUgY29kZSBmcm9tIHRoZSBBU1QuXG4gIHJldHVybiBnZW5lcmF0ZShwcm9ncmFtKS5jb2RlO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIGEgcmVtb3RlIHByb3h5IGZvciBhIG1vZHVsZS1sZXZlbCBmdW5jdGlvbi5cbiAqIEBwYXJhbSBmdW5jIC0gVGhlIEZ1bmN0aW9uRGVmaW5pdGlvbiBvYmplY3QgdGhhdCByZXByZXNlbnRzIHRoZSBmdW5jdGlvbnMgQVBJLlxuICogQHJldHVybnMgVGhlIHByb3h5IGZ1bmN0aW9uIChhcyBhbiBhcnJvdyBmdW5jdGlvbikgdGhhdCBzaG91bGQgYmUgYXNzaWduZWQgdG9cbiAqICAgYSBwcm9wZXJ0eSBvZiB0aGUgcmVtb3RlIG1vZHVsZS5cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVGdW5jdGlvblByb3h5KG5hbWU6IHN0cmluZywgZnVuY1R5cGU6IEZ1bmN0aW9uVHlwZSk6IGFueSB7XG4gIGNvbnN0IHByb3h5U3RhdG1lbnRzID0gW107XG5cbiAgLy8gQ29udmVydCBhbGwgb2YgdGhlIGFyZ3VtZW50cyBpbnRvIG1hcnNoYWxlZCBmb3JtLiBgYXJndW1lbnRzUHJvbWlzZWAgd2lsbCByZXNvbHZlXG4gIC8vIHRvIGFuIGFycmF5IG9mIHRoZSBjb252ZXJ0ZWQgYXJndW1lbnRzLlxuICBjb25zdCBhcmdzID0gZnVuY1R5cGUuYXJndW1lbnRUeXBlcy5tYXAoKGFyZywgaSkgPT4gdC5pZGVudGlmaWVyKGBhcmcke2l9YCkpO1xuICBjb25zdCBhcmd1bWVudHNQcm9taXNlID0gZ2VuZXJhdGVBcmd1bWVudENvbnZlcnNpb25Qcm9taXNlKGZ1bmNUeXBlLmFyZ3VtZW50VHlwZXMpO1xuXG4gIC8vIENhbGwgdGhlIHJlbW90ZUZ1bmN0aW9uQ2FsbCBtZXRob2Qgb2YgdGhlIENsaWVudENvbXBvbmVudCBvYmplY3QuXG4gIGxldCBycGNDYWxsRXhwcmVzc2lvbiA9IHQuY2FsbEV4cHJlc3Npb24oY2FsbFJlbW90ZUZ1bmN0aW9uRXhwcmVzc2lvbiwgW1xuICAgIHQubGl0ZXJhbChuYW1lKSxcbiAgICB0LmxpdGVyYWwoZnVuY1R5cGUucmV0dXJuVHlwZS5raW5kKSxcbiAgICB0LmlkZW50aWZpZXIoJ2FyZ3MnKSxcbiAgXSk7XG5cbiAgbGV0IHZhbHVlLCB0cmFuc2Zvcm1lciwgdHlwZTtcbiAgY29uc3QgcmV0dXJuVHlwZSA9IGZ1bmNUeXBlLnJldHVyblR5cGU7XG4gIHN3aXRjaCAocmV0dXJuVHlwZS5raW5kKSB7XG4gICAgY2FzZSAndm9pZCc6XG4gICAgICBycGNDYWxsRXhwcmVzc2lvbiA9IHRoZW5Qcm9taXNlKGFyZ3VtZW50c1Byb21pc2UsIHQuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oXG4gICAgICAgIFt0LmlkZW50aWZpZXIoJ2FyZ3MnKV0sXG4gICAgICAgIHJwY0NhbGxFeHByZXNzaW9uLFxuICAgICAgKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgIHJwY0NhbGxFeHByZXNzaW9uID0gdGhlblByb21pc2UoYXJndW1lbnRzUHJvbWlzZSwgdC5hcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihcbiAgICAgICAgW3QuaWRlbnRpZmllcignYXJncycpXSxcbiAgICAgICAgcnBjQ2FsbEV4cHJlc3Npb24sXG4gICAgICApKTtcblxuICAgICAgdmFsdWUgPSB0LmlkZW50aWZpZXIoJ3ZhbHVlJyk7XG4gICAgICB0eXBlID0gcmV0dXJuVHlwZS50eXBlO1xuICAgICAgdHJhbnNmb3JtZXIgPSB0LmFycm93RnVuY3Rpb25FeHByZXNzaW9uKFt2YWx1ZV0sXG4gICAgICAgIGdlbmVyYXRlVHJhbnNmb3JtU3RhdGVtZW50KHZhbHVlLCB0eXBlLCBmYWxzZSkpO1xuXG4gICAgICBycGNDYWxsRXhwcmVzc2lvbiA9IHRoZW5Qcm9taXNlKHJwY0NhbGxFeHByZXNzaW9uLCB0cmFuc2Zvcm1lcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgIC8vIGdlbmVyYXRlQXJndW1lbnRDb252ZXJzaW9uT2JzZXJ2YWJsZSB3aWxsIHJldHVybiBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgdGhlIHRyYW5zZm9ybWVkXG4gICAgICAvLyBhcnJheSBvZiBhcmd1bWVudHMuIFdlIGNvbmNhdE1hcCB0aGlzIGFycmF5IHRocm91Z2ggdGhlIFJQQyBjYWxsLCB3aGljaCB3aWxsIHJldHVybiB0aGVcbiAgICAgIC8vIHN0cmVhbSBvZiBldmVudHMuXG4gICAgICBycGNDYWxsRXhwcmVzc2lvbiA9IHQuY2FsbEV4cHJlc3Npb24oXG4gICAgICAgIHQubWVtYmVyRXhwcmVzc2lvbihcbiAgICAgICAgICBnZW5lcmF0ZUFyZ3VtZW50Q29udmVyc2lvbk9ic2VydmFibGUoZnVuY1R5cGUuYXJndW1lbnRUeXBlcyksIHQuaWRlbnRpZmllcignY29uY2F0TWFwJylcbiAgICAgICAgKSxcbiAgICAgICAgW3QuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW3QuaWRlbnRpZmllcignYXJncycpXSwgcnBjQ2FsbEV4cHJlc3Npb24pXVxuICAgICAgKTtcblxuICAgICAgLy8gV2UgdGhlbiBtYXAgdGhlIGluY29taW5nIGV2ZW50cyB0aHJvdWdoIHRoZSBhcHByb3ByaWF0ZSBtYXJzaGFsbGVyLiBXZSB1c2UgY29uY2F0TWFwXG4gICAgICAvLyBpbnN0ZWFkIG9mIGZsYXRNYXAsIHNpbmNlIGNvbmNhdE1hcCBlbnN1cmVzIHRoYXQgdGhlIG9yZGVyIG9mIHRoZSBldmVudHMgZG9lc24ndCBjaGFuZ2UuXG4gICAgICB2YWx1ZSA9IHQuaWRlbnRpZmllcigndmFsdWUnKTtcbiAgICAgIHR5cGUgPSByZXR1cm5UeXBlLnR5cGU7XG4gICAgICB0cmFuc2Zvcm1lciA9IHQuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW3ZhbHVlXSxcbiAgICAgICAgZ2VuZXJhdGVUcmFuc2Zvcm1TdGF0ZW1lbnQodmFsdWUsIHR5cGUsIGZhbHNlKSk7XG4gICAgICBycGNDYWxsRXhwcmVzc2lvbiA9IHQuY2FsbEV4cHJlc3Npb24oXG4gICAgICAgIHQubWVtYmVyRXhwcmVzc2lvbihycGNDYWxsRXhwcmVzc2lvbiwgdC5pZGVudGlmaWVyKCdjb25jYXRNYXAnKSksIFt0cmFuc2Zvcm1lcl0pO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rb3duIHJldHVybiB0eXBlICR7cmV0dXJuVHlwZS5raW5kfS5gKTtcbiAgfVxuXG4gIHByb3h5U3RhdG1lbnRzLnB1c2godC5yZXR1cm5TdGF0ZW1lbnQocnBjQ2FsbEV4cHJlc3Npb24pKTtcbiAgcmV0dXJuIHQuZnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIGFyZ3MsIHQuYmxvY2tTdGF0ZW1lbnQocHJveHlTdGF0bWVudHMpKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgc3RhdG1lbnRzIHRoYXQgY2FuIGJlIHVzZWQgdG8gbWFyc2hhbCBhbGwgb2YgdGhlXG4gKiBhcmd1bWVudHMgdG8gYSBmdW5jdGlvbi5cbiAqIEBwYXJhbSBhcmd1bWVudFR5cGVzIC0gQW4gYXJyYXkgb2YgdGhlIHR5cGVzIG9mIHRoZSBmdW5jdGlvbidzIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIGFycmF5IG9mIHRoZSBhcmd1bWVudHMuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQXJndW1lbnRDb252ZXJzaW9uUHJvbWlzZShhcmd1bWVudFR5cGVzOiBBcnJheTxUeXBlPik6IEFycmF5PGFueT4ge1xuICAvLyBDb252ZXJ0IGFsbCBvZiB0aGUgYXJndW1lbnRzIGludG8gbWFyc2hhbGVkIGZvcm0uXG4gIGNvbnN0IGFyZ3MgPSBhcmd1bWVudFR5cGVzLm1hcCgoYXJnLCBpKSA9PiB0LmlkZW50aWZpZXIoYGFyZyR7aX1gKSk7XG4gIHJldHVybiB0LmNhbGxFeHByZXNzaW9uKHByb21pc2VEb3RBbGxFeHByZXNzaW9uLFxuICAgIFt0LmFycmF5RXhwcmVzc2lvbihcbiAgICAgIGFyZ3MubWFwKChhcmcsIGkpID0+IGdlbmVyYXRlVHJhbnNmb3JtU3RhdGVtZW50KGFyZywgYXJndW1lbnRUeXBlc1tpXSwgdHJ1ZSkpXG4gICAgKV1cbiAgKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIGFuIGFycmF5IG9mIGNvbnZlcnRlZCBhcmd1bWVudHMuXG4gKiBAcGFyYW0gYXJndW1lbnRUeXBlcyAtIEFuIGFycmF5IG9mIHRoZSB0eXBlcyBvZiB0aGUgZnVuY3Rpb24ncyBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBBbiBleHByZXNzaW9uIHRoYXQgcmVwcmVzZW50cyBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgYW4gYXJyYXkgb2YgY29udmVydGVkIGFyZ3VtZW50cy5cbiAqIEV4YW1wbGU6IGBPYnNlcnZhYmxlLmNvbmNhdChfY2xpZW50Lm1hcnNoYWwoLi4uKSwgX2NsaWVudC5tYXJzaGFsKC4uLikpLnRvQXJyYXkoKWBcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVBcmd1bWVudENvbnZlcnNpb25PYnNlcnZhYmxlKGFyZ3VtZW50VHlwZXM6IEFycmF5PFR5cGU+KTogQXJyYXk8YW55PiB7XG4gIC8vIENyZWF0ZSBpZGVudGlmaWVycyB0aGF0IHJlcHJlc2VudCBhbGwgb2YgdGhlIGFyZ3VtZW50cy5cbiAgY29uc3QgYXJncyA9IGFyZ3VtZW50VHlwZXMubWFwKChhcmcsIGkpID0+IHQuaWRlbnRpZmllcihgYXJnJHtpfWApKTtcblxuICAvLyBXZSBjcmVhdGUgYW4gaW5pdGlhbCBvYnNlcnZhYmxlIGJ5IGNvbmNhdGVuYXRpbmcgKGh0dHA6Ly9yeG1hcmJsZXMuY29tLyNjb25jYXQpIGFsbCBvZlxuICAvLyB0aGUgbWFyc2hhbGxpbmcgcHJvbWlzZXMuIENvbmNhdGVuYXRpb24gdGFrZXMgbXVsdGlwbGUgc3RyZWFtcyAoUHJvbWlzZXMgaW4gdGhpcyBjYXNlKSwgYW5kXG4gIC8vIHJldHVybnMgb25lIHN0cmVhbSB3aGVyZSBhbGwgdGhlIGVsZW1lbnRzIG9mIHRoZSBpbnB1dCBzdHJlYW1zIGFyZSBlbWl0dGVkLiBDb25jYXQgcHJlc2VydmVzXG4gIC8vIG9yZGVyLCBlbnN1cmluZyB0aGF0IGFsbCBvZiBzdHJlYW0ncyBlbGVtZW50cyBhcmUgZW1pdHRlZCBiZWZvcmUgdGhlIG5leHQgc3RyZWFtJ3MgY2FuIGVtaXQuXG4gIGNvbnN0IGFyZ3VtZW50c09ic2VydmFibGUgPSB0LmNhbGxFeHByZXNzaW9uKFxuICAgICAgdC5tZW1iZXJFeHByZXNzaW9uKG9ic2VydmFibGVJZGVudGlmaWVyLCB0LmlkZW50aWZpZXIoJ2NvbmNhdCcpKSxcbiAgICAgIGFyZ3MubWFwKChhcmcsIGkpID0+IGdlbmVyYXRlVHJhbnNmb3JtU3RhdGVtZW50KGFyZywgYXJndW1lbnRUeXBlc1tpXSwgdHJ1ZSkpKTtcblxuICAvLyBPbmNlIHdlIGhhdmUgYSBzdHJlYW0gb2YgdGhlIGFyZ3VtZW50cywgd2UgY2FuIHVzZSB0b0FycmF5KCksIHdoaWNoIHJldHVybnMgYW4gb2JzZXJ2YWJsZSB0aGF0XG4gIC8vIHdhaXRzIGZvciB0aGUgc3RyZWFtIHRvIGNvbXBsZXRlLCBhbmQgZW1pdHMgb25lIGV2ZW50IHdpdGggYWxsIG9mIHRoZSBlbGVtZW50cyBhcyBhbiBhcnJheS5cbiAgcmV0dXJuIHQuY2FsbEV4cHJlc3Npb24odC5tZW1iZXJFeHByZXNzaW9uKGFyZ3VtZW50c09ic2VydmFibGUsIHQuaWRlbnRpZmllcigndG9BcnJheScpKSwgW10pO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIGEgcmVtb3RlIHByb3h5IGZvciBhbiBpbnRlcmZhY2UuXG4gKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpbnRlcmZhY2UuXG4gKiBAcGFyYW0gZGVmIC0gVGhlIEludGVyZmFjZURlZmluaXRpb24gb2JqZWN0IHRoYXQgZW5jb2RlcyBhbGwgaWYgdGhlIGludGVyZmFjZSdzIG9wZXJhdGlvbnMuXG4gKiBAcmV0dXJucyBBbiBhbm9ueW1vdXMgQ2xhc3NFeHByZXNzaW9uIG5vZGUgdGhhdCBjYW4gYmUgYXNzaWduZWQgdG8gYSBtb2R1bGUgcHJvcGVydHkuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlSW50ZXJmYWNlUHJveHkoZGVmOiBJbnRlcmZhY2VEZWZpbml0aW9uKTogYW55IHtcbiAgY29uc3QgbmFtZSA9IGRlZi5uYW1lO1xuICBjb25zdCBtZXRob2REZWZpbml0aW9ucyA9IFtdO1xuXG4gIC8vIEdlbmVyYXRlIHByb3hpZXMgZm9yIHN0YXRpYyBtZXRob2RzLlxuICBkZWYuc3RhdGljTWV0aG9kcy5mb3JFYWNoKChmdW5jVHlwZSwgbWV0aG9kTmFtZSkgPT4ge1xuICAgIG1ldGhvZERlZmluaXRpb25zLnB1c2godC5tZXRob2REZWZpbml0aW9uKFxuICAgICAgdC5pZGVudGlmaWVyKG1ldGhvZE5hbWUpLFxuICAgICAgZ2VuZXJhdGVGdW5jdGlvblByb3h5KGAke25hbWV9LyR7bWV0aG9kTmFtZX1gLCBmdW5jVHlwZSksXG4gICAgICAnbWV0aG9kJyxcbiAgICAgIGZhbHNlLFxuICAgICAgdHJ1ZVxuICAgICkpO1xuICB9KTtcblxuICAvLyBHZW5lcmF0ZSBjb25zdHJ1Y3RvciBwcm94eS5cbiAgbWV0aG9kRGVmaW5pdGlvbnMucHVzaChnZW5lcmF0ZVJlbW90ZUNvbnN0cnVjdG9yKG5hbWUsIGRlZi5jb25zdHJ1Y3RvckFyZ3MpKTtcblxuICAvLyBHZW5lcmF0ZSBwcm94aWVzIGZvciBpbnN0YW5jZSBtZXRob2RzLlxuICBkZWYuaW5zdGFuY2VNZXRob2RzLmZvckVhY2goKGZ1bmNUeXBlLCBtZXRob2ROYW1lKSA9PiB7XG4gICAgY29uc3QgbWV0aG9kRGVmaW5pdGlvbiA9IGdlbmVyYXRlUmVtb3RlRGlzcGF0Y2gobWV0aG9kTmFtZSwgZnVuY1R5cGUpO1xuXG4gICAgLy8gQWRkIHRyYWNrVGltaW5nIGRlY29yYXRvciB0byBpbnN0YW5jZSBtZXRob2QgdGhhdCByZXR1cm5zIGEgcHJvbWlzZS5cbiAgICBpZiAoZnVuY1R5cGUucmV0dXJuVHlwZS5raW5kID09PSAncHJvbWlzZScpIHtcbiAgICAgIG1ldGhvZERlZmluaXRpb24uZGVjb3JhdG9ycyA9IFtcbiAgICAgICAgdC5kZWNvcmF0b3IoXG4gICAgICAgICAgdC5jYWxsRXhwcmVzc2lvbihcbiAgICAgICAgICAgIHQuaWRlbnRpZmllcigndHJhY2tUaW1pbmcnKSxcbiAgICAgICAgICAgIFt0LmxpdGVyYWwoYCR7bmFtZX0uJHttZXRob2ROYW1lfWApXSxcbiAgICAgICAgICApLFxuICAgICAgICApLFxuICAgICAgXTtcbiAgICB9XG5cbiAgICBtZXRob2REZWZpbml0aW9ucy5wdXNoKG1ldGhvZERlZmluaXRpb24pO1xuICB9KTtcblxuICAvLyBHZW5lcmF0ZSB0aGUgZGlzcG9zZSBtZXRob2QuXG4gIG1ldGhvZERlZmluaXRpb25zLnB1c2goZ2VuZXJhdGVEaXNwb3NlTWV0aG9kKCkpO1xuXG4gIHJldHVybiB0LmNsYXNzRXhwcmVzc2lvbihudWxsLCB0LmNsYXNzQm9keShtZXRob2REZWZpbml0aW9ucyksIG51bGwpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGdlbmVyYXRlcyBhIHJlbW90ZSBjb25zdHJ1Y3RvciBwcm94eS5cbiAqIEBwYXJhbSBjbGFzc05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgaW50ZXJmYWNlLlxuICogQHBhcmFtIGNvbnN0cnVjdG9yQXJncyAtIFRoZSB0eXBlcyBvZiB0aGUgYXJndW1lbnRzIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAqIEByZXR1cm5zIEEgTWV0aG9kRGVmaW5pdGlvbiBub2RlIHRoYXQgY2FuIGJlIGFkZGVkIHRvIGEgQ2xhc3NCb2R5LlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZVJlbW90ZUNvbnN0cnVjdG9yKGNsYXNzTmFtZTogc3RyaW5nLCBjb25zdHJ1Y3RvckFyZ3M6IEFycmF5PFR5cGU+KSB7XG4gIC8vIENvbnZlcnQgY29uc3RydWN0b3IgYXJndW1lbnRzLlxuICBjb25zdCBhcmdzID0gY29uc3RydWN0b3JBcmdzLm1hcCgoYXJnLCBpKSA9PiB0LmlkZW50aWZpZXIoYGFyZyR7aX1gKSk7XG4gIGNvbnN0IGFyZ3VtZW50c1Byb21pc2UgPSBnZW5lcmF0ZUFyZ3VtZW50Q29udmVyc2lvblByb21pc2UoY29uc3RydWN0b3JBcmdzKTtcblxuICAvLyBNYWtlIGFuIFJQQyBjYWxsIHRoYXQgd2lsbCByZXR1cm4gdGhlIGlkIG9mIHRoZSByZW1vdGUgb2JqZWN0LlxuICBsZXQgcnBjQ2FsbEV4cHJlc3Npb24gPSB0LmNhbGxFeHByZXNzaW9uKGNyZWF0ZVJlbW90ZU9iamVjdEV4cHJlc3Npb24sIFtcbiAgICB0LmxpdGVyYWwoY2xhc3NOYW1lKSxcbiAgICB0LmlkZW50aWZpZXIoJ2FyZ3MnKSxcbiAgXSk7XG4gIHJwY0NhbGxFeHByZXNzaW9uID0gdGhlblByb21pc2UoYXJndW1lbnRzUHJvbWlzZSwgdC5hcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihcbiAgICBbdC5pZGVudGlmaWVyKCdhcmdzJyldLCBycGNDYWxsRXhwcmVzc2lvbikpO1xuXG4gIC8vIFNldCBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBpZCBvZiB0aGUgcmVtb3RhYmxlIG9iamVjdCBpcyBrbm93bi5cbiAgcnBjQ2FsbEV4cHJlc3Npb24gPSB0LmFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgdGhpc0RvdElkUHJvbWlzZUV4cHJlc3Npb24sIHJwY0NhbGxFeHByZXNzaW9uKTtcblxuICBjb25zdCBjb25zdHJ1Y3RvciA9IHQuRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIGFyZ3MsIHQuYmxvY2tTdGF0ZW1lbnQoW3JwY0NhbGxFeHByZXNzaW9uXSkpO1xuICByZXR1cm4gdC5tZXRob2REZWZpbml0aW9uKHQuaWRlbnRpZmllcignY29uc3RydWN0b3InKSwgY29uc3RydWN0b3IsICdjb25zdHJ1Y3RvcicsIGZhbHNlLCBmYWxzZSk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGEgcHJveHkgZm9yIGFuIGluc3RhbmNlIG1ldGhvZCBvZiBhbiBpbnRlcmZhY2UuXG4gKiBAcGFyYW0gbWV0aG9kTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QuXG4gKiBAcGFyYW0gZnVuY1R5cGUgLSBUaGUgdHlwZSBpbmZvcm1hdGlvbiBmb3IgdGhlIGZ1bmN0aW9uLlxuICogQHJldHVybnMgQSBNZXRob2REZWZpbml0aW9uIG5vZGUgdGhhdCBjYW4gYmUgYWRkZWQgdG8gYSBDbGFzc0JvZHlcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVSZW1vdGVEaXNwYXRjaChtZXRob2ROYW1lOiBzdHJpbmcsIGZ1bmNUeXBlOiBGdW5jdGlvblR5cGUpIHtcbiAgLy8gRmlyc3QsIGNvbnZlcnQgdGhlIGFyZ3VtZW50cy5cbiAgY29uc3QgYXJndW1lbnRzUHJvbWlzZSA9IGdlbmVyYXRlQXJndW1lbnRDb252ZXJzaW9uUHJvbWlzZShmdW5jVHlwZS5hcmd1bWVudFR5cGVzKTtcblxuICBjb25zdCBpZCA9IHQuaWRlbnRpZmllcignaWQnKTtcbiAgY29uc3QgdmFsdWUgPSB0LmlkZW50aWZpZXIoJ3ZhbHVlJyk7XG5cbiAgY29uc3QgcmVtb3RlTWV0aG9kQ2FsbCA9IHQuY2FsbEV4cHJlc3Npb24oY2FsbFJlbW90ZU1ldGhvZEV4cHJlc3Npb24sIFtcbiAgICBpZCwgdC5saXRlcmFsKG1ldGhvZE5hbWUpLCB0LmxpdGVyYWwoZnVuY1R5cGUucmV0dXJuVHlwZS5raW5kKSwgdC5pZGVudGlmaWVyKCdhcmdzJyldKTtcbiAgbGV0IHJwY0NhbGxFeHByZXNzaW9uID0gdGhlblByb21pc2UodGhpc0RvdElkUHJvbWlzZUV4cHJlc3Npb24sIHQuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oXG4gICAgW2lkXSwgcmVtb3RlTWV0aG9kQ2FsbCkpO1xuXG4gIHJwY0NhbGxFeHByZXNzaW9uID0gdGhlblByb21pc2UoYXJndW1lbnRzUHJvbWlzZSwgdC5hcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihcbiAgICBbdC5pZGVudGlmaWVyKCdhcmdzJyldLFxuICAgIHJwY0NhbGxFeHByZXNzaW9uLFxuICApKTtcblxuICBjb25zdCByZXR1cm5UeXBlID0gZnVuY1R5cGUucmV0dXJuVHlwZTtcbiAgc3dpdGNoIChyZXR1cm5UeXBlLmtpbmQpIHtcbiAgICBjYXNlICd2b2lkJzpcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgY29uc3QgcHJvbWlzZVRyYW5zZm9ybWVyID0gdC5hcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbdmFsdWVdLFxuICAgICAgICBnZW5lcmF0ZVRyYW5zZm9ybVN0YXRlbWVudCh2YWx1ZSwgcmV0dXJuVHlwZS50eXBlLCBmYWxzZSkpO1xuICAgICAgcnBjQ2FsbEV4cHJlc3Npb24gPSB0aGVuUHJvbWlzZShycGNDYWxsRXhwcmVzc2lvbiwgcHJvbWlzZVRyYW5zZm9ybWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgY29uc3QgYXJndW1lbnRzT2JzZXJ2YWJsZSA9IGdlbmVyYXRlQXJndW1lbnRDb252ZXJzaW9uT2JzZXJ2YWJsZShmdW5jVHlwZS5hcmd1bWVudFR5cGVzKTtcblxuICAgICAgLy8gV2UgbmVlZCB0byByZXNvbHZlIGJvdGggdGhlIHRyYW5zZm9ybWVkIGFyZ3VtZW50cyBhbmQgdGhlIG9iamVjdCBpZCBiZWZvcmUgbWFraW5nIHRoZSBSUEMuXG4gICAgICAvLyBXZSBjYW4gdXNlIGZvcmtKb2luIC0gaHR0cHM6Ly9naXRodWIuY29tL1JlYWN0aXZlLUV4dGVuc2lvbnMvUnhKUy9ibG9iL21hc3Rlci9kb2MvYXBpL2NvcmUvb3BlcmF0b3JzL2Zvcmtqb2luLm1kLlxuICAgICAgLy8gVGhpcyB3aWxsIHJlc29sdmUgdG8gYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIGFuIGFycmF5IHdpdGggW2lkLCBhcmdzXSBhcyB0aGUgdHdvIGVsZW1lbnRzLlxuICAgICAgY29uc3QgaWRBbmRBcmd1bWVudHNPYnNlcnZhYmxlID0gdC5jYWxsRXhwcmVzc2lvbih0Lm1lbWJlckV4cHJlc3Npb24ob2JzZXJ2YWJsZUlkZW50aWZpZXIsXG4gICAgICAgIHQuaWRlbnRpZmllcignZm9ya0pvaW4nKSksIFt0aGlzRG90SWRQcm9taXNlRXhwcmVzc2lvbiwgYXJndW1lbnRzT2JzZXJ2YWJsZV0pO1xuXG4gICAgICAvLyBPbmNlIHdlIHJlc29sdmUgYm90aCB0aGUgaWQgYW5kIHRoZSB0cmFuc2Zvcm1lZCBhcmd1bWVudHMsIHdlIGNhbiBtYXAgdGhlbSB0byB0aGVuIFJQQ1xuICAgICAgLy8gY2FsbCwgd2hpY2ggdGhlbiByZXR1cm5zIHRoZSBvYnNlcnZhYmxlIG9mIGRhdGEgdGhhdCB3ZSBhY3R1YWxseSB3YW50IHRvIHJldHVybi5cbiAgICAgIHJwY0NhbGxFeHByZXNzaW9uID0gdC5jYWxsRXhwcmVzc2lvbihcbiAgICAgICAgdC5tZW1iZXJFeHByZXNzaW9uKGlkQW5kQXJndW1lbnRzT2JzZXJ2YWJsZSwgdC5pZGVudGlmaWVyKCdjb25jYXRNYXAnKSksXG4gICAgICAgIFt0LmFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtcbiAgICAgICAgICB0LmFycmF5UGF0dGVybihbdC5pZGVudGlmaWVyKCdpZCcpLCB0LmlkZW50aWZpZXIoJ2FyZ3MnKV0pLFxuICAgICAgICBdLCByZW1vdGVNZXRob2RDYWxsKV1cbiAgICAgICk7XG5cbiAgICAgIC8vIEZpbmFsbHksIHdlIG1hcCB0aGUgZXZlbnRzIHRocm91Z2ggdGhlIGFwcHJvcHJpYXRlIG1hcnNoYWxsZXIuIFdlIHVzZSBjb25jYXRNYXAgaW5zdGVhZCBvZlxuICAgICAgLy8gZmxhdE1hcCB0byBlbnN1cmUgdGhhdCB0aGUgb3JkZXIgZG9lc24ndCBjaGFuZ2UsIGluIGNhc2Ugb25lIGV2ZW50IHRha2VzIGVzcGVjaWFsbHkgbG9uZ1xuICAgICAgLy8gdG8gbWFyc2hhbC5cbiAgICAgIGNvbnN0IG9ic2VydmFibGVUcmFuc2Zvcm1lciA9IHQuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW3ZhbHVlXSxcbiAgICAgICAgZ2VuZXJhdGVUcmFuc2Zvcm1TdGF0ZW1lbnQodmFsdWUsIHJldHVyblR5cGUudHlwZSwgZmFsc2UpKTtcbiAgICAgIHJwY0NhbGxFeHByZXNzaW9uID0gdC5jYWxsRXhwcmVzc2lvbihcbiAgICAgICAgdC5tZW1iZXJFeHByZXNzaW9uKHJwY0NhbGxFeHByZXNzaW9uLCB0LmlkZW50aWZpZXIoJ2NvbmNhdE1hcCcpKSwgW29ic2VydmFibGVUcmFuc2Zvcm1lcl0pO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rb3duIHJldHVybiB0eXBlICR7cmV0dXJuVHlwZS5raW5kfS5gKTtcbiAgfVxuXG4gIGNvbnN0IGZ1bmNUeXBlQXJncyA9IGZ1bmNUeXBlLmFyZ3VtZW50VHlwZXMubWFwKChhcmcsIGkpID0+IHQuaWRlbnRpZmllcihgYXJnJHtpfWApKTtcbiAgY29uc3QgZnVuY0V4cHJlc3Npb24gPSB0LmZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBmdW5jVHlwZUFyZ3MsIHQuYmxvY2tTdGF0ZW1lbnQoW1xuICAgIHQucmV0dXJuU3RhdGVtZW50KHJwY0NhbGxFeHByZXNzaW9uKV0pKTtcblxuICByZXR1cm4gdC5tZXRob2REZWZpbml0aW9uKHQuaWRlbnRpZmllcihtZXRob2ROYW1lKSwgZnVuY0V4cHJlc3Npb24sICdtZXRob2QnLCBmYWxzZSwgZmFsc2UpO1xufVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdGhhdCBnZW5lcmF0ZXMgdGhlIGRpc3Bvc2UgbWV0aG9kIGZvciBhIGNsYXNzLiBUaGUgZGlzcG9zZSBtZXRob2RcbiAqIHJlcGxhY2VzIGB0aGlzLl9pZFByb21pc2VgIHdpdGggYSB0aGVuYWJsZSBvYmplY3QgdGhhdCB0aHJvd3MgZXJyb3Igd2hlbiB1c2VkLFxuICogYXMgd2VsbCBhcyBjYWxscyBgX2NsaWVudC5kaXNwb3NlUmVtb3RlT2JqZWN0YCB3aXRoIHRoZSBvYmplY3QncyBpZCBhcyBhIHBhcmFtZXRlci5cbiAqIEByZXR1cm5zIEEgTWV0aG9kRGVmaW5pdGlvbiBub2RlIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIGEgY2xhc3MgYm9keS5cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVEaXNwb3NlTWV0aG9kKCkge1xuICBjb25zdCBpZCA9IHQuaWRlbnRpZmllcignaWQnKTtcblxuICAvLyBSZXBsYWNlIGBpZFByb21pc2VgIHdpdGggdGhlbmFibGUgb2JqZWN0IHRoYXQgdGhyb3dzIGVycm9yLlxuICBjb25zdCBkaXNwb3NlZEVycm9yID0gdC5uZXdFeHByZXNzaW9uKHQuaWRlbnRpZmllcignRXJyb3InKSxcbiAgICBbdC5saXRlcmFsKCdUaGlzIFJlbW90ZSBPYmplY3QgaGFzIGJlZW4gZGlzcG9zZWQuJyldKTtcbiAgY29uc3QgdGhyb3dFcnJvckZ1bmN0aW9uID0gdC5mdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW10sIHQuYmxvY2tTdGF0ZW1lbnQoW1xuICAgIHQudGhyb3dTdGF0ZW1lbnQoZGlzcG9zZWRFcnJvciksXG4gIF0pKTtcbiAgY29uc3QgdGhlbmFibGVFcnJvck9iamVjdCA9XG4gICAgdC5vYmplY3RFeHByZXNzaW9uKFt0LlByb3BlcnR5KCdpbml0JywgdC5pZGVudGlmaWVyKCd0aGVuJyksIHRocm93RXJyb3JGdW5jdGlvbildKTtcbiAgY29uc3QgcmVwbGFjZUlkUHJvbWlzZSA9IHQuZXhwcmVzc2lvblN0YXRlbWVudCh0LmFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JyxcbiAgICB0aGlzRG90SWRQcm9taXNlRXhwcmVzc2lvbiwgdGhlbmFibGVFcnJvck9iamVjdCkpO1xuXG4gIC8vIENhbGwgYF9jbGllbnQuZGlzcG9zZVJlbW90ZU9iamVjdGAuXG4gIGxldCBycGNDYWxsRXhwcmVzc2lvbiA9IHQuY2FsbEV4cHJlc3Npb24oZGlzcG9zZVJlbW90ZU9iamVjdEV4cHJlc3Npb24sIFtpZF0pO1xuXG4gIC8vIFdyYXAgdGhlc2Ugc3RhdGVtZW50cyBpbiBhIGAudGhlbmAgb24gYGlkUHJvbWlzZWAsIHNvIHRoYXQgdGhleSBjYW4gZXhlY3V0ZSBhZnRlciB0aGVcbiAgLy8gaWQgaGFzIGJlZW4gZGV0ZXJtaW5lZC5cbiAgcnBjQ2FsbEV4cHJlc3Npb24gPSB0LmNhbGxFeHByZXNzaW9uKFxuICAgIHQubWVtYmVyRXhwcmVzc2lvbih0aGlzRG90SWRQcm9taXNlRXhwcmVzc2lvbiwgdC5pZGVudGlmaWVyKCd0aGVuJykpLFxuICAgIFt0LmFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtpZF0sIHQuYmxvY2tTdGF0ZW1lbnQoW1xuICAgICAgcmVwbGFjZUlkUHJvbWlzZSxcbiAgICAgIHQucmV0dXJuU3RhdGVtZW50KHJwY0NhbGxFeHByZXNzaW9uKSxcbiAgICBdKSldXG4gICk7XG4gIGNvbnN0IHJldHVyblN0YXRlbWVudCA9IHQucmV0dXJuU3RhdGVtZW50KHJwY0NhbGxFeHByZXNzaW9uKTtcblxuICByZXR1cm4gdC5tZXRob2REZWZpbml0aW9uKHQuaWRlbnRpZmllcignZGlzcG9zZScpLFxuICAgIHQuZnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtdLCB0LmJsb2NrU3RhdGVtZW50KFtyZXR1cm5TdGF0ZW1lbnRdKSksICdtZXRob2QnLCBmYWxzZSwgZmFsc2UpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGdlbmVyYXRlcyBhIHRyYW5zZm9ybWF0aW9uIHN0YXRlbWVudCBmb3IgYW4gb2JqZWN0LiBUaGlzIGFtbW91bnRzIHRvXG4gKiBhIGNhbGwgZWl0aGVyIHRvIF9jbGllbnQubWFyc2hhbCBvciBfY2xpZW50LnVubWFyc2hhbC5cbiAqIEBwYXJhbSBpZCB7SWRlbnRpZmllcn0gVGhlIGlkZW50aWZpZXIgb2YgdGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcGFyYW0gdHlwZSB7VHlwZX0gVGhlIHR5cGUgb2YgdGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcGFyYW0gbWFyc2hhbCB7Ym9vbGVhbn0gLSBJZiB0cnVlLCB0aGVuIHdlIGFyZSB0cnlpbmcgdG8gbWFyc2hhbCB0aGUgdmFsdWUuIElmIGZhbHNlLCB0aGVuXG4gKiAgIHdlIGFyZSB0cnlpbmcgdG8gdW5tYXJzaGFsLlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZVRyYW5zZm9ybVN0YXRlbWVudChpZDogYW55LCB0eXBlOiBUeXBlLCBtYXJzaGFsOiBib29sZWFuKTogYW55IHtcbiAgLy8gVGhlIGZpcnN0IGFyZ3VtZW50IGlzIHRoZSB2YWx1ZSB0byBiZSBtYXJzaGFsbGVkIG9yIHVubWFyc2hhbGxlZC5cbiAgLy8gVGhlIHNlY29uZCBhcmd1bWVudCBpcyB0aGUgdHlwZSBvYmplY3QsIHdoaWNoIGVuY29kZXMgYWxsIG9mIHRoZSBpbmZvcm1hdGlvbiByZXF1aXJlZFxuICAvLyB0byBtYXJzaGFsIC8gdW5tYXJzaGFsIHRoZSB2YWx1ZS5cbiAgY29uc3QgY29udmVydEFyZ3MgPSBbaWQsIG9iamVjdFRvTGl0ZXJhbCh0eXBlKV07XG5cbiAgLy8gSWYgdGhlIHR5cGUgaXMgcGFyYW1ldGVyaXplZCwgd2Ugc2VuZCB0aGUgcGFyYW1ldGVycyBhcyBhbiBvcHRpb25hbCBmb3VydGggYXJndW1lbnQuXG4gIGlmICh0eXBlLnBhcmFtKSB7XG4gICAgY29udmVydEFyZ3MucHVzaChvYmplY3RUb0xpdGVyYWwodHlwZS5wYXJhbSkpO1xuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBhcHByb3ByaWF0ZSBjYWxsLlxuICByZXR1cm4gKG1hcnNoYWwgPyBtYXJzaGFsQ2FsbCA6IHVubWFyc2hhbENhbGwpLmFwcGx5KHRoaXMsIGNvbnZlcnRBcmdzKTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhbiBvYmplY3QsIGFuZCByZWN1cnNpdmVseSBjb252ZXJ0cyBpdCB0byBhIEJhYmVsIEFTVCBsaXRlcmFsIG5vZGUuIFRoaXMgaGFuZGxlcyBzdHJpbmdzLFxuICogbnVtYmVycywgYm9vbGVhbnMsIGJhc2ljIG9iamVjdHMsIGFuZCBBcnJheXMuIFRoaXMgY2Fubm90IGhhbmRsZSBjaXJjdWxhciByZWZlcmVuY2VzLlxuICogQHBhcmFtIG9iaiAtIFRoZSBvYmplY3QgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIEEgYmFiZWwgQVNUIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvTGl0ZXJhbChvYmo6IGFueSk6IGFueSB7XG4gIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygb2JqID09PSAnbnVtYmVyJyB8fCB0eXBlb2Ygb2JqID09PSAnYm9vbGVhbicpIHtcbiAgICByZXR1cm4gdC5saXRlcmFsKG9iaik7XG4gIH0gZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICByZXR1cm4gdC5hcnJheUV4cHJlc3Npb24ob2JqLm1hcChlbGVtID0+IG9iamVjdFRvTGl0ZXJhbChlbGVtKSkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHQub2JqZWN0RXhwcmVzc2lvbihPYmplY3Qua2V5cyhvYmopLm1hcChrZXkgPT4ge1xuICAgICAgcmV0dXJuIHQuUHJvcGVydHkoJ2luaXQnLCB0LmlkZW50aWZpZXIoa2V5KSwgb2JqZWN0VG9MaXRlcmFsKG9ialtrZXldKSk7XG4gICAgfSkpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY29udmVydCB1bmtvd24gdHlwZSAke3R5cGVvZiBvYmp9IHRvIGxpdGVyYWwuYCk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgYC50aGVuYHMgb24gYSBwcm9taXNlLlxuICogQHBhcmFtIHByb21pc2VFeHByZXNzaW9uIC0gQW4gZXhwcmVzc2lvbiB0aGF0IHdpbGwgZXZhbHVhdGUgdG8gYSBwcm9taXNlLlxuICogQHBhcmFtIGZ1bmN0aW9uRXhwcmVzc2lvbiAtIEEgZnVuY3Rpb24gdG8gcGFzcyBhcyBhbiBhcmd1bWVudCB0byBgLnRoZW5gXG4gKiBAcmV0dXJucyBBIENhbGxFeHByZXNzaW9uIG5vZGUgdGhhdCBgLnRoZW5gcyBvbiB0aGUgcHJvdmlkZWQgcHJvbWlzZS5cbiAqL1xuZnVuY3Rpb24gdGhlblByb21pc2UocHJvbWlzZUV4cHJlc3Npb24sIGZ1bmN0aW9uRXhwcmVzc2lvbik6IGFueSB7XG4gIHJldHVybiB0LmNhbGxFeHByZXNzaW9uKHQubWVtYmVyRXhwcmVzc2lvbihwcm9taXNlRXhwcmVzc2lvbiwgdGhlbklkZW50KSxcbiAgICBbZnVuY3Rpb25FeHByZXNzaW9uXSk7XG59XG5cbi8qKiBFeHBvcnQgcHJpdmF0ZSBmdW5jdGlvbnMgZm9yIHVuaXQtdGVzdGluZy4gKi9cbmV4cG9ydCBjb25zdCBfX3Rlc3RfXyA9IHtcbiAgZ2VuZXJhdGVUcmFuc2Zvcm1TdGF0ZW1lbnQsXG59O1xuIl19