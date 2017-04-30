/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {ASTNode} from 'graphql/language';
import type {ValidationContext} from 'graphql/validation';
import type {GraphQLConfig} from '../../lib/config/GraphQLConfig';
import type {CustomValidationRule} from '../../lib/types/Types';

import {GraphQLError} from 'graphql/error';

export default function customRules(
  graphQLConfig: GraphQLConfig,
): Array<CustomValidationRule> {
  // This rule is just for testing purposes
  const NoAlphabetIDArgumentRule = (context: ValidationContext) => ({
    Argument(node: ASTNode): void {
      if (!/^\d+$/.test(node.value.value)) {
        context.reportError(
          new GraphQLError(
            'Argument ID must be a number written in string type.',
            [node],
          ),
        );
      }
    },
  });
  return [NoAlphabetIDArgumentRule];
}
