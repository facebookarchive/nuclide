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
import invariant from 'assert';
import vm from 'vm';
import fs from 'fs';

import type {Type} from './types';

/*
 * This type represents a Transformer function, which takes in a value, and either serializes
 * or deserializes it. Transformer's are added to a registry and indexed by the name of
 * the type they handle (eg: 'Date'). The second argument is the actual type object that represent
 * the value. Parameterized types like Array, or Object can use this to recursively call other
 * transformers.
 */
export type Transformer = (value: any, type: Type) => Promise<any>;

function statsToObject(stats: fs.Stats): Object {
  const result = {
    dev: stats.dev,
    mode: stats.mode,
    nlink: stats.nlink,
    uid: stats.uid,
    gid: stats.gid,
    rdev: stats.rdev,
    blksize: stats.blksize,
    ino: stats.ino,
    size: stats.size,
    blocks: stats.blocks,
    atime: stats.atime.toJSON(),
    mtime: stats.mtime.toJSON(),
    ctime: stats.ctime.toJSON(),
  };

  if (stats.birthtime) {
    return {...result, birthtime: stats.birthtime.toJSON() };
  }

  return result;
}

function objectToStats(jsonStats: Object): fs.Stats {
  var stats = new fs.Stats();

  stats.dev = jsonStats.dev;
  stats.mode = jsonStats.mode;
  stats.nlink = jsonStats.nlink;
  stats.uid = jsonStats.uid;
  stats.gid = jsonStats.gid;
  stats.rdev = jsonStats.rdev;
  stats.blksize = jsonStats.blksize;
  stats.ino = jsonStats.ino;
  stats.size = jsonStats.size;
  stats.blocks = jsonStats.blocks;
  stats.atime = new Date(jsonStats.atime);
  stats.mtime = new Date(jsonStats.mtime);
  stats.ctime = new Date(jsonStats.ctime);

  if (jsonStats.birthtime) {
    // $FlowIssue
    stats.birthtime = new Date(jsonStats.birthtime);
  }

  return stats;
}

/*
 * The TypeRegistry is a centralized place to register functions that serialize and deserialize
 * types. This allows for types defined in one service to include types from another service in
 * another file. It also allows the ability to add new primitives, ranging from Buffer to NuclideUri
 * that are not handled at the transport layer. The key concept is that marshalling functions can
 * be recursive, calling other marshalling functions, ending at the primitives.
 */
export default class TypeRegistry {
  /** Store marhsallers and and unmarshallers, index by the name of the type. */
  _marshallers: Map<string, Transformer>;
  _unmarshallers: Map<string, Transformer>;

  constructor() {
    this._marshallers = new Map();
    this._unmarshallers = new Map();

    this._registerPrimitives();
    this._registerSpecialTypes();
    this._registerContainers();

    // Register NullableType and NamedType
    this.registerType('nullable', async (value: any, type: Type) => {
      if (value === null || value === undefined || type.kind !== 'nullable') {
        return null;
      }
      return await this.marshal(value, type.type);
    }, async (value: any, type: Type) => {
      if (value === null || value === undefined || type.kind !== 'nullable') {
        return null;
      }
      return await this.unmarshal(value, type.type);
    });

    this.registerType('named', async (value: any, type: Type) => {
      invariant(type.kind === 'named');
      // $FlowFixMe - figure out how to represent custom types as `Type`.
      return await this.marshal(value, {kind: type.name});
    }, async (value: any, type: Type) => {
      invariant(type.kind === 'named');
      // $FlowFixMe - figure out how to represent custom types as `Type`.
      return await this.unmarshal(value, {kind: type.name});
    });

    this.registerType(
      'void',
      (value, type) => Promise.resolve(null),
      (value, type) => Promise.resolve(null));
  }

  /**
   * Register a type by providing both a marshaller and an unmarshaller. The marshaller
   * will be called to transform the type before sending it out onto the network, while the
   * unmarshaller will be called on values incoming from the network.
   * @param typeName - The string name of the type that the provided marshallers convert.
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
    // We assume an 'any' type requires no marshalling.
    var anyTransformer = async arg => arg;

    // Register these transformers
    this.registerType('string', stringTransformer, stringTransformer);
    this.registerType('number', numberTransformer, numberTransformer);
    this.registerType('boolean', booleanTransformer, booleanTransformer);
    this.registerType('any', anyTransformer, anyTransformer);
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
      // $FlowIssue - flesh out the vm module.
      return vm.runInThisContext(regStr);
    });

    // Serialize / Deserialize Buffer objects through Base64 strings
    this.registerType('Buffer', async buffer => {
      assert(buffer instanceof Buffer, 'Expected a buffer argument.');
      return buffer.toString('base64');
    }, async base64string => {
      // Unbox argument.
      base64string = (base64string instanceof String) ? base64string.valueOf() : base64string;

      assert(
        typeof base64string === 'string',
        `Expected a base64 string. Not ${typeof base64string}`);
      return new Buffer(base64string, 'base64');
    });

    // fs.Stats
    this.registerType('fs.Stats', async stats => {
      assert(stats instanceof fs.Stats);
      return JSON.stringify(statsToObject(stats));
    }, async json => {
      assert(typeof json === 'string');
      return objectToStats(JSON.parse(json));
    });
  }

  _registerContainers(): void {
    // Serialize / Deserialize Arrays.
    this.registerType('array', async (value: any, type: Type) => {
      assert(value instanceof Array, 'Expected an object of type Array.');
      invariant(type.kind === 'array');
      var elemType = type.type;
      return await Promise.all(value.map(elem => this.marshal(elem, elemType)));
    }, async (value: any, type: Type) => {
      assert(value instanceof Array, 'Expected an object of type Array.');
      invariant(type.kind === 'array');
      var elemType = type.type;
      return await Promise.all(value.map(elem => this.unmarshal(elem, elemType)));
    });

    // Serialize and Deserialize Objects.
    this.registerType('object', async (obj: any, type: Type) => {
      assert(typeof obj === 'object', 'Expected an argument of type object.');
      invariant(type.kind === 'object');
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
    }, async (obj: any, type: Type) => {
      assert(typeof obj === 'object', 'Expected an argument of type object.');
      invariant(type.kind === 'object');
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
    this.registerType('set', async (value: any, type: Type) => {
      invariant(type.kind === 'set');
      assert(value instanceof Set, 'Expected an object of type Set.');
      var serializePromises = [];
      for (var elem of value) {
        serializePromises.push(this.marshal(elem, type.type));
      }
      return await Promise.all(serializePromises);
    }, async (value: any, type: Type) => {
      assert(value instanceof Array, 'Expected an object of type Array.');
      invariant(type.kind === 'set');
      var elemType = type.type;
      var elements = await Promise.all(value.map(elem => this.unmarshal(elem, elemType)));
      return new Set(elements);
    });

    // Serialize / Deserialize Maps.
    this.registerType('map', async (map: Map, type: Type) => {
      assert(map instanceof Map, 'Expected an object of type Set.');
      invariant(type.kind === 'map');
      var serializePromises = [];
      for (var [key, value] of map) {
        serializePromises.push(Promise.all([
          this.marshal(key, type.keyType),
          this.marshal(value, type.valueType),
        ]));
      }
      return await Promise.all(serializePromises);
    }, async (serialized: any, type: Type) => {
      assert(serialized instanceof Array, 'Expected an object of type Array.');
      invariant(type.kind === 'map');
      var keyType = type.keyType;
      var valueType = type.valueType;
      var entries = await Promise.all(
        serialized.map(entry => Promise.all([
          this.unmarshal(entry[0], keyType),
          this.unmarshal(entry[1], valueType),
        ]))
      );
      return new Map(entries);
    });

    // Serialize / Deserialize Tuples.
    this.registerType('tuple', async (value: any, type: Type) => {
      // Assert the length of the array.
      assert(Array.isArray(value), 'Expected an object of type Array.');
      invariant(type.kind === 'tuple');
      var types = type.types;
      assert(value.length === types.length, `Expected tuple of length ${types.length}.`);

      // Convert all of the elements through the correct marshaller.
      return await Promise.all(value.map((elem, i) =>
        this.marshal(elem, types[i])));
    }, async (value: any, type: Type) => {
      // Assert the length of the array.
      assert(Array.isArray(value), 'Expected an object of type Array.');
      invariant(type.kind === 'tuple');
      var types = type.types;
      assert(value.length === types.length, `Expected tuple of length ${types.length}.`);

      // Convert all of the elements through the correct unmarshaller.
      return await Promise.all(value.map((elem, i) =>
        this.unmarshal(elem, types[i])));
    });
  }
}
