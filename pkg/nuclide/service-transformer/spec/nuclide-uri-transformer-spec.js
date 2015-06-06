'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type Identifier = any;
type AssignmentExpression = any;
type FlowTypeNode = any;

var babel = require('babel-core');
var fs = require('fs');
var {isNuclideUriFlowTypeAnnotation} = require('../lib/flow-annotation');
var path = require('path');
var t = babel.types;
var {ManipulationAssignmentExpressionCreator} = require('../lib/nuclide-uri-transformer');
var Transformer = babel.Transformer;

var SUFFIX = '_MANIPULATE';

function addSuffixManipulation(identifier: Identifier): AssignmentExpression {
  // Assignment expression of `$identifier = $identifier + suffix`.
  return t.expressionStatement(
    t.assignmentExpression(
      /* operator */ '=',
      /* left */ identifier,
      /* right */ t.binaryExpression(
        /* operator */ '+',
        /* left */ identifier,
        /* right */ t.literal(SUFFIX),
      ),
    )
  );
}

var manipulationCreator = new ManipulationAssignmentExpressionCreator(
    isNuclideUriFlowTypeAnnotation,
    addSuffixManipulation);

function createOnetimeHelperPlugin(): any {
  var expired = false;
  return new Transformer('helper', {
    FunctionDeclaration(node, parent) {
      if (expired) {
        return;
      } else {
        expired = true;
      }
      var parametersManipulationExpressions = [];

      node.params.forEach(param => {
        var assignmentExpression = manipulationCreator.create(
            param.typeAnnotation.typeAnnotation, param);
        if (assignmentExpression) {
          parametersManipulationExpressions.push(assignmentExpression);
        }
      });

      node.body.body = parametersManipulationExpressions.concat(node.body.body);
    },
  });
}

/**
 * Test a object with given flow type could be transfomred to expected object.
 */
function testTransformNuclideUri(stringFlowType: string, obj: any, expected: any): void {
  var helperSourceCode = 'function foo(x: FLOWTYPE) {return x;}'.replace('FLOWTYPE', stringFlowType);

  var transformedFunctionCode = babel.transform(helperSourceCode, {
    plugins: [createOnetimeHelperPlugin()],
    blacklist: ['strict'],
  }).code;

  // Eval the transfomred source code to get the transformed foo ready to use.
  eval(transformedFunctionCode);

  expect(foo(obj)).toEqual(expected);
}

describe('Nuclide nuclide uri transformer test suite.', function() {
  it('Add suffix to all NuclideUri', function() {
    testTransformNuclideUri('string', 'a', 'a');
    testTransformNuclideUri('NuclideUri', 'a', 'a' + SUFFIX);
    testTransformNuclideUri('?NuclideUri', 'a', 'a' + SUFFIX);
    testTransformNuclideUri('?NuclideUri', null, null);
    testTransformNuclideUri('Array<NuclideUri>', ['a', 'b'], ['a' + SUFFIX, 'b' + SUFFIX]);
    testTransformNuclideUri('?Array<NuclideUri>', ['a', 'b'], ['a' + SUFFIX, 'b' + SUFFIX]);
    testTransformNuclideUri('?Array<NuclideUri>', null, null);
    testTransformNuclideUri('Array<?NuclideUri>', [null, 'b'], [null, 'b' + SUFFIX]);
    testTransformNuclideUri(
      '{nuclideUri: NuclideUri; string: string}',
      {nuclideUri: 'a', string: 'a'},
      {nuclideUri: 'a' + SUFFIX, string: 'a'},
    );
    testTransformNuclideUri(
      '{nuclideUri: ?NuclideUri; string: string}',
      {nuclideUri: 'a', string: 'a'},
      {nuclideUri: 'a' + SUFFIX, string: 'a'},
    );
    testTransformNuclideUri(
      '{nuclideUri: ?NuclideUri; string: string}',
      {nuclideUri: null, string: 'a'},
      {nuclideUri: null, string: 'a'},
    );
    testTransformNuclideUri(
      'Array<{nuclideUri: NuclideUri; string: string}>',
      [
        {nuclideUri: 'a', string: 'a'},
        {nuclideUri: 'b', string: 'b'},
      ],
      [
        {nuclideUri: 'a' + SUFFIX, string: 'a'},
        {nuclideUri: 'b' + SUFFIX, string: 'b'},
      ],
    );
    testTransformNuclideUri(
      '{nuclideUris: Array<NuclideUri>; string: string}',
      {nuclideUris: ['a', 'b'], string: 'a'},
      {nuclideUris: ['a' + SUFFIX, 'b' + SUFFIX], string: 'a'},
    );
  });
});
