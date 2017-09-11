'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeRegistry = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _assert = _interopRequireDefault(require('assert'));

var _vm = _interopRequireDefault(require('vm'));

var _fs = _interopRequireDefault(require('fs'));

var _builtinTypes;

function _load_builtinTypes() {
  return _builtinTypes = require('./builtin-types');
}

var _location;

function _load_location() {
  return _location = require('./location');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Equivalent to Promise.all, but avoids wrappers if nothing is actually a promise.
// Input must be homogenously typed.


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
function smartPromiseAll(arr) {
  if (arr.length === 0 || !(arr[0] instanceof Promise)) {
    return arr;
  }
  return Promise.all(arr);
}

// Same as the above, but works for non-homogenous input.
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

function checkedSmartPromiseAll(arr) {
  for (const elem of arr) {
    if (elem instanceof Promise) {
      return Promise.all(arr);
    }
  }
  return arr;
}

function canBeUndefined(type) {
  return type.kind === 'nullable' || type.kind === 'mixed' || type.kind === 'any';
}

function statsToObject(stats) {
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
    ctime: stats.ctime.toJSON()
  };

  if (stats.birthtime instanceof Date) {
    return Object.assign({}, result, { birthtime: stats.birthtime.toJSON() });
  }

  return result;
}

function objectToStats(jsonStats) {
  const stats = new _fs.default.Stats();

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
 *
 * The ObjectRegistry is opaque to the TypeRegistry and allows for adding per-connection
 * context to marshalling transformations.
 */
class TypeRegistry {
  /** Store marshallers and and unmarshallers, index by the kind of the type. */
  constructor(predefinedTypes) {
    this._kindMarshallers = new Map();
    this._namedMarshallers = new Map();

    this._registerPrimitives();
    this._registerSpecialTypes();
    this._registerContainers();
    this._registerLiterals();
    this._registerUnions();
    this._registerIntersections();

    // Register NullableType and NamedType
    this._registerKind('nullable', (value, type, context) => {
      if (!(type.kind === 'nullable')) {
        throw new Error('Invariant violation: "type.kind === \'nullable\'"');
      }

      if (value === null || value === undefined) {
        return value;
      }
      return this._marshal(context, value, type.type);
    }, (value, type, context) => {
      if (!(type.kind === 'nullable')) {
        throw new Error('Invariant violation: "type.kind === \'nullable\'"');
      }

      if (value === null || value === undefined) {
        return value;
      }
      return this._unmarshal(context, value, type.type);
    });

    this._registerKind('named', (value, type, context) => {
      if (!(type.kind === 'named')) {
        throw new Error('Invariant violation: "type.kind === \'named\'"');
      }

      const namedMarshaller = this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error(`No marshaller found for named type ${type.name}.`);
      }
      return namedMarshaller.marshaller(value, context);
    }, (value, type, context) => {
      if (!(type.kind === 'named')) {
        throw new Error('Invariant violation: "type.kind === \'named\'"');
      }

      const namedMarshaller = this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error(`No marshaller found for named type ${type.name}.`);
      }
      return namedMarshaller.unmarshaller(value, context);
    });

    this._registerKind('void', (value, type, context) => Promise.resolve(null), (value, type, context) => Promise.resolve(null));

    predefinedTypes.forEach(type => {
      this.registerPredefinedType(type.typeName, type.marshaller, type.unmarshaller);
    });
  }

  /** Store marshallers and and unmarshallers, index by the name of the type. */


  _registerKind(kind, marshaller, unmarshaller) {
    if (!!this._kindMarshallers.has(kind)) {
      throw new Error('Invariant violation: "!this._kindMarshallers.has(kind)"');
    }

    this._kindMarshallers.set(kind, {
      marshaller: makeKindMarshaller(kind, marshaller),
      unmarshaller: makeKindMarshaller(kind, unmarshaller)
    });
  }

  registerPredefinedType(typeName, marshaller, unmarshaller) {
    this.registerType(typeName, (_builtinTypes || _load_builtinTypes()).builtinLocation, marshaller, unmarshaller);
  }

  /**
   * Register a type by providing both a marshaller and an unmarshaller. The marshaller
   * will be called to transform the type before sending it out onto the network, while the
   * unmarshaller will be called on values incoming from the network.
   * @param typeName - The string name of the type that the provided marshallers convert.
   * @param marshaller - Serialize the type.
   * @param unmarshaller - Deserialize the type.
   */
  registerType(typeName, location, marshaller, unmarshaller) {
    const existingMarshaller = this._namedMarshallers.get(typeName);
    if (existingMarshaller != null) {
      // If the locations are equal then assume that the types are equal.
      if (!(0, (_location || _load_location()).locationsEqual)(existingMarshaller.location, location)) {
        throw new Error(`${(0, (_location || _load_location()).locationToString)(location)}: A type by the name ${typeName} has already` + ` been registered at ${(0, (_location || _load_location()).locationToString)(existingMarshaller.location)}.`);
      }
    } else {
      this._namedMarshallers.set(typeName, {
        location,
        marshaller: makeNamedMarshaller(typeName, marshaller),
        unmarshaller: makeNamedMarshaller(typeName, unmarshaller)
      });
    }
  }

  /**
   * Helper function for registering the marashaller/unmarshaller for a type alias.
   * @param name - The name of the alias type.
   * @param type - The type the the alias represents.
   */
  registerAlias(name, location, type) {
    this.registerType(name, location, (value, context) => this._marshal(context, value, type), (value, context) => this._unmarshal(context, value, type));
  }

  /**
   * Marshal an object using the appropriate marshal function.
   * Ensures the result is actually a Promise.
   * @param value - The value to be marshalled.
   * @param type - The type object (used to find the appropriate function).
   */
  marshal(context, value, type) {
    return Promise.resolve(this._marshal(context, value, type));
  }

  _marshal(context, value, type) {
    const kindMarshaller = this._kindMarshallers.get(type.kind);
    if (kindMarshaller == null) {
      throw new Error(`No marshaller found for type kind ${type.kind}.`);
    }
    return kindMarshaller.marshaller(value, type, context);
  }

  marshalArguments(context, args, argTypes) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const marshalledargs = yield Promise.all(argTypes.map(function (param, i) {
        return _this.marshal(context, args[i], param.type);
      }));
      const result = {};
      marshalledargs.forEach(function (arg, i) {
        if (!(typeof argTypes[i].name === 'string')) {
          throw new Error('Invariant violation: "typeof argTypes[i].name === \'string\'"');
        }

        result[argTypes[i].name] = arg;
      });
      return result;
    })();
  }

  /**
   * Unmarshal and object using the appropriate unmarshal function.
   * Ensures the result is actually a Promise.
   * @param value - The value to be marshalled.
   * @param type - The type object (used to find the appropriate function).
   */
  unmarshal(context, value, type) {
    return Promise.resolve(this._unmarshal(context, value, type));
  }

  unmarshalArguments(context, args, argTypes) {
    return Promise.all(argTypes.map((arg, i) => {
      if (!(Object.hasOwnProperty.call(args, arg.name) || canBeUndefined(arg.type))) {
        throw new Error(`unmarshalArguments: Missing argument: ${arg.name}`);
      }

      return this.unmarshal(context, args[arg.name], arg.type);
    }));
  }

  _unmarshal(context, value, type) {
    const kindMarshaller = this._kindMarshallers.get(type.kind);
    if (kindMarshaller == null) {
      throw new Error(`No unmarshaller found for type kind ${type.kind}.`);
    }
    return kindMarshaller.unmarshaller(value, type, context);
  }

  _registerPrimitives() {
    // Since string, number, and boolean are JSON primitives,
    // they require no marshalling. Instead, simply create wrapped transformers
    // that assert the type of their argument.
    const stringTransformer = arg_ => {
      let arg = arg_;
      // Unbox argument.
      arg = arg instanceof String ? arg.valueOf() : arg;
      (0, _assert.default)(typeof arg === 'string', 'Expected a string argument');
      return arg;
    };
    const numberMarshaller = arg_ => {
      let arg = arg_;
      // Unbox argument.
      if (arg instanceof Number) {
        arg = arg.valueOf();
      }
      (0, _assert.default)(typeof arg === 'number', 'Expected a number argument');
      if (!Number.isFinite(arg)) {
        if (arg === Number.NEGATIVE_INFINITY) {
          arg = 'NEGATIVE_INFINITY';
        } else if (arg === Number.POSITIVE_INFINITY) {
          arg = 'POSITIVE_INFINITY';
        } else {
          arg = 'NaN';
        }
      }
      return arg;
    };
    const numberUnmarshaller = arg_ => {
      let arg = arg_;
      if (typeof arg === 'string') {
        switch (arg) {
          case 'NEGATIVE_INFINITY':
            arg = Number.NEGATIVE_INFINITY;
            break;
          case 'POSITIVE_INFINITY':
            arg = Number.POSITIVE_INFINITY;
            break;
          case 'NaN':
            arg = Number.NaN;
            break;
          default:
            // This will assert below
            break;
        }
      } else if (arg instanceof Number) {
        arg = arg.valueOf();
      }
      (0, _assert.default)(typeof arg === 'number', 'Expected a number argument');
      return arg;
    };
    const booleanTransformer = arg_ => {
      let arg = arg_;
      // Unbox argument
      if (arg instanceof Boolean) {
        arg = arg.valueOf();
      }
      (0, _assert.default)(typeof arg === 'boolean', 'Expected a boolean argument');
      return arg;
    };
    // We assume an 'any' and 'mixed' types require no marshalling.
    const identityTransformer = arg => arg;

    // Register these transformers
    this._registerKind('string', stringTransformer, stringTransformer);
    this._registerKind('number', numberMarshaller, numberUnmarshaller);
    this._registerKind('boolean', booleanTransformer, booleanTransformer);
    this._registerKind('any', identityTransformer, identityTransformer);
    this._registerKind('mixed', identityTransformer, identityTransformer);
  }

  _registerLiterals() {
    const literalTransformer = (arg, type) => {
      if (!(type.kind === 'string-literal' || type.kind === 'number-literal' || type.kind === 'boolean-literal')) {
        throw new Error('Invariant violation: "type.kind === \'string-literal\' ||\\n          type.kind === \'number-literal\' ||\\n          type.kind === \'boolean-literal\'"');
      }

      if (!(arg === type.value)) {
        throw new Error('Invariant violation: "arg === type.value"');
      }

      return arg;
    };
    this._registerKind('string-literal', literalTransformer, literalTransformer);
    this._registerKind('number-literal', literalTransformer, literalTransformer);
    this._registerKind('boolean-literal', literalTransformer, literalTransformer);
  }

  _registerUnions() {
    const unionLiteralTransformer = (arg, type) => {
      if (!(type.kind === 'union')) {
        throw new Error('Invariant violation: "type.kind === \'union\'"');
      }

      const alternate = type.types.find(element => {
        if (!(element.kind === 'string-literal' || element.kind === 'number-literal' || element.kind === 'boolean-literal')) {
          throw new Error('Invariant violation: "element.kind === \'string-literal\' ||\\n            element.kind === \'number-literal\' ||\\n            element.kind === \'boolean-literal\'"');
        }

        return arg === element.value;
      });

      if (!alternate) {
        throw new Error('Invariant violation: "alternate"');
      }
      // This is just the literal transformer inlined ...


      return arg;
    };
    const unionObjectMarshaller = (arg, type, context) => {
      if (!(type.kind === 'union')) {
        throw new Error('Invariant violation: "type.kind === \'union\'"');
      }

      return this._marshal(context, arg, findAlternate(arg, type));
    };
    const unionObjectUnmarshaller = (arg, type, context) => {
      if (!(type.kind === 'union')) {
        throw new Error('Invariant violation: "type.kind === \'union\'"');
      }

      return this._unmarshal(context, arg, findAlternate(arg, type));
    };
    const unionMarshaller = (arg, type, context) => {
      if (!(type.kind === 'union')) {
        throw new Error('Invariant violation: "type.kind === \'union\'"');
      }

      if (type.discriminantField != null) {
        return unionObjectMarshaller(arg, type, context);
      } else {
        return unionLiteralTransformer(arg, type);
      }
    };
    const unionUnmarshaller = (arg, type, context) => {
      if (!(type.kind === 'union')) {
        throw new Error('Invariant violation: "type.kind === \'union\'"');
      }

      if (type.discriminantField != null) {
        return unionObjectUnmarshaller(arg, type, context);
      } else {
        return unionLiteralTransformer(arg, type);
      }
    };
    this._registerKind('union', unionMarshaller, unionUnmarshaller);
  }

  _registerIntersections() {
    const intersectionMarshaller = (arg, type, context) => {
      if (!(type.kind === 'intersection')) {
        throw new Error('Invariant violation: "type.kind === \'intersection\'"');
      }

      if (!(type.flattened != null)) {
        throw new Error('Invariant violation: "type.flattened != null"');
      }

      return this._marshal(context, arg, type.flattened);
    };
    const intersectionUnmarshaller = (arg, type, context) => {
      if (!(type.kind === 'intersection')) {
        throw new Error('Invariant violation: "type.kind === \'intersection\'"');
      }

      if (!(type.flattened != null)) {
        throw new Error('Invariant violation: "type.flattened != null"');
      }

      return this._unmarshal(context, arg, type.flattened);
    };
    this._registerKind('intersection', intersectionMarshaller, intersectionUnmarshaller);
  }

  _registerSpecialTypes() {
    // Serialize / Deserialize any Object type
    this.registerType((_builtinTypes || _load_builtinTypes()).objectType.name, (_builtinTypes || _load_builtinTypes()).builtinLocation, object => {
      (0, _assert.default)(object != null && typeof object === 'object', 'Expected Object argument.');
      return object;
    }, object => {
      (0, _assert.default)(object != null && typeof object === 'object', 'Expected Object argument.');
      return object;
    });

    // Serialize / Deserialize Javascript Date objects
    this.registerType((_builtinTypes || _load_builtinTypes()).dateType.name, (_builtinTypes || _load_builtinTypes()).builtinLocation, date => {
      (0, _assert.default)(date instanceof Date, 'Expected date argument.');
      return date.toJSON();
    }, dateStr_ => {
      let dateStr = dateStr_;
      // Unbox argument.
      dateStr = dateStr instanceof String ? dateStr.valueOf() : dateStr;

      (0, _assert.default)(typeof dateStr === 'string', 'Expeceted a string argument.');
      return new Date(dateStr);
    });

    // Serialize / Deserialize RegExp objects
    this.registerType((_builtinTypes || _load_builtinTypes()).regExpType.name, (_builtinTypes || _load_builtinTypes()).builtinLocation, regexp => {
      (0, _assert.default)(regexp instanceof RegExp, 'Expected a RegExp object as an argument');
      return regexp.toString();
    }, regStr_ => {
      let regStr = regStr_;
      // Unbox argument.
      regStr = regStr instanceof String ? regStr.valueOf() : regStr;

      (0, _assert.default)(typeof regStr === 'string', 'Expected a string argument.');
      return _vm.default.runInThisContext(regStr);
    });

    // Serialize / Deserialize Buffer objects through Base64 strings
    this.registerType((_builtinTypes || _load_builtinTypes()).bufferType.name, (_builtinTypes || _load_builtinTypes()).builtinLocation, buffer => {
      (0, _assert.default)(buffer instanceof Buffer, 'Expected a buffer argument.');
      return buffer.toString('base64');
    }, base64string_ => {
      let base64string = base64string_;
      // Unbox argument.
      base64string = base64string instanceof String ? base64string.valueOf() : base64string;

      (0, _assert.default)(typeof base64string === 'string', `Expected a base64 string. Not ${typeof base64string}`);
      return new Buffer(base64string, 'base64');
    });

    // fs.Stats
    this.registerType((_builtinTypes || _load_builtinTypes()).fsStatsType.name, (_builtinTypes || _load_builtinTypes()).builtinLocation, stats => {
      (0, _assert.default)(stats instanceof _fs.default.Stats);
      return JSON.stringify(statsToObject(stats));
    }, json => {
      (0, _assert.default)(typeof json === 'string');
      return objectToStats(JSON.parse(json));
    });
  }

  _registerContainers() {
    // Serialize / Deserialize Arrays.
    this._registerKind('array', (value, type, context) => {
      (0, _assert.default)(value instanceof Array, 'Expected an object of type Array.');

      if (!(type.kind === 'array')) {
        throw new Error('Invariant violation: "type.kind === \'array\'"');
      }

      const elemType = type.type;
      return smartPromiseAll(value.map(elem => this._marshal(context, elem, elemType)));
    }, (value, type, context) => {
      (0, _assert.default)(value instanceof Array, 'Expected an object of type Array.');

      if (!(type.kind === 'array')) {
        throw new Error('Invariant violation: "type.kind === \'array\'"');
      }

      const elemType = type.type;
      return smartPromiseAll(value.map(elem => this._unmarshal(context, elem, elemType)));
    });

    // Serialize and Deserialize Objects.
    this._registerKind('object', (obj, type, context) => {
      (0, _assert.default)(typeof obj === 'object', 'Expected an argument of type object.');

      if (!(type.kind === 'object')) {
        throw new Error('Invariant violation: "type.kind === \'object\'"');
      }

      const newObj = {}; // Create a new object so we don't mutate the original one.
      const promise = checkedSmartPromiseAll(type.fields.map(prop => {
        const name = prop.name;
        const originalValue = obj[name];
        const annotateErrorAndThrow = e => {
          addMarshallingContextToError(`Field: ${name}`, originalValue, e);
          throw e;
        };
        // Check if the source object has this key.
        if (obj != null && obj.hasOwnProperty(name)) {
          try {
            let value;
            // Optional props can be explicitly set to `undefined`
            if (originalValue === undefined && prop.optional) {
              value = undefined;
            } else {
              value = this._marshal(context, originalValue, prop.type);
            }
            if (value instanceof Promise) {
              return value.then(result => newObj[name] = result, annotateErrorAndThrow);
            } else {
              newObj[name] = value;
            }
          } catch (e) {
            annotateErrorAndThrow(e);
          }
        } else if (!prop.optional) {
          // If the property is optional, it's okay for it to be missing.
          throw new Error(`Source object: ${JSON.stringify(obj)} is missing property ${prop.name}.`);
        }
      }));
      if (promise instanceof Promise) {
        return promise.then(() => newObj);
      }
      return newObj;
    }, (obj, type, context) => {
      (0, _assert.default)(typeof obj === 'object', 'Expected an argument of type object.');

      if (!(type.kind === 'object')) {
        throw new Error('Invariant violation: "type.kind === \'object\'"');
      }

      const newObj = {}; // Create a new object so we don't mutate the original one.
      const promise = checkedSmartPromiseAll(type.fields.map(prop => {
        // Check if the source object has this key.
        if (obj != null && obj.hasOwnProperty(prop.name)) {
          const name = prop.name;
          const originalValue = obj[name];
          const annotateErrorAndThrow = e => {
            addMarshallingContextToError(`Field: ${name}`, originalValue, e);
            throw e;
          };
          try {
            const value = this._unmarshal(context, originalValue, prop.type);
            if (value instanceof Promise) {
              return value.then(result => newObj[name] = result, annotateErrorAndThrow);
            } else {
              newObj[name] = value;
            }
          } catch (e) {
            annotateErrorAndThrow(e);
          }
        } else if (!prop.optional && !canBeUndefined(prop.type)) {
          // If the property is optional, it's okay for it to be missing.
          // JSON omits undefined values, so they can also be missing.
          throw new Error(`Source object: ${JSON.stringify(obj)} is missing property ${prop.name}.`);
        }
      }));
      if (promise instanceof Promise) {
        return promise.then(() => newObj);
      }
      return newObj;
    });

    // Serialize / Deserialize Sets.
    this._registerKind('set', (value, type, context) => {
      if (!(type.kind === 'set')) {
        throw new Error('Invariant violation: "type.kind === \'set\'"');
      }

      (0, _assert.default)(value instanceof Set, 'Expected an object of type Set.');
      const serializePromises = [];
      for (const elem of value) {
        serializePromises.push(this._marshal(context, elem, type.type));
      }
      return smartPromiseAll(serializePromises);
    }, (value, type, context) => {
      (0, _assert.default)(value instanceof Array, 'Expected an object of type Array.');

      if (!(type.kind === 'set')) {
        throw new Error('Invariant violation: "type.kind === \'set\'"');
      }

      const elemType = type.type;
      const elements = smartPromiseAll(value.map(elem => this._unmarshal(context, elem, elemType)));
      if (elements instanceof Promise) {
        return elements.then(x => new Set(x));
      }
      return new Set(elements);
    });

    // Serialize / Deserialize Maps.
    this._registerKind('map', (map, type, context) => {
      (0, _assert.default)(map instanceof Map, 'Expected an object of type Set.');

      if (!(type.kind === 'map')) {
        throw new Error('Invariant violation: "type.kind === \'map\'"');
      }

      const serializePromises = [];
      for (const [key, value] of map) {
        serializePromises.push(checkedSmartPromiseAll([this._marshal(context, key, type.keyType), this._marshal(context, value, type.valueType)]));
      }
      return smartPromiseAll(serializePromises);
    }, (serialized, type, context) => {
      (0, _assert.default)(serialized instanceof Array, 'Expected an object of type Array.');

      if (!(type.kind === 'map')) {
        throw new Error('Invariant violation: "type.kind === \'map\'"');
      }

      const keyType = type.keyType;
      const valueType = type.valueType;
      const entries = smartPromiseAll(serialized.map(entry => checkedSmartPromiseAll([this._unmarshal(context, entry[0], keyType), this._unmarshal(context, entry[1], valueType)])));
      if (entries instanceof Promise) {
        return entries.then(x => new Map(x));
      }
      return new Map(entries);
    });

    // Serialize / Deserialize Tuples.
    this._registerKind('tuple', (value, type, context) => {
      // Assert the length of the array.
      (0, _assert.default)(Array.isArray(value), 'Expected an object of type Array.');

      if (!(type.kind === 'tuple')) {
        throw new Error('Invariant violation: "type.kind === \'tuple\'"');
      }

      const types = type.types;
      (0, _assert.default)(value.length === types.length, `Expected tuple of length ${types.length}.`);

      // Convert all of the elements through the correct marshaller.
      return checkedSmartPromiseAll(value.map((elem, i) => this._marshal(context, elem, types[i])));
    }, (value, type, context) => {
      // Assert the length of the array.
      (0, _assert.default)(Array.isArray(value), 'Expected an object of type Array.');

      if (!(type.kind === 'tuple')) {
        throw new Error('Invariant violation: "type.kind === \'tuple\'"');
      }

      const types = type.types;
      (0, _assert.default)(value.length === types.length, `Expected tuple of length ${types.length}.`);

      // Convert all of the elements through the correct unmarshaller.
      return checkedSmartPromiseAll(value.map((elem, i) => this._unmarshal(context, elem, types[i])));
    });
  }
}

exports.TypeRegistry = TypeRegistry;
function getObjectFieldByName(type, fieldName) {
  const result = type.fields.find(field => field.name === fieldName);

  if (!(result != null)) {
    throw new Error('Invariant violation: "result != null"');
  }

  return result;
}

function findAlternate(arg, type) {
  const discriminantField = type.discriminantField;

  if (!(discriminantField != null)) {
    throw new Error('Invariant violation: "discriminantField != null"');
  }

  const discriminant = arg[discriminantField];

  if (!(discriminant != null)) {
    throw new Error('Invariant violation: "discriminant != null"');
  }

  const alternates = type.types;
  const result = alternates.find(alternate => {
    if (!(alternate.kind === 'object')) {
      throw new Error('Invariant violation: "alternate.kind === \'object\'"');
    }

    const alternateType = getObjectFieldByName(alternate, discriminantField).type;

    if (!(alternateType.kind === 'string-literal' || alternateType.kind === 'number-literal' || alternateType.kind === 'boolean-literal')) {
      throw new Error('Invariant violation: "alternateType.kind === \'string-literal\' ||\\n        alternateType.kind === \'number-literal\' ||\\n        alternateType.kind === \'boolean-literal\'"');
    }

    return alternateType.value === discriminant;
  });

  if (!(result != null)) {
    throw new Error('Invariant violation: "result != null"');
  }

  return result;
}

function valueToString(value) {
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

function addMarshallingContextToError(message, value, e) {
  if (e.hasMarshallingError == null) {
    e.hasMarshallingError = true;
    e.message += `\nError marshalling value: '${valueToString(value)}'\n`;
  }
  e.message += `${message}\n`;
}

function makeKindMarshaller(kind, transformer) {
  return (value, type, context) => {
    try {
      return transformer(value, type, context);
    } catch (e) {
      addMarshallingContextToError(kind, value, e);
      throw e;
    }
  };
}

function makeNamedMarshaller(typeName, transformer) {
  return (value, context) => {
    try {
      return transformer(value, context);
    } catch (e) {
      addMarshallingContextToError(typeName, value, e);
      throw e;
    }
  };
}