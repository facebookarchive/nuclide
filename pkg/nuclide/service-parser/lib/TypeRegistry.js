Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _assert3 = _interopRequireDefault(_assert);

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _commons = require('../../commons');

var _builtinTypes = require('./builtin-types');

/*
 * This type represents a Transformer function, which takes in a value, and either serializes
 * or deserializes it. Transformer's are added to a registry and indexed by the name of
 * the type they handle (eg: 'Date'). The second argument is the actual type object that represent
 * the value. Parameterized types like Array, or Object can use this to recursively call other
 * transformers.
 */

function statsToObject(stats) {
  var result = {
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

  if (stats.birthtime) {
    return _extends({}, result, { birthtime: stats.birthtime.toJSON() });
  }

  return result;
}

function objectToStats(jsonStats) {
  var stats = new _fs2['default'].Stats();

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

var TypeRegistry = (function () {
  function TypeRegistry() {
    var _this = this;

    _classCallCheck(this, TypeRegistry);

    this._kindMarshallers = new Map();
    this._namedMarshallers = new Map();

    this._registerPrimitives();
    this._registerSpecialTypes();
    this._registerContainers();
    this._registerLiterals();
    this._registerUnions();

    // Register NullableType and NamedType
    this._registerKind('nullable', _asyncToGenerator(function* (value, type) {
      if (value === null || value === undefined || type.kind !== 'nullable') {
        return null;
      }
      return yield _this.marshal(value, type.type);
    }), _asyncToGenerator(function* (value, type) {
      if (value === null || value === undefined || type.kind !== 'nullable') {
        return null;
      }
      return yield _this.unmarshal(value, type.type);
    }));

    this._registerKind('named', _asyncToGenerator(function* (value, type) {
      (0, _assert3['default'])(type.kind === 'named');
      var namedMarshaller = _this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error('No marshaller found for named type ' + type.name + '.');
      }
      return yield namedMarshaller.marshaller(value);
    }), _asyncToGenerator(function* (value, type) {
      (0, _assert3['default'])(type.kind === 'named');
      var namedMarshaller = _this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error('No marshaller found for named type ' + type.name + '.');
      }
      return yield namedMarshaller.unmarshaller(value);
    }));

    this._registerKind('void', function (value, type) {
      return Promise.resolve(null);
    }, function (value, type) {
      return Promise.resolve(null);
    });
  }

  _createClass(TypeRegistry, [{
    key: '_registerKind',
    value: function _registerKind(kind, marshaller, unmarshaller) {
      (0, _assert3['default'])(!this._kindMarshallers.has(kind));
      this._kindMarshallers.set(kind, { marshaller: marshaller, unmarshaller: unmarshaller });
    }

    /**
     * Register a type by providing both a marshaller and an unmarshaller. The marshaller
     * will be called to transform the type before sending it out onto the network, while the
     * unmarshaller will be called on values incoming from the network.
     * @param typeName - The string name of the type that the provided marshallers convert.
     * @param marshaller - Serialize the type.
     * @param unmarshaller - Deserialize the type.
     */
  }, {
    key: 'registerType',
    value: function registerType(typeName, marshaller, unmarshaller) {
      if (this._namedMarshallers.has(typeName)) {
        throw new Error('A type by the name ' + typeName + ' has already been registered.');
      }
      this._namedMarshallers.set(typeName, { marshaller: marshaller, unmarshaller: unmarshaller });
    }

    /**
     * Helper function for registering the marashaller/unmarshaller for a type alias.
     * @param name - The name of the alias type.
     * @param type - The type the the alias represents.
     */
  }, {
    key: 'registerAlias',
    value: function registerAlias(name, type) {
      var _this2 = this;

      this.registerType(name, function (value) {
        return _this2.marshal(value, type);
      }, function (value) {
        return _this2.unmarshal(value, type);
      });
    }

    /**
     * Marshal an object using the appropriate marshal function.
     * @param value - The value to be marshalled.
     * @param type - The type object (used to find the appropriate function).
     */
  }, {
    key: 'marshal',
    value: function marshal(value, type) {
      var kindMarshaller = this._kindMarshallers.get(type.kind);
      if (kindMarshaller == null) {
        throw new Error('No marshaller found for type kind ' + type.kind + '.');
      }
      return kindMarshaller.marshaller(value, type);
    }

    /**
     * Unmarshal and object using the appropriate unmarshal function.
     * @param value - The value to be marshalled.
     * @param type - The type object (used to find the appropriate function).
     */
  }, {
    key: 'unmarshal',
    value: function unmarshal(value, type) {
      var kindMarshaller = this._kindMarshallers.get(type.kind);
      if (kindMarshaller == null) {
        throw new Error('No unmarshaller found for type kind ' + type.kind + '.');
      }
      return kindMarshaller.unmarshaller(value, type);
    }
  }, {
    key: '_registerPrimitives',
    value: function _registerPrimitives() {
      // Since string, number, and boolean are JSON primitives,
      // they require no marshalling. Instead, simply create wrapped transformers
      // that assert the type of their argument.
      var stringTransformer = _asyncToGenerator(function* (arg) {
        // Unbox argument.
        arg = arg instanceof String ? arg.valueOf() : arg;
        (0, _assert2['default'])(typeof arg === 'string', 'Expected a string argument');
        return arg;
      });
      var numberTransformer = _asyncToGenerator(function* (arg) {
        // Unbox argument.
        if (arg instanceof Number) {
          arg = arg.valueOf();
        }
        (0, _assert2['default'])(typeof arg === 'number', 'Expected a number argument');
        return arg;
      });
      var booleanTransformer = _asyncToGenerator(function* (arg) {
        // Unbox argument
        if (arg instanceof Boolean) {
          arg = arg.valueOf();
        }
        (0, _assert2['default'])(typeof arg === 'boolean', 'Expected a boolean argument');
        return arg;
      });
      // We assume an 'any' and 'mixed' types require no marshalling.
      var identityTransformer = _asyncToGenerator(function* (arg) {
        return arg;
      });

      // Register these transformers
      this._registerKind('string', stringTransformer, stringTransformer);
      this._registerKind('number', numberTransformer, numberTransformer);
      this._registerKind('boolean', booleanTransformer, booleanTransformer);
      this._registerKind('any', identityTransformer, identityTransformer);
      this._registerKind('mixed', identityTransformer, identityTransformer);
    }
  }, {
    key: '_registerLiterals',
    value: function _registerLiterals() {
      var literalTransformer = _asyncToGenerator(function* (arg, type) {
        (0, _assert3['default'])(type.kind === 'string-literal' || type.kind === 'number-literal' || type.kind === 'boolean-literal');
        (0, _assert3['default'])(arg === type.value);
        return arg;
      });
      this._registerKind('string-literal', literalTransformer, literalTransformer);
      this._registerKind('number-literal', literalTransformer, literalTransformer);
      this._registerKind('boolean-literal', literalTransformer, literalTransformer);
    }
  }, {
    key: '_registerUnions',
    value: function _registerUnions() {
      var _this3 = this;

      var unionLiteralTransformer = _asyncToGenerator(function* (arg, type) {
        (0, _assert3['default'])(type.kind === 'union');
        var alternate = _commons.array.find(type.types, function (element) {
          (0, _assert3['default'])(element.kind === 'string-literal' || element.kind === 'number-literal' || element.kind === 'boolean-literal');
          return arg === element.value;
        });
        (0, _assert3['default'])(alternate);
        // This is just the literal transformer inlined ...
        return arg;
      });
      var unionObjectMarshaller = function unionObjectMarshaller(arg, type) {
        (0, _assert3['default'])(type.kind === 'union');
        return _this3.marshal(arg, findAlternate(arg, type));
      };
      var unionObjectUnmarshaller = function unionObjectUnmarshaller(arg, type) {
        (0, _assert3['default'])(type.kind === 'union');
        return _this3.unmarshal(arg, findAlternate(arg, type));
      };
      var unionMarshaller = function unionMarshaller(arg, type) {
        (0, _assert3['default'])(type.kind === 'union');
        if (type.discriminantField != null) {
          return unionObjectMarshaller(arg, type);
        } else {
          return unionLiteralTransformer(arg, type);
        }
      };
      var unionUnmarshaller = function unionUnmarshaller(arg, type) {
        (0, _assert3['default'])(type.kind === 'union');
        if (type.discriminantField != null) {
          return unionObjectUnmarshaller(arg, type);
        } else {
          return unionLiteralTransformer(arg, type);
        }
      };
      this._registerKind('union', unionMarshaller, unionUnmarshaller);
    }
  }, {
    key: '_registerSpecialTypes',
    value: function _registerSpecialTypes() {
      // Serialize / Deserialize any Object type
      this.registerType(_builtinTypes.objectType.name, _asyncToGenerator(function* (object) {
        (0, _assert2['default'])(object != null && typeof object === 'object', 'Expected Object argument.');
        return object;
      }), _asyncToGenerator(function* (object) {
        (0, _assert2['default'])(object != null && typeof object === 'object', 'Expected Object argument.');
        return object;
      }));

      // Serialize / Deserialize Javascript Date objects
      this.registerType(_builtinTypes.dateType.name, _asyncToGenerator(function* (date) {
        (0, _assert2['default'])(date instanceof Date, 'Expected date argument.');
        return date.toJSON();
      }), _asyncToGenerator(function* (dateStr) {
        // Unbox argument.
        dateStr = dateStr instanceof String ? dateStr.valueOf() : dateStr;

        (0, _assert2['default'])(typeof dateStr === 'string', 'Expeceted a string argument.');
        return new Date(dateStr);
      }));

      // Serialize / Deserialize RegExp objects
      this.registerType(_builtinTypes.regExpType.name, _asyncToGenerator(function* (regexp) {
        (0, _assert2['default'])(regexp instanceof RegExp, 'Expected a RegExp object as an argument');
        return regexp.toString();
      }), _asyncToGenerator(function* (regStr) {
        // Unbox argument.
        regStr = regStr instanceof String ? regStr.valueOf() : regStr;

        (0, _assert2['default'])(typeof regStr === 'string', 'Expected a string argument.');
        // $FlowIssue - flesh out the vm module.
        return _vm2['default'].runInThisContext(regStr);
      }));

      // Serialize / Deserialize Buffer objects through Base64 strings
      this.registerType(_builtinTypes.bufferType.name, _asyncToGenerator(function* (buffer) {
        (0, _assert2['default'])(buffer instanceof Buffer, 'Expected a buffer argument.');
        return buffer.toString('base64');
      }), _asyncToGenerator(function* (base64string) {
        // Unbox argument.
        base64string = base64string instanceof String ? base64string.valueOf() : base64string;

        (0, _assert2['default'])(typeof base64string === 'string', 'Expected a base64 string. Not ' + typeof base64string);
        return new Buffer(base64string, 'base64');
      }));

      // fs.Stats
      this.registerType(_builtinTypes.fsStatsType.name, _asyncToGenerator(function* (stats) {
        (0, _assert2['default'])(stats instanceof _fs2['default'].Stats);
        return JSON.stringify(statsToObject(stats));
      }), _asyncToGenerator(function* (json) {
        (0, _assert2['default'])(typeof json === 'string');
        return objectToStats(JSON.parse(json));
      }));
    }
  }, {
    key: '_registerContainers',
    value: function _registerContainers() {
      var _this4 = this;

      // Serialize / Deserialize Arrays.
      this._registerKind('array', _asyncToGenerator(function* (value, type) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'array');
        var elemType = type.type;
        return yield Promise.all(value.map(function (elem) {
          return _this4.marshal(elem, elemType);
        }));
      }), _asyncToGenerator(function* (value, type) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'array');
        var elemType = type.type;
        return yield Promise.all(value.map(function (elem) {
          return _this4.unmarshal(elem, elemType);
        }));
      }));

      // Serialize and Deserialize Objects.
      this._registerKind('object', _asyncToGenerator(function* (obj, type) {
        (0, _assert2['default'])(typeof obj === 'object', 'Expected an argument of type object.');
        (0, _assert3['default'])(type.kind === 'object');
        var newObj = {}; // Create a new object so we don't mutate the original one.
        yield Promise.all(type.fields.map(_asyncToGenerator(function* (prop) {
          // Check if the source object has this key.
          if (obj.hasOwnProperty(prop.name)) {
            newObj[prop.name] = yield _this4.marshal(obj[prop.name], prop.type);
          } else {
            // If the property is optional, it's okay for it to be missing.
            if (!prop.optional) {
              throw new Error('Source object is missing property ' + prop.name + '.');
            }
          }
        })));
        return newObj;
      }), _asyncToGenerator(function* (obj, type) {
        (0, _assert2['default'])(typeof obj === 'object', 'Expected an argument of type object.');
        (0, _assert3['default'])(type.kind === 'object');
        var newObj = {}; // Create a new object so we don't mutate the original one.
        yield Promise.all(type.fields.map(_asyncToGenerator(function* (prop) {
          // Check if the source object has this key.
          if (obj.hasOwnProperty(prop.name)) {
            newObj[prop.name] = yield _this4.unmarshal(obj[prop.name], prop.type);
          } else {
            // If the property is optional, it's okay for it to be missing.
            if (!prop.optional) {
              throw new Error('Source object is missing property ' + prop.name + '.');
            }
          }
        })));
        return newObj;
      }));

      // Serialize / Deserialize Sets.
      this._registerKind('set', _asyncToGenerator(function* (value, type) {
        (0, _assert3['default'])(type.kind === 'set');
        (0, _assert2['default'])(value instanceof Set, 'Expected an object of type Set.');
        var serializePromises = [];
        for (var elem of value) {
          serializePromises.push(_this4.marshal(elem, type.type));
        }
        return yield Promise.all(serializePromises);
      }), _asyncToGenerator(function* (value, type) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'set');
        var elemType = type.type;
        var elements = yield Promise.all(value.map(function (elem) {
          return _this4.unmarshal(elem, elemType);
        }));
        return new Set(elements);
      }));

      // Serialize / Deserialize Maps.
      this._registerKind('map', _asyncToGenerator(function* (map, type) {
        (0, _assert2['default'])(map instanceof Map, 'Expected an object of type Set.');
        (0, _assert3['default'])(type.kind === 'map');
        var serializePromises = [];
        for (var _ref3 of map) {
          var _ref2 = _slicedToArray(_ref3, 2);

          var key = _ref2[0];
          var _value = _ref2[1];

          serializePromises.push(Promise.all([_this4.marshal(key, type.keyType), _this4.marshal(_value, type.valueType)]));
        }
        return yield Promise.all(serializePromises);
      }), _asyncToGenerator(function* (serialized, type) {
        (0, _assert2['default'])(serialized instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'map');
        var keyType = type.keyType;
        var valueType = type.valueType;
        var entries = yield Promise.all(serialized.map(function (entry) {
          return Promise.all([_this4.unmarshal(entry[0], keyType), _this4.unmarshal(entry[1], valueType)]);
        }));
        return new Map(entries);
      }));

      // Serialize / Deserialize Tuples.
      this._registerKind('tuple', _asyncToGenerator(function* (value, type) {
        // Assert the length of the array.
        (0, _assert2['default'])(Array.isArray(value), 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'tuple');
        var types = type.types;
        (0, _assert2['default'])(value.length === types.length, 'Expected tuple of length ' + types.length + '.');

        // Convert all of the elements through the correct marshaller.
        return yield Promise.all(value.map(function (elem, i) {
          return _this4.marshal(elem, types[i]);
        }));
      }), _asyncToGenerator(function* (value, type) {
        // Assert the length of the array.
        (0, _assert2['default'])(Array.isArray(value), 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'tuple');
        var types = type.types;
        (0, _assert2['default'])(value.length === types.length, 'Expected tuple of length ' + types.length + '.');

        // Convert all of the elements through the correct unmarshaller.
        return yield Promise.all(value.map(function (elem, i) {
          return _this4.unmarshal(elem, types[i]);
        }));
      }));
    }
  }]);

  return TypeRegistry;
})();

exports['default'] = TypeRegistry;

function getObjectFieldByName(type, fieldName) {
  var result = _commons.array.find(type.fields, function (field) {
    return field.name === fieldName;
  });
  (0, _assert3['default'])(result != null);
  return result;
}

function findAlternate(arg, type) {
  var discriminantField = type.discriminantField;
  (0, _assert3['default'])(discriminantField != null);
  var discriminant = arg[discriminantField];
  (0, _assert3['default'])(discriminant != null);
  var alternates = type.types;
  var result = _commons.array.find(alternates, function (alternate) {
    (0, _assert3['default'])(alternate.kind === 'object');
    var alternateType = getObjectFieldByName(alternate, discriminantField).type;
    (0, _assert3['default'])(alternateType.kind === 'string-literal' || alternateType.kind === 'number-literal' || alternateType.kind === 'boolean-literal');
    return alternateType.value === discriminant;
  });
  (0, _assert3['default'])(result != null);
  return result;
}
module.exports = exports['default'];

/** Store marhsallers and and unmarshallers, index by the kind of the type. */

/** Store marhsallers and and unmarshallers, index by the name of the type. */
//# sourceMappingURL=data:application/json;base64,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LElBQUksS0FBSyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELFdBQU8sYUFBYSxDQUFDLEtBQUssS0FBSyxZQUFZLENBQUM7R0FDN0MsQ0FBQyxDQUFDO0FBQ0gsMkJBQVUsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzFCLFNBQU8sTUFBTSxDQUFDO0NBQ2YiLCJmaWxlIjoiVHlwZVJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHZtIGZyb20gJ3ZtJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIFR5cGUsXG4gIE9iamVjdFR5cGUsXG4gIE9iamVjdEZpZWxkLFxuICBVbmlvblR5cGUsXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtvYmplY3RUeXBlLCBkYXRlVHlwZSwgcmVnRXhwVHlwZSwgYnVmZmVyVHlwZSwgZnNTdGF0c1R5cGV9IGZyb20gJy4vYnVpbHRpbi10eXBlcyc7XG5cblxuLypcbiAqIFRoaXMgdHlwZSByZXByZXNlbnRzIGEgVHJhbnNmb3JtZXIgZnVuY3Rpb24sIHdoaWNoIHRha2VzIGluIGEgdmFsdWUsIGFuZCBlaXRoZXIgc2VyaWFsaXplc1xuICogb3IgZGVzZXJpYWxpemVzIGl0LiBUcmFuc2Zvcm1lcidzIGFyZSBhZGRlZCB0byBhIHJlZ2lzdHJ5IGFuZCBpbmRleGVkIGJ5IHRoZSBuYW1lIG9mXG4gKiB0aGUgdHlwZSB0aGV5IGhhbmRsZSAoZWc6ICdEYXRlJykuIFRoZSBzZWNvbmQgYXJndW1lbnQgaXMgdGhlIGFjdHVhbCB0eXBlIG9iamVjdCB0aGF0IHJlcHJlc2VudFxuICogdGhlIHZhbHVlLiBQYXJhbWV0ZXJpemVkIHR5cGVzIGxpa2UgQXJyYXksIG9yIE9iamVjdCBjYW4gdXNlIHRoaXMgdG8gcmVjdXJzaXZlbHkgY2FsbCBvdGhlclxuICogdHJhbnNmb3JtZXJzLlxuICovXG5leHBvcnQgdHlwZSBUcmFuc2Zvcm1lciA9ICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiBQcm9taXNlPGFueT47XG5cbmZ1bmN0aW9uIHN0YXRzVG9PYmplY3Qoc3RhdHM6IGZzLlN0YXRzKTogT2JqZWN0IHtcbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIGRldjogc3RhdHMuZGV2LFxuICAgIG1vZGU6IHN0YXRzLm1vZGUsXG4gICAgbmxpbms6IHN0YXRzLm5saW5rLFxuICAgIHVpZDogc3RhdHMudWlkLFxuICAgIGdpZDogc3RhdHMuZ2lkLFxuICAgIHJkZXY6IHN0YXRzLnJkZXYsXG4gICAgYmxrc2l6ZTogc3RhdHMuYmxrc2l6ZSxcbiAgICBpbm86IHN0YXRzLmlubyxcbiAgICBzaXplOiBzdGF0cy5zaXplLFxuICAgIGJsb2Nrczogc3RhdHMuYmxvY2tzLFxuICAgIGF0aW1lOiBzdGF0cy5hdGltZS50b0pTT04oKSxcbiAgICBtdGltZTogc3RhdHMubXRpbWUudG9KU09OKCksXG4gICAgY3RpbWU6IHN0YXRzLmN0aW1lLnRvSlNPTigpLFxuICB9O1xuXG4gIGlmIChzdGF0cy5iaXJ0aHRpbWUpIHtcbiAgICByZXR1cm4gey4uLnJlc3VsdCwgYmlydGh0aW1lOiBzdGF0cy5iaXJ0aHRpbWUudG9KU09OKCkgfTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RhdHMoanNvblN0YXRzOiBPYmplY3QpOiBmcy5TdGF0cyB7XG4gIGNvbnN0IHN0YXRzID0gbmV3IGZzLlN0YXRzKCk7XG5cbiAgc3RhdHMuZGV2ID0ganNvblN0YXRzLmRldjtcbiAgc3RhdHMubW9kZSA9IGpzb25TdGF0cy5tb2RlO1xuICBzdGF0cy5ubGluayA9IGpzb25TdGF0cy5ubGluaztcbiAgc3RhdHMudWlkID0ganNvblN0YXRzLnVpZDtcbiAgc3RhdHMuZ2lkID0ganNvblN0YXRzLmdpZDtcbiAgc3RhdHMucmRldiA9IGpzb25TdGF0cy5yZGV2O1xuICBzdGF0cy5ibGtzaXplID0ganNvblN0YXRzLmJsa3NpemU7XG4gIHN0YXRzLmlubyA9IGpzb25TdGF0cy5pbm87XG4gIHN0YXRzLnNpemUgPSBqc29uU3RhdHMuc2l6ZTtcbiAgc3RhdHMuYmxvY2tzID0ganNvblN0YXRzLmJsb2NrcztcbiAgc3RhdHMuYXRpbWUgPSBuZXcgRGF0ZShqc29uU3RhdHMuYXRpbWUpO1xuICBzdGF0cy5tdGltZSA9IG5ldyBEYXRlKGpzb25TdGF0cy5tdGltZSk7XG4gIHN0YXRzLmN0aW1lID0gbmV3IERhdGUoanNvblN0YXRzLmN0aW1lKTtcblxuICBpZiAoanNvblN0YXRzLmJpcnRodGltZSkge1xuICAgIC8vICRGbG93SXNzdWVcbiAgICBzdGF0cy5iaXJ0aHRpbWUgPSBuZXcgRGF0ZShqc29uU3RhdHMuYmlydGh0aW1lKTtcbiAgfVxuXG4gIHJldHVybiBzdGF0cztcbn1cblxuLypcbiAqIFRoZSBUeXBlUmVnaXN0cnkgaXMgYSBjZW50cmFsaXplZCBwbGFjZSB0byByZWdpc3RlciBmdW5jdGlvbnMgdGhhdCBzZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplXG4gKiB0eXBlcy4gVGhpcyBhbGxvd3MgZm9yIHR5cGVzIGRlZmluZWQgaW4gb25lIHNlcnZpY2UgdG8gaW5jbHVkZSB0eXBlcyBmcm9tIGFub3RoZXIgc2VydmljZSBpblxuICogYW5vdGhlciBmaWxlLiBJdCBhbHNvIGFsbG93cyB0aGUgYWJpbGl0eSB0byBhZGQgbmV3IHByaW1pdGl2ZXMsIHJhbmdpbmcgZnJvbSBCdWZmZXIgdG8gTnVjbGlkZVVyaVxuICogdGhhdCBhcmUgbm90IGhhbmRsZWQgYXQgdGhlIHRyYW5zcG9ydCBsYXllci4gVGhlIGtleSBjb25jZXB0IGlzIHRoYXQgbWFyc2hhbGxpbmcgZnVuY3Rpb25zIGNhblxuICogYmUgcmVjdXJzaXZlLCBjYWxsaW5nIG90aGVyIG1hcnNoYWxsaW5nIGZ1bmN0aW9ucywgZW5kaW5nIGF0IHRoZSBwcmltaXRpdmVzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlUmVnaXN0cnkge1xuICAvKiogU3RvcmUgbWFyaHNhbGxlcnMgYW5kIGFuZCB1bm1hcnNoYWxsZXJzLCBpbmRleCBieSB0aGUga2luZCBvZiB0aGUgdHlwZS4gKi9cbiAgX2tpbmRNYXJzaGFsbGVyczogTWFwPHN0cmluZywge1xuICAgICAgbWFyc2hhbGxlcjogVHJhbnNmb3JtZXI7XG4gICAgICB1bm1hcnNoYWxsZXI6IFRyYW5zZm9ybWVyO1xuICAgIH0+O1xuXG4gIC8qKiBTdG9yZSBtYXJoc2FsbGVycyBhbmQgYW5kIHVubWFyc2hhbGxlcnMsIGluZGV4IGJ5IHRoZSBuYW1lIG9mIHRoZSB0eXBlLiAqL1xuICBfbmFtZWRNYXJzaGFsbGVyczogTWFwPHN0cmluZywge1xuICAgICAgbWFyc2hhbGxlcjogKHZhbHVlOiBhbnkpID0+IFByb21pc2U8YW55PjtcbiAgICAgIHVubWFyc2hhbGxlcjogKHZhbHVlOiBhbnkpID0+IFByb21pc2U8YW55PjtcbiAgICB9PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9raW5kTWFyc2hhbGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fbmFtZWRNYXJzaGFsbGVycyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyUHJpbWl0aXZlcygpO1xuICAgIHRoaXMuX3JlZ2lzdGVyU3BlY2lhbFR5cGVzKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJDb250YWluZXJzKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJMaXRlcmFscygpO1xuICAgIHRoaXMuX3JlZ2lzdGVyVW5pb25zKCk7XG5cbiAgICAvLyBSZWdpc3RlciBOdWxsYWJsZVR5cGUgYW5kIE5hbWVkVHlwZVxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbnVsbGFibGUnLCBhc3luYyAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdHlwZS5raW5kICE9PSAnbnVsbGFibGUnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMubWFyc2hhbCh2YWx1ZSwgdHlwZS50eXBlKTtcbiAgICB9LCBhc3luYyAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdHlwZS5raW5kICE9PSAnbnVsbGFibGUnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudW5tYXJzaGFsKHZhbHVlLCB0eXBlLnR5cGUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCduYW1lZCcsIGFzeW5jICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnbmFtZWQnKTtcbiAgICAgIGNvbnN0IG5hbWVkTWFyc2hhbGxlciA9IHRoaXMuX25hbWVkTWFyc2hhbGxlcnMuZ2V0KHR5cGUubmFtZSk7XG4gICAgICBpZiAobmFtZWRNYXJzaGFsbGVyID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBtYXJzaGFsbGVyIGZvdW5kIGZvciBuYW1lZCB0eXBlICR7dHlwZS5uYW1lfS5gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhd2FpdCBuYW1lZE1hcnNoYWxsZXIubWFyc2hhbGxlcih2YWx1ZSk7XG4gICAgfSwgYXN5bmMgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICduYW1lZCcpO1xuICAgICAgY29uc3QgbmFtZWRNYXJzaGFsbGVyID0gdGhpcy5fbmFtZWRNYXJzaGFsbGVycy5nZXQodHlwZS5uYW1lKTtcbiAgICAgIGlmIChuYW1lZE1hcnNoYWxsZXIgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIG1hcnNoYWxsZXIgZm91bmQgZm9yIG5hbWVkIHR5cGUgJHt0eXBlLm5hbWV9LmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF3YWl0IG5hbWVkTWFyc2hhbGxlci51bm1hcnNoYWxsZXIodmFsdWUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKFxuICAgICAgJ3ZvaWQnLFxuICAgICAgKHZhbHVlLCB0eXBlKSA9PiBQcm9taXNlLnJlc29sdmUobnVsbCksXG4gICAgICAodmFsdWUsIHR5cGUpID0+IFByb21pc2UucmVzb2x2ZShudWxsKSk7XG4gIH1cblxuICBfcmVnaXN0ZXJLaW5kKGtpbmQ6IHN0cmluZywgbWFyc2hhbGxlcjogVHJhbnNmb3JtZXIsIHVubWFyc2hhbGxlcjogVHJhbnNmb3JtZXIpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQoIXRoaXMuX2tpbmRNYXJzaGFsbGVycy5oYXMoa2luZCkpO1xuICAgIHRoaXMuX2tpbmRNYXJzaGFsbGVycy5zZXQoa2luZCwge21hcnNoYWxsZXIsIHVubWFyc2hhbGxlcn0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgdHlwZSBieSBwcm92aWRpbmcgYm90aCBhIG1hcnNoYWxsZXIgYW5kIGFuIHVubWFyc2hhbGxlci4gVGhlIG1hcnNoYWxsZXJcbiAgICogd2lsbCBiZSBjYWxsZWQgdG8gdHJhbnNmb3JtIHRoZSB0eXBlIGJlZm9yZSBzZW5kaW5nIGl0IG91dCBvbnRvIHRoZSBuZXR3b3JrLCB3aGlsZSB0aGVcbiAgICogdW5tYXJzaGFsbGVyIHdpbGwgYmUgY2FsbGVkIG9uIHZhbHVlcyBpbmNvbWluZyBmcm9tIHRoZSBuZXR3b3JrLlxuICAgKiBAcGFyYW0gdHlwZU5hbWUgLSBUaGUgc3RyaW5nIG5hbWUgb2YgdGhlIHR5cGUgdGhhdCB0aGUgcHJvdmlkZWQgbWFyc2hhbGxlcnMgY29udmVydC5cbiAgICogQHBhcmFtIG1hcnNoYWxsZXIgLSBTZXJpYWxpemUgdGhlIHR5cGUuXG4gICAqIEBwYXJhbSB1bm1hcnNoYWxsZXIgLSBEZXNlcmlhbGl6ZSB0aGUgdHlwZS5cbiAgICovXG4gIHJlZ2lzdGVyVHlwZSh0eXBlTmFtZTogc3RyaW5nLCBtYXJzaGFsbGVyOiAodmFsdWU6IGFueSkgPT4gUHJvbWlzZTxhbnk+LFxuICAgICAgdW5tYXJzaGFsbGVyOiAodmFsdWU6IGFueSkgPT4gUHJvbWlzZTxhbnk+KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX25hbWVkTWFyc2hhbGxlcnMuaGFzKHR5cGVOYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBIHR5cGUgYnkgdGhlIG5hbWUgJHt0eXBlTmFtZX0gaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkLmApO1xuICAgIH1cbiAgICB0aGlzLl9uYW1lZE1hcnNoYWxsZXJzLnNldCh0eXBlTmFtZSwge21hcnNoYWxsZXIsIHVubWFyc2hhbGxlcn0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3IgcmVnaXN0ZXJpbmcgdGhlIG1hcmFzaGFsbGVyL3VubWFyc2hhbGxlciBmb3IgYSB0eXBlIGFsaWFzLlxuICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBhbGlhcyB0eXBlLlxuICAgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRoZSB0aGUgYWxpYXMgcmVwcmVzZW50cy5cbiAgICovXG4gIHJlZ2lzdGVyQWxpYXMobmFtZTogc3RyaW5nLCB0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5yZWdpc3RlclR5cGUobmFtZSwgdmFsdWUgPT4gdGhpcy5tYXJzaGFsKHZhbHVlLCB0eXBlKSxcbiAgICAgIHZhbHVlID0+IHRoaXMudW5tYXJzaGFsKHZhbHVlLCB0eXBlKSk7XG4gIH1cblxuICAvKipcbiAgICogTWFyc2hhbCBhbiBvYmplY3QgdXNpbmcgdGhlIGFwcHJvcHJpYXRlIG1hcnNoYWwgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBiZSBtYXJzaGFsbGVkLlxuICAgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIG9iamVjdCAodXNlZCB0byBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmdW5jdGlvbikuXG4gICAqL1xuICBtYXJzaGFsKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGtpbmRNYXJzaGFsbGVyID0gdGhpcy5fa2luZE1hcnNoYWxsZXJzLmdldCh0eXBlLmtpbmQpO1xuICAgIGlmIChraW5kTWFyc2hhbGxlciA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIG1hcnNoYWxsZXIgZm91bmQgZm9yIHR5cGUga2luZCAke3R5cGUua2luZH0uYCk7XG4gICAgfVxuICAgIHJldHVybiBraW5kTWFyc2hhbGxlci5tYXJzaGFsbGVyKHZhbHVlLCB0eXBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbm1hcnNoYWwgYW5kIG9iamVjdCB1c2luZyB0aGUgYXBwcm9wcmlhdGUgdW5tYXJzaGFsIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0gdmFsdWUgLSBUaGUgdmFsdWUgdG8gYmUgbWFyc2hhbGxlZC5cbiAgICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSBvYmplY3QgKHVzZWQgdG8gZmluZCB0aGUgYXBwcm9wcmlhdGUgZnVuY3Rpb24pLlxuICAgKi9cbiAgdW5tYXJzaGFsKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGtpbmRNYXJzaGFsbGVyID0gdGhpcy5fa2luZE1hcnNoYWxsZXJzLmdldCh0eXBlLmtpbmQpO1xuICAgIGlmIChraW5kTWFyc2hhbGxlciA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHVubWFyc2hhbGxlciBmb3VuZCBmb3IgdHlwZSBraW5kICR7dHlwZS5raW5kfS5gKTtcbiAgICB9XG4gICAgcmV0dXJuIGtpbmRNYXJzaGFsbGVyLnVubWFyc2hhbGxlcih2YWx1ZSwgdHlwZSk7XG4gIH1cblxuICBfcmVnaXN0ZXJQcmltaXRpdmVzKCk6IHZvaWQge1xuICAgIC8vIFNpbmNlIHN0cmluZywgbnVtYmVyLCBhbmQgYm9vbGVhbiBhcmUgSlNPTiBwcmltaXRpdmVzLFxuICAgIC8vIHRoZXkgcmVxdWlyZSBubyBtYXJzaGFsbGluZy4gSW5zdGVhZCwgc2ltcGx5IGNyZWF0ZSB3cmFwcGVkIHRyYW5zZm9ybWVyc1xuICAgIC8vIHRoYXQgYXNzZXJ0IHRoZSB0eXBlIG9mIHRoZWlyIGFyZ3VtZW50LlxuICAgIGNvbnN0IHN0cmluZ1RyYW5zZm9ybWVyID0gYXN5bmMgYXJnID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50LlxuICAgICAgYXJnID0gKGFyZyBpbnN0YW5jZW9mIFN0cmluZykgPyBhcmcudmFsdWVPZigpIDogYXJnO1xuICAgICAgYXNzZXJ0KHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnLCAnRXhwZWN0ZWQgYSBzdHJpbmcgYXJndW1lbnQnKTtcbiAgICAgIHJldHVybiBhcmc7XG4gICAgfTtcbiAgICBjb25zdCBudW1iZXJUcmFuc2Zvcm1lciA9IGFzeW5jIGFyZyA9PiB7XG4gICAgICAvLyBVbmJveCBhcmd1bWVudC5cbiAgICAgIGlmIChhcmcgaW5zdGFuY2VvZiBOdW1iZXIpIHtcbiAgICAgICAgYXJnID0gYXJnLnZhbHVlT2YoKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydCh0eXBlb2YgYXJnID09PSAnbnVtYmVyJywgJ0V4cGVjdGVkIGEgbnVtYmVyIGFyZ3VtZW50Jyk7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgY29uc3QgYm9vbGVhblRyYW5zZm9ybWVyID0gYXN5bmMgYXJnID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50XG4gICAgICBpZiAoYXJnIGluc3RhbmNlb2YgQm9vbGVhbikge1xuICAgICAgICBhcmcgPSBhcmcudmFsdWVPZigpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0KHR5cGVvZiBhcmcgPT09ICdib29sZWFuJywgJ0V4cGVjdGVkIGEgYm9vbGVhbiBhcmd1bWVudCcpO1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICAgIC8vIFdlIGFzc3VtZSBhbiAnYW55JyBhbmQgJ21peGVkJyB0eXBlcyByZXF1aXJlIG5vIG1hcnNoYWxsaW5nLlxuICAgIGNvbnN0IGlkZW50aXR5VHJhbnNmb3JtZXIgPSBhc3luYyBhcmcgPT4gYXJnO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGhlc2UgdHJhbnNmb3JtZXJzXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdzdHJpbmcnLCBzdHJpbmdUcmFuc2Zvcm1lciwgc3RyaW5nVHJhbnNmb3JtZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbnVtYmVyJywgbnVtYmVyVHJhbnNmb3JtZXIsIG51bWJlclRyYW5zZm9ybWVyKTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ2Jvb2xlYW4nLCBib29sZWFuVHJhbnNmb3JtZXIsIGJvb2xlYW5UcmFuc2Zvcm1lcik7XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdhbnknLCBpZGVudGl0eVRyYW5zZm9ybWVyLCBpZGVudGl0eVRyYW5zZm9ybWVyKTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ21peGVkJywgaWRlbnRpdHlUcmFuc2Zvcm1lciwgaWRlbnRpdHlUcmFuc2Zvcm1lcik7XG4gIH1cblxuICBfcmVnaXN0ZXJMaXRlcmFscygpOiB2b2lkIHtcbiAgICBjb25zdCBsaXRlcmFsVHJhbnNmb3JtZXIgPSBhc3luYyAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnc3RyaW5nLWxpdGVyYWwnIHx8IHR5cGUua2luZCA9PT0gJ251bWJlci1saXRlcmFsJyB8fFxuICAgICAgICAgIHR5cGUua2luZCA9PT0gJ2Jvb2xlYW4tbGl0ZXJhbCcpO1xuICAgICAgaW52YXJpYW50KGFyZyA9PT0gdHlwZS52YWx1ZSk7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdzdHJpbmctbGl0ZXJhbCcsIGxpdGVyYWxUcmFuc2Zvcm1lciwgbGl0ZXJhbFRyYW5zZm9ybWVyKTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ251bWJlci1saXRlcmFsJywgbGl0ZXJhbFRyYW5zZm9ybWVyLCBsaXRlcmFsVHJhbnNmb3JtZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnYm9vbGVhbi1saXRlcmFsJywgbGl0ZXJhbFRyYW5zZm9ybWVyLCBsaXRlcmFsVHJhbnNmb3JtZXIpO1xuICB9XG5cbiAgX3JlZ2lzdGVyVW5pb25zKCk6IHZvaWQge1xuICAgIGNvbnN0IHVuaW9uTGl0ZXJhbFRyYW5zZm9ybWVyID0gYXN5bmMgKGFyZywgdHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3VuaW9uJyk7XG4gICAgICBjb25zdCBhbHRlcm5hdGUgPSBhcnJheS5maW5kKHR5cGUudHlwZXMsIGVsZW1lbnQgPT4ge1xuICAgICAgICBpbnZhcmlhbnQoZWxlbWVudC5raW5kID09PSAnc3RyaW5nLWxpdGVyYWwnIHx8IGVsZW1lbnQua2luZCA9PT0gJ251bWJlci1saXRlcmFsJ1xuICAgICAgICAgICAgfHwgZWxlbWVudC5raW5kID09PSAnYm9vbGVhbi1saXRlcmFsJyk7XG4gICAgICAgIHJldHVybiAoYXJnID09PSBlbGVtZW50LnZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgaW52YXJpYW50KGFsdGVybmF0ZSk7XG4gICAgICAvLyBUaGlzIGlzIGp1c3QgdGhlIGxpdGVyYWwgdHJhbnNmb3JtZXIgaW5saW5lZCAuLi5cbiAgICAgIHJldHVybiBhcmc7XG4gICAgfTtcbiAgICBjb25zdCB1bmlvbk9iamVjdE1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndW5pb24nKTtcbiAgICAgIHJldHVybiB0aGlzLm1hcnNoYWwoYXJnLCBmaW5kQWx0ZXJuYXRlKGFyZywgdHlwZSkpO1xuICAgIH07XG4gICAgY29uc3QgdW5pb25PYmplY3RVbm1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndW5pb24nKTtcbiAgICAgIHJldHVybiB0aGlzLnVubWFyc2hhbChhcmcsIGZpbmRBbHRlcm5hdGUoYXJnLCB0eXBlKSk7XG4gICAgfTtcbiAgICBjb25zdCB1bmlvbk1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndW5pb24nKTtcbiAgICAgIGlmICh0eXBlLmRpc2NyaW1pbmFudEZpZWxkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuaW9uT2JqZWN0TWFyc2hhbGxlcihhcmcsIHR5cGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVuaW9uTGl0ZXJhbFRyYW5zZm9ybWVyKGFyZywgdHlwZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCB1bmlvblVubWFyc2hhbGxlciA9IChhcmcsIHR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd1bmlvbicpO1xuICAgICAgaWYgKHR5cGUuZGlzY3JpbWluYW50RmllbGQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5pb25PYmplY3RVbm1hcnNoYWxsZXIoYXJnLCB0eXBlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmlvbkxpdGVyYWxUcmFuc2Zvcm1lcihhcmcsIHR5cGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCd1bmlvbicsIHVuaW9uTWFyc2hhbGxlciwgdW5pb25Vbm1hcnNoYWxsZXIpO1xuICB9XG5cbiAgX3JlZ2lzdGVyU3BlY2lhbFR5cGVzKCk6IHZvaWQge1xuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIGFueSBPYmplY3QgdHlwZVxuICAgIHRoaXMucmVnaXN0ZXJUeXBlKG9iamVjdFR5cGUubmFtZSwgYXN5bmMgb2JqZWN0ID0+IHtcbiAgICAgIGFzc2VydChvYmplY3QgIT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JywgJ0V4cGVjdGVkIE9iamVjdCBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfSwgYXN5bmMgb2JqZWN0ID0+IHtcbiAgICAgIGFzc2VydChvYmplY3QgIT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JywgJ0V4cGVjdGVkIE9iamVjdCBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBKYXZhc2NyaXB0IERhdGUgb2JqZWN0c1xuICAgIHRoaXMucmVnaXN0ZXJUeXBlKGRhdGVUeXBlLm5hbWUsIGFzeW5jIGRhdGUgPT4ge1xuICAgICAgYXNzZXJ0KGRhdGUgaW5zdGFuY2VvZiBEYXRlLCAnRXhwZWN0ZWQgZGF0ZSBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBkYXRlLnRvSlNPTigpO1xuICAgIH0sIGFzeW5jIGRhdGVTdHIgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnQuXG4gICAgICBkYXRlU3RyID0gKGRhdGVTdHIgaW5zdGFuY2VvZiBTdHJpbmcpID8gZGF0ZVN0ci52YWx1ZU9mKCkgOiBkYXRlU3RyO1xuXG4gICAgICBhc3NlcnQodHlwZW9mIGRhdGVTdHIgPT09ICdzdHJpbmcnLCAnRXhwZWNldGVkIGEgc3RyaW5nIGFyZ3VtZW50LicpO1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGVTdHIpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgUmVnRXhwIG9iamVjdHNcbiAgICB0aGlzLnJlZ2lzdGVyVHlwZShyZWdFeHBUeXBlLm5hbWUsIGFzeW5jIHJlZ2V4cCA9PiB7XG4gICAgICBhc3NlcnQocmVnZXhwIGluc3RhbmNlb2YgUmVnRXhwLCAnRXhwZWN0ZWQgYSBSZWdFeHAgb2JqZWN0IGFzIGFuIGFyZ3VtZW50Jyk7XG4gICAgICByZXR1cm4gcmVnZXhwLnRvU3RyaW5nKCk7XG4gICAgfSwgYXN5bmMgcmVnU3RyID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50LlxuICAgICAgcmVnU3RyID0gKHJlZ1N0ciBpbnN0YW5jZW9mIFN0cmluZykgPyByZWdTdHIudmFsdWVPZigpIDogcmVnU3RyO1xuXG4gICAgICBhc3NlcnQodHlwZW9mIHJlZ1N0ciA9PT0gJ3N0cmluZycsICdFeHBlY3RlZCBhIHN0cmluZyBhcmd1bWVudC4nKTtcbiAgICAgIC8vICRGbG93SXNzdWUgLSBmbGVzaCBvdXQgdGhlIHZtIG1vZHVsZS5cbiAgICAgIHJldHVybiB2bS5ydW5JblRoaXNDb250ZXh0KHJlZ1N0cik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBCdWZmZXIgb2JqZWN0cyB0aHJvdWdoIEJhc2U2NCBzdHJpbmdzXG4gICAgdGhpcy5yZWdpc3RlclR5cGUoYnVmZmVyVHlwZS5uYW1lLCBhc3luYyBidWZmZXIgPT4ge1xuICAgICAgYXNzZXJ0KGJ1ZmZlciBpbnN0YW5jZW9mIEJ1ZmZlciwgJ0V4cGVjdGVkIGEgYnVmZmVyIGFyZ3VtZW50LicpO1xuICAgICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgfSwgYXN5bmMgYmFzZTY0c3RyaW5nID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50LlxuICAgICAgYmFzZTY0c3RyaW5nID0gKGJhc2U2NHN0cmluZyBpbnN0YW5jZW9mIFN0cmluZykgPyBiYXNlNjRzdHJpbmcudmFsdWVPZigpIDogYmFzZTY0c3RyaW5nO1xuXG4gICAgICBhc3NlcnQoXG4gICAgICAgIHR5cGVvZiBiYXNlNjRzdHJpbmcgPT09ICdzdHJpbmcnLFxuICAgICAgICBgRXhwZWN0ZWQgYSBiYXNlNjQgc3RyaW5nLiBOb3QgJHt0eXBlb2YgYmFzZTY0c3RyaW5nfWApO1xuICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoYmFzZTY0c3RyaW5nLCAnYmFzZTY0Jyk7XG4gICAgfSk7XG5cbiAgICAvLyBmcy5TdGF0c1xuICAgIHRoaXMucmVnaXN0ZXJUeXBlKGZzU3RhdHNUeXBlLm5hbWUsIGFzeW5jIHN0YXRzID0+IHtcbiAgICAgIGFzc2VydChzdGF0cyBpbnN0YW5jZW9mIGZzLlN0YXRzKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzdGF0c1RvT2JqZWN0KHN0YXRzKSk7XG4gICAgfSwgYXN5bmMganNvbiA9PiB7XG4gICAgICBhc3NlcnQodHlwZW9mIGpzb24gPT09ICdzdHJpbmcnKTtcbiAgICAgIHJldHVybiBvYmplY3RUb1N0YXRzKEpTT04ucGFyc2UoanNvbikpO1xuICAgIH0pO1xuICB9XG5cbiAgX3JlZ2lzdGVyQ29udGFpbmVycygpOiB2b2lkIHtcbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBBcnJheXMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdhcnJheScsIGFzeW5jICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBhc3NlcnQodmFsdWUgaW5zdGFuY2VvZiBBcnJheSwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIEFycmF5LicpO1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ2FycmF5Jyk7XG4gICAgICBjb25zdCBlbGVtVHlwZSA9IHR5cGUudHlwZTtcbiAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbCh2YWx1ZS5tYXAoZWxlbSA9PiB0aGlzLm1hcnNoYWwoZWxlbSwgZWxlbVR5cGUpKSk7XG4gICAgfSwgYXN5bmMgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnYXJyYXknKTtcbiAgICAgIGNvbnN0IGVsZW1UeXBlID0gdHlwZS50eXBlO1xuICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKHZhbHVlLm1hcChlbGVtID0+IHRoaXMudW5tYXJzaGFsKGVsZW0sIGVsZW1UeXBlKSkpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIGFuZCBEZXNlcmlhbGl6ZSBPYmplY3RzLlxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnb2JqZWN0JywgYXN5bmMgKG9iajogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBhc3NlcnQodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcsICdFeHBlY3RlZCBhbiBhcmd1bWVudCBvZiB0eXBlIG9iamVjdC4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdvYmplY3QnKTtcbiAgICAgIGNvbnN0IG5ld09iaiA9IHt9OyAvLyBDcmVhdGUgYSBuZXcgb2JqZWN0IHNvIHdlIGRvbid0IG11dGF0ZSB0aGUgb3JpZ2luYWwgb25lLlxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwodHlwZS5maWVsZHMubWFwKGFzeW5jIHByb3AgPT4ge1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgc291cmNlIG9iamVjdCBoYXMgdGhpcyBrZXkuXG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcC5uYW1lKSkge1xuICAgICAgICAgIG5ld09ialtwcm9wLm5hbWVdID0gYXdhaXQgdGhpcy5tYXJzaGFsKG9ialtwcm9wLm5hbWVdLCBwcm9wLnR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIHRoZSBwcm9wZXJ0eSBpcyBvcHRpb25hbCwgaXQncyBva2F5IGZvciBpdCB0byBiZSBtaXNzaW5nLlxuICAgICAgICAgIGlmICghcHJvcC5vcHRpb25hbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTb3VyY2Ugb2JqZWN0IGlzIG1pc3NpbmcgcHJvcGVydHkgJHtwcm9wLm5hbWV9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIG5ld09iajtcbiAgICB9LCBhc3luYyAob2JqOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGFzc2VydCh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JywgJ0V4cGVjdGVkIGFuIGFyZ3VtZW50IG9mIHR5cGUgb2JqZWN0LicpO1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ29iamVjdCcpO1xuICAgICAgY29uc3QgbmV3T2JqID0ge307IC8vIENyZWF0ZSBhIG5ldyBvYmplY3Qgc28gd2UgZG9uJ3QgbXV0YXRlIHRoZSBvcmlnaW5hbCBvbmUuXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbCh0eXBlLmZpZWxkcy5tYXAoYXN5bmMgcHJvcCA9PiB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBzb3VyY2Ugb2JqZWN0IGhhcyB0aGlzIGtleS5cbiAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wLm5hbWUpKSB7XG4gICAgICAgICAgbmV3T2JqW3Byb3AubmFtZV0gPSBhd2FpdCB0aGlzLnVubWFyc2hhbChvYmpbcHJvcC5uYW1lXSwgcHJvcC50eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcHJvcGVydHkgaXMgb3B0aW9uYWwsIGl0J3Mgb2theSBmb3IgaXQgdG8gYmUgbWlzc2luZy5cbiAgICAgICAgICBpZiAoIXByb3Aub3B0aW9uYWwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU291cmNlIG9iamVjdCBpcyBtaXNzaW5nIHByb3BlcnR5ICR7cHJvcC5uYW1lfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIHJldHVybiBuZXdPYmo7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBTZXRzLlxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnc2V0JywgYXN5bmMgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdzZXQnKTtcbiAgICAgIGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIFNldCwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIFNldC4nKTtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZVByb21pc2VzID0gW107XG4gICAgICBmb3IgKGNvbnN0IGVsZW0gb2YgdmFsdWUpIHtcbiAgICAgICAgc2VyaWFsaXplUHJvbWlzZXMucHVzaCh0aGlzLm1hcnNoYWwoZWxlbSwgdHlwZS50eXBlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoc2VyaWFsaXplUHJvbWlzZXMpO1xuICAgIH0sIGFzeW5jICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBhc3NlcnQodmFsdWUgaW5zdGFuY2VvZiBBcnJheSwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIEFycmF5LicpO1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3NldCcpO1xuICAgICAgY29uc3QgZWxlbVR5cGUgPSB0eXBlLnR5cGU7XG4gICAgICBjb25zdCBlbGVtZW50cyA9IGF3YWl0IFByb21pc2UuYWxsKHZhbHVlLm1hcChlbGVtID0+IHRoaXMudW5tYXJzaGFsKGVsZW0sIGVsZW1UeXBlKSkpO1xuICAgICAgcmV0dXJuIG5ldyBTZXQoZWxlbWVudHMpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgTWFwcy5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ21hcCcsIGFzeW5jIChtYXA6IE1hcCwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgYXNzZXJ0KG1hcCBpbnN0YW5jZW9mIE1hcCwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIFNldC4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdtYXAnKTtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZVByb21pc2VzID0gW107XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBtYXApIHtcbiAgICAgICAgc2VyaWFsaXplUHJvbWlzZXMucHVzaChQcm9taXNlLmFsbChbXG4gICAgICAgICAgdGhpcy5tYXJzaGFsKGtleSwgdHlwZS5rZXlUeXBlKSxcbiAgICAgICAgICB0aGlzLm1hcnNoYWwodmFsdWUsIHR5cGUudmFsdWVUeXBlKSxcbiAgICAgICAgXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKHNlcmlhbGl6ZVByb21pc2VzKTtcbiAgICB9LCBhc3luYyAoc2VyaWFsaXplZDogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBhc3NlcnQoc2VyaWFsaXplZCBpbnN0YW5jZW9mIEFycmF5LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnbWFwJyk7XG4gICAgICBjb25zdCBrZXlUeXBlID0gdHlwZS5rZXlUeXBlO1xuICAgICAgY29uc3QgdmFsdWVUeXBlID0gdHlwZS52YWx1ZVR5cGU7XG4gICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIHNlcmlhbGl6ZWQubWFwKGVudHJ5ID0+IFByb21pc2UuYWxsKFtcbiAgICAgICAgICB0aGlzLnVubWFyc2hhbChlbnRyeVswXSwga2V5VHlwZSksXG4gICAgICAgICAgdGhpcy51bm1hcnNoYWwoZW50cnlbMV0sIHZhbHVlVHlwZSksXG4gICAgICAgIF0pKVxuICAgICAgKTtcbiAgICAgIHJldHVybiBuZXcgTWFwKGVudHJpZXMpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgVHVwbGVzLlxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgndHVwbGUnLCBhc3luYyAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgLy8gQXNzZXJ0IHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LlxuICAgICAgYXNzZXJ0KEFycmF5LmlzQXJyYXkodmFsdWUpLCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndHVwbGUnKTtcbiAgICAgIGNvbnN0IHR5cGVzID0gdHlwZS50eXBlcztcbiAgICAgIGFzc2VydCh2YWx1ZS5sZW5ndGggPT09IHR5cGVzLmxlbmd0aCwgYEV4cGVjdGVkIHR1cGxlIG9mIGxlbmd0aCAke3R5cGVzLmxlbmd0aH0uYCk7XG5cbiAgICAgIC8vIENvbnZlcnQgYWxsIG9mIHRoZSBlbGVtZW50cyB0aHJvdWdoIHRoZSBjb3JyZWN0IG1hcnNoYWxsZXIuXG4gICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwodmFsdWUubWFwKChlbGVtLCBpKSA9PlxuICAgICAgICB0aGlzLm1hcnNoYWwoZWxlbSwgdHlwZXNbaV0pKSk7XG4gICAgfSwgYXN5bmMgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIC8vIEFzc2VydCB0aGUgbGVuZ3RoIG9mIHRoZSBhcnJheS5cbiAgICAgIGFzc2VydChBcnJheS5pc0FycmF5KHZhbHVlKSwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIEFycmF5LicpO1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3R1cGxlJyk7XG4gICAgICBjb25zdCB0eXBlcyA9IHR5cGUudHlwZXM7XG4gICAgICBhc3NlcnQodmFsdWUubGVuZ3RoID09PSB0eXBlcy5sZW5ndGgsIGBFeHBlY3RlZCB0dXBsZSBvZiBsZW5ndGggJHt0eXBlcy5sZW5ndGh9LmApO1xuXG4gICAgICAvLyBDb252ZXJ0IGFsbCBvZiB0aGUgZWxlbWVudHMgdGhyb3VnaCB0aGUgY29ycmVjdCB1bm1hcnNoYWxsZXIuXG4gICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwodmFsdWUubWFwKChlbGVtLCBpKSA9PlxuICAgICAgICB0aGlzLnVubWFyc2hhbChlbGVtLCB0eXBlc1tpXSkpKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRPYmplY3RGaWVsZEJ5TmFtZSh0eXBlOiBPYmplY3RUeXBlLCBmaWVsZE5hbWU6IHN0cmluZyk6IE9iamVjdEZpZWxkIHtcbiAgY29uc3QgcmVzdWx0ID0gYXJyYXkuZmluZCh0eXBlLmZpZWxkcywgZmllbGQgPT4gZmllbGQubmFtZSA9PT0gZmllbGROYW1lKTtcbiAgaW52YXJpYW50KHJlc3VsdCAhPSBudWxsKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZmluZEFsdGVybmF0ZShhcmc6IE9iamVjdCwgdHlwZTogVW5pb25UeXBlKTogT2JqZWN0VHlwZSB7XG4gIGNvbnN0IGRpc2NyaW1pbmFudEZpZWxkID0gdHlwZS5kaXNjcmltaW5hbnRGaWVsZDtcbiAgaW52YXJpYW50KGRpc2NyaW1pbmFudEZpZWxkICE9IG51bGwpO1xuICBjb25zdCBkaXNjcmltaW5hbnQgPSBhcmdbZGlzY3JpbWluYW50RmllbGRdO1xuICBpbnZhcmlhbnQoZGlzY3JpbWluYW50ICE9IG51bGwpO1xuICBjb25zdCBhbHRlcm5hdGVzOiBBcnJheTxPYmplY3RUeXBlPiA9ICh0eXBlLnR5cGVzOiBhbnkpO1xuICBjb25zdCByZXN1bHQgPSBhcnJheS5maW5kKGFsdGVybmF0ZXMsIGFsdGVybmF0ZSA9PiB7XG4gICAgaW52YXJpYW50KGFsdGVybmF0ZS5raW5kID09PSAnb2JqZWN0Jyk7XG4gICAgY29uc3QgYWx0ZXJuYXRlVHlwZSA9IGdldE9iamVjdEZpZWxkQnlOYW1lKGFsdGVybmF0ZSwgZGlzY3JpbWluYW50RmllbGQpLnR5cGU7XG4gICAgaW52YXJpYW50KGFsdGVybmF0ZVR5cGUua2luZCA9PT0gJ3N0cmluZy1saXRlcmFsJyB8fCBhbHRlcm5hdGVUeXBlLmtpbmQgPT09ICdudW1iZXItbGl0ZXJhbCdcbiAgICAgICAgfHwgYWx0ZXJuYXRlVHlwZS5raW5kID09PSAnYm9vbGVhbi1saXRlcmFsJyk7XG4gICAgcmV0dXJuIGFsdGVybmF0ZVR5cGUudmFsdWUgPT09IGRpc2NyaW1pbmFudDtcbiAgfSk7XG4gIGludmFyaWFudChyZXN1bHQgIT0gbnVsbCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=