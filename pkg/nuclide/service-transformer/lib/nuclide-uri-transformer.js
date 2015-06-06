'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {isNuclideUriFlowTypeAnnotation} = require('./flow-annotation');
var t = require('babel-core').types;

type Identifier = any;
type AssignmentExpression = any;
type FlowTypeNode = any;

/**
 * Given the identifier, create following assignment expression:
 * `$identifier  = this._connection.getPathOfUri($identifier);`
 */
function createGetPathOfUriAssignmentExpression(identifier: Identifier): AssignmentExpression {
  var callExpression = t.callExpression(
    /* callee */ t.memberExpression(
      t.memberExpression(
        t.thisExpression(),
        t.identifier('_connection')
      ),
      t.identifier('getPathOfUri')
    ),
    /* arguments */ [identifier],
  );

  return t.expressionStatement(
    t.assignmentExpression(
      /* operator */ '=',
      /* left */ identifier,
      /* right */ callExpression,
    )
  );
}

/**
 * Given the identifier, create following assignment expression:
 * `$identifier  = this._connection.getUriOfRemotePath($identifier);`
 */
function createGetUriOfRemotePathAssignmentExpression(identifier: Identifier): AssignmentExpression {
  var callExpression = t.callExpression(
    /* callee */ t.memberExpression(
      t.memberExpression(
        t.thisExpression(),
        t.identifier('_connection')
      ),
      t.identifier('getUriOfRemotePath')
    ),
    /* arguments */ [identifier],
  );

  return t.expressionStatement(
    t.assignmentExpression(
      /* operator */ '=',
      /* left */ identifier,
      /* right */ callExpression,
    )
  );
}

/**
 * It creates a manipulation assigment expression for an identifier node, by comparing it's flow
 * type with typeNodeValidator.
 *
 * The key feature is that if the node is an Object or an Array, and the object's property or
 * the array's item matches given flow type according to node's flow type definition, the
 * creator could handle it and create correct assignment expression. As long as the flow type of
 * the node is a valid json object, this creator could create the expected assignment
 * expression.
 *
 * For example, say we are intersted in flow type `fooType` and we want to manipulate the
 * object with `fooType` by `object = bar(object)`. Following the expected result of created
 * assignmentExpression:
 *
 * `object: fooType` => `object = bar(object)`.
 *
 * `object: {a: fooType, b: number}` => `object.a = bar(object.a)`.
 *
 * `object: Array<fooType>` => 'object = object.map((arg) => {return bar(arg)})`.
 *
 */
class ManipulationAssignmentExpressionCreator {
  /**
   * Initialize the creator.
   * @param typeNodeValidator A function who take a FlowTypeNode as argument and return true
   *    if it is the type we want to manipulate.
   * @param identifierToAssignmentExpression A function who take an idnentifier as argument and
   *    create an manipulation assignment expression.
   */
  constructor(typeNodeValidator: (typeNode: FlowTypeNode) => boolean,
      identifierToAssignmentExpression: (identifier: Identifier) => AssignmentExpression) {
    this._typeNodeValidator = typeNodeValidator;
    this._identifierToAssignmentExpression = identifierToAssignmentExpression;
  }

  /**
   * Create the manipulation assignment expression for the identifier if the flowTypeNode or the
   * flowTypeNode's nested node matches the typeNodeValidator. If nothing matches, just return
   * null.
   */
  create(flowTypeNode: FlowTypeNode, identifier: Identifier): ?AssignmentExpression {
    return this._visit(flowTypeNode, identifier);
  }

  _visit(flowTypeNode: FlowTypeNode, identifier: Identifier): ?AssignmentExpression {
    if (this._typeNodeValidator(flowTypeNode)) {
      return this._identifierToAssignmentExpression(identifier);
    }

    if (flowTypeNode.type === 'GenericTypeAnnotation') {
      return this._visitGenericTypeAnnotationNode(flowTypeNode, identifier);
    } else if (flowTypeNode.type === 'ObjectTypeAnnotation') {
      return this._visitObjectTypeAnnotationNode(flowTypeNode, identifier);
    } else if (flowTypeNode.type === 'NullableTypeAnnotation') {
      return this._visitNullableTypeAnnotationNode(flowTypeNode, identifier);
    } else {
      return null;
    }
  }

  _visitGenericTypeAnnotationNode(flowTypeNode: FlowTypeNode, identifier: Identifier): ?AssignmentExpression{
    if (flowTypeNode.id &&
        flowTypeNode.id.type === 'Identifier' &&
        flowTypeNode.id.name === 'Array') {
      return this._visitArrayTypeAnnotationNode(flowTypeNode, identifier);
    } else {
      return null;
    }
  }

  /**
   * Visit the node typed as `Array<$nestedFlowType>` and create the manipulation
   * expression if nestedFlowType should be manipulate.
   *
   * For example, if the nestedFlowType should be manipuated,  the generated expression will be
   * in following form:
   * ```
   * identifier = identifier.map(arg0 => {
   *   arg0 = manipulation(arg0);
   *   return arg0;
   * });
   * ```
   */
  _visitArrayTypeAnnotationNode(flowTypeNode: FlowTypeNode, identifier: Identifier): ?AssignmentExpression{
    // Skip if there is either no nested flow type or more than one.
    if (!flowTypeNode.typeParameters ||
        flowTypeNode.typeParameters.params.length !== 1) {
      return null;
    }

    var nestedFlowType = flowTypeNode.typeParameters.params[0];
    var arrowFunctionParam = t.identifier('item');
    var assignmentExpression = this._visit(nestedFlowType, arrowFunctionParam);

    if (!assignmentExpression) {
      return null;
    }

    var arrowFunction = t.arrowFunctionExpression(
      /* params */ [arrowFunctionParam],
      /* body */ t.blockStatement(
        [
          assignmentExpression,
          t.returnStatement(arrowFunctionParam),
        ]
      )
    );

    var callArrayMapExpression = t.callExpression(
      /* callee */ t.memberExpression(
        identifier,
        t.identifier('map'),
      ),
      /* arguments */ [arrowFunction],
    );

    return t.expressionStatement(
      t.assignmentExpression(
        /* operator */ '=',
        /* left */ identifier,
        /* right */ callArrayMapExpression,
      )
    );
  }

  /**
   * Visit the node typed as `{property0: flowType0, property1: flowtype1... }` and create the
   * manipulation expression if any of its properties should be manipulated.
   *
   * For example, if `identifier.property0` should be manipuated,  the generated expression will be
   * in following form:
   * ```
   * identifier = ((arg0) => {
   *  arg0.property0 = manipulation(arg0.property0);
   * }) (identifier);
   *
   * ```
   */
  _visitObjectTypeAnnotationNode(flowTypeNode: FlowTypeNode, identifier: Identifier): ?AssignmentExpression {
    var objectIdentifier = t.identifier('obj');
    var assignmentExpressions = [];

    flowTypeNode.properties.forEach(property => {
      var key = property.key;
      if (key.type !== 'Identifier') {
        return;
      }

      var propertyExpression = t.memberExpression(objectIdentifier, t.identifier(key.name));
      var assignmentExpression = this._visit(property.value, propertyExpression);

      if (assignmentExpression) {
        assignmentExpressions.push(assignmentExpression);
      }
    });

    // Skip if the the properties don't need to be manipuated.
    if (assignmentExpressions.length === 0) {
      return null;
    }

    var arrowFunction = t.arrowFunctionExpression(
      /* params */ [objectIdentifier],
      /* body */ t.blockStatement(
        assignmentExpressions.concat(t.returnStatement(objectIdentifier)),
      )
    );

    var callArrowFunctionExpression = t.callExpression(
      /* callee */ arrowFunction,
      /* arguments */ [identifier],
    );

    return t.expressionStatement(
      t.assignmentExpression(
        /* operator */ '=',
        /* left */ identifier,
        /* right */ callArrowFunctionExpression,
      )
    );
  }

  /**
   * Visit the node typed as `?$nestedFlowType` (nullable) and create the if statement
   * manipulation expression if the nested flow type should be manipulated.
   *
   * For example, if `identifier: ?$nestedFlowType` should be manipuated,  the generated expression will be
   * in following form:
   * ```
   * if (identifier !== null) {
   *   identifier = manipulation(identifier);
   * }
   * ```
   */
  _visitNullableTypeAnnotationNode(flowTypeNode: FlowTypeNode, identifier: Identifier): ?any {
    if (!flowTypeNode.typeAnnotation) {
      return null;
    }

    var assignmentExpression = this._visit(flowTypeNode.typeAnnotation, identifier);

    if (!assignmentExpression) {
      return null;
    }

    return t.ifStatement(
      /* test */ t.binaryExpression('!==', identifier, t.literal(null)),
      /* consequent */ t.blockStatement([assignmentExpression]),
    );
  }
}

module.exports = {
  ManipulationAssignmentExpressionCreator,

  createGetPathOfUriAssignmentExpression(
    flowTypeNode: FlowTypeNode,
    identifier: Identifier
  ): ?AssignmentExpression {
    var creator = new ManipulationAssignmentExpressionCreator(
        isNuclideUriFlowTypeAnnotation,
        createGetPathOfUriAssignmentExpression);
    return creator.create(flowTypeNode, identifier);
  },

  createGetUriOfRemotePathAssignmentExpression(
    flowTypeNode: FlowTypeNode,
    identifier: Identifier
  ): ?AssignmentExpression {
    var creator = new ManipulationAssignmentExpressionCreator(
        isNuclideUriFlowTypeAnnotation,
        createGetUriOfRemotePathAssignmentExpression);
    return creator.create(flowTypeNode, identifier);
  },
}
