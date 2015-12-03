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

import {builtinLocation} from '../lib/builtin-types';

const t = babel.types;

describe('Proxy generator test suite.', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  for (const file of fs.readdirSync(path.join(__dirname, 'fixtures'))) {
    if (file.endsWith('.def')) {
      it(`Successfully generates proxy for ${file}`, () => {
        const fixturePath = path.join(__dirname, 'fixtures', file);
        const definitions = parseServiceDefinition(file, fs.readFileSync(fixturePath, 'utf8'));

        const code = generateProxy(path.basename(file, '.def'), definitions);
        const expected = fs.readFileSync(
          path.join(__dirname, 'fixtures', file).replace('.def', '.proxy'), 'utf8');
        expect(code.trim()).diffLines(expected.trim());
      });
    }
  }
});

const ArrayOfArrayOfNuclideUri: Type = {
  location: builtinLocation,
  kind: 'array',
  type: {
    location: builtinLocation,
    kind: 'array',
    type: {
      location: builtinLocation,
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
    const code = generate(__test__.generateTransformStatement(t.identifier('value'),
        ArrayOfArrayOfNuclideUri, true)).code;
    expect(code).diffLines(marshalText);
  });

  it('Generates an unmarshal statement.', () => {
    const code = generate(__test__.generateTransformStatement(t.identifier('value'),
        ArrayOfArrayOfNuclideUri, false)).code;
    expect(code).diffLines(unmarshalText);
  });
});

const marshalText = `_client.marshal(value, {
  location: {
    type: "builtin"
  },
  kind: "array",
  type: {
    location: {
      type: "builtin"
    },
    kind: "array",
    type: {
      location: {
        type: "builtin"
      },
      kind: "named",
      name: "NuclideUri"
    }
  }
})`;

const unmarshalText = `_client.unmarshal(value, {
  location: {
    type: "builtin"
  },
  kind: "array",
  type: {
    location: {
      type: "builtin"
    },
    kind: "array",
    type: {
      location: {
        type: "builtin"
      },
      kind: "named",
      name: "NuclideUri"
    }
  }
})`;
