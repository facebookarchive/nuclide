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

import type {NamedType, ArrayType, ObjectType, NullableType} from '../lib/types';
import {
  numberType,
  stringType,
  booleanType,
  dateType,
  regExpType,
  bufferType,
} from '../lib/builtin-types';

describe('TypeRegistry', () => {
  var typeRegistry;
  beforeEach(() => {
    typeRegistry = new TypeRegistry();
  });

  it('Can serialize / deserialize basic primitive types', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);

      var expected = 'Hello World';
      var str = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected, stringType),
        stringType,
      );
      expect(str).toBe(expected);

      var expected = 312213;
      var num = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected, numberType),
        numberType,
      );
      expect(num).toBe(expected);

      var expected = false;
      var bool = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected, booleanType),
        booleanType,
      );
      expect(bool).toBe(expected);
    });
  });

  it('Can serialize / deserialize complex types like Date, Regex and Buffer', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);

      var expected = new Date();
      var date = await typeRegistry.unmarshal(
          await typeRegistry.marshal(expected, dateType), dateType);
      expect(date.getTime()).toBe(expected.getTime());

      var expected = /nuclide/ig;
      var regex = await typeRegistry.unmarshal(
          await typeRegistry.marshal(expected, regExpType), regExpType);
      expect(regex.source).toBe(expected.source);

      var expected = new Buffer('test buffer data.');
      var buf: Buffer = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected, bufferType), bufferType);
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
        type: bufferType,
      };
      var result = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, type), type);
      expect(result.length).toBe(2);
      expect(result[0].equals(expected[0])).toBeTruthy();
      expect(result[1].equals(expected[1])).toBeTruthy();

      // Object with a a nullable property and a buffer property.
      var objectType: ObjectType = {
        kind: 'object',
        fields: [
          // A nullable string property.
          {
            type: {
              kind: 'nullable',
              type: stringType,
            },
            name: 'a',
            optional: false,
          },
          // A non-nullable buffer property.
          {
            type: bufferType,
            name: 'b',
            optional: false,
          },
          // An optional number property.
          {
            type: numberType,
            name: 'c',
            optional: true,
          },
        ],
      };
      var expected = { a: null, b: new Buffer('test') };
      var result = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected, objectType),
        objectType
      );
      expect(result.a).toBeNull();
      expect(result.b.equals(expected.b)).toBeTruthy();
    });
  });

  it('Can serialize / deserialize type aliases.', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);
      typeRegistry.registerAlias('ValueTypeA', ValueTypeA);

      var data = {valueA: 'Hello World.', valueB: null};
      var type: NamedType = {
        kind: 'named',
        name: 'ValueTypeA',
      };
      var result = await typeRegistry.unmarshal(await typeRegistry.marshal(data, type), type);
      expect(result.valueA).toBe(data.valueA);
      expect(result.valueB).toBeNull();
      expect(result.hasOwnProperty('valueC')).toBeFalsy();
    });
  });

  it('Can serialize / deserialize named types with same name as type kinds.', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);
      typeRegistry.registerAlias('nullable', numberType);

      var data = null;
      var type: NullableType = {
        kind: 'nullable',
        type: stringType,
      };
      var result = await typeRegistry.unmarshal(await typeRegistry.marshal(data, type), type);
      expect(result).toBe(null);
    });
  });
});

const ValueTypeA = {
  fields: [
    {
      name: 'valueA',
      optional: false,
      type: stringType,
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
      type: booleanType,
    },
  ],
  kind: 'object',
};
