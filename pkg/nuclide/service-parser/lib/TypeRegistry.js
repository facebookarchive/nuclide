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

import {array} from '../../commons';

import type {
  Type,
  ObjectType,
  ObjectField,
  UnionType,
} from './types';
import {objectType, dateType, regExpType, bufferType, fsStatsType} from './builtin-types';


/*
 * This type represents a Transformer function, which takes in a value, and either serializes
 * or deserializes it. Transformer's are added to a registry and indexed by the name of
 * the type they handle (eg: 'Date'). The second argument is the actual type object that represent
 * the value. Parameterized types like Array, or Object can use this to recursively call other
 * transformers.
 *
 * In the interest of a performance, a transformer should only return a Promise if necessary.
 * (Promise objects and Promise.all are very expensive operations in large numbers).
 */
export type Transformer<T> = (value: T, type: Type) => (T | Promise<T>);
export type NamedTransformer<T> = (value: T) => (T | Promise<T>);

// Equivalent to Promise.all, but avoids wrappers if nothing is actually a promise.
// Input must be homogenously typed.
function smartPromiseAll<T>(arr: Array<T>): Array<T> | Promise<Array<T>> {
  if (arr.length === 0 || !(arr[0] instanceof Promise)) {
    return arr;
  }
  return Promise.all(arr);
}

// Same as the above, but works for non-homogenous input.
function checkedSmartPromiseAll(arr: Array<any>): Array<any> | Promise<Array<any>> {
  for (const elem of arr) {
    if (elem instanceof Promise) {
      return Promise.all(arr);
    }
  }
  return arr;
}

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
  const stats = new fs.Stats();

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
  /** Store marhsallers and and unmarshallers, index by the kind of the type. */
  _kindMarshallers: Map<string, {
      marshaller: Transformer;
      unmarshaller: Transformer;
    }>;

  /** Store marhsallers and and unmarshallers, index by the name of the type. */
  _namedMarshallers: Map<string, {
      marshaller: NamedTransformer;
      unmarshaller: NamedTransformer;
    }>;

  constructor() {
    this._kindMarshallers = new Map();
    this._namedMarshallers = new Map();

    this._registerPrimitives();
    this._registerSpecialTypes();
    this._registerContainers();
    this._registerLiterals();
    this._registerUnions();

    // Register NullableType and NamedType
    this._registerKind('nullable', (value: any, type: Type) => {
      if (value === null || value === undefined || type.kind !== 'nullable') {
        return null;
      }
      return this._marshal(value, type.type);
    }, (value: any, type: Type) => {
      if (value === null || value === undefined || type.kind !== 'nullable') {
        return null;
      }
      return this._unmarshal(value, type.type);
    });

    this._registerKind('named', (value: any, type: Type) => {
      invariant(type.kind === 'named');
      const namedMarshaller = this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error(`No marshaller found for named type ${type.name}.`);
      }
      return namedMarshaller.marshaller(value);
    }, (value: any, type: Type) => {
      invariant(type.kind === 'named');
      const namedMarshaller = this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error(`No marshaller found for named type ${type.name}.`);
      }
      return namedMarshaller.unmarshaller(value);
    });

    this._registerKind(
      'void',
      (value, type) => Promise.resolve(null),
      (value, type) => Promise.resolve(null));
  }

  _registerKind(kind: string, marshaller: Transformer, unmarshaller: Transformer): void {
    invariant(!this._kindMarshallers.has(kind));
    this._kindMarshallers.set(kind, {marshaller, unmarshaller});
  }

  /**
   * Register a type by providing both a marshaller and an unmarshaller. The marshaller
   * will be called to transform the type before sending it out onto the network, while the
   * unmarshaller will be called on values incoming from the network.
   * @param typeName - The string name of the type that the provided marshallers convert.
   * @param marshaller - Serialize the type.
   * @param unmarshaller - Deserialize the type.
   */
  registerType(
    typeName: string,
    marshaller: NamedTransformer,
    unmarshaller: NamedTransformer,
  ): void {
    if (this._namedMarshallers.has(typeName)) {
      throw new Error(`A type by the name ${typeName} has already been registered.`);
    }
    this._namedMarshallers.set(typeName, {marshaller, unmarshaller});
  }

  /**
   * Helper function for registering the marashaller/unmarshaller for a type alias.
   * @param name - The name of the alias type.
   * @param type - The type the the alias represents.
   */
  registerAlias(name: string, type: Type): void {
    this.registerType(name, value => this._marshal(value, type),
      value => this._unmarshal(value, type));
  }

  /**
   * Marshal an object using the appropriate marshal function.
   * Ensures the result is actually a Promise.
   * @param value - The value to be marshalled.
   * @param type - The type object (used to find the appropriate function).
   */
  marshal(value: any, type: Type): Promise<any> {
    return Promise.resolve(this._marshal(value, type));
  }

  _marshal(value: any, type: Type): any {
    const kindMarshaller = this._kindMarshallers.get(type.kind);
    if (kindMarshaller == null) {
      throw new Error(`No marshaller found for type kind ${type.kind}.`);
    }
    return kindMarshaller.marshaller(value, type);
  }

  /**
   * Unmarshal and object using the appropriate unmarshal function.
   * Ensures the result is actually a Promise.
   * @param value - The value to be marshalled.
   * @param type - The type object (used to find the appropriate function).
   */
  unmarshal(value: any, type: Type): Promise<any> {
    return Promise.resolve(this._unmarshal(value, type));
  }

  _unmarshal(value: any, type: Type): any {
    const kindMarshaller = this._kindMarshallers.get(type.kind);
    if (kindMarshaller == null) {
      throw new Error(`No unmarshaller found for type kind ${type.kind}.`);
    }
    return kindMarshaller.unmarshaller(value, type);
  }

  _registerPrimitives(): void {
    // Since string, number, and boolean are JSON primitives,
    // they require no marshalling. Instead, simply create wrapped transformers
    // that assert the type of their argument.
    const stringTransformer = arg => {
      // Unbox argument.
      arg = (arg instanceof String) ? arg.valueOf() : arg;
      assert(typeof arg === 'string', 'Expected a string argument');
      return arg;
    };
    const numberTransformer = arg => {
      // Unbox argument.
      if (arg instanceof Number) {
        arg = arg.valueOf();
      }
      assert(typeof arg === 'number', 'Expected a number argument');
      return arg;
    };
    const booleanTransformer = arg => {
      // Unbox argument
      if (arg instanceof Boolean) {
        arg = arg.valueOf();
      }
      assert(typeof arg === 'boolean', 'Expected a boolean argument');
      return arg;
    };
    // We assume an 'any' and 'mixed' types require no marshalling.
    const identityTransformer = arg => arg;

    // Register these transformers
    this._registerKind('string', stringTransformer, stringTransformer);
    this._registerKind('number', numberTransformer, numberTransformer);
    this._registerKind('boolean', booleanTransformer, booleanTransformer);
    this._registerKind('any', identityTransformer, identityTransformer);
    this._registerKind('mixed', identityTransformer, identityTransformer);
  }

  _registerLiterals(): void {
    const literalTransformer = (arg, type) => {
      invariant(type.kind === 'string-literal' || type.kind === 'number-literal' ||
          type.kind === 'boolean-literal');
      invariant(arg === type.value);
      return arg;
    };
    this._registerKind('string-literal', literalTransformer, literalTransformer);
    this._registerKind('number-literal', literalTransformer, literalTransformer);
    this._registerKind('boolean-literal', literalTransformer, literalTransformer);
  }

  _registerUnions(): void {
    const unionLiteralTransformer = (arg, type) => {
      invariant(type.kind === 'union');
      const alternate = array.find(type.types, element => {
        invariant(element.kind === 'string-literal' || element.kind === 'number-literal'
            || element.kind === 'boolean-literal');
        return (arg === element.value);
      });
      invariant(alternate);
      // This is just the literal transformer inlined ...
      return arg;
    };
    const unionObjectMarshaller = (arg, type) => {
      invariant(type.kind === 'union');
      return this._marshal(arg, findAlternate(arg, type));
    };
    const unionObjectUnmarshaller = (arg, type) => {
      invariant(type.kind === 'union');
      return this._unmarshal(arg, findAlternate(arg, type));
    };
    const unionMarshaller = (arg, type) => {
      invariant(type.kind === 'union');
      if (type.discriminantField != null) {
        return unionObjectMarshaller(arg, type);
      } else {
        return unionLiteralTransformer(arg, type);
      }
    };
    const unionUnmarshaller = (arg, type) => {
      invariant(type.kind === 'union');
      if (type.discriminantField != null) {
        return unionObjectUnmarshaller(arg, type);
      } else {
        return unionLiteralTransformer(arg, type);
      }
    };
    this._registerKind('union', unionMarshaller, unionUnmarshaller);
  }

  _registerSpecialTypes(): void {
    // Serialize / Deserialize any Object type
    this.registerType(objectType.name, object => {
      assert(object != null && typeof object === 'object', 'Expected Object argument.');
      return object;
    }, object => {
      assert(object != null && typeof object === 'object', 'Expected Object argument.');
      return object;
    });

    // Serialize / Deserialize Javascript Date objects
    this.registerType(dateType.name, date => {
      assert(date instanceof Date, 'Expected date argument.');
      return date.toJSON();
    }, dateStr => {
      // Unbox argument.
      dateStr = (dateStr instanceof String) ? dateStr.valueOf() : dateStr;

      assert(typeof dateStr === 'string', 'Expeceted a string argument.');
      return new Date(dateStr);
    });

    // Serialize / Deserialize RegExp objects
    this.registerType(regExpType.name, regexp => {
      assert(regexp instanceof RegExp, 'Expected a RegExp object as an argument');
      return regexp.toString();
    }, regStr => {
      // Unbox argument.
      regStr = (regStr instanceof String) ? regStr.valueOf() : regStr;

      assert(typeof regStr === 'string', 'Expected a string argument.');
      // $FlowIssue - flesh out the vm module.
      return vm.runInThisContext(regStr);
    });

    // Serialize / Deserialize Buffer objects through Base64 strings
    this.registerType(bufferType.name, buffer => {
      assert(buffer instanceof Buffer, 'Expected a buffer argument.');
      return buffer.toString('base64');
    }, base64string => {
      // Unbox argument.
      base64string = (base64string instanceof String) ? base64string.valueOf() : base64string;

      assert(
        typeof base64string === 'string',
        `Expected a base64 string. Not ${typeof base64string}`);
      return new Buffer(base64string, 'base64');
    });

    // fs.Stats
    this.registerType(fsStatsType.name, stats => {
      assert(stats instanceof fs.Stats);
      return JSON.stringify(statsToObject(stats));
    }, json => {
      assert(typeof json === 'string');
      return objectToStats(JSON.parse(json));
    });
  }

  _registerContainers(): void {
    // Serialize / Deserialize Arrays.
    this._registerKind('array', (value: any, type: Type) => {
      assert(value instanceof Array, 'Expected an object of type Array.');
      invariant(type.kind === 'array');
      const elemType = type.type;
      return smartPromiseAll(value.map(elem => this._marshal(elem, elemType)));
    }, (value: any, type: Type) => {
      assert(value instanceof Array, 'Expected an object of type Array.');
      invariant(type.kind === 'array');
      const elemType = type.type;
      return smartPromiseAll(value.map(elem => this._unmarshal(elem, elemType)));
    });

    // Serialize and Deserialize Objects.
    this._registerKind('object', (obj: any, type: Type) => {
      assert(typeof obj === 'object', 'Expected an argument of type object.');
      invariant(type.kind === 'object');
      const newObj = {}; // Create a new object so we don't mutate the original one.
      const promise = checkedSmartPromiseAll(type.fields.map(prop => {
        // Check if the source object has this key.
        if (obj.hasOwnProperty(prop.name)) {
          const value = this._marshal(obj[prop.name], prop.type);
          if (value instanceof Promise) {
            return value.then(result => newObj[prop.name] = result);
          } else {
            newObj[prop.name] = value;
          }
        } else if (!prop.optional) {
          // If the property is optional, it's okay for it to be missing.
          throw new Error(`Source object is missing property ${prop.name}.`);
        }
      }));
      if (promise instanceof Promise) {
        return promise.then(() => newObj);
      }
      return newObj;
    }, (obj: any, type: Type) => {
      assert(typeof obj === 'object', 'Expected an argument of type object.');
      invariant(type.kind === 'object');
      const newObj = {}; // Create a new object so we don't mutate the original one.
      const promise = checkedSmartPromiseAll(type.fields.map(prop => {
        // Check if the source object has this key.
        if (obj.hasOwnProperty(prop.name)) {
          const value = this._unmarshal(obj[prop.name], prop.type);
          if (value instanceof Promise) {
            return value.then(result => newObj[prop.name] = result);
          } else {
            newObj[prop.name] = value;
          }
        } else if (!prop.optional) {
          // If the property is optional, it's okay for it to be missing.
          throw new Error(`Source object is missing property ${prop.name}.`);
        }
      }));
      if (promise instanceof Promise) {
        return promise.then(() => newObj);
      }
      return newObj;
    });

    // Serialize / Deserialize Sets.
    this._registerKind('set', (value: any, type: Type) => {
      invariant(type.kind === 'set');
      assert(value instanceof Set, 'Expected an object of type Set.');
      const serializePromises = [];
      for (const elem of value) {
        serializePromises.push(this._marshal(elem, type.type));
      }
      return smartPromiseAll(serializePromises);
    }, async (value: any, type: Type) => {
      assert(value instanceof Array, 'Expected an object of type Array.');
      invariant(type.kind === 'set');
      const elemType = type.type;
      const elements = await smartPromiseAll(value.map(elem => this._unmarshal(elem, elemType)));
      return new Set(elements);
    });

    // Serialize / Deserialize Maps.
    this._registerKind('map', (map: Map, type: Type) => {
      assert(map instanceof Map, 'Expected an object of type Set.');
      invariant(type.kind === 'map');
      const serializePromises = [];
      for (const [key, value] of map) {
        serializePromises.push(checkedSmartPromiseAll([
          this._marshal(key, type.keyType),
          this._marshal(value, type.valueType),
        ]));
      }
      return smartPromiseAll(serializePromises);
    }, async (serialized: any, type: Type) => {
      assert(serialized instanceof Array, 'Expected an object of type Array.');
      invariant(type.kind === 'map');
      const keyType = type.keyType;
      const valueType = type.valueType;
      const entries = await smartPromiseAll(
        serialized.map(entry => checkedSmartPromiseAll([
          this._unmarshal(entry[0], keyType),
          this._unmarshal(entry[1], valueType),
        ]))
      );
      return new Map(entries);
    });

    // Serialize / Deserialize Tuples.
    this._registerKind('tuple', (value: any, type: Type) => {
      // Assert the length of the array.
      assert(Array.isArray(value), 'Expected an object of type Array.');
      invariant(type.kind === 'tuple');
      const types = type.types;
      assert(value.length === types.length, `Expected tuple of length ${types.length}.`);

      // Convert all of the elements through the correct marshaller.
      return checkedSmartPromiseAll(value.map((elem, i) => this._marshal(elem, types[i])));
    }, (value: any, type: Type) => {
      // Assert the length of the array.
      assert(Array.isArray(value), 'Expected an object of type Array.');
      invariant(type.kind === 'tuple');
      const types = type.types;
      assert(value.length === types.length, `Expected tuple of length ${types.length}.`);

      // Convert all of the elements through the correct unmarshaller.
      return checkedSmartPromiseAll(value.map((elem, i) => this._unmarshal(elem, types[i])));
    });
  }
}

function getObjectFieldByName(type: ObjectType, fieldName: string): ObjectField {
  const result = array.find(type.fields, field => field.name === fieldName);
  invariant(result != null);
  return result;
}

function findAlternate(arg: Object, type: UnionType): ObjectType {
  const discriminantField = type.discriminantField;
  invariant(discriminantField != null);
  const discriminant = arg[discriminantField];
  invariant(discriminant != null);
  const alternates: Array<ObjectType> = (type.types: any);
  const result = array.find(alternates, alternate => {
    invariant(alternate.kind === 'object');
    const alternateType = getObjectFieldByName(alternate, discriminantField).type;
    invariant(alternateType.kind === 'string-literal' || alternateType.kind === 'number-literal'
        || alternateType.kind === 'boolean-literal');
    return alternateType.value === discriminant;
  });
  invariant(result != null);
  return result;
}
