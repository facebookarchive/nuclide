'use strict';

var _TypeRegistry;

function _load_TypeRegistry() {
  return _TypeRegistry = require('../lib/TypeRegistry');
}

var _builtinTypes;

function _load_builtinTypes() {
  return _builtinTypes = require('../lib/builtin-types');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

describe('TypeRegistry', () => {
  let typeRegistry = null;
  let context = null;
  beforeEach(() => {
    typeRegistry = new (_TypeRegistry || _load_TypeRegistry()).TypeRegistry([]);
    context = {};
  });

  it('Can serialize / deserialize basic primitive types', async () => {
    if (!typeRegistry) {
      throw new Error('Invariant violation: "typeRegistry"');
    }

    const expected1 = 'Hello World';
    const str1 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected1, (_builtinTypes || _load_builtinTypes()).stringType)), (_builtinTypes || _load_builtinTypes()).stringType);
    expect(str1).toBe(expected1);

    const expected2 = 312213;
    const num2 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected2, (_builtinTypes || _load_builtinTypes()).numberType)), (_builtinTypes || _load_builtinTypes()).numberType);
    expect(num2).toBe(expected2);

    const expected3 = false;
    const bool3 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected3, (_builtinTypes || _load_builtinTypes()).booleanType)), (_builtinTypes || _load_builtinTypes()).booleanType);
    expect(bool3).toBe(expected3);

    const expected4 = false;
    const bool4 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected4, (_builtinTypes || _load_builtinTypes()).anyType)), (_builtinTypes || _load_builtinTypes()).anyType);
    expect(bool4).toBe(expected4);

    const expected5 = 42;
    const num5 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected5, (_builtinTypes || _load_builtinTypes()).mixedType)), (_builtinTypes || _load_builtinTypes()).mixedType);
    expect(num5).toBe(expected5);

    const expected6 = Number.NEGATIVE_INFINITY;
    const num6 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected6, (_builtinTypes || _load_builtinTypes()).numberType)), (_builtinTypes || _load_builtinTypes()).numberType);
    expect(num6).toBe(expected6);

    const expected7 = Number.POSITIVE_INFINITY;
    const num7 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected7, (_builtinTypes || _load_builtinTypes()).numberType)), (_builtinTypes || _load_builtinTypes()).numberType);
    expect(num7).toBe(expected7);

    const expected8 = Number.POSITIVE_INFINITY;
    const num8 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected8, (_builtinTypes || _load_builtinTypes()).numberType)), (_builtinTypes || _load_builtinTypes()).numberType);
    expect(num8).toBe(expected8);

    // Marshalling an unexpected value throws.
    let thrown = false;
    try {
      await typeRegistry.marshal(context, null, (_builtinTypes || _load_builtinTypes()).numberType);
    } catch (e) {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Can serialize / deserialize literal types', async () => {
    await (async () => {
      const stringLiteralType = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'string-literal',
        value: 'Hello World'
      };

      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      const expected1 = 'Hello World';
      const str1 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected1, stringLiteralType)), stringLiteralType);
      expect(str1).toBe(expected1);

      const numberLiteralType = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'number-literal',
        value: 312213
      };
      const expected2 = 312213;
      const num2 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected2, numberLiteralType)), numberLiteralType);
      expect(num2).toBe(expected2);

      const falseLiteralType = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'boolean',
        value: false
      };
      const expected3 = false;
      const bool3 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected3, falseLiteralType)), falseLiteralType);
      expect(bool3).toBe(expected3);

      // Marshalling an unexpected value throws.
      let thrown = false;
      try {
        await typeRegistry.marshal(context, 42, falseLiteralType);
      } catch (e) {
        thrown = true;
      }
      expect(thrown).toBe(true);
    })();
  });

  it('Can serialize / deserialize complex types like Date, Regex and Buffer', async () => {
    await (async () => {
      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      const expected1 = { a: 42, b: { c: 'str' } };
      const object1 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected1, (_builtinTypes || _load_builtinTypes()).objectType)), (_builtinTypes || _load_builtinTypes()).objectType);
      expect(object1).toBe(expected1);

      const expected2 = new Date();
      const date2 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected2, (_builtinTypes || _load_builtinTypes()).dateType)), (_builtinTypes || _load_builtinTypes()).dateType);
      expect(date2.getTime()).toBe(expected2.getTime());

      const expected3 = /nuclide/gi;
      const regex3 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected3, (_builtinTypes || _load_builtinTypes()).regExpType)), (_builtinTypes || _load_builtinTypes()).regExpType);
      expect(regex3.source).toBe(expected3.source);

      const expected4 = new Buffer('test buffer data.');
      const buf4 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected4, (_builtinTypes || _load_builtinTypes()).bufferType)), (_builtinTypes || _load_builtinTypes()).bufferType);
      expect(expected4.equals(buf4)).toBeTruthy();
    })();
  });

  it('Can serialize / deserialize parameterized types like Array and Object', async () => {
    await (async () => {
      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      // An array of buffers.


      const expected = [new Buffer('testdas'), new Buffer('test')];
      const type = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'array',
        type: (_builtinTypes || _load_builtinTypes()).bufferType
      };
      const result = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected, type)), type);
      expect(result.length).toBe(2);
      expect(result[0].equals(expected[0])).toBeTruthy();
      expect(result[1].equals(expected[1])).toBeTruthy();

      // Object with a a nullable property and a buffer property.
      const customObjectType = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'object',
        fields: [
        // A nullable string property.
        {
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: {
            location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
            kind: 'nullable',
            type: (_builtinTypes || _load_builtinTypes()).stringType
          },
          name: 'a',
          optional: false
        },
        // A non-nullable buffer property.
        {
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: (_builtinTypes || _load_builtinTypes()).bufferType,
          name: 'b',
          optional: false
        },
        // An optional number property.
        {
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: (_builtinTypes || _load_builtinTypes()).numberType,
          name: 'c',
          optional: true
        }]
      };
      const expected2 = { a: null, b: new Buffer('test') };
      const result2 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, expected2, customObjectType)), customObjectType);
      expect(result2.a).toBeNull();
      expect(result2.b.equals(expected2.b)).toBeTruthy();

      // Undefined is acceptable for nullable fields.
      const expected3 = { a: undefined, b: new Buffer('test') };
      const marshalled = await typeRegistry.marshal(context, expected3, customObjectType);
      const result3 = await typeRegistry.unmarshal(context,
      // JSON omits undefined values, so accurately test that.
      JSON.parse(JSON.stringify(marshalled)), customObjectType);
      expect(result3.a).toBe(undefined);
      expect(result3.b.equals(expected3.b)).toBeTruthy();
    })();
  });

  it('Can serialize / deserialize type aliases.', async () => {
    await (async () => {
      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      typeRegistry.registerAlias('ValueTypeA', (_builtinTypes || _load_builtinTypes()).builtinLocation, ValueTypeA);

      const data = { valueA: 'Hello World.', valueB: null };
      const type = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'named',
        name: 'ValueTypeA'
      };
      const result = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data, type)), type);
      expect(result.valueA).toBe(data.valueA);
      expect(result.valueB).toBeNull();
      expect(result.hasOwnProperty('valueC')).toBeFalsy();
    })();
  });

  it('Can serialize / deserialize named types with same name as type kinds.', async () => {
    await (async () => {
      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      typeRegistry.registerAlias('nullable', (_builtinTypes || _load_builtinTypes()).builtinLocation, (_builtinTypes || _load_builtinTypes()).numberType);

      const data = null;
      const type = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'nullable',
        type: (_builtinTypes || _load_builtinTypes()).stringType
      };
      const result = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data, type)), type);
      expect(result).toBe(null);
    })();
  });

  it('Can serialize / deserialize union literal types.', async () => {
    await (async () => {
      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      const type = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'union',
        types: [a1, a2, a3]
      };

      const data1 = 'bork';
      const result1 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data1, type)), type);
      expect(result1).toBe(data1);

      const data2 = 'bork!';
      const result2 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data2, type)), type);
      expect(result2).toBe(data2);

      const data3 = 42;
      const result3 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data3, type)), type);
      expect(result3).toBe(data3);

      const data4 = 'not bork!';
      let thrown = false;
      try {
        await typeRegistry.marshal(context, data4, type);
      } catch (e) {
        thrown = true;
      }
      expect(thrown).toBe(true);
    })();
  });

  it('Can serialize / deserialize union object types.', async () => {
    await (async () => {
      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      // {kind: 'bork'; n: number }


      const o1 = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'object',
        fields: [{
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: a1,
          name: 'kind',
          optional: false
        }, {
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: (_builtinTypes || _load_builtinTypes()).numberType,
          name: 'n',
          optional: false
        }]
      };

      // {kind: 'bork!'; s: string }
      const o2 = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'object',
        fields: [{
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: a2,
          name: 'kind',
          optional: false
        }, {
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: (_builtinTypes || _load_builtinTypes()).stringType,
          name: 's',
          optional: false
        }]
      };

      // {kind: 42; b: boolean }
      const o3 = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'object',
        fields: [{
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: a3,
          name: 'kind',
          optional: false
        }, {
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: (_builtinTypes || _load_builtinTypes()).booleanType,
          name: 'b',
          optional: false
        }]
      };

      const type = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'union',
        types: [o1, o2, o3],
        discriminantField: 'kind'
      };

      const data1 = { kind: 'bork', n: 42 };
      const result1 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data1, type)), type);
      expect(result1).toEqual(data1);

      const data2 = { kind: 'bork!', s: 'hello' };
      const result2 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data2, type)), type);
      expect(result2).toEqual(data2);

      const data3 = { kind: 42, b: true };
      const result3 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data3, type)), type);
      expect(result3).toEqual(data3);

      // Ensure no extra fields are accidentally marshalled.
      const data4 = { kind: 'bork', n: 42, s: 'hello', b: true };
      const result4 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data4, type)), type);
      expect(result4).toEqual(data1);

      const data5 = { kind: 'not bork!' };
      let thrown = false;
      try {
        await typeRegistry.marshal(context, data5, type);
      } catch (e) {
        thrown = true;
      }
      expect(thrown).toBe(true);
    })();
  });

  it('can serialize/deserialize intersection object types', async () => {
    await (async () => {
      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      // { x: number, y: number }


      const o1 = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'object',
        fields: [{
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: (_builtinTypes || _load_builtinTypes()).numberType,
          name: 'x',
          optional: false
        }, {
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: (_builtinTypes || _load_builtinTypes()).numberType,
          name: 'y',
          optional: false
        }]
      };

      // { s: string }
      const o2 = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'object',
        fields: [{
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          type: (_builtinTypes || _load_builtinTypes()).stringType,
          name: 's',
          optional: false
        }]
      };

      const type = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'intersection',
        types: [o1, o2],
        flattened: {
          kind: 'object',
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          fields: o1.fields.concat(o2.fields)
        }
      };

      const data1 = { x: 5, y: 6, s: 'asdf' };
      const result1 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data1, type)), type);
      expect(result1).toEqual(data1);

      // Ensure no extra fields are accidentally marshalled.
      const data4 = { x: 5, y: 6, s: 'asdf', b: true };
      const result4 = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data4, type)), type);
      expect(result4).toEqual(data1);
    })();
  });

  it('Can serialize / deserialize undefined values', async () => {
    await (async () => {
      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      const data = undefined;
      const type = {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'nullable',
        type: (_builtinTypes || _load_builtinTypes()).stringType
      };
      const result = await typeRegistry.unmarshal(context, (await typeRegistry.marshal(context, data, type)), type);
      expect(result).toBe(undefined);
    })();
  });

  it('works for very large values', async () => {
    const testArray = [];
    for (let i = 0; i < 100000; i++) {
      testArray.push('this is a test string');
    }
    const { heapUsed } = process.memoryUsage();
    const startTime = Date.now();
    const result = await typeRegistry.marshal(context, testArray, {
      location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
      kind: 'array',
      type: (_builtinTypes || _load_builtinTypes()).stringType
    });
    const mem = process.memoryUsage().heapUsed - heapUsed;
    // eslint-disable-next-line no-console
    console.log('time taken: %d seconds', (Date.now() - startTime) / 1000);
    // eslint-disable-next-line no-console
    console.log('memory used: %d', mem);

    // 10MB is a very reasonable upper bound.
    // In contrast, using promises takes 152MB!
    expect(result).toEqual(testArray);
    expect(mem).toBeLessThan(10 * 1024 * 1024);
  });

  it('works for parameter names same name as members from Object.prototype', async () => {
    await (async () => {
      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      const parameters = [{
        name: 'hasOwnProperty',
        type: (_builtinTypes || _load_builtinTypes()).stringType
      }];

      const expected = 'Hello World';
      const results = await typeRegistry.unmarshalArguments(context, (await typeRegistry.marshalArguments(context, [expected], parameters)), parameters);
      expect(results).toEqual([expected]);
    })();
  });

  it('accepts undefined parameters for nullable/mixed/any types', async () => {
    await (async () => {
      if (!typeRegistry) {
        throw new Error('Invariant violation: "typeRegistry"');
      }

      const parameters = [{
        name: 'a',
        type: {
          location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
          kind: 'nullable',
          type: (_builtinTypes || _load_builtinTypes()).stringType
        }
      }, {
        name: 'b',
        type: (_builtinTypes || _load_builtinTypes()).anyType
      }, {
        name: 'c',
        type: (_builtinTypes || _load_builtinTypes()).mixedType
      }];

      const results = await typeRegistry.unmarshalArguments(context, {}, // JSON.stringify removes all undefined values.
      parameters);
      expect(results).toEqual([undefined, undefined, undefined]);
    })();
  });
});

const a1 = {
  location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
  kind: 'string-literal',
  value: 'bork'
};
const a2 = {
  location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
  kind: 'string-literal',
  value: 'bork!'
};
const a3 = {
  location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
  kind: 'number-literal',
  value: 42
};

const ValueTypeA = {
  location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
  kind: 'object',
  fields: [{
    location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
    name: 'valueA',
    optional: false,
    type: (_builtinTypes || _load_builtinTypes()).stringType
  }, {
    location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
    name: 'valueB',
    optional: false,
    type: {
      location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
      kind: 'nullable',
      type: {
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
        kind: 'named',
        name: 'ValueTypeB'
      }
    }
  }, {
    location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
    name: 'valueC',
    optional: true,
    type: (_builtinTypes || _load_builtinTypes()).booleanType
  }]
};