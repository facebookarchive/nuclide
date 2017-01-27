/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {parse} from 'graphql';

import {getGraphQLCache} from '../lib/server/GraphQLCache';
import {validateWithCustomRules} from '../lib/utils/validateWithCustomRules';

describe('validateWithCustomRules', () => {
  let cache;
  let graphQLRC;
  let config;

  beforeEach(() => {
    waitsForPromise(async () => {
      cache = await getGraphQLCache(__dirname);
      graphQLRC = cache.getGraphQLRC();
      config = graphQLRC.getConfig('test');
    });
  });

  it('validates with custom rules defined', () => {
    waitsForPromise(async () => {
      const invalidAST = parse('query { human(id: "a") { name } }');
      // Flow catches require() parameter not being a literal string;
      // resolve the pathname here to avoid that error.
      const customRulesPath = require.resolve(
        config.getCustomValidationRulesModulePath() || '',
      );
      const customRules = require(customRulesPath)(config);
      const schema = await cache.getSchema(config.getSchemaPath());

      const errors = validateWithCustomRules(schema, invalidAST, customRules);
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toEqual(
        'Argument ID must be a number written in string type.',
      );
    });
  });
});
