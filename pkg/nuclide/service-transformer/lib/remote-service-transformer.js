'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*
 * Babel's plugin who auto generate remote service implementation based on service definition class.
 * If the method name starts with 'on' (assuming a camel-cased method), we will generate the event
 * registration method, otherwise, rpc call method will be generated.
 *
 * It is common that a remote service api take a file path as parameter or return a file path as
 * result. However, the same path has different forms locally and remotely.
 * In client a remote file's uri is in form of 'nuclide://$host:$port/$path', while in the server
 * we only need $path.
 *
 * To address this problem, we support flow type `NuclideUri` for parameter and
 * `Promise<NuclideUri>` for return value in RPC method definition:
 *   a) If a parameter is typed as `NuclideUri`, the generated method in remote service assumes
 *      the parameter is a remote file uri ('nuclide://$host:$post/$path'). So it parses the
 *      parameter and calls to rpc with the parsed path.
 *   b) If the return value is typed as `Promise<NuclideUri>`, the generated method treats result
 *      from rpc call as a path. It assembles the path with remote host/port to a remote file uri
 *      and return the uri to caller.
 *   c) For event method definition, if the callback's parameter is typed as `NuclideUri`, the
 *      generated method assembles the parameter with remote host/port information as well.
 *   d) We also support nested flow type definition for parameter and return value like
 *      `Array<NuclideUri>` or `{file: NuclideUri, sizeInByte: number}` etc, as it will be properly
 *      transformed. For more information, please read comments in 'nuclide-uri-transformer.js'.
 *
 * As an example, for a service definition:
 *
 * ```
 *  class TestService {
 *    getStatus(includeIgnored: boolean): Promise<any> {
 *      return Promise.reject('not implemented');
 *    }
 *
 *    getFileStatus(fileUri: NuclideUri): Promise<any> {
 *      return Promise.reject('not implemented');
 *    }
 *
 *    getLastOpenedFile(): Promise<NucideUri> {
 *      return Promise.reject('not implemented');
 *    }
 *
 *    onFileChanged(callback: (payload: any) => void): Disposable {
 *      return Promise.reject('not implemented');
 *    }
 *  }
 *
 * module.exports = TestService;
 * ```
 *
 * it will generate following code:
 *
 * ```
 *  var TestService = require(...);
 *
 *  // Auto-generated: DO NOT MODIFY.
 *
 *  class RemoteTestService extends TestService {
 *    constructor(connection, options) {
 *      super();
 *      this._connection = connection;
 *      this._options = options;
 *    }
 *    getStatus(includeIgnored) {
 *      return this._connection.makeRpc('TestService/getStatus', [includeIgnored], this._options);
 *    }
 *    getFileStatus(fileUri) {
 *      fileUri = this._connection.getPathOfUri(fileUri);
 *      return this._connection.makeRpc('TestService/getFileStatus', [fileUri], this._options);
 *    }
 *    getLastOpenedFile() {
 *      return this._connection.makeRpc('TestService/getLastOpenedFile', [], this._options)
 *        .then(arg0 => {
 *          arg0 = this._connection.getUriOfRemotePath(arg0);
 *          return arg0;
 *        });
 *    }
 *    onFileChanged(callback) {
 *      return this._connection.registerEventListener(
 *        'TestService/onFileChanged',
 *        callback,
 *        this._options,
 *      );
 *    }
 *  }
 *
 * module.exports = RemoteTestService;
 * ```
 */
import {getClassPrefix, hasGeneratedClassPrefix} from './class-prefix';

const {Transformer} = require('babel-core');
const t = require('babel-core').types;
const {isEventMethodName} = require('./method-name-parser');
const {isGenericFlowTypeAnnotation} = require('./flow-annotation');
const {createGetUriOfRemotePathAssignmentExpression, createGetPathOfUriAssignmentExpression}
    = require('./nuclide-uri-transformer');

/**
 * Create ast expression of `var $baseClassName = require('$baseClassFilePath')
 * .$baseClassName || require('$baseClassFilePath');`.
 */
function createBaseClassRequireExpression(baseClassName: string, baseClassFilePath: string): any {
  // Create a require expression that loads the file of the service definition.
  const requireExpression = t.callExpression(t.identifier('require'),
    [t.literal(baseClassFilePath)]);
  // First try to access the service as a property of the module - if not,
  // the service is the module itself.
  const orExpression = t.binaryExpression('||', t.memberExpression(requireExpression,
    t.identifier(baseClassName)), requireExpression);

  return t.variableDeclaration(
    /* kind */ 'var',
    /* declarations */ [
      t.variableDeclarator(
        /* id */ t.identifier(baseClassName),
        /* init */ orExpression
      ),
    ]
  );
}

/**
 * Create ast expression of `var analytics = require('nuclide-analytics');`.
 */
function createAnalyticsRequireExpression(): any {
  return t.variableDeclaration(
    /* kind */ 'var',
    /* declarations */ [
      t.variableDeclarator(
        /* id */ t.identifier('analytics'),
        /* init */ t.callExpression(
          /* callee */ t.identifier('require'),
          /* arguments */ [t.literal('nuclide-analytics')]
        )
      ),
    ]
  );
}

function createRemoteClassDeclaration(classDeclaration: any, isDecorator: boolean): any {
  const remoteMethodDefinitions = classDeclaration.body.body.map(bodyPart => {
    // Create remote method definition for each class method. The part type must be checked because
    // ES7 class properties are also part of the `body` array and have type `ClassProperty`.
    if (bodyPart.type === 'MethodDefinition') {
      if (isEventMethodName(bodyPart.key.name) && !isDecorator) {
        return createRemoteEventMethodDefinition(classDeclaration, bodyPart);
      } else {
        return createRemoteRpcMethodDefinition(classDeclaration, bodyPart, isDecorator);
      }
    }
  });

  const classPrefix = getClassPrefix(isDecorator);
  const remoteClassDeclaration = t.classDeclaration(
    /* id */ t.identifier(classPrefix + classDeclaration.id.name),
    /* body */ t.classBody(
      [createConstructorDefinition(isDecorator)].concat(remoteMethodDefinitions)
    ),
    /* superClass */ classDeclaration.id
  );

  // There is no such function to create comment node in babel, so use following
  // hack to walk around for now.
  remoteClassDeclaration.leadingComments = [
    {
      type: 'Line',
      value: ' Auto-generated: DO NOT MODIFY.',
    },
  ];

  return remoteClassDeclaration;
}

function createConstructorDefinition(isDecorator: boolean): any {
  let constructorFunctionExpression;
  if (isDecorator) {
    constructorFunctionExpression = t.functionExpression(
      /* id */ null,
      /* params */ [t.identifier('delegate'), t.identifier('serviceLogger')],
      /* body */ t.blockStatement(
        [
          // AST node of `super()`.
          t.expressionStatement(
            t.callExpression(/* callee */ t.super(), /* arguments */ [])
          ),
          // AST node of `this._delegate = delegate`.
          t.expressionStatement(
            t.assignmentExpression(
              /* operator */ '=',
              /* left */ t.memberExpression(
                t.thisExpression(),
                t.identifier('_delegate')
              ),
              /* right */ t.identifier('delegate')
            )
          ),
          // AST node of `this._serviceLogger = serviceLogger`.
          t.expressionStatement(
            t.assignmentExpression(
              /* operator */ '=',
              /* left */ t.memberExpression(
                t.thisExpression(),
                t.identifier('_serviceLogger')
              ),
              /* right */ t.identifier('serviceLogger')
            )
          ),
        ]
      )
    );
  } else {
    constructorFunctionExpression = t.functionExpression(
      /* id */ null,
      /* params */ [t.identifier('connection'), t.identifier('options')],
      /* body */ t.blockStatement(
        [
          // AST node of `super()`.
          t.expressionStatement(
            t.callExpression(/* callee */ t.super(), /* arguments */ [])
          ),
          // AST node of `this._connection = connection`.
          t.expressionStatement(
            t.assignmentExpression(
              /* operator */ '=',
              /* left */ t.memberExpression(
                t.thisExpression(),
                t.identifier('_connection')
              ),
              /* right */ t.identifier('connection')
            )
          ),
          // AST node of `this._options = options`.
          t.expressionStatement(
            t.assignmentExpression(
              /* operator */ '=',
              /* left */ t.memberExpression(
                t.thisExpression(),
                t.identifier('_options')
              ),
              /* right */ t.identifier('options')
            )
          ),
        ]
      )
    );
  }

  return t.methodDefinition(
    /* key */ t.identifier('constructor'),
    /* value */ constructorFunctionExpression,
    /* kind */ 'constructor'
  );
}

/**
 * Generate call expression of
 * `$promiseNode.then(arg0 => {manipulate(arg0); return arg0;})` if nestedflowTypeNodeOfPromise
 * or its child flow type node matches NuclideUri.
 */
function createGetUriFromPathPromiseExpression(
    promiseNode: any,
    nestedflowTypeNodeOfPromise: any): any {

  const arrowFunctionParameter = t.identifier('result');
  const assignmentExpression = createGetUriOfRemotePathAssignmentExpression(
      nestedflowTypeNodeOfPromise, arrowFunctionParameter);

  if (!assignmentExpression) {
    return promiseNode;
  }

  const arrowFunction = t.arrowFunctionExpression(
    /* params */ [arrowFunctionParameter],
    /* body */ t.blockStatement(
      [
        assignmentExpression,
        t.returnStatement(arrowFunctionParameter),
      ]
    )
  );

  return t.callExpression(
    /* callee */ t.memberExpression(
      promiseNode,
      t.identifier('then'),
    ),
    /* arguments */ [arrowFunction],
  );
}

function createRemoteRpcMethodDefinition(
  classDeclaration: any,
  methodDefinition: any,
  isDecorator: boolean,
): any {
  // For each parameter of the method, check its flow type and create manipulation expression if
  // the flow type matches or contains `NuclideUri`.
  const parametersManipulationExpressions = [];
  if (!isDecorator) {
    methodDefinition.value.params.forEach(param => {
      const assignmentExpression = createGetPathOfUriAssignmentExpression(
          param.typeAnnotation.typeAnnotation, param);
      if (assignmentExpression) {
        parametersManipulationExpressions.push(assignmentExpression);
      }
    });
  }

  let remoteFunctionExpression;
  if (isDecorator) {
    const argsAsIdentifiers = methodDefinition.value.params.map(param => t.identifier(param.name));

    // AST node of
    // `this._serviceLogger.logServiceCall(
    //   '$className',
    //   '$methodName',
    //   true,
    //   $methodParam0,
    //   $methodParam1,
    //   ...);
    // );`
    const logServiceCallExpression = t.callExpression(
      /* callee */ t.memberExpression(
        t.memberExpression(
          t.thisExpression(),
          t.identifier('_serviceLogger'),
        ),
        t.identifier('logServiceCall')
      ),
      /* arguments */ [
        t.literal(classDeclaration.id.name),
        t.literal(methodDefinition.key.name),
        t.literal(true),
      ].concat(argsAsIdentifiers),
    );

    // AST node of
    // `this._delegate.$methodName(
    //   $methodParam0,
    //   $methodParam1,
    //   ...);
    // );`
    const delegateExpression = t.callExpression(
      /* callee */ t.memberExpression(
        t.memberExpression(
          t.thisExpression(),
          t.identifier('_delegate'),
        ),
        t.identifier(methodDefinition.key.name)
      ),
      /* arguments */ argsAsIdentifiers,
    );
    remoteFunctionExpression = t.functionExpression(
      /* id */ null,
      /* params */ methodDefinition.value.params,
      /* body */ t.blockStatement(
        [
          t.expressionStatement(logServiceCallExpression),
          t.returnStatement(delegateExpression),
        ],
      ),
    );
  } else {
    // AST node of
    // `this._connection.makeRpc(
    //   '$className/$methodName',
    //   [$methodParam0,
    //    $methodParam1,
    //    ....],
    //   this._options);
    // );`
    let rpcCallExpression = t.callExpression(
      /* callee */ t.memberExpression(
        t.memberExpression(
          t.thisExpression(),
          t.identifier('_connection')
        ),
        t.identifier('makeRpc')
      ),
      /* arguments */ [
        t.literal(classDeclaration.id.name + '/' + methodDefinition.key.name),
        t.arrayExpression(methodDefinition.value.params),
        t.memberExpression(t.thisExpression(), t.identifier('_options')),
      ],
    );

    // If the method's return value is typed as Promise<..> and has nested `NuclideUri`, append
    // manipulation code in `returnValue.then(...)` block.
    const methodReturnType = methodDefinition.value.returnType;
    if (methodReturnType !== undefined &&
        isGenericFlowTypeAnnotation(methodReturnType.typeAnnotation, 'Promise')) {

      const typeParameters = methodReturnType.typeAnnotation.typeParameters;

      if (typeParameters && typeParameters.params.length === 1)  {
        rpcCallExpression = createGetUriFromPathPromiseExpression(
            rpcCallExpression, typeParameters.params[0]);
      }
    }

    remoteFunctionExpression = t.functionExpression(
      /* id */ null,
      /* params */ methodDefinition.value.params,
      /* body */ t.blockStatement(
        parametersManipulationExpressions.concat(
          [t.returnStatement(
            rpcCallExpression,
          )],
        )
      ),
    );
  }

  // Create the method defintion AST node.
  const remoteMethodDefinition = t.methodDefinition(
    /* key */ t.identifier(methodDefinition.key.name),
    /* value */ remoteFunctionExpression,
    /* kind */ 'method'
  );

  if (!isDecorator) {
    // Annotate this node with the analytics.trackTiming decorator.
    remoteMethodDefinition.decorators = [
      t.decorator(
        t.callExpression(
          t.memberExpression(
            t.identifier('analytics'),
            t.identifier('trackTiming')
          ),
          []
        )
      ),
    ];
  }

  return remoteMethodDefinition;
}

/**
 * If the callback function's parameter is typed as `NuclideUri` or has nested type of `NuclideUri`,
 * create a new callback function which transform the paramter's NuclideUri first then call to the
 * original callback.
 *
 * For example, given callback `callback: (payload: NuclideUri) => void`, it returns a new arrow
 * function:
 * ```
 * payload => {
 *   payload = this._connection.getUriOfRemotePath(payload);
 *   return callback(payload);
 * }
 * ```
 */
function createManipulatedCallbackArrowFunction(callbackAstNode: any): ?any {
  if (!callbackAstNode.typeAnnotation.typeAnnotation.params) {
    return null;
  }

  const parameterManipulateExpressions = [];

  callbackAstNode.typeAnnotation.typeAnnotation.params.forEach(callbackParameterFlowtypeNode => {
    const identifier = callbackParameterFlowtypeNode.name;
    const manipulateCallbackParameterAssignmentExpression =
      createGetUriOfRemotePathAssignmentExpression(
        callbackParameterFlowtypeNode.typeAnnotation,
        identifier
      );
    if (manipulateCallbackParameterAssignmentExpression) {
      parameterManipulateExpressions.push(manipulateCallbackParameterAssignmentExpression);
    }
  });

  if (parameterManipulateExpressions.length === 0) {
    return null;
  }

  const parameterIdentifiers = callbackAstNode.typeAnnotation.typeAnnotation.params.map(
      node => node.name);

  return t.arrowFunctionExpression(
    /* params */ parameterIdentifiers,
    /* body */ t.blockStatement(
      parameterManipulateExpressions.concat(
        [
          t.returnStatement(
            t.callExpression(
              t.identifier(callbackAstNode.name),
              parameterIdentifiers,
            ),
          ),
        ]
      ),
    )
  );
}

function createRemoteEventMethodDefinition(classDeclaration: any, methodDefinition: any): any {
  const remoteEventMethodBody = [];
  var callbackParameter = methodDefinition.value.params[0];

  const manipulatedCallback
      = createManipulatedCallbackArrowFunction(methodDefinition.value.params[0]);

  if (manipulatedCallback) {
    callbackParameter = t.identifier('_' + callbackParameter.name);

    remoteEventMethodBody.push(t.variableDeclaration(
      /* kind */ 'var',
      /* declarations */ [
        t.variableDeclarator(
          /* id */ callbackParameter,
          /* init */ manipulatedCallback
        ),
      ]
    ));
  }

  remoteEventMethodBody.push(
    // AST node of
    // `return this._connection.registerEventListener(
    //   '$className/$methodName',
    //   callback,
    //   this._options,
    // );`
    t.returnStatement(
      t.callExpression(
        /* callee */ t.memberExpression(
          t.memberExpression(
            t.thisExpression(),
            t.identifier('_connection')
          ),
          t.identifier('registerEventListener')
        ),
        /* arguments */ [
          t.literal(classDeclaration.id.name + '/' + methodDefinition.key.name),
          callbackParameter,
          t.memberExpression(t.thisExpression(), t.identifier('_options')),
        ]
      )
    )
  );

  const remoteFunctionExpression = t.functionExpression(
    /* id */ null,
    /* params */ methodDefinition.value.params,
    /* body */ t.blockStatement(remoteEventMethodBody),
  );

  return t.methodDefinition(
    /* key */ t.identifier(methodDefinition.key.name),
    /* value */ remoteFunctionExpression,
    /* kind */ 'method'
  );
}

export default function createServiceTransformer(
  baseClassFilePath: string,
  isDecorator: boolean,
): any {
  const classPrefix = getClassPrefix(isDecorator);
  return new Transformer('remote-service', {
    ClassDeclaration: function (node, parent) {
      // Skip classes with `Remote` prefix as it's generated.
      if (hasGeneratedClassPrefix(node.id.name)) {
        return;
      }

      // Make sure block comment `/* flow */` generated at the beginning of the file.
      // The way babel deal with comments is buggy, if we switch following two lines:
      // ```
      //   this.insertBefore(createBaseClassRequireExpression(...));
      //   return createRemoteClassDeclaration(...);
      // ```
      // The generated code will look like:
      // ```
      //   'use babel';
      //   var TestService = require('...');
      //   /* flow */
      //   class RemoteTestService extends TestService {
      //   ...
      // ```
      // which is not what we expect.
      this.insertAfter(createRemoteClassDeclaration(node, isDecorator));

      // Require the analytics package.
      if (!isDecorator) {
        this.insertAfter(createAnalyticsRequireExpression());
      }

      return createBaseClassRequireExpression(node.id.name, baseClassFilePath);
    },

    // Update `module.exports` to export generated remote class.
    ExpressionStatement: (node, parent) => {
      // Ignore expression not in form of `module.exports = ...`.
      if (!t.isAssignmentExpression(node.expression) ||
          node.expression.operator !== '=' ||
          !t.isMemberExpression(node.expression.left) ||
          !t.isIdentifier(node.expression.left.object) ||
          !t.isIdentifier(node.expression.left.property) ||
          node.expression.left.object.name !== 'module' ||
          node.expression.left.property.name !== 'exports') {
        return;
      }
      const right = node.expression.right;

      // If expression takes form `module.exports = $identifier`, then we are exporting
      // only one class.
      if (t.isIdentifier(right)) {
        node.expression.right = t.identifier(
          classPrefix + node.expression.right.name);
        return;
      }

      // If expression takes form `module.exports = { $identifier, ..., $identifer }`, then
      // we are exporting multiple classes.
      if (t.isObjectExpression(right)) {
        // Ensure that all the properties in this object are all identifier : identifier mappins.
        const identifiers = right.properties.every(prop => {
          return t.isIdentifier(prop.key) && t.isIdentifier(prop.value);
        });
        if (!identifiers) {
          return;
        }
        // Prepend the class prefix to every key and value.
        right.properties.forEach(prop => {
          prop.value = t.identifier(classPrefix + prop.value.name);
        });
      }
    },
  });
}
