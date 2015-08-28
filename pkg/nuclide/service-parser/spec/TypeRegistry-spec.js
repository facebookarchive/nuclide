'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import TypeRegistry from '../lib/TypeRegistry';
import invariant from 'assert';

import type {NamedType, ArrayType, ObjectType} from '../lib/types';

describe('TypeRegistry', () => {
  var typeRegistry;
  beforeEach(() => {
    typeRegistry = new TypeRegistry();
  });

  it('Can serialize / deserialize basic primitive types', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);

      var expected = 'Hello World';
      var str = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, {kind: 'string'}), {kind: 'string'});
      expect(str).toBe(expected);

      var expected = 312213;
      var num = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, {kind: 'number'}),
      {kind: 'number'});
      expect(num).toBe(expected);

      var expected = false;
      var bool = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, {kind: 'boolean'}),
      {kind: 'boolean'});
      expect(bool).toBe(expected);
    });
  });

  it('Can serialize / deserialize complex types like Date, Regex and Buffer', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);

      var expected = new Date();
      var type: NamedType = {kind: 'named', name: 'Date'};
      var date = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, type), type);
      expect(date.getTime()).toBe(expected.getTime());

      var expected = /nuclide/ig;
      var type: NamedType = {kind: 'named', name: 'RegExp'};
      var regex = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, type), type);
      expect(regex.source).toBe(expected.source);

      var expected = new Buffer('test buffer data.');
      var type: NamedType = {kind: 'named', name: 'Buffer'};
      var buf: Buffer = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, type), type);
      expect(expected.equals(buf)).toBeTruthy();
    });
  });

  it('Can serialize / deserialize parameterized types like Array and Object', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);

      // An array of buffers.
      var expected = [new Buffer('testdas'), new Buffer('test')];
      var type: ArrayType = {
        kind: 'array',
        type: {
          kind: 'named',
          name: 'Buffer',
        },
      };
      var result = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, type), type);
      expect(result.length).toBe(2);
      expect(result[0].equals(expected[0])).toBeTruthy();
      expect(result[1].equals(expected[1])).toBeTruthy();

      // Object with a a nullable property and a buffer property.
      var type: ObjectType = {
        kind: 'object',
        fields: [
          // A nullable string property.
          {
            type: { kind: 'nullable', type: { kind: 'string' } },
            name: 'a',
            optional: false,
          },
          // A non-nullable buffer property.
          {
            type: { kind: 'Buffer' },
            name: 'b',
            optional: false,
          },
          // An optional number property.
          {
            type: { kind: 'number' },
            name: 'c',
            optional: true,
          },
        ],
      };
      var expected = { a: null, b: new Buffer('test') };
      var result = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, type), type);
      expect(result.a).toBeNull();
      expect(result.b.equals(expected.b)).toBeTruthy();
    });
  });

  it('Can serialize / deserialize type aliases.', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);
      typeRegistry.registerAlias('ValueTypeA', ValueTypeA);

      var data = {valueA: 'Hello World.', valueB: null};
      var type: NamedType = {kind: 'named', name: 'ValueTypeA'};
      var result = await typeRegistry.unmarshal(await typeRegistry.marshal(data, type), type);
      expect(result.valueA).toBe(data.valueA);
      expect(result.valueB).toBeNull();
      expect(result.hasOwnProperty('valueC')).toBeFalsy();
    });
  });
});

var ValueTypeA = {
  fields: [
    {
      name: 'valueA',
      optional: false,
      type: {
        kind: 'string',
      },
    },
    {
      name: 'valueB',
      optional: false,
      type: {
        kind: 'nullable',
        type: {
          kind: 'named',
          name: 'ValueTypeB',
        },
      },
    },
    {
      name: 'valueC',
      optional: true,
      type: {
        kind: 'boolean',
      },
    },
  ],
  kind: 'object',
};
