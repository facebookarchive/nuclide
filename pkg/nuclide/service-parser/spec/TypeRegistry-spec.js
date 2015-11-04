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
  objectType,
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

  it('Can serialize / deserialize literal types', () => {
    waitsForPromise(async () => {
      const stringLiteralType = {
        location: builtinLocation,
        kind: 'string-literal',
        value: 'Hello World',
      };
      invariant(typeRegistry);

      const expected1 = 'Hello World';
      const str1 = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected1, stringLiteralType),
        stringLiteralType,
      );
      expect(str1).toBe(expected1);

      const numberLiteralType = {
        location: builtinLocation,
        kind: 'number-literal',
        value: 312213,
      };
      const expected2 = 312213;
      const num2 = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected2, numberLiteralType),
        numberLiteralType,
      );
      expect(num2).toBe(expected2);

      const falseLiteralType = {
        location: builtinLocation,
        kind: 'boolean-literal',
        value: false,
      };
      const expected3 = false;
      const bool3 = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected3, falseLiteralType),
        falseLiteralType,
      );
      expect(bool3).toBe(expected3);

      // Marshalling an unexpected value throws.
      let thrown = false;
      try {
        await typeRegistry.marshal(42, falseLiteralType);
      } catch (e) {
        thrown = true;
      }
      expect(thrown).toBe(true);
    });
  });

  it('Can serialize / deserialize complex types like Date, Regex and Buffer', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);

      const expected1 = { a: 42, b: { c: 'str' }};
      const object1 = await typeRegistry.unmarshal(
          await typeRegistry.marshal(expected1, objectType), objectType);
      expect(object1).toBe(expected1);

      const expected2 = new Date();
      const date2 = await typeRegistry.unmarshal(
          await typeRegistry.marshal(expected2, dateType), dateType);
      expect(date2.getTime()).toBe(expected2.getTime());

      const expected3 = /nuclide/ig;
      const regex3 = await typeRegistry.unmarshal(
          await typeRegistry.marshal(expected3, regExpType), regExpType);
      expect(regex3.source).toBe(expected3.source);

      const expected4 = new Buffer('test buffer data.');
      const buf4: Buffer = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected4, bufferType), bufferType);
      expect(expected4.equals(buf4)).toBeTruthy();
    });
  });

  it('Can serialize / deserialize parameterized types like Array and Object', () => {
    waitsForPromise(async () => {
      invariant(typeRegistry);

      // An array of buffers.
      const expected = [new Buffer('testdas'), new Buffer('test')];
      const type: ArrayType = {
        location: builtinLocation,
        kind: 'array',
        type: bufferType,
      };
      const result = await typeRegistry.unmarshal(await typeRegistry.marshal(expected, type), type);
      expect(result.length).toBe(2);
      expect(result[0].equals(expected[0])).toBeTruthy();
      expect(result[1].equals(expected[1])).toBeTruthy();

      // Object with a a nullable property and a buffer property.
      const customObjectType: ObjectType = {
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
      const expected2 = { a: null, b: new Buffer('test') };
      const result2 = await typeRegistry.unmarshal(
        await typeRegistry.marshal(expected2, customObjectType),
        customObjectType
      );
      expect(result2.a).toBeNull();
      expect(result2.b.equals(expected2.b)).toBeTruthy();
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
