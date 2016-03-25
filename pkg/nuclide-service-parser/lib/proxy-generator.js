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
  var program = t.program([t.expressionStatement(t.literal('use babel')), t.importDeclaration([t.importSpecifier(t.identifier('Observable'), t.identifier('Observable'))], t.literal('rx')), t.importDeclaration([t.importSpecifier(t.identifier('trackTiming'), t.identifier('trackTiming'))], t.literal('../../nuclide-analytics')), assignment]);

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
//# sourceMappingURL=data:application/json;base64,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Iid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCAqIGFzIGJhYmVsIGZyb20gJ2JhYmVsLWNvcmUnO1xuaW1wb3J0IGdlbmVyYXRlIGZyb20gJ2JhYmVsLWNvcmUvbGliL2dlbmVyYXRpb24nO1xuXG5pbXBvcnQgdHlwZSB7XG4gIERlZmluaXRpb25zLFxuICBGdW5jdGlvblR5cGUsXG4gIFR5cGUsXG4gIEludGVyZmFjZURlZmluaXRpb24sXG59IGZyb20gJy4vdHlwZXMnO1xuXG5jb25zdCB0ID0gYmFiZWwudHlwZXM7XG5cbmNvbnN0IHByb21pc2VEb3RBbGxFeHByZXNzaW9uID0gdC5tZW1iZXJFeHByZXNzaW9uKHQuaWRlbnRpZmllcignUHJvbWlzZScpLCB0LmlkZW50aWZpZXIoJ2FsbCcpKTtcbmNvbnN0IHRoZW5JZGVudCA9IHQuaWRlbnRpZmllcigndGhlbicpO1xuXG5jb25zdCBvYnNlcnZhYmxlSWRlbnRpZmllciA9IHQuaWRlbnRpZmllcignT2JzZXJ2YWJsZScpO1xuXG5jb25zdCBtb2R1bGVEb3RFeHBvcnRzRXhwcmVzc2lvbiA9XG4gIHQubWVtYmVyRXhwcmVzc2lvbih0LmlkZW50aWZpZXIoJ21vZHVsZScpLCB0LmlkZW50aWZpZXIoJ2V4cG9ydHMnKSk7XG5jb25zdCBjbGllbnRJZGVudGlmaWVyID0gdC5pZGVudGlmaWVyKCdfY2xpZW50Jyk7XG5cbi8vIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbXBsZW1lbnRlZCBhdCB0aGUgY29ubmVjdGlvbiBsYXllci5cbmNvbnN0IGNhbGxSZW1vdGVGdW5jdGlvbkV4cHJlc3Npb24gPVxuICB0Lm1lbWJlckV4cHJlc3Npb24oY2xpZW50SWRlbnRpZmllciwgdC5pZGVudGlmaWVyKCdjYWxsUmVtb3RlRnVuY3Rpb24nKSk7XG5jb25zdCBjYWxsUmVtb3RlTWV0aG9kRXhwcmVzc2lvbiA9XG4gIHQubWVtYmVyRXhwcmVzc2lvbihjbGllbnRJZGVudGlmaWVyLCB0LmlkZW50aWZpZXIoJ2NhbGxSZW1vdGVNZXRob2QnKSk7XG5jb25zdCBjcmVhdGVSZW1vdGVPYmplY3RFeHByZXNzaW9uID1cbiAgdC5tZW1iZXJFeHByZXNzaW9uKGNsaWVudElkZW50aWZpZXIsIHQuaWRlbnRpZmllcignY3JlYXRlUmVtb3RlT2JqZWN0JykpO1xuY29uc3QgZGlzcG9zZVJlbW90ZU9iamVjdEV4cHJlc3Npb24gPVxuICB0Lm1lbWJlckV4cHJlc3Npb24oY2xpZW50SWRlbnRpZmllciwgdC5pZGVudGlmaWVyKCdkaXNwb3NlUmVtb3RlT2JqZWN0JykpO1xuXG5jb25zdCB0aGlzRG90SWRQcm9taXNlRXhwcmVzc2lvbiA9XG4gIHQubWVtYmVyRXhwcmVzc2lvbih0LnRoaXNFeHByZXNzaW9uKCksIHQuaWRlbnRpZmllcignX2lkUHJvbWlzZScpKTtcblxuY29uc3QgcmVtb3RlTW9kdWxlID0gdC5pZGVudGlmaWVyKCdyZW1vdGVNb2R1bGUnKTtcbmNvbnN0IGVtcHR5T2JqZWN0ID0gdC5vYmplY3RFeHByZXNzaW9uKFtdKTtcblxuY29uc3QgY2xpZW50RG90TWFyc2hhbEV4cHJlc3Npb25cbiAgPSB0Lm1lbWJlckV4cHJlc3Npb24oY2xpZW50SWRlbnRpZmllciwgdC5pZGVudGlmaWVyKCdtYXJzaGFsJykpO1xuY29uc3QgY2xpZW50RG90VW5tYXJzaGFsRXhwcmVzc2lvblxuICA9IHQubWVtYmVyRXhwcmVzc2lvbihjbGllbnRJZGVudGlmaWVyLCB0LmlkZW50aWZpZXIoJ3VubWFyc2hhbCcpKTtcbmNvbnN0IG1hcnNoYWxDYWxsID0gKC4uLmFyZ3MpID0+IHQuY2FsbEV4cHJlc3Npb24oY2xpZW50RG90TWFyc2hhbEV4cHJlc3Npb24sIGFyZ3MpO1xuY29uc3QgdW5tYXJzaGFsQ2FsbCA9ICguLi5hcmdzKSA9PiB0LmNhbGxFeHByZXNzaW9uKGNsaWVudERvdFVubWFyc2hhbEV4cHJlc3Npb24sIGFyZ3MpO1xuXG4vKipcbiAqIEdpdmVuIHRoZSBwYXJzZWQgcmVzdWx0IG9mIGEgZGVmaW5pdGlvbiBmaWxlLCBnZW5lcmF0ZSBhIHJlbW90ZSBwcm94eSBtb2R1bGVcbiAqIHRoYXQgZXhwb3J0cyB0aGUgZGVmaW5pdGlvbidzIEFQSSwgYnV0IGludGVybmFsbHkgY2FsbHMgUlBDIGZ1bmN0aW9ucy4gVGhlIGZ1bmN0aW9uXG4gKiBkb2VzIG5vdCByZXR1cm4gdGhlIHByb3h5IG1vZHVsZSBkaXJlY3RseSwgYnV0IHJhdGhlciByZXR1cm5zIGEgJ2ZhY3RvcnknIG1ldGhvZFxuICogdGhhdCBzaG91bGQgYmUgY2FsbGVkIHdpdGggYSBDbGllbnRDb21wb25lbnQgb2JqZWN0LiBUaGlzIGZhY3RvcnkgbWV0aG9kIHJldHVybnMgdGhlXG4gKiByZW1vdGUgbW9kdWxlIHdpdGggdGhlIGNsaWVudCBvYmplY3QgJ2Nsb3NlZCBvdmVyLCcgYW5kIHVzZWQgdG8gbWFrZSB0aGUgUlBDIGNhbGxzLlxuICogQHBhcmFtIGRlZnMgLSBUaGUgcmVzdWx0IG9mIHBhcnNpbmcgdGhlIGRlZmluaXRpb24gZmlsZS5cbiAqIEByZXR1cm5zIFRoZSBwcm94eSBmYWN0b3J5IG1ldGhvZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2VuZXJhdGVQcm94eShzZXJ2aWNlTmFtZTogc3RyaW5nLCBkZWZzOiBEZWZpbml0aW9ucyk6IHN0cmluZyB7XG4gIC8vIEluaXRpYWxpemVkIHJlbW90ZU1vZHVsZSB0byBlbXB0eSBvYmplY3QuXG4gIGNvbnN0IHN0YXRlbWVudHMgPSBbdC5hc3NpZ25tZW50RXhwcmVzc2lvbignPScsIHJlbW90ZU1vZHVsZSwgZW1wdHlPYmplY3QpXTtcblxuICBkZWZzLmZvckVhY2goZGVmaW5pdGlvbiA9PiB7XG4gICAgY29uc3QgbmFtZSA9IGRlZmluaXRpb24ubmFtZTtcbiAgICBzd2l0Y2ggKGRlZmluaXRpb24ua2luZCkge1xuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAvLyBHZW5lcmF0ZSBhIHJlbW90ZSBwcm94eSBmb3IgZWFjaCBtb2R1bGUtbGV2ZWwgZnVuY3Rpb24uXG4gICAgICAgIHN0YXRlbWVudHMucHVzaCh0LmFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JyxcbiAgICAgICAgICB0Lm1lbWJlckV4cHJlc3Npb24ocmVtb3RlTW9kdWxlLCB0LmlkZW50aWZpZXIobmFtZSkpLFxuICAgICAgICAgIGdlbmVyYXRlRnVuY3Rpb25Qcm94eShgJHtzZXJ2aWNlTmFtZX0vJHtuYW1lfWAsIGRlZmluaXRpb24udHlwZSkpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbnRlcmZhY2UnOlxuICAgICAgICAvLyBHZW5lcmF0ZSBhIHJlbW90ZSBwcm94eSBmb3IgZWFjaCByZW1vdGFibGUgaW50ZXJmYWNlLlxuICAgICAgICBzdGF0ZW1lbnRzLnB1c2godC5hc3NpZ25tZW50RXhwcmVzc2lvbignPScsXG4gICAgICAgICAgdC5tZW1iZXJFeHByZXNzaW9uKHJlbW90ZU1vZHVsZSwgdC5pZGVudGlmaWVyKG5hbWUpKSxcbiAgICAgICAgICBnZW5lcmF0ZUludGVyZmFjZVByb3h5KGRlZmluaXRpb24pKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAvLyBub3RoaW5nXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gUmV0dXJuIHRoZSByZW1vdGUgbW9kdWxlLlxuICBzdGF0ZW1lbnRzLnB1c2godC5yZXR1cm5TdGF0ZW1lbnQocmVtb3RlTW9kdWxlKSk7XG5cbiAgLy8gV3JhcCB0aGUgcmVtb3RlTW9kdWxlIGNvbnN0cnVjdGlvbiBpbiBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBDbGllbnRDb21wb25lbnQgb2JqZWN0IGFzXG4gIC8vIGFuIGFyZ3VtZW50LiBgcmVxdWlyZWAgY2FsbHMgd2lsbCByZXNvbHZlIGFzIGlmIG1hZGUgYnkgYSBmaWxlIHRoYXQgaXMgYSBzaWJsaW5nIHRvXG4gIC8vIHRoaXMgbW9kdWxlJ3MgYGxpYi9tYWluLmpzYC5cbiAgY29uc3QgZnVuYyA9IHQuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW2NsaWVudElkZW50aWZpZXJdLCB0LmJsb2NrU3RhdGVtZW50KHN0YXRlbWVudHMpKTtcbiAgY29uc3QgYXNzaWdubWVudCA9IHQuYXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtb2R1bGVEb3RFeHBvcnRzRXhwcmVzc2lvbiwgZnVuYyk7XG4gIGNvbnN0IHByb2dyYW0gPSB0LnByb2dyYW0oW1xuICAgIHQuZXhwcmVzc2lvblN0YXRlbWVudCh0LmxpdGVyYWwoJ3VzZSBiYWJlbCcpKSxcbiAgICB0LmltcG9ydERlY2xhcmF0aW9uKFtcbiAgICAgIHQuaW1wb3J0U3BlY2lmaWVyKHQuaWRlbnRpZmllcignT2JzZXJ2YWJsZScpLCB0LmlkZW50aWZpZXIoJ09ic2VydmFibGUnKSldLFxuICAgICAgdC5saXRlcmFsKCdyeCcpKSxcbiAgICB0LmltcG9ydERlY2xhcmF0aW9uKFtcbiAgICAgIHQuaW1wb3J0U3BlY2lmaWVyKHQuaWRlbnRpZmllcigndHJhY2tUaW1pbmcnKSwgdC5pZGVudGlmaWVyKCd0cmFja1RpbWluZycpKV0sXG4gICAgICB0LmxpdGVyYWwoJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJykpLFxuICAgIGFzc2lnbm1lbnQsXG4gIF0pO1xuXG4gIC8vIFVzZSBCYWJlbCB0byBnZW5lcmF0ZSBjb2RlIGZyb20gdGhlIEFTVC5cbiAgcmV0dXJuIGdlbmVyYXRlKHByb2dyYW0pLmNvZGU7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYSByZW1vdGUgcHJveHkgZm9yIGEgbW9kdWxlLWxldmVsIGZ1bmN0aW9uLlxuICogQHBhcmFtIGZ1bmMgLSBUaGUgRnVuY3Rpb25EZWZpbml0aW9uIG9iamVjdCB0aGF0IHJlcHJlc2VudHMgdGhlIGZ1bmN0aW9ucyBBUEkuXG4gKiBAcmV0dXJucyBUaGUgcHJveHkgZnVuY3Rpb24gKGFzIGFuIGFycm93IGZ1bmN0aW9uKSB0aGF0IHNob3VsZCBiZSBhc3NpZ25lZCB0b1xuICogICBhIHByb3BlcnR5IG9mIHRoZSByZW1vdGUgbW9kdWxlLlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUZ1bmN0aW9uUHJveHkobmFtZTogc3RyaW5nLCBmdW5jVHlwZTogRnVuY3Rpb25UeXBlKTogYW55IHtcbiAgY29uc3QgcHJveHlTdGF0bWVudHMgPSBbXTtcblxuICAvLyBDb252ZXJ0IGFsbCBvZiB0aGUgYXJndW1lbnRzIGludG8gbWFyc2hhbGVkIGZvcm0uIGBhcmd1bWVudHNQcm9taXNlYCB3aWxsIHJlc29sdmVcbiAgLy8gdG8gYW4gYXJyYXkgb2YgdGhlIGNvbnZlcnRlZCBhcmd1bWVudHMuXG4gIGNvbnN0IGFyZ3MgPSBmdW5jVHlwZS5hcmd1bWVudFR5cGVzLm1hcCgoYXJnLCBpKSA9PiB0LmlkZW50aWZpZXIoYGFyZyR7aX1gKSk7XG4gIGNvbnN0IGFyZ3VtZW50c1Byb21pc2UgPSBnZW5lcmF0ZUFyZ3VtZW50Q29udmVyc2lvblByb21pc2UoZnVuY1R5cGUuYXJndW1lbnRUeXBlcyk7XG5cbiAgLy8gQ2FsbCB0aGUgcmVtb3RlRnVuY3Rpb25DYWxsIG1ldGhvZCBvZiB0aGUgQ2xpZW50Q29tcG9uZW50IG9iamVjdC5cbiAgbGV0IHJwY0NhbGxFeHByZXNzaW9uID0gdC5jYWxsRXhwcmVzc2lvbihjYWxsUmVtb3RlRnVuY3Rpb25FeHByZXNzaW9uLCBbXG4gICAgdC5saXRlcmFsKG5hbWUpLFxuICAgIHQubGl0ZXJhbChmdW5jVHlwZS5yZXR1cm5UeXBlLmtpbmQpLFxuICAgIHQuaWRlbnRpZmllcignYXJncycpLFxuICBdKTtcblxuICBsZXQgdmFsdWUsIHRyYW5zZm9ybWVyLCB0eXBlO1xuICBjb25zdCByZXR1cm5UeXBlID0gZnVuY1R5cGUucmV0dXJuVHlwZTtcbiAgc3dpdGNoIChyZXR1cm5UeXBlLmtpbmQpIHtcbiAgICBjYXNlICd2b2lkJzpcbiAgICAgIHJwY0NhbGxFeHByZXNzaW9uID0gdGhlblByb21pc2UoYXJndW1lbnRzUHJvbWlzZSwgdC5hcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihcbiAgICAgICAgW3QuaWRlbnRpZmllcignYXJncycpXSxcbiAgICAgICAgcnBjQ2FsbEV4cHJlc3Npb24sXG4gICAgICApKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgcnBjQ2FsbEV4cHJlc3Npb24gPSB0aGVuUHJvbWlzZShhcmd1bWVudHNQcm9taXNlLCB0LmFycm93RnVuY3Rpb25FeHByZXNzaW9uKFxuICAgICAgICBbdC5pZGVudGlmaWVyKCdhcmdzJyldLFxuICAgICAgICBycGNDYWxsRXhwcmVzc2lvbixcbiAgICAgICkpO1xuXG4gICAgICB2YWx1ZSA9IHQuaWRlbnRpZmllcigndmFsdWUnKTtcbiAgICAgIHR5cGUgPSByZXR1cm5UeXBlLnR5cGU7XG4gICAgICB0cmFuc2Zvcm1lciA9IHQuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW3ZhbHVlXSxcbiAgICAgICAgZ2VuZXJhdGVUcmFuc2Zvcm1TdGF0ZW1lbnQodmFsdWUsIHR5cGUsIGZhbHNlKSk7XG5cbiAgICAgIHJwY0NhbGxFeHByZXNzaW9uID0gdGhlblByb21pc2UocnBjQ2FsbEV4cHJlc3Npb24sIHRyYW5zZm9ybWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgLy8gZ2VuZXJhdGVBcmd1bWVudENvbnZlcnNpb25PYnNlcnZhYmxlIHdpbGwgcmV0dXJuIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB0aGUgdHJhbnNmb3JtZWRcbiAgICAgIC8vIGFycmF5IG9mIGFyZ3VtZW50cy4gV2UgY29uY2F0TWFwIHRoaXMgYXJyYXkgdGhyb3VnaCB0aGUgUlBDIGNhbGwsIHdoaWNoIHdpbGwgcmV0dXJuIHRoZVxuICAgICAgLy8gc3RyZWFtIG9mIGV2ZW50cy5cbiAgICAgIHJwY0NhbGxFeHByZXNzaW9uID0gdC5jYWxsRXhwcmVzc2lvbihcbiAgICAgICAgdC5tZW1iZXJFeHByZXNzaW9uKFxuICAgICAgICAgIGdlbmVyYXRlQXJndW1lbnRDb252ZXJzaW9uT2JzZXJ2YWJsZShmdW5jVHlwZS5hcmd1bWVudFR5cGVzKSwgdC5pZGVudGlmaWVyKCdjb25jYXRNYXAnKVxuICAgICAgICApLFxuICAgICAgICBbdC5hcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbdC5pZGVudGlmaWVyKCdhcmdzJyldLCBycGNDYWxsRXhwcmVzc2lvbildXG4gICAgICApO1xuXG4gICAgICAvLyBXZSB0aGVuIG1hcCB0aGUgaW5jb21pbmcgZXZlbnRzIHRocm91Z2ggdGhlIGFwcHJvcHJpYXRlIG1hcnNoYWxsZXIuIFdlIHVzZSBjb25jYXRNYXBcbiAgICAgIC8vIGluc3RlYWQgb2YgZmxhdE1hcCwgc2luY2UgY29uY2F0TWFwIGVuc3VyZXMgdGhhdCB0aGUgb3JkZXIgb2YgdGhlIGV2ZW50cyBkb2Vzbid0IGNoYW5nZS5cbiAgICAgIHZhbHVlID0gdC5pZGVudGlmaWVyKCd2YWx1ZScpO1xuICAgICAgdHlwZSA9IHJldHVyblR5cGUudHlwZTtcbiAgICAgIHRyYW5zZm9ybWVyID0gdC5hcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbdmFsdWVdLFxuICAgICAgICBnZW5lcmF0ZVRyYW5zZm9ybVN0YXRlbWVudCh2YWx1ZSwgdHlwZSwgZmFsc2UpKTtcbiAgICAgIHJwY0NhbGxFeHByZXNzaW9uID0gdC5jYWxsRXhwcmVzc2lvbihcbiAgICAgICAgdC5tZW1iZXJFeHByZXNzaW9uKHJwY0NhbGxFeHByZXNzaW9uLCB0LmlkZW50aWZpZXIoJ2NvbmNhdE1hcCcpKSwgW3RyYW5zZm9ybWVyXSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtvd24gcmV0dXJuIHR5cGUgJHtyZXR1cm5UeXBlLmtpbmR9LmApO1xuICB9XG5cbiAgcHJveHlTdGF0bWVudHMucHVzaCh0LnJldHVyblN0YXRlbWVudChycGNDYWxsRXhwcmVzc2lvbikpO1xuICByZXR1cm4gdC5mdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgYXJncywgdC5ibG9ja1N0YXRlbWVudChwcm94eVN0YXRtZW50cykpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGdlbmVyYXRlcyBzdGF0bWVudHMgdGhhdCBjYW4gYmUgdXNlZCB0byBtYXJzaGFsIGFsbCBvZiB0aGVcbiAqIGFyZ3VtZW50cyB0byBhIGZ1bmN0aW9uLlxuICogQHBhcmFtIGFyZ3VtZW50VHlwZXMgLSBBbiBhcnJheSBvZiB0aGUgdHlwZXMgb2YgdGhlIGZ1bmN0aW9uJ3MgYXJndW1lbnRzLlxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gYXJyYXkgb2YgdGhlIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVBcmd1bWVudENvbnZlcnNpb25Qcm9taXNlKGFyZ3VtZW50VHlwZXM6IEFycmF5PFR5cGU+KTogQXJyYXk8YW55PiB7XG4gIC8vIENvbnZlcnQgYWxsIG9mIHRoZSBhcmd1bWVudHMgaW50byBtYXJzaGFsZWQgZm9ybS5cbiAgY29uc3QgYXJncyA9IGFyZ3VtZW50VHlwZXMubWFwKChhcmcsIGkpID0+IHQuaWRlbnRpZmllcihgYXJnJHtpfWApKTtcbiAgcmV0dXJuIHQuY2FsbEV4cHJlc3Npb24ocHJvbWlzZURvdEFsbEV4cHJlc3Npb24sXG4gICAgW3QuYXJyYXlFeHByZXNzaW9uKFxuICAgICAgYXJncy5tYXAoKGFyZywgaSkgPT4gZ2VuZXJhdGVUcmFuc2Zvcm1TdGF0ZW1lbnQoYXJnLCBhcmd1bWVudFR5cGVzW2ldLCB0cnVlKSlcbiAgICApXVxuICApO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGdlbmVyYXRlcyBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgYW4gYXJyYXkgb2YgY29udmVydGVkIGFyZ3VtZW50cy5cbiAqIEBwYXJhbSBhcmd1bWVudFR5cGVzIC0gQW4gYXJyYXkgb2YgdGhlIHR5cGVzIG9mIHRoZSBmdW5jdGlvbidzIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gdGhhdCByZXByZXNlbnRzIGFuIE9ic2VydmFibGUgdGhhdCBlbWl0cyBhbiBhcnJheSBvZiBjb252ZXJ0ZWQgYXJndW1lbnRzLlxuICogRXhhbXBsZTogYE9ic2VydmFibGUuY29uY2F0KF9jbGllbnQubWFyc2hhbCguLi4pLCBfY2xpZW50Lm1hcnNoYWwoLi4uKSkudG9BcnJheSgpYFxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUFyZ3VtZW50Q29udmVyc2lvbk9ic2VydmFibGUoYXJndW1lbnRUeXBlczogQXJyYXk8VHlwZT4pOiBBcnJheTxhbnk+IHtcbiAgLy8gQ3JlYXRlIGlkZW50aWZpZXJzIHRoYXQgcmVwcmVzZW50IGFsbCBvZiB0aGUgYXJndW1lbnRzLlxuICBjb25zdCBhcmdzID0gYXJndW1lbnRUeXBlcy5tYXAoKGFyZywgaSkgPT4gdC5pZGVudGlmaWVyKGBhcmcke2l9YCkpO1xuXG4gIC8vIFdlIGNyZWF0ZSBhbiBpbml0aWFsIG9ic2VydmFibGUgYnkgY29uY2F0ZW5hdGluZyAoaHR0cDovL3J4bWFyYmxlcy5jb20vI2NvbmNhdCkgYWxsIG9mXG4gIC8vIHRoZSBtYXJzaGFsbGluZyBwcm9taXNlcy4gQ29uY2F0ZW5hdGlvbiB0YWtlcyBtdWx0aXBsZSBzdHJlYW1zIChQcm9taXNlcyBpbiB0aGlzIGNhc2UpLCBhbmRcbiAgLy8gcmV0dXJucyBvbmUgc3RyZWFtIHdoZXJlIGFsbCB0aGUgZWxlbWVudHMgb2YgdGhlIGlucHV0IHN0cmVhbXMgYXJlIGVtaXR0ZWQuIENvbmNhdCBwcmVzZXJ2ZXNcbiAgLy8gb3JkZXIsIGVuc3VyaW5nIHRoYXQgYWxsIG9mIHN0cmVhbSdzIGVsZW1lbnRzIGFyZSBlbWl0dGVkIGJlZm9yZSB0aGUgbmV4dCBzdHJlYW0ncyBjYW4gZW1pdC5cbiAgY29uc3QgYXJndW1lbnRzT2JzZXJ2YWJsZSA9IHQuY2FsbEV4cHJlc3Npb24oXG4gICAgICB0Lm1lbWJlckV4cHJlc3Npb24ob2JzZXJ2YWJsZUlkZW50aWZpZXIsIHQuaWRlbnRpZmllcignY29uY2F0JykpLFxuICAgICAgYXJncy5tYXAoKGFyZywgaSkgPT4gZ2VuZXJhdGVUcmFuc2Zvcm1TdGF0ZW1lbnQoYXJnLCBhcmd1bWVudFR5cGVzW2ldLCB0cnVlKSkpO1xuXG4gIC8vIE9uY2Ugd2UgaGF2ZSBhIHN0cmVhbSBvZiB0aGUgYXJndW1lbnRzLCB3ZSBjYW4gdXNlIHRvQXJyYXkoKSwgd2hpY2ggcmV0dXJucyBhbiBvYnNlcnZhYmxlIHRoYXRcbiAgLy8gd2FpdHMgZm9yIHRoZSBzdHJlYW0gdG8gY29tcGxldGUsIGFuZCBlbWl0cyBvbmUgZXZlbnQgd2l0aCBhbGwgb2YgdGhlIGVsZW1lbnRzIGFzIGFuIGFycmF5LlxuICByZXR1cm4gdC5jYWxsRXhwcmVzc2lvbih0Lm1lbWJlckV4cHJlc3Npb24oYXJndW1lbnRzT2JzZXJ2YWJsZSwgdC5pZGVudGlmaWVyKCd0b0FycmF5JykpLCBbXSk7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYSByZW1vdGUgcHJveHkgZm9yIGFuIGludGVyZmFjZS5cbiAqIEBwYXJhbSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGludGVyZmFjZS5cbiAqIEBwYXJhbSBkZWYgLSBUaGUgSW50ZXJmYWNlRGVmaW5pdGlvbiBvYmplY3QgdGhhdCBlbmNvZGVzIGFsbCBpZiB0aGUgaW50ZXJmYWNlJ3Mgb3BlcmF0aW9ucy5cbiAqIEByZXR1cm5zIEFuIGFub255bW91cyBDbGFzc0V4cHJlc3Npb24gbm9kZSB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byBhIG1vZHVsZSBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVJbnRlcmZhY2VQcm94eShkZWY6IEludGVyZmFjZURlZmluaXRpb24pOiBhbnkge1xuICBjb25zdCBuYW1lID0gZGVmLm5hbWU7XG4gIGNvbnN0IG1ldGhvZERlZmluaXRpb25zID0gW107XG5cbiAgLy8gR2VuZXJhdGUgcHJveGllcyBmb3Igc3RhdGljIG1ldGhvZHMuXG4gIGRlZi5zdGF0aWNNZXRob2RzLmZvckVhY2goKGZ1bmNUeXBlLCBtZXRob2ROYW1lKSA9PiB7XG4gICAgbWV0aG9kRGVmaW5pdGlvbnMucHVzaCh0Lm1ldGhvZERlZmluaXRpb24oXG4gICAgICB0LmlkZW50aWZpZXIobWV0aG9kTmFtZSksXG4gICAgICBnZW5lcmF0ZUZ1bmN0aW9uUHJveHkoYCR7bmFtZX0vJHttZXRob2ROYW1lfWAsIGZ1bmNUeXBlKSxcbiAgICAgICdtZXRob2QnLFxuICAgICAgZmFsc2UsXG4gICAgICB0cnVlXG4gICAgKSk7XG4gIH0pO1xuXG4gIC8vIEdlbmVyYXRlIGNvbnN0cnVjdG9yIHByb3h5LlxuICBtZXRob2REZWZpbml0aW9ucy5wdXNoKGdlbmVyYXRlUmVtb3RlQ29uc3RydWN0b3IobmFtZSwgZGVmLmNvbnN0cnVjdG9yQXJncykpO1xuXG4gIC8vIEdlbmVyYXRlIHByb3hpZXMgZm9yIGluc3RhbmNlIG1ldGhvZHMuXG4gIGRlZi5pbnN0YW5jZU1ldGhvZHMuZm9yRWFjaCgoZnVuY1R5cGUsIG1ldGhvZE5hbWUpID0+IHtcbiAgICBjb25zdCBtZXRob2REZWZpbml0aW9uID0gZ2VuZXJhdGVSZW1vdGVEaXNwYXRjaChtZXRob2ROYW1lLCBmdW5jVHlwZSk7XG5cbiAgICAvLyBBZGQgdHJhY2tUaW1pbmcgZGVjb3JhdG9yIHRvIGluc3RhbmNlIG1ldGhvZCB0aGF0IHJldHVybnMgYSBwcm9taXNlLlxuICAgIGlmIChmdW5jVHlwZS5yZXR1cm5UeXBlLmtpbmQgPT09ICdwcm9taXNlJykge1xuICAgICAgbWV0aG9kRGVmaW5pdGlvbi5kZWNvcmF0b3JzID0gW1xuICAgICAgICB0LmRlY29yYXRvcihcbiAgICAgICAgICB0LmNhbGxFeHByZXNzaW9uKFxuICAgICAgICAgICAgdC5pZGVudGlmaWVyKCd0cmFja1RpbWluZycpLFxuICAgICAgICAgICAgW3QubGl0ZXJhbChgJHtuYW1lfS4ke21ldGhvZE5hbWV9YCldLFxuICAgICAgICAgICksXG4gICAgICAgICksXG4gICAgICBdO1xuICAgIH1cblxuICAgIG1ldGhvZERlZmluaXRpb25zLnB1c2gobWV0aG9kRGVmaW5pdGlvbik7XG4gIH0pO1xuXG4gIC8vIEdlbmVyYXRlIHRoZSBkaXNwb3NlIG1ldGhvZC5cbiAgbWV0aG9kRGVmaW5pdGlvbnMucHVzaChnZW5lcmF0ZURpc3Bvc2VNZXRob2QoKSk7XG5cbiAgcmV0dXJuIHQuY2xhc3NFeHByZXNzaW9uKG51bGwsIHQuY2xhc3NCb2R5KG1ldGhvZERlZmluaXRpb25zKSwgbnVsbCk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGEgcmVtb3RlIGNvbnN0cnVjdG9yIHByb3h5LlxuICogQHBhcmFtIGNsYXNzTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpbnRlcmZhY2UuXG4gKiBAcGFyYW0gY29uc3RydWN0b3JBcmdzIC0gVGhlIHR5cGVzIG9mIHRoZSBhcmd1bWVudHMgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICogQHJldHVybnMgQSBNZXRob2REZWZpbml0aW9uIG5vZGUgdGhhdCBjYW4gYmUgYWRkZWQgdG8gYSBDbGFzc0JvZHkuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlUmVtb3RlQ29uc3RydWN0b3IoY2xhc3NOYW1lOiBzdHJpbmcsIGNvbnN0cnVjdG9yQXJnczogQXJyYXk8VHlwZT4pIHtcbiAgLy8gQ29udmVydCBjb25zdHJ1Y3RvciBhcmd1bWVudHMuXG4gIGNvbnN0IGFyZ3MgPSBjb25zdHJ1Y3RvckFyZ3MubWFwKChhcmcsIGkpID0+IHQuaWRlbnRpZmllcihgYXJnJHtpfWApKTtcbiAgY29uc3QgYXJndW1lbnRzUHJvbWlzZSA9IGdlbmVyYXRlQXJndW1lbnRDb252ZXJzaW9uUHJvbWlzZShjb25zdHJ1Y3RvckFyZ3MpO1xuXG4gIC8vIE1ha2UgYW4gUlBDIGNhbGwgdGhhdCB3aWxsIHJldHVybiB0aGUgaWQgb2YgdGhlIHJlbW90ZSBvYmplY3QuXG4gIGxldCBycGNDYWxsRXhwcmVzc2lvbiA9IHQuY2FsbEV4cHJlc3Npb24oY3JlYXRlUmVtb3RlT2JqZWN0RXhwcmVzc2lvbiwgW1xuICAgIHQubGl0ZXJhbChjbGFzc05hbWUpLFxuICAgIHQuaWRlbnRpZmllcignYXJncycpLFxuICBdKTtcbiAgcnBjQ2FsbEV4cHJlc3Npb24gPSB0aGVuUHJvbWlzZShhcmd1bWVudHNQcm9taXNlLCB0LmFycm93RnVuY3Rpb25FeHByZXNzaW9uKFxuICAgIFt0LmlkZW50aWZpZXIoJ2FyZ3MnKV0sIHJwY0NhbGxFeHByZXNzaW9uKSk7XG5cbiAgLy8gU2V0IGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGlkIG9mIHRoZSByZW1vdGFibGUgb2JqZWN0IGlzIGtub3duLlxuICBycGNDYWxsRXhwcmVzc2lvbiA9IHQuYXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCB0aGlzRG90SWRQcm9taXNlRXhwcmVzc2lvbiwgcnBjQ2FsbEV4cHJlc3Npb24pO1xuXG4gIGNvbnN0IGNvbnN0cnVjdG9yID0gdC5GdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgYXJncywgdC5ibG9ja1N0YXRlbWVudChbcnBjQ2FsbEV4cHJlc3Npb25dKSk7XG4gIHJldHVybiB0Lm1ldGhvZERlZmluaXRpb24odC5pZGVudGlmaWVyKCdjb25zdHJ1Y3RvcicpLCBjb25zdHJ1Y3RvciwgJ2NvbnN0cnVjdG9yJywgZmFsc2UsIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgYSBwcm94eSBmb3IgYW4gaW5zdGFuY2UgbWV0aG9kIG9mIGFuIGludGVyZmFjZS5cbiAqIEBwYXJhbSBtZXRob2ROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIG1ldGhvZC5cbiAqIEBwYXJhbSBmdW5jVHlwZSAtIFRoZSB0eXBlIGluZm9ybWF0aW9uIGZvciB0aGUgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyBBIE1ldGhvZERlZmluaXRpb24gbm9kZSB0aGF0IGNhbiBiZSBhZGRlZCB0byBhIENsYXNzQm9keVxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZVJlbW90ZURpc3BhdGNoKG1ldGhvZE5hbWU6IHN0cmluZywgZnVuY1R5cGU6IEZ1bmN0aW9uVHlwZSkge1xuICAvLyBGaXJzdCwgY29udmVydCB0aGUgYXJndW1lbnRzLlxuICBjb25zdCBhcmd1bWVudHNQcm9taXNlID0gZ2VuZXJhdGVBcmd1bWVudENvbnZlcnNpb25Qcm9taXNlKGZ1bmNUeXBlLmFyZ3VtZW50VHlwZXMpO1xuXG4gIGNvbnN0IGlkID0gdC5pZGVudGlmaWVyKCdpZCcpO1xuICBjb25zdCB2YWx1ZSA9IHQuaWRlbnRpZmllcigndmFsdWUnKTtcblxuICBjb25zdCByZW1vdGVNZXRob2RDYWxsID0gdC5jYWxsRXhwcmVzc2lvbihjYWxsUmVtb3RlTWV0aG9kRXhwcmVzc2lvbiwgW1xuICAgIGlkLCB0LmxpdGVyYWwobWV0aG9kTmFtZSksIHQubGl0ZXJhbChmdW5jVHlwZS5yZXR1cm5UeXBlLmtpbmQpLCB0LmlkZW50aWZpZXIoJ2FyZ3MnKV0pO1xuICBsZXQgcnBjQ2FsbEV4cHJlc3Npb24gPSB0aGVuUHJvbWlzZSh0aGlzRG90SWRQcm9taXNlRXhwcmVzc2lvbiwgdC5hcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihcbiAgICBbaWRdLCByZW1vdGVNZXRob2RDYWxsKSk7XG5cbiAgcnBjQ2FsbEV4cHJlc3Npb24gPSB0aGVuUHJvbWlzZShhcmd1bWVudHNQcm9taXNlLCB0LmFycm93RnVuY3Rpb25FeHByZXNzaW9uKFxuICAgIFt0LmlkZW50aWZpZXIoJ2FyZ3MnKV0sXG4gICAgcnBjQ2FsbEV4cHJlc3Npb24sXG4gICkpO1xuXG4gIGNvbnN0IHJldHVyblR5cGUgPSBmdW5jVHlwZS5yZXR1cm5UeXBlO1xuICBzd2l0Y2ggKHJldHVyblR5cGUua2luZCkge1xuICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICBjb25zdCBwcm9taXNlVHJhbnNmb3JtZXIgPSB0LmFycm93RnVuY3Rpb25FeHByZXNzaW9uKFt2YWx1ZV0sXG4gICAgICAgIGdlbmVyYXRlVHJhbnNmb3JtU3RhdGVtZW50KHZhbHVlLCByZXR1cm5UeXBlLnR5cGUsIGZhbHNlKSk7XG4gICAgICBycGNDYWxsRXhwcmVzc2lvbiA9IHRoZW5Qcm9taXNlKHJwY0NhbGxFeHByZXNzaW9uLCBwcm9taXNlVHJhbnNmb3JtZXIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnb2JzZXJ2YWJsZSc6XG4gICAgICBjb25zdCBhcmd1bWVudHNPYnNlcnZhYmxlID0gZ2VuZXJhdGVBcmd1bWVudENvbnZlcnNpb25PYnNlcnZhYmxlKGZ1bmNUeXBlLmFyZ3VtZW50VHlwZXMpO1xuXG4gICAgICAvLyBXZSBuZWVkIHRvIHJlc29sdmUgYm90aCB0aGUgdHJhbnNmb3JtZWQgYXJndW1lbnRzIGFuZCB0aGUgb2JqZWN0IGlkIGJlZm9yZSBtYWtpbmcgdGhlIFJQQy5cbiAgICAgIC8vIFdlIGNhbiB1c2UgZm9ya0pvaW4gLSBodHRwczovL2dpdGh1Yi5jb20vUmVhY3RpdmUtRXh0ZW5zaW9ucy9SeEpTL2Jsb2IvbWFzdGVyL2RvYy9hcGkvY29yZS9vcGVyYXRvcnMvZm9ya2pvaW4ubWQuXG4gICAgICAvLyBUaGlzIHdpbGwgcmVzb2x2ZSB0byBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgYW4gYXJyYXkgd2l0aCBbaWQsIGFyZ3NdIGFzIHRoZSB0d28gZWxlbWVudHMuXG4gICAgICBjb25zdCBpZEFuZEFyZ3VtZW50c09ic2VydmFibGUgPSB0LmNhbGxFeHByZXNzaW9uKHQubWVtYmVyRXhwcmVzc2lvbihvYnNlcnZhYmxlSWRlbnRpZmllcixcbiAgICAgICAgdC5pZGVudGlmaWVyKCdmb3JrSm9pbicpKSwgW3RoaXNEb3RJZFByb21pc2VFeHByZXNzaW9uLCBhcmd1bWVudHNPYnNlcnZhYmxlXSk7XG5cbiAgICAgIC8vIE9uY2Ugd2UgcmVzb2x2ZSBib3RoIHRoZSBpZCBhbmQgdGhlIHRyYW5zZm9ybWVkIGFyZ3VtZW50cywgd2UgY2FuIG1hcCB0aGVtIHRvIHRoZW4gUlBDXG4gICAgICAvLyBjYWxsLCB3aGljaCB0aGVuIHJldHVybnMgdGhlIG9ic2VydmFibGUgb2YgZGF0YSB0aGF0IHdlIGFjdHVhbGx5IHdhbnQgdG8gcmV0dXJuLlxuICAgICAgcnBjQ2FsbEV4cHJlc3Npb24gPSB0LmNhbGxFeHByZXNzaW9uKFxuICAgICAgICB0Lm1lbWJlckV4cHJlc3Npb24oaWRBbmRBcmd1bWVudHNPYnNlcnZhYmxlLCB0LmlkZW50aWZpZXIoJ2NvbmNhdE1hcCcpKSxcbiAgICAgICAgW3QuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW1xuICAgICAgICAgIHQuYXJyYXlQYXR0ZXJuKFt0LmlkZW50aWZpZXIoJ2lkJyksIHQuaWRlbnRpZmllcignYXJncycpXSksXG4gICAgICAgIF0sIHJlbW90ZU1ldGhvZENhbGwpXVxuICAgICAgKTtcblxuICAgICAgLy8gRmluYWxseSwgd2UgbWFwIHRoZSBldmVudHMgdGhyb3VnaCB0aGUgYXBwcm9wcmlhdGUgbWFyc2hhbGxlci4gV2UgdXNlIGNvbmNhdE1hcCBpbnN0ZWFkIG9mXG4gICAgICAvLyBmbGF0TWFwIHRvIGVuc3VyZSB0aGF0IHRoZSBvcmRlciBkb2Vzbid0IGNoYW5nZSwgaW4gY2FzZSBvbmUgZXZlbnQgdGFrZXMgZXNwZWNpYWxseSBsb25nXG4gICAgICAvLyB0byBtYXJzaGFsLlxuICAgICAgY29uc3Qgb2JzZXJ2YWJsZVRyYW5zZm9ybWVyID0gdC5hcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbdmFsdWVdLFxuICAgICAgICBnZW5lcmF0ZVRyYW5zZm9ybVN0YXRlbWVudCh2YWx1ZSwgcmV0dXJuVHlwZS50eXBlLCBmYWxzZSkpO1xuICAgICAgcnBjQ2FsbEV4cHJlc3Npb24gPSB0LmNhbGxFeHByZXNzaW9uKFxuICAgICAgICB0Lm1lbWJlckV4cHJlc3Npb24ocnBjQ2FsbEV4cHJlc3Npb24sIHQuaWRlbnRpZmllcignY29uY2F0TWFwJykpLCBbb2JzZXJ2YWJsZVRyYW5zZm9ybWVyXSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtvd24gcmV0dXJuIHR5cGUgJHtyZXR1cm5UeXBlLmtpbmR9LmApO1xuICB9XG5cbiAgY29uc3QgZnVuY1R5cGVBcmdzID0gZnVuY1R5cGUuYXJndW1lbnRUeXBlcy5tYXAoKGFyZywgaSkgPT4gdC5pZGVudGlmaWVyKGBhcmcke2l9YCkpO1xuICBjb25zdCBmdW5jRXhwcmVzc2lvbiA9IHQuZnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIGZ1bmNUeXBlQXJncywgdC5ibG9ja1N0YXRlbWVudChbXG4gICAgdC5yZXR1cm5TdGF0ZW1lbnQocnBjQ2FsbEV4cHJlc3Npb24pXSkpO1xuXG4gIHJldHVybiB0Lm1ldGhvZERlZmluaXRpb24odC5pZGVudGlmaWVyKG1ldGhvZE5hbWUpLCBmdW5jRXhwcmVzc2lvbiwgJ21ldGhvZCcsIGZhbHNlLCBmYWxzZSk7XG59XG5cbi8qKlxuICogSGVscGVyIG1ldGhvZCB0aGF0IGdlbmVyYXRlcyB0aGUgZGlzcG9zZSBtZXRob2QgZm9yIGEgY2xhc3MuIFRoZSBkaXNwb3NlIG1ldGhvZFxuICogcmVwbGFjZXMgYHRoaXMuX2lkUHJvbWlzZWAgd2l0aCBhIHRoZW5hYmxlIG9iamVjdCB0aGF0IHRocm93cyBlcnJvciB3aGVuIHVzZWQsXG4gKiBhcyB3ZWxsIGFzIGNhbGxzIGBfY2xpZW50LmRpc3Bvc2VSZW1vdGVPYmplY3RgIHdpdGggdGhlIG9iamVjdCdzIGlkIGFzIGEgcGFyYW1ldGVyLlxuICogQHJldHVybnMgQSBNZXRob2REZWZpbml0aW9uIG5vZGUgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gYSBjbGFzcyBib2R5LlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZURpc3Bvc2VNZXRob2QoKSB7XG4gIGNvbnN0IGlkID0gdC5pZGVudGlmaWVyKCdpZCcpO1xuXG4gIC8vIFJlcGxhY2UgYGlkUHJvbWlzZWAgd2l0aCB0aGVuYWJsZSBvYmplY3QgdGhhdCB0aHJvd3MgZXJyb3IuXG4gIGNvbnN0IGRpc3Bvc2VkRXJyb3IgPSB0Lm5ld0V4cHJlc3Npb24odC5pZGVudGlmaWVyKCdFcnJvcicpLFxuICAgIFt0LmxpdGVyYWwoJ1RoaXMgUmVtb3RlIE9iamVjdCBoYXMgYmVlbiBkaXNwb3NlZC4nKV0pO1xuICBjb25zdCB0aHJvd0Vycm9yRnVuY3Rpb24gPSB0LmZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbXSwgdC5ibG9ja1N0YXRlbWVudChbXG4gICAgdC50aHJvd1N0YXRlbWVudChkaXNwb3NlZEVycm9yKSxcbiAgXSkpO1xuICBjb25zdCB0aGVuYWJsZUVycm9yT2JqZWN0ID1cbiAgICB0Lm9iamVjdEV4cHJlc3Npb24oW3QuUHJvcGVydHkoJ2luaXQnLCB0LmlkZW50aWZpZXIoJ3RoZW4nKSwgdGhyb3dFcnJvckZ1bmN0aW9uKV0pO1xuICBjb25zdCByZXBsYWNlSWRQcm9taXNlID0gdC5leHByZXNzaW9uU3RhdGVtZW50KHQuYXNzaWdubWVudEV4cHJlc3Npb24oJz0nLFxuICAgIHRoaXNEb3RJZFByb21pc2VFeHByZXNzaW9uLCB0aGVuYWJsZUVycm9yT2JqZWN0KSk7XG5cbiAgLy8gQ2FsbCBgX2NsaWVudC5kaXNwb3NlUmVtb3RlT2JqZWN0YC5cbiAgbGV0IHJwY0NhbGxFeHByZXNzaW9uID0gdC5jYWxsRXhwcmVzc2lvbihkaXNwb3NlUmVtb3RlT2JqZWN0RXhwcmVzc2lvbiwgW2lkXSk7XG5cbiAgLy8gV3JhcCB0aGVzZSBzdGF0ZW1lbnRzIGluIGEgYC50aGVuYCBvbiBgaWRQcm9taXNlYCwgc28gdGhhdCB0aGV5IGNhbiBleGVjdXRlIGFmdGVyIHRoZVxuICAvLyBpZCBoYXMgYmVlbiBkZXRlcm1pbmVkLlxuICBycGNDYWxsRXhwcmVzc2lvbiA9IHQuY2FsbEV4cHJlc3Npb24oXG4gICAgdC5tZW1iZXJFeHByZXNzaW9uKHRoaXNEb3RJZFByb21pc2VFeHByZXNzaW9uLCB0LmlkZW50aWZpZXIoJ3RoZW4nKSksXG4gICAgW3QuYXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW2lkXSwgdC5ibG9ja1N0YXRlbWVudChbXG4gICAgICByZXBsYWNlSWRQcm9taXNlLFxuICAgICAgdC5yZXR1cm5TdGF0ZW1lbnQocnBjQ2FsbEV4cHJlc3Npb24pLFxuICAgIF0pKV1cbiAgKTtcbiAgY29uc3QgcmV0dXJuU3RhdGVtZW50ID0gdC5yZXR1cm5TdGF0ZW1lbnQocnBjQ2FsbEV4cHJlc3Npb24pO1xuXG4gIHJldHVybiB0Lm1ldGhvZERlZmluaXRpb24odC5pZGVudGlmaWVyKCdkaXNwb3NlJyksXG4gICAgdC5mdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW10sIHQuYmxvY2tTdGF0ZW1lbnQoW3JldHVyblN0YXRlbWVudF0pKSwgJ21ldGhvZCcsIGZhbHNlLCBmYWxzZSk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGEgdHJhbnNmb3JtYXRpb24gc3RhdGVtZW50IGZvciBhbiBvYmplY3QuIFRoaXMgYW1tb3VudHMgdG9cbiAqIGEgY2FsbCBlaXRoZXIgdG8gX2NsaWVudC5tYXJzaGFsIG9yIF9jbGllbnQudW5tYXJzaGFsLlxuICogQHBhcmFtIGlkIHtJZGVudGlmaWVyfSBUaGUgaWRlbnRpZmllciBvZiB0aGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEBwYXJhbSB0eXBlIHtUeXBlfSBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEBwYXJhbSBtYXJzaGFsIHtib29sZWFufSAtIElmIHRydWUsIHRoZW4gd2UgYXJlIHRyeWluZyB0byBtYXJzaGFsIHRoZSB2YWx1ZS4gSWYgZmFsc2UsIHRoZW5cbiAqICAgd2UgYXJlIHRyeWluZyB0byB1bm1hcnNoYWwuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlVHJhbnNmb3JtU3RhdGVtZW50KGlkOiBhbnksIHR5cGU6IFR5cGUsIG1hcnNoYWw6IGJvb2xlYW4pOiBhbnkge1xuICAvLyBUaGUgZmlyc3QgYXJndW1lbnQgaXMgdGhlIHZhbHVlIHRvIGJlIG1hcnNoYWxsZWQgb3IgdW5tYXJzaGFsbGVkLlxuICAvLyBUaGUgc2Vjb25kIGFyZ3VtZW50IGlzIHRoZSB0eXBlIG9iamVjdCwgd2hpY2ggZW5jb2RlcyBhbGwgb2YgdGhlIGluZm9ybWF0aW9uIHJlcXVpcmVkXG4gIC8vIHRvIG1hcnNoYWwgLyB1bm1hcnNoYWwgdGhlIHZhbHVlLlxuICBjb25zdCBjb252ZXJ0QXJncyA9IFtpZCwgb2JqZWN0VG9MaXRlcmFsKHR5cGUpXTtcblxuICAvLyBJZiB0aGUgdHlwZSBpcyBwYXJhbWV0ZXJpemVkLCB3ZSBzZW5kIHRoZSBwYXJhbWV0ZXJzIGFzIGFuIG9wdGlvbmFsIGZvdXJ0aCBhcmd1bWVudC5cbiAgaWYgKHR5cGUucGFyYW0pIHtcbiAgICBjb252ZXJ0QXJncy5wdXNoKG9iamVjdFRvTGl0ZXJhbCh0eXBlLnBhcmFtKSk7XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIGFwcHJvcHJpYXRlIGNhbGwuXG4gIHJldHVybiAobWFyc2hhbCA/IG1hcnNoYWxDYWxsIDogdW5tYXJzaGFsQ2FsbCkuYXBwbHkodGhpcywgY29udmVydEFyZ3MpO1xufVxuXG4vKipcbiAqIFRha2VzIGFuIG9iamVjdCwgYW5kIHJlY3Vyc2l2ZWx5IGNvbnZlcnRzIGl0IHRvIGEgQmFiZWwgQVNUIGxpdGVyYWwgbm9kZS4gVGhpcyBoYW5kbGVzIHN0cmluZ3MsXG4gKiBudW1iZXJzLCBib29sZWFucywgYmFzaWMgb2JqZWN0cywgYW5kIEFycmF5cy4gVGhpcyBjYW5ub3QgaGFuZGxlIGNpcmN1bGFyIHJlZmVyZW5jZXMuXG4gKiBAcGFyYW0gb2JqIC0gVGhlIG9iamVjdCB0byBjb252ZXJ0LlxuICogQHJldHVybnMgQSBiYWJlbCBBU1Qgbm9kZS5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9MaXRlcmFsKG9iajogYW55KTogYW55IHtcbiAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBvYmogPT09ICdudW1iZXInIHx8IHR5cGVvZiBvYmogPT09ICdib29sZWFuJykge1xuICAgIHJldHVybiB0LmxpdGVyYWwob2JqKTtcbiAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHJldHVybiB0LmFycmF5RXhwcmVzc2lvbihvYmoubWFwKGVsZW0gPT4gb2JqZWN0VG9MaXRlcmFsKGVsZW0pKSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gdC5vYmplY3RFeHByZXNzaW9uKE9iamVjdC5rZXlzKG9iaikubWFwKGtleSA9PiB7XG4gICAgICByZXR1cm4gdC5Qcm9wZXJ0eSgnaW5pdCcsIHQuaWRlbnRpZmllcihrZXkpLCBvYmplY3RUb0xpdGVyYWwob2JqW2tleV0pKTtcbiAgICB9KSk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBjb252ZXJ0IHVua293biB0eXBlICR7dHlwZW9mIG9ian0gdG8gbGl0ZXJhbC5gKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBgLnRoZW5gcyBvbiBhIHByb21pc2UuXG4gKiBAcGFyYW0gcHJvbWlzZUV4cHJlc3Npb24gLSBBbiBleHByZXNzaW9uIHRoYXQgd2lsbCBldmFsdWF0ZSB0byBhIHByb21pc2UuXG4gKiBAcGFyYW0gZnVuY3Rpb25FeHByZXNzaW9uIC0gQSBmdW5jdGlvbiB0byBwYXNzIGFzIGFuIGFyZ3VtZW50IHRvIGAudGhlbmBcbiAqIEByZXR1cm5zIEEgQ2FsbEV4cHJlc3Npb24gbm9kZSB0aGF0IGAudGhlbmBzIG9uIHRoZSBwcm92aWRlZCBwcm9taXNlLlxuICovXG5mdW5jdGlvbiB0aGVuUHJvbWlzZShwcm9taXNlRXhwcmVzc2lvbiwgZnVuY3Rpb25FeHByZXNzaW9uKTogYW55IHtcbiAgcmV0dXJuIHQuY2FsbEV4cHJlc3Npb24odC5tZW1iZXJFeHByZXNzaW9uKHByb21pc2VFeHByZXNzaW9uLCB0aGVuSWRlbnQpLFxuICAgIFtmdW5jdGlvbkV4cHJlc3Npb25dKTtcbn1cblxuLyoqIEV4cG9ydCBwcml2YXRlIGZ1bmN0aW9ucyBmb3IgdW5pdC10ZXN0aW5nLiAqL1xuZXhwb3J0IGNvbnN0IF9fdGVzdF9fID0ge1xuICBnZW5lcmF0ZVRyYW5zZm9ybVN0YXRlbWVudCxcbn07XG4iXX0=