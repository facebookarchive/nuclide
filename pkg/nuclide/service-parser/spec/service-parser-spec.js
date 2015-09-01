'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import {addMatchers} from 'nuclide-test-helpers';
import parseServiceDefinition from '../lib/service-parser';
import path from 'path';

describe('Nuclide service parser test suite.', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  for (let file of fs.readdirSync(path.join(__dirname, 'fixtures'))) {
    if (file.endsWith('.def')) {
      it(`Successfully parses ${file}`, () => {
        var code = fs.readFileSync(path.join(__dirname, 'fixtures', file), 'utf8');
        var expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', file) + '.json', 'utf8'));
        var definitions = parseServiceDefinition(code);

        definitions.functions = mapToJSON(definitions.functions);
        definitions.aliases = mapToJSON(definitions.aliases);

        definitions.interfaces.forEach(def => {
          def.staticMethods = mapToJSON(def.staticMethods);
          def.instanceMethods = mapToJSON(def.instanceMethods);
        });
        definitions.interfaces = mapToJSON(definitions.interfaces);

        expect(definitions).diffJson(expected);
      });
    }
  }
});

function mapToJSON<T>(map: Map<string, T>): { [key: string]: T } {
  var obj = {};
  for (var it of map.entries()) {
    obj[it[0]] = it[1];
  }
  return obj;
}
