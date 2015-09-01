'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import assert from 'assert';
import vm from 'vm';

import type {Type, NullableType, ArrayType, ObjectType} from './types';

/*
 * This type represents a Transfomer function, which takes in a value, and either serializes
 * or deserializes it. Transformer's are added to a registry and indexed by the name of
 * the type they handle (eg: 'Date'). The second argument is the actual type object that represent
 * the value. Parameterized types like Array, or Object can use this to recursively call other
 * transformers.
 */
export type Transfomer = (value: any, type: Type) => Promise<any>;

/*
 * The TypeRegistry is a centralized place to register functions that serialize and deserialize
 * types. This allows for types defined in one service to include types from another service in
 * another file. It also allows the ability to add new primitives, ranging from Buffer to NuclideUri
 * that are not handled at the transport layer. The key concept is that marshalling functions can
 * be recursive, calling other marshalling functions, ending at the primitives.
 */
export default class TypeRegistry {
  /** Store marhsallers and and unmarshallers, index by the name of the type. */
  _marshallers: Map<string, Transfomer>;
  _unmarshallers: Map<string, Transfomer>;

  constructor() {
    this._marshallers = new Map();
    this._unmarshallers = new Map();

    this._registerPrimitives();
    this._registerSpecialTypes();
    this._registerContainers();

    // Register NullableType and NamedType
    this.registerType('nullable', async (value: any, type: NullableType) => {
      if (value === null || value === undefined) {
        return null;
      }
      return await this.marshal(value, type.type);
    }, async (value: any, type: NullableType) => {
      if (value === null || value === undefined) {
        return null;
      }
      return await this.unmarshal(value, type.type);
    });

    this.registerType('named', async (value: any, type: NamedType) => {
      return await this.marshal(value, { kind: type.name });
    }, async (value: any, type: NullableType) => {
      return await this.unmarshal(value, { kind: type.name });
    });

    this.registerType('void', value => null, value => null);
  }

  /**
   * Register a type by providing both a marshaller and an unmarshaller. The marshaller
   * will be called to transform the type before sending it out onto the network, while the
   * unmarshaller will be called on values incoming from the network.
   * @param typeName - The string name of the type that the provided marshaller / unmarshaller convert.
   * @param marshaller - Serialize the type.
   * @param unmarshaller - Deserialize the type.
   */
  registerType(typeName: string, marshaller: Transformer, unmarshaller: Transformer): void {
    if (this._marshallers.has(typeName) || this._unmarshallers.has(typeName)) {
      throw new Error(`A type by the name ${typeName} has already been registered.`);
    }
    this._marshallers.set(typeName, marshaller);
    this._unmarshallers.set(typeName, unmarshaller);
  }

  /**
   * Helper function for registering the marashaller/unmarshaller for a type alias.
   * @param name - The name of the alias type.
   * @param type - The type the the alias represents.
   */
  registerAlias(name: string, type: Type): void {
    this.registerType(name, value => this.marshal(value, type),
      value => this.unmarshal(value, type));
  }

  /**
   * Marshal an object using the appropriate marshal function.
   * @param value - The value to be marshalled.
   * @param type - The type object (used to find the appropriate function).
   */
  marshal(value: any, type: Type): Promise<any> {
    if (!this._marshallers.has(type.kind)) {
      throw new Error(`No marshaller found for type ${type.kind}.`);
    }
    return this._marshallers.get(type.kind)(value, type);
  }

  /**
   * Unmarshal and object using the appropriate unmarshal function.
   * @param value - The value to be marshalled.
   * @param type - The type object (used to find the appropriate function).
   */
  unmarshal(value: any, type: Type): Promise<any> {
    if (!this._unmarshallers.has(type.kind)) {
      throw new Error(`No unmarshaller found for type ${type.kind}.`);
    }
    return this._unmarshallers.get(type.kind)(value, type);
  }

  _registerPrimitives(): void {
    // Since string, number, and boolean are JSON primitives,
    // they require no marshalling. Instead, simply create wrapped transformers
    // that assert the type of their argument.
    var stringTransformer = async arg => {
      // Unbox argument.
      arg = (arg instanceof String) ? arg.valueOf() : arg;
      assert(typeof arg === 'string', 'Expected a string argument');
      return arg;
    };
    var numberTransformer = async arg => {
      // Unbox argument.
      if (arg instanceof Number) {
        arg = arg.valueOf();
      }
      assert(typeof arg === 'number', 'Expected a number argument');
      return arg;
    };
    var booleanTransformer = async arg => {
      // Unbox argument
      if (arg instanceof Boolean) {
        arg = arg.valueOf();
      }
      assert(typeof arg === 'boolean', 'Expected a boolean argument');
      return arg;
    };

    // Register these transformers
    this.registerType('string', stringTransformer, stringTransformer);
    this.registerType('number', numberTransformer, numberTransformer);
    this.registerType('boolean', booleanTransformer, booleanTransformer);
  }

  _registerSpecialTypes(): void {
    // Serialize / Deserialize Javascript Date objects
    this.registerType('Date', async date => {
      assert(date instanceof Date, 'Expected date argument.');
      return date.toJSON();
    }, async dateStr => {
      // Unbox argument.
      dateStr = (dateStr instanceof String) ? dateStr.valueOf() : dateStr;

      assert(typeof dateStr === 'string', 'Expeceted a string argument.');
      return new Date(dateStr);
    });

    // Serialize / Deserialize RegExp objects
    this.registerType('RegExp', async regexp => {
      assert(regexp instanceof RegExp, 'Expected a RegExp object as an argument');
      return regexp.toString();
    }, async regStr => {
      // Unbox argument.
      regStr = (regStr instanceof String) ? regStr.valueOf() : regStr;

      assert(typeof regStr === 'string', 'Expected a string argument.');
      return vm.runInThisContext(regStr);
    });

    // Serialize / Deserialize Buffer objects through Base64 strings
    this.registerType('Buffer', async buffer => {
      assert(buffer instanceof Buffer, 'Expected a buffer argument.');
      return buffer.toString('base64');
    }, async base64string => {
      // Unbox argument.
      base64string = (base64string instanceof String) ? base64string.valueOf() : base64string;

      assert(typeof base64string === 'string', `Expected a base64 string. Not ${typeof base64string}`);
      return new Buffer(base64string, 'base64');
    });
  }

  _registerContainers(): void {
    // Serialize / Deserialize Arrays.
    this.registerType('array', async (value: any, type: ArrayType) => {
      assert(value instanceof Array, 'Expected an object of type Array.');
      return await Promise.all(value.map(elem => this.marshal(elem, type.type)));
    }, async (value: any, type: ArrayType) => {
      assert(value instanceof Array, 'Expected an object of type Array.');
      return await Promise.all(value.map(elem => this.unmarshal(elem, type.type)));
    });

    // Serialize and Deserialize Objects.
    this.registerType('object', async (obj: any, type: ObjectType) => {
      assert(typeof obj === 'object', 'Expected an argument of type object.');
      var newObj = {}; // Create a new object so we don't mutate the original one.
      await Promise.all(type.fields.map(async prop => {
        // Check if the source object has this key.
        if (obj.hasOwnProperty(prop.name)) {
          newObj[prop.name] = await this.marshal(obj[prop.name], prop.type);
        } else {
          // If the property is optional, it's okay for it to be missing.
          if (!prop.optional) {
            throw new Error(`Source object is missing property ${prop.name}.`);
          }
        }
      }));
      return newObj;
    }, async (obj: any, type: ObjectType) => {
      assert(typeof obj === 'object', 'Expected an argument of type object.');
      var newObj = {}; // Create a new object so we don't mutate the original one.
      await Promise.all(type.fields.map(async prop => {
        // Check if the source object has this key.
        if (obj.hasOwnProperty(prop.name)) {
          newObj[prop.name] = await this.unmarshal(obj[prop.name], prop.type);
        } else {
          // If the property is optional, it's okay for it to be missing.
          if (!prop.optional) {
            throw new Error(`Source object is missing property ${prop.name}.`);
          }
        }
      }));
      return newObj;
    });

    // Serialize / Deserialize Sets.
    this.registerType('set', async (value: any, type: SetType) => {
      assert(value instanceof Set, 'Expected an object of type Set.');
      var serializePromises = [];
      for (var elem of value) {
        serializePromises.push(this.marshal(elem, type.type));
      }
      return await Promise.all(serializePromises);
    }, async (value: any, type: SetType) => {
      assert(value instanceof Array, 'Expected an object of type Array.');
      var elements = await Promise.all(value.map(elem => this.unmarshal(elem, type.type)));
      return new Set(elements);
    });

    // Serialize / Deserialize Maps.
    this.registerType('map', async (map: Map, type: MapType) => {
      assert(map instanceof Map, 'Expected an object of type Set.');
      var serializePromises = [];
      for (var [key, value] of map) {
        serializePromises.push(Promise.all([
          this.marshal(key, type.keyType),
          this.marshal(value, type.valueType),
        ]));
      }
      return await Promise.all(serializePromises);
    }, async (serialized: any, type: MapType) => {
      assert(serialized instanceof Array, 'Expected an object of type Array.');
      var entries = await Promise.all(
        serialized.map(entry => Promise.all([
          this.unmarshal(entry[0], type.keyType),
          this.unmarshal(entry[1], type.valueType),
        ]))
      );
      return new Map(entries);
    });
  }
}
