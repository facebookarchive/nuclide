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

import type {
  NamedType,
  ArrayType,
  ObjectType,
  NullableType,
} from '../lib/types';

import {
  builtinLocation,
  numberType,
  stringType,
  booleanType,
  dateType,
  regExpType,
  bufferType,
  anyType,
  mixedType,
} from '../lib/builtin-types';

describe('TypeRegistry', () => {
  let typeRegistry: any;
  beforeEach(() => {
    typeRegistry = new TypeRegistry();
  });

  it('Can serialize / deserialize basic primitive types', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);

      const expected1 = 'Hello World';
      const str1 = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected1, stringType),
        stringType,
      );
      expect(str1).toBe(expected1);

      const expected2 = 312213;
      const num2 = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected2, numberType),
        numberType,
      );
      expect(num2).toBe(expected2);

      const expected3 = false;
      const bool3 = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected3, booleanType),
        booleanType,
      );
      expect(bool3).toBe(expected3);

      const expected4 = false;
      const bool4 = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected4, anyType),
        anyType,
      );
      expect(bool4).toBe(expected4);

      const expected5 = 42;
      const num5 = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected5, mixedType),
        mixedType,
      );
      expect(num5).toBe(expected5);
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
        location: builtinLocation,
        kind: 'array',
        type: bufferType,
      };
      var result = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, type), type);
      expect(result.length).toBe(2);
      expect(result[0].equals(expected[0])).toBeTruthy();
      expect(result[1].equals(expected[1])).toBeTruthy();

      // Object with a a nullable property and a buffer property.
      var objectType: ObjectType = {
        location: builtinLocation,
        kind: 'object',
        fields: [
          // A nullable string property.
          {
            location: builtinLocation,
            type: {
              location: builtinLocation,
              kind: 'nullable',
              type: stringType,
            },
            name: 'a',
            optional: false,
          },
          // A non-nullable buffer property.
          {
            location: builtinLocation,
            type: bufferType,
            name: 'b',
            optional: false,
          },
          // An optional number property.
          {
            location: builtinLocation,
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
        location: builtinLocation,
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
        location: builtinLocation,
        kind: 'nullable',
        type: stringType,
      };
      var result = await typeRegistry.unmarshal(await typeRegistry.marshal(data, type), type);
      expect(result).toBe(null);
    });
  });
});

const ValueTypeA: ObjectType = {
  location: builtinLocation,
  kind: 'object',
  fields: [
    {
      location: builtinLocation,
      name: 'valueA',
      optional: false,
      type: stringType,
    },
    {
      location: builtinLocation,
      name: 'valueB',
      optional: false,
      type: {
        location: builtinLocation,
        kind: 'nullable',
        type: {
          location: builtinLocation,
          kind: 'named',
          name: 'ValueTypeB',
        },
      },
    },
    {
      location: builtinLocation,
      name: 'valueC',
      optional: true,
      type: booleanType,
    },
  ],
};
