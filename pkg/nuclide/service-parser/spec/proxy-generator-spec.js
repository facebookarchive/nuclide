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
import fs from 'fs';
import generate from 'babel-core/lib/generation';
import generateProxy from '../lib/proxy-generator';
import {addMatchers} from 'nuclide-test-helpers';
import parseServiceDefinition from '../lib/service-parser';
import path from 'path';
import {__test__} from '../lib/proxy-generator';

import {Type} from '../lib/types';

var t = babel.types;

describe('Proxy generator test suite.', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  for (let file of fs.readdirSync(path.join(__dirname, 'fixtures'))) {
    if (file.endsWith('.def')) {
      it(`Successfully generates proxy for ${file}`, () => {
        var definitions =  parseServiceDefinition(fs.readFileSync(path.join(__dirname, 'fixtures', file), 'utf8'));

        var code = generateProxy(definitions);
        var expected = fs.readFileSync(path.join(__dirname, 'fixtures', file).replace('.def', '.proxy'), 'utf8');
        expect(code.trim()).diffLines(expected.trim());
      });
    }
  }
});

var ArrayOfArrayOfNuclideUri: Type = {
  kind: 'array',
  elementType: {
    kind: 'array',
    elementType: {
      kind: 'named',
      name: 'NuclideUri',
    },
  },
};

describe('generateTransformStatement helper function', function () {
  beforeEach(function() {
    addMatchers(this);
  });

  it('Generates a marshal statement.', () => {
    var code = generate(__test__.generateTransformStatement(t.identifier('value'),
        ArrayOfArrayOfNuclideUri, true)).code;
    expect(code).diffLines(marshalText);
  });

  it('Generates an unmarshal statement.', () => {
    var code = generate(__test__.generateTransformStatement(t.identifier('value'),
        ArrayOfArrayOfNuclideUri, false)).code;
    expect(code).diffLines(unmarshalText);
  });
});

var marshalText = `_client.marshal(value, {
  kind: "array",
  elementType: {
    kind: "array",
    elementType: {
      kind: "named",
      name: "NuclideUri"
    }
  }
})`;

var unmarshalText = `_client.unmarshal(value, {
  kind: "array",
  elementType: {
    kind: "array",
    elementType: {
      kind: "named",
      name: "NuclideUri"
    }
  }
})`;
