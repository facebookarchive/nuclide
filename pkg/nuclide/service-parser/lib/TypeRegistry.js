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
 *
 * In the interest of a performance, a transformer should only return a Promise if necessary.
 * (Promise objects and Promise.all are very expensive operations in large numbers).
 */

// Equivalent to Promise.all, but avoids wrappers if nothing is actually a promise.
// Input must be homogenously typed.
function smartPromiseAll(arr) {
  if (arr.length === 0 || !(arr[0] instanceof Promise)) {
    return arr;
  }
  return Promise.all(arr);
}

// Same as the above, but works for non-homogenous input.
function checkedSmartPromiseAll(arr) {
  for (var elem of arr) {
    if (elem instanceof Promise) {
      return Promise.all(arr);
    }
  }
  return arr;
}

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
    this._registerIntersections();

    // Register NullableType and NamedType
    this._registerKind('nullable', function (value, type) {
      if (value === null || value === undefined || type.kind !== 'nullable') {
        return null;
      }
      return _this._marshal(value, type.type);
    }, function (value, type) {
      if (value === null || value === undefined || type.kind !== 'nullable') {
        return null;
      }
      return _this._unmarshal(value, type.type);
    });

    this._registerKind('named', function (value, type) {
      (0, _assert3['default'])(type.kind === 'named');
      var namedMarshaller = _this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error('No marshaller found for named type ' + type.name + '.');
      }
      return namedMarshaller.marshaller(value);
    }, function (value, type) {
      (0, _assert3['default'])(type.kind === 'named');
      var namedMarshaller = _this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error('No marshaller found for named type ' + type.name + '.');
      }
      return namedMarshaller.unmarshaller(value);
    });

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
        return _this2._marshal(value, type);
      }, function (value) {
        return _this2._unmarshal(value, type);
      });
    }

    /**
     * Marshal an object using the appropriate marshal function.
     * Ensures the result is actually a Promise.
     * @param value - The value to be marshalled.
     * @param type - The type object (used to find the appropriate function).
     */
  }, {
    key: 'marshal',
    value: function marshal(value, type) {
      return Promise.resolve(this._marshal(value, type));
    }
  }, {
    key: '_marshal',
    value: function _marshal(value, type) {
      var kindMarshaller = this._kindMarshallers.get(type.kind);
      if (kindMarshaller == null) {
        throw new Error('No marshaller found for type kind ' + type.kind + '.');
      }
      return kindMarshaller.marshaller(value, type);
    }

    /**
     * Unmarshal and object using the appropriate unmarshal function.
     * Ensures the result is actually a Promise.
     * @param value - The value to be marshalled.
     * @param type - The type object (used to find the appropriate function).
     */
  }, {
    key: 'unmarshal',
    value: function unmarshal(value, type) {
      return Promise.resolve(this._unmarshal(value, type));
    }
  }, {
    key: '_unmarshal',
    value: function _unmarshal(value, type) {
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
      var stringTransformer = function stringTransformer(arg) {
        // Unbox argument.
        arg = arg instanceof String ? arg.valueOf() : arg;
        (0, _assert2['default'])(typeof arg === 'string', 'Expected a string argument');
        return arg;
      };
      var numberTransformer = function numberTransformer(arg) {
        // Unbox argument.
        if (arg instanceof Number) {
          arg = arg.valueOf();
        }
        (0, _assert2['default'])(typeof arg === 'number', 'Expected a number argument');
        return arg;
      };
      var booleanTransformer = function booleanTransformer(arg) {
        // Unbox argument
        if (arg instanceof Boolean) {
          arg = arg.valueOf();
        }
        (0, _assert2['default'])(typeof arg === 'boolean', 'Expected a boolean argument');
        return arg;
      };
      // We assume an 'any' and 'mixed' types require no marshalling.
      var identityTransformer = function identityTransformer(arg) {
        return arg;
      };

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
      var literalTransformer = function literalTransformer(arg, type) {
        (0, _assert3['default'])(type.kind === 'string-literal' || type.kind === 'number-literal' || type.kind === 'boolean-literal');
        (0, _assert3['default'])(arg === type.value);
        return arg;
      };
      this._registerKind('string-literal', literalTransformer, literalTransformer);
      this._registerKind('number-literal', literalTransformer, literalTransformer);
      this._registerKind('boolean-literal', literalTransformer, literalTransformer);
    }
  }, {
    key: '_registerUnions',
    value: function _registerUnions() {
      var _this3 = this;

      var unionLiteralTransformer = function unionLiteralTransformer(arg, type) {
        (0, _assert3['default'])(type.kind === 'union');
        var alternate = _commons.array.find(type.types, function (element) {
          (0, _assert3['default'])(element.kind === 'string-literal' || element.kind === 'number-literal' || element.kind === 'boolean-literal');
          return arg === element.value;
        });
        (0, _assert3['default'])(alternate);
        // This is just the literal transformer inlined ...
        return arg;
      };
      var unionObjectMarshaller = function unionObjectMarshaller(arg, type) {
        (0, _assert3['default'])(type.kind === 'union');
        return _this3._marshal(arg, findAlternate(arg, type));
      };
      var unionObjectUnmarshaller = function unionObjectUnmarshaller(arg, type) {
        (0, _assert3['default'])(type.kind === 'union');
        return _this3._unmarshal(arg, findAlternate(arg, type));
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
    key: '_registerIntersections',
    value: function _registerIntersections() {
      var _this4 = this;

      var intersectionMarshaller = function intersectionMarshaller(arg, type) {
        (0, _assert3['default'])(type.kind === 'intersection');
        (0, _assert3['default'])(type.flattened != null);
        return _this4._marshal(arg, type.flattened);
      };
      var intersectionUnmarshaller = function intersectionUnmarshaller(arg, type) {
        (0, _assert3['default'])(type.kind === 'intersection');
        (0, _assert3['default'])(type.flattened != null);
        return _this4._unmarshal(arg, type.flattened);
      };
      this._registerKind('intersection', intersectionMarshaller, intersectionUnmarshaller);
    }
  }, {
    key: '_registerSpecialTypes',
    value: function _registerSpecialTypes() {
      // Serialize / Deserialize any Object type
      this.registerType(_builtinTypes.objectType.name, function (object) {
        (0, _assert2['default'])(object != null && typeof object === 'object', 'Expected Object argument.');
        return object;
      }, function (object) {
        (0, _assert2['default'])(object != null && typeof object === 'object', 'Expected Object argument.');
        return object;
      });

      // Serialize / Deserialize Javascript Date objects
      this.registerType(_builtinTypes.dateType.name, function (date) {
        (0, _assert2['default'])(date instanceof Date, 'Expected date argument.');
        return date.toJSON();
      }, function (dateStr) {
        // Unbox argument.
        dateStr = dateStr instanceof String ? dateStr.valueOf() : dateStr;

        (0, _assert2['default'])(typeof dateStr === 'string', 'Expeceted a string argument.');
        return new Date(dateStr);
      });

      // Serialize / Deserialize RegExp objects
      this.registerType(_builtinTypes.regExpType.name, function (regexp) {
        (0, _assert2['default'])(regexp instanceof RegExp, 'Expected a RegExp object as an argument');
        return regexp.toString();
      }, function (regStr) {
        // Unbox argument.
        regStr = regStr instanceof String ? regStr.valueOf() : regStr;

        (0, _assert2['default'])(typeof regStr === 'string', 'Expected a string argument.');
        return _vm2['default'].runInThisContext(regStr);
      });

      // Serialize / Deserialize Buffer objects through Base64 strings
      this.registerType(_builtinTypes.bufferType.name, function (buffer) {
        (0, _assert2['default'])(buffer instanceof Buffer, 'Expected a buffer argument.');
        return buffer.toString('base64');
      }, function (base64string) {
        // Unbox argument.
        base64string = base64string instanceof String ? base64string.valueOf() : base64string;

        (0, _assert2['default'])(typeof base64string === 'string', 'Expected a base64 string. Not ' + typeof base64string);
        return new Buffer(base64string, 'base64');
      });

      // fs.Stats
      this.registerType(_builtinTypes.fsStatsType.name, function (stats) {
        (0, _assert2['default'])(stats instanceof _fs2['default'].Stats);
        return JSON.stringify(statsToObject(stats));
      }, function (json) {
        (0, _assert2['default'])(typeof json === 'string');
        return objectToStats(JSON.parse(json));
      });
    }
  }, {
    key: '_registerContainers',
    value: function _registerContainers() {
      var _this5 = this;

      // Serialize / Deserialize Arrays.
      this._registerKind('array', function (value, type) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'array');
        var elemType = type.type;
        return smartPromiseAll(value.map(function (elem) {
          return _this5._marshal(elem, elemType);
        }));
      }, function (value, type) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'array');
        var elemType = type.type;
        return smartPromiseAll(value.map(function (elem) {
          return _this5._unmarshal(elem, elemType);
        }));
      });

      // Serialize and Deserialize Objects.
      this._registerKind('object', function (obj, type) {
        (0, _assert2['default'])(typeof obj === 'object', 'Expected an argument of type object.');
        (0, _assert3['default'])(type.kind === 'object');
        var newObj = {}; // Create a new object so we don't mutate the original one.
        var promise = checkedSmartPromiseAll(type.fields.map(function (prop) {
          // Check if the source object has this key.
          if (obj != null && obj.hasOwnProperty(prop.name)) {
            var _value = _this5._marshal(obj[prop.name], prop.type);
            if (_value instanceof Promise) {
              return _value.then(function (result) {
                return newObj[prop.name] = result;
              });
            } else {
              newObj[prop.name] = _value;
            }
          } else if (!prop.optional) {
            // If the property is optional, it's okay for it to be missing.
            throw new Error('Source object: ' + JSON.stringify(obj) + ' is missing property ' + prop.name + '.');
          }
        }));
        if (promise instanceof Promise) {
          return promise.then(function () {
            return newObj;
          });
        }
        return newObj;
      }, function (obj, type) {
        (0, _assert2['default'])(typeof obj === 'object', 'Expected an argument of type object.');
        (0, _assert3['default'])(type.kind === 'object');
        var newObj = {}; // Create a new object so we don't mutate the original one.
        var promise = checkedSmartPromiseAll(type.fields.map(function (prop) {
          // Check if the source object has this key.
          if (obj != null && obj.hasOwnProperty(prop.name)) {
            var _value2 = _this5._unmarshal(obj[prop.name], prop.type);
            if (_value2 instanceof Promise) {
              return _value2.then(function (result) {
                return newObj[prop.name] = result;
              });
            } else {
              newObj[prop.name] = _value2;
            }
          } else if (!prop.optional) {
            // If the property is optional, it's okay for it to be missing.
            throw new Error('Source object: ' + JSON.stringify(obj) + ' is missing property ' + prop.name + '.');
          }
        }));
        if (promise instanceof Promise) {
          return promise.then(function () {
            return newObj;
          });
        }
        return newObj;
      });

      // Serialize / Deserialize Sets.
      this._registerKind('set', function (value, type) {
        (0, _assert3['default'])(type.kind === 'set');
        (0, _assert2['default'])(value instanceof Set, 'Expected an object of type Set.');
        var serializePromises = [];
        for (var elem of value) {
          serializePromises.push(_this5._marshal(elem, type.type));
        }
        return smartPromiseAll(serializePromises);
      }, _asyncToGenerator(function* (value, type) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'set');
        var elemType = type.type;
        var elements = yield smartPromiseAll(value.map(function (elem) {
          return _this5._unmarshal(elem, elemType);
        }));
        return new Set(elements);
      }));

      // Serialize / Deserialize Maps.
      this._registerKind('map', function (map, type) {
        (0, _assert2['default'])(map instanceof Map, 'Expected an object of type Set.');
        (0, _assert3['default'])(type.kind === 'map');
        var serializePromises = [];
        for (var _ref3 of map) {
          var _ref2 = _slicedToArray(_ref3, 2);

          var key = _ref2[0];
          var _value3 = _ref2[1];

          serializePromises.push(checkedSmartPromiseAll([_this5._marshal(key, type.keyType), _this5._marshal(_value3, type.valueType)]));
        }
        return smartPromiseAll(serializePromises);
      }, _asyncToGenerator(function* (serialized, type) {
        (0, _assert2['default'])(serialized instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'map');
        var keyType = type.keyType;
        var valueType = type.valueType;
        var entries = yield smartPromiseAll(serialized.map(function (entry) {
          return checkedSmartPromiseAll([_this5._unmarshal(entry[0], keyType), _this5._unmarshal(entry[1], valueType)]);
        }));
        return new Map(entries);
      }));

      // Serialize / Deserialize Tuples.
      this._registerKind('tuple', function (value, type) {
        // Assert the length of the array.
        (0, _assert2['default'])(Array.isArray(value), 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'tuple');
        var types = type.types;
        (0, _assert2['default'])(value.length === types.length, 'Expected tuple of length ' + types.length + '.');

        // Convert all of the elements through the correct marshaller.
        return checkedSmartPromiseAll(value.map(function (elem, i) {
          return _this5._marshal(elem, types[i]);
        }));
      }, function (value, type) {
        // Assert the length of the array.
        (0, _assert2['default'])(Array.isArray(value), 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'tuple');
        var types = type.types;
        (0, _assert2['default'])(value.length === types.length, 'Expected tuple of length ' + types.length + '.');

        // Convert all of the elements through the correct unmarshaller.
        return checkedSmartPromiseAll(value.map(function (elem, i) {
          return _this5._unmarshal(elem, types[i]);
        }));
      });
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
//# sourceMappingURL=data:application/json;base64,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LDJCQUFVLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQztBQUMxQixTQUFPLE1BQU0sQ0FBQztDQUNmIiwiZmlsZSI6IlR5cGVSZWdpc3RyeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB2bSBmcm9tICd2bSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuaW1wb3J0IHR5cGUge1xuICBUeXBlLFxuICBPYmplY3RUeXBlLFxuICBPYmplY3RGaWVsZCxcbiAgVW5pb25UeXBlLFxufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7b2JqZWN0VHlwZSwgZGF0ZVR5cGUsIHJlZ0V4cFR5cGUsIGJ1ZmZlclR5cGUsIGZzU3RhdHNUeXBlfSBmcm9tICcuL2J1aWx0aW4tdHlwZXMnO1xuXG5cbi8qXG4gKiBUaGlzIHR5cGUgcmVwcmVzZW50cyBhIFRyYW5zZm9ybWVyIGZ1bmN0aW9uLCB3aGljaCB0YWtlcyBpbiBhIHZhbHVlLCBhbmQgZWl0aGVyIHNlcmlhbGl6ZXNcbiAqIG9yIGRlc2VyaWFsaXplcyBpdC4gVHJhbnNmb3JtZXIncyBhcmUgYWRkZWQgdG8gYSByZWdpc3RyeSBhbmQgaW5kZXhlZCBieSB0aGUgbmFtZSBvZlxuICogdGhlIHR5cGUgdGhleSBoYW5kbGUgKGVnOiAnRGF0ZScpLiBUaGUgc2Vjb25kIGFyZ3VtZW50IGlzIHRoZSBhY3R1YWwgdHlwZSBvYmplY3QgdGhhdCByZXByZXNlbnRcbiAqIHRoZSB2YWx1ZS4gUGFyYW1ldGVyaXplZCB0eXBlcyBsaWtlIEFycmF5LCBvciBPYmplY3QgY2FuIHVzZSB0aGlzIHRvIHJlY3Vyc2l2ZWx5IGNhbGwgb3RoZXJcbiAqIHRyYW5zZm9ybWVycy5cbiAqXG4gKiBJbiB0aGUgaW50ZXJlc3Qgb2YgYSBwZXJmb3JtYW5jZSwgYSB0cmFuc2Zvcm1lciBzaG91bGQgb25seSByZXR1cm4gYSBQcm9taXNlIGlmIG5lY2Vzc2FyeS5cbiAqIChQcm9taXNlIG9iamVjdHMgYW5kIFByb21pc2UuYWxsIGFyZSB2ZXJ5IGV4cGVuc2l2ZSBvcGVyYXRpb25zIGluIGxhcmdlIG51bWJlcnMpLlxuICovXG5leHBvcnQgdHlwZSBUcmFuc2Zvcm1lcjxUPiA9ICh2YWx1ZTogVCwgdHlwZTogVHlwZSkgPT4gKFQgfCBQcm9taXNlPFQ+KTtcbmV4cG9ydCB0eXBlIE5hbWVkVHJhbnNmb3JtZXI8VD4gPSAodmFsdWU6IFQpID0+IChUIHwgUHJvbWlzZTxUPik7XG5cbi8vIEVxdWl2YWxlbnQgdG8gUHJvbWlzZS5hbGwsIGJ1dCBhdm9pZHMgd3JhcHBlcnMgaWYgbm90aGluZyBpcyBhY3R1YWxseSBhIHByb21pc2UuXG4vLyBJbnB1dCBtdXN0IGJlIGhvbW9nZW5vdXNseSB0eXBlZC5cbmZ1bmN0aW9uIHNtYXJ0UHJvbWlzZUFsbDxUPihhcnI6IEFycmF5PFQ+KTogQXJyYXk8VD4gfCBQcm9taXNlPEFycmF5PFQ+PiB7XG4gIGlmIChhcnIubGVuZ3RoID09PSAwIHx8ICEoYXJyWzBdIGluc3RhbmNlb2YgUHJvbWlzZSkpIHtcbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIHJldHVybiBQcm9taXNlLmFsbChhcnIpO1xufVxuXG4vLyBTYW1lIGFzIHRoZSBhYm92ZSwgYnV0IHdvcmtzIGZvciBub24taG9tb2dlbm91cyBpbnB1dC5cbmZ1bmN0aW9uIGNoZWNrZWRTbWFydFByb21pc2VBbGwoYXJyOiBBcnJheTxhbnk+KTogQXJyYXk8YW55PiB8IFByb21pc2U8QXJyYXk8YW55Pj4ge1xuICBmb3IgKGNvbnN0IGVsZW0gb2YgYXJyKSB7XG4gICAgaWYgKGVsZW0gaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoYXJyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cblxuZnVuY3Rpb24gc3RhdHNUb09iamVjdChzdGF0czogZnMuU3RhdHMpOiBPYmplY3Qge1xuICBjb25zdCByZXN1bHQgPSB7XG4gICAgZGV2OiBzdGF0cy5kZXYsXG4gICAgbW9kZTogc3RhdHMubW9kZSxcbiAgICBubGluazogc3RhdHMubmxpbmssXG4gICAgdWlkOiBzdGF0cy51aWQsXG4gICAgZ2lkOiBzdGF0cy5naWQsXG4gICAgcmRldjogc3RhdHMucmRldixcbiAgICBibGtzaXplOiBzdGF0cy5ibGtzaXplLFxuICAgIGlubzogc3RhdHMuaW5vLFxuICAgIHNpemU6IHN0YXRzLnNpemUsXG4gICAgYmxvY2tzOiBzdGF0cy5ibG9ja3MsXG4gICAgYXRpbWU6IHN0YXRzLmF0aW1lLnRvSlNPTigpLFxuICAgIG10aW1lOiBzdGF0cy5tdGltZS50b0pTT04oKSxcbiAgICBjdGltZTogc3RhdHMuY3RpbWUudG9KU09OKCksXG4gIH07XG5cbiAgaWYgKHN0YXRzLmJpcnRodGltZSkge1xuICAgIHJldHVybiB7Li4ucmVzdWx0LCBiaXJ0aHRpbWU6IHN0YXRzLmJpcnRodGltZS50b0pTT04oKSB9O1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gb2JqZWN0VG9TdGF0cyhqc29uU3RhdHM6IE9iamVjdCk6IGZzLlN0YXRzIHtcbiAgY29uc3Qgc3RhdHMgPSBuZXcgZnMuU3RhdHMoKTtcblxuICBzdGF0cy5kZXYgPSBqc29uU3RhdHMuZGV2O1xuICBzdGF0cy5tb2RlID0ganNvblN0YXRzLm1vZGU7XG4gIHN0YXRzLm5saW5rID0ganNvblN0YXRzLm5saW5rO1xuICBzdGF0cy51aWQgPSBqc29uU3RhdHMudWlkO1xuICBzdGF0cy5naWQgPSBqc29uU3RhdHMuZ2lkO1xuICBzdGF0cy5yZGV2ID0ganNvblN0YXRzLnJkZXY7XG4gIHN0YXRzLmJsa3NpemUgPSBqc29uU3RhdHMuYmxrc2l6ZTtcbiAgc3RhdHMuaW5vID0ganNvblN0YXRzLmlubztcbiAgc3RhdHMuc2l6ZSA9IGpzb25TdGF0cy5zaXplO1xuICBzdGF0cy5ibG9ja3MgPSBqc29uU3RhdHMuYmxvY2tzO1xuICBzdGF0cy5hdGltZSA9IG5ldyBEYXRlKGpzb25TdGF0cy5hdGltZSk7XG4gIHN0YXRzLm10aW1lID0gbmV3IERhdGUoanNvblN0YXRzLm10aW1lKTtcbiAgc3RhdHMuY3RpbWUgPSBuZXcgRGF0ZShqc29uU3RhdHMuY3RpbWUpO1xuXG4gIGlmIChqc29uU3RhdHMuYmlydGh0aW1lKSB7XG4gICAgLy8gJEZsb3dJc3N1ZVxuICAgIHN0YXRzLmJpcnRodGltZSA9IG5ldyBEYXRlKGpzb25TdGF0cy5iaXJ0aHRpbWUpO1xuICB9XG5cbiAgcmV0dXJuIHN0YXRzO1xufVxuXG4vKlxuICogVGhlIFR5cGVSZWdpc3RyeSBpcyBhIGNlbnRyYWxpemVkIHBsYWNlIHRvIHJlZ2lzdGVyIGZ1bmN0aW9ucyB0aGF0IHNlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemVcbiAqIHR5cGVzLiBUaGlzIGFsbG93cyBmb3IgdHlwZXMgZGVmaW5lZCBpbiBvbmUgc2VydmljZSB0byBpbmNsdWRlIHR5cGVzIGZyb20gYW5vdGhlciBzZXJ2aWNlIGluXG4gKiBhbm90aGVyIGZpbGUuIEl0IGFsc28gYWxsb3dzIHRoZSBhYmlsaXR5IHRvIGFkZCBuZXcgcHJpbWl0aXZlcywgcmFuZ2luZyBmcm9tIEJ1ZmZlciB0byBOdWNsaWRlVXJpXG4gKiB0aGF0IGFyZSBub3QgaGFuZGxlZCBhdCB0aGUgdHJhbnNwb3J0IGxheWVyLiBUaGUga2V5IGNvbmNlcHQgaXMgdGhhdCBtYXJzaGFsbGluZyBmdW5jdGlvbnMgY2FuXG4gKiBiZSByZWN1cnNpdmUsIGNhbGxpbmcgb3RoZXIgbWFyc2hhbGxpbmcgZnVuY3Rpb25zLCBlbmRpbmcgYXQgdGhlIHByaW1pdGl2ZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGVSZWdpc3RyeSB7XG4gIC8qKiBTdG9yZSBtYXJoc2FsbGVycyBhbmQgYW5kIHVubWFyc2hhbGxlcnMsIGluZGV4IGJ5IHRoZSBraW5kIG9mIHRoZSB0eXBlLiAqL1xuICBfa2luZE1hcnNoYWxsZXJzOiBNYXA8c3RyaW5nLCB7XG4gICAgICBtYXJzaGFsbGVyOiBUcmFuc2Zvcm1lcjtcbiAgICAgIHVubWFyc2hhbGxlcjogVHJhbnNmb3JtZXI7XG4gICAgfT47XG5cbiAgLyoqIFN0b3JlIG1hcmhzYWxsZXJzIGFuZCBhbmQgdW5tYXJzaGFsbGVycywgaW5kZXggYnkgdGhlIG5hbWUgb2YgdGhlIHR5cGUuICovXG4gIF9uYW1lZE1hcnNoYWxsZXJzOiBNYXA8c3RyaW5nLCB7XG4gICAgICBtYXJzaGFsbGVyOiBOYW1lZFRyYW5zZm9ybWVyO1xuICAgICAgdW5tYXJzaGFsbGVyOiBOYW1lZFRyYW5zZm9ybWVyO1xuICAgIH0+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2tpbmRNYXJzaGFsbGVycyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9uYW1lZE1hcnNoYWxsZXJzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fcmVnaXN0ZXJQcmltaXRpdmVzKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJTcGVjaWFsVHlwZXMoKTtcbiAgICB0aGlzLl9yZWdpc3RlckNvbnRhaW5lcnMoKTtcbiAgICB0aGlzLl9yZWdpc3RlckxpdGVyYWxzKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJVbmlvbnMoKTtcbiAgICB0aGlzLl9yZWdpc3RlckludGVyc2VjdGlvbnMoKTtcblxuICAgIC8vIFJlZ2lzdGVyIE51bGxhYmxlVHlwZSBhbmQgTmFtZWRUeXBlXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdudWxsYWJsZScsICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB0eXBlLmtpbmQgIT09ICdudWxsYWJsZScpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fbWFyc2hhbCh2YWx1ZSwgdHlwZS50eXBlKTtcbiAgICB9LCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdHlwZS5raW5kICE9PSAnbnVsbGFibGUnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX3VubWFyc2hhbCh2YWx1ZSwgdHlwZS50eXBlKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbmFtZWQnLCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ25hbWVkJyk7XG4gICAgICBjb25zdCBuYW1lZE1hcnNoYWxsZXIgPSB0aGlzLl9uYW1lZE1hcnNoYWxsZXJzLmdldCh0eXBlLm5hbWUpO1xuICAgICAgaWYgKG5hbWVkTWFyc2hhbGxlciA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gbWFyc2hhbGxlciBmb3VuZCBmb3IgbmFtZWQgdHlwZSAke3R5cGUubmFtZX0uYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmFtZWRNYXJzaGFsbGVyLm1hcnNoYWxsZXIodmFsdWUpO1xuICAgIH0sICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnbmFtZWQnKTtcbiAgICAgIGNvbnN0IG5hbWVkTWFyc2hhbGxlciA9IHRoaXMuX25hbWVkTWFyc2hhbGxlcnMuZ2V0KHR5cGUubmFtZSk7XG4gICAgICBpZiAobmFtZWRNYXJzaGFsbGVyID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBtYXJzaGFsbGVyIGZvdW5kIGZvciBuYW1lZCB0eXBlICR7dHlwZS5uYW1lfS5gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYW1lZE1hcnNoYWxsZXIudW5tYXJzaGFsbGVyKHZhbHVlKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZChcbiAgICAgICd2b2lkJyxcbiAgICAgICh2YWx1ZSwgdHlwZSkgPT4gUHJvbWlzZS5yZXNvbHZlKG51bGwpLFxuICAgICAgKHZhbHVlLCB0eXBlKSA9PiBQcm9taXNlLnJlc29sdmUobnVsbCkpO1xuICB9XG5cbiAgX3JlZ2lzdGVyS2luZChraW5kOiBzdHJpbmcsIG1hcnNoYWxsZXI6IFRyYW5zZm9ybWVyLCB1bm1hcnNoYWxsZXI6IFRyYW5zZm9ybWVyKTogdm9pZCB7XG4gICAgaW52YXJpYW50KCF0aGlzLl9raW5kTWFyc2hhbGxlcnMuaGFzKGtpbmQpKTtcbiAgICB0aGlzLl9raW5kTWFyc2hhbGxlcnMuc2V0KGtpbmQsIHttYXJzaGFsbGVyLCB1bm1hcnNoYWxsZXJ9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIHR5cGUgYnkgcHJvdmlkaW5nIGJvdGggYSBtYXJzaGFsbGVyIGFuZCBhbiB1bm1hcnNoYWxsZXIuIFRoZSBtYXJzaGFsbGVyXG4gICAqIHdpbGwgYmUgY2FsbGVkIHRvIHRyYW5zZm9ybSB0aGUgdHlwZSBiZWZvcmUgc2VuZGluZyBpdCBvdXQgb250byB0aGUgbmV0d29yaywgd2hpbGUgdGhlXG4gICAqIHVubWFyc2hhbGxlciB3aWxsIGJlIGNhbGxlZCBvbiB2YWx1ZXMgaW5jb21pbmcgZnJvbSB0aGUgbmV0d29yay5cbiAgICogQHBhcmFtIHR5cGVOYW1lIC0gVGhlIHN0cmluZyBuYW1lIG9mIHRoZSB0eXBlIHRoYXQgdGhlIHByb3ZpZGVkIG1hcnNoYWxsZXJzIGNvbnZlcnQuXG4gICAqIEBwYXJhbSBtYXJzaGFsbGVyIC0gU2VyaWFsaXplIHRoZSB0eXBlLlxuICAgKiBAcGFyYW0gdW5tYXJzaGFsbGVyIC0gRGVzZXJpYWxpemUgdGhlIHR5cGUuXG4gICAqL1xuICByZWdpc3RlclR5cGUoXG4gICAgdHlwZU5hbWU6IHN0cmluZyxcbiAgICBtYXJzaGFsbGVyOiBOYW1lZFRyYW5zZm9ybWVyLFxuICAgIHVubWFyc2hhbGxlcjogTmFtZWRUcmFuc2Zvcm1lcixcbiAgKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX25hbWVkTWFyc2hhbGxlcnMuaGFzKHR5cGVOYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBIHR5cGUgYnkgdGhlIG5hbWUgJHt0eXBlTmFtZX0gaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkLmApO1xuICAgIH1cbiAgICB0aGlzLl9uYW1lZE1hcnNoYWxsZXJzLnNldCh0eXBlTmFtZSwge21hcnNoYWxsZXIsIHVubWFyc2hhbGxlcn0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3IgcmVnaXN0ZXJpbmcgdGhlIG1hcmFzaGFsbGVyL3VubWFyc2hhbGxlciBmb3IgYSB0eXBlIGFsaWFzLlxuICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBhbGlhcyB0eXBlLlxuICAgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRoZSB0aGUgYWxpYXMgcmVwcmVzZW50cy5cbiAgICovXG4gIHJlZ2lzdGVyQWxpYXMobmFtZTogc3RyaW5nLCB0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5yZWdpc3RlclR5cGUobmFtZSwgdmFsdWUgPT4gdGhpcy5fbWFyc2hhbCh2YWx1ZSwgdHlwZSksXG4gICAgICB2YWx1ZSA9PiB0aGlzLl91bm1hcnNoYWwodmFsdWUsIHR5cGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJzaGFsIGFuIG9iamVjdCB1c2luZyB0aGUgYXBwcm9wcmlhdGUgbWFyc2hhbCBmdW5jdGlvbi5cbiAgICogRW5zdXJlcyB0aGUgcmVzdWx0IGlzIGFjdHVhbGx5IGEgUHJvbWlzZS5cbiAgICogQHBhcmFtIHZhbHVlIC0gVGhlIHZhbHVlIHRvIGJlIG1hcnNoYWxsZWQuXG4gICAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgb2JqZWN0ICh1c2VkIHRvIGZpbmQgdGhlIGFwcHJvcHJpYXRlIGZ1bmN0aW9uKS5cbiAgICovXG4gIG1hcnNoYWwodmFsdWU6IGFueSwgdHlwZTogVHlwZSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9tYXJzaGFsKHZhbHVlLCB0eXBlKSk7XG4gIH1cblxuICBfbWFyc2hhbCh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKTogYW55IHtcbiAgICBjb25zdCBraW5kTWFyc2hhbGxlciA9IHRoaXMuX2tpbmRNYXJzaGFsbGVycy5nZXQodHlwZS5raW5kKTtcbiAgICBpZiAoa2luZE1hcnNoYWxsZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBtYXJzaGFsbGVyIGZvdW5kIGZvciB0eXBlIGtpbmQgJHt0eXBlLmtpbmR9LmApO1xuICAgIH1cbiAgICByZXR1cm4ga2luZE1hcnNoYWxsZXIubWFyc2hhbGxlcih2YWx1ZSwgdHlwZSk7XG4gIH1cblxuICAvKipcbiAgICogVW5tYXJzaGFsIGFuZCBvYmplY3QgdXNpbmcgdGhlIGFwcHJvcHJpYXRlIHVubWFyc2hhbCBmdW5jdGlvbi5cbiAgICogRW5zdXJlcyB0aGUgcmVzdWx0IGlzIGFjdHVhbGx5IGEgUHJvbWlzZS5cbiAgICogQHBhcmFtIHZhbHVlIC0gVGhlIHZhbHVlIHRvIGJlIG1hcnNoYWxsZWQuXG4gICAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgb2JqZWN0ICh1c2VkIHRvIGZpbmQgdGhlIGFwcHJvcHJpYXRlIGZ1bmN0aW9uKS5cbiAgICovXG4gIHVubWFyc2hhbCh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX3VubWFyc2hhbCh2YWx1ZSwgdHlwZSkpO1xuICB9XG5cbiAgX3VubWFyc2hhbCh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKTogYW55IHtcbiAgICBjb25zdCBraW5kTWFyc2hhbGxlciA9IHRoaXMuX2tpbmRNYXJzaGFsbGVycy5nZXQodHlwZS5raW5kKTtcbiAgICBpZiAoa2luZE1hcnNoYWxsZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyB1bm1hcnNoYWxsZXIgZm91bmQgZm9yIHR5cGUga2luZCAke3R5cGUua2luZH0uYCk7XG4gICAgfVxuICAgIHJldHVybiBraW5kTWFyc2hhbGxlci51bm1hcnNoYWxsZXIodmFsdWUsIHR5cGUpO1xuICB9XG5cbiAgX3JlZ2lzdGVyUHJpbWl0aXZlcygpOiB2b2lkIHtcbiAgICAvLyBTaW5jZSBzdHJpbmcsIG51bWJlciwgYW5kIGJvb2xlYW4gYXJlIEpTT04gcHJpbWl0aXZlcyxcbiAgICAvLyB0aGV5IHJlcXVpcmUgbm8gbWFyc2hhbGxpbmcuIEluc3RlYWQsIHNpbXBseSBjcmVhdGUgd3JhcHBlZCB0cmFuc2Zvcm1lcnNcbiAgICAvLyB0aGF0IGFzc2VydCB0aGUgdHlwZSBvZiB0aGVpciBhcmd1bWVudC5cbiAgICBjb25zdCBzdHJpbmdUcmFuc2Zvcm1lciA9IGFyZyA9PiB7XG4gICAgICAvLyBVbmJveCBhcmd1bWVudC5cbiAgICAgIGFyZyA9IChhcmcgaW5zdGFuY2VvZiBTdHJpbmcpID8gYXJnLnZhbHVlT2YoKSA6IGFyZztcbiAgICAgIGFzc2VydCh0eXBlb2YgYXJnID09PSAnc3RyaW5nJywgJ0V4cGVjdGVkIGEgc3RyaW5nIGFyZ3VtZW50Jyk7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgY29uc3QgbnVtYmVyVHJhbnNmb3JtZXIgPSBhcmcgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnQuXG4gICAgICBpZiAoYXJnIGluc3RhbmNlb2YgTnVtYmVyKSB7XG4gICAgICAgIGFyZyA9IGFyZy52YWx1ZU9mKCk7XG4gICAgICB9XG4gICAgICBhc3NlcnQodHlwZW9mIGFyZyA9PT0gJ251bWJlcicsICdFeHBlY3RlZCBhIG51bWJlciBhcmd1bWVudCcpO1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICAgIGNvbnN0IGJvb2xlYW5UcmFuc2Zvcm1lciA9IGFyZyA9PiB7XG4gICAgICAvLyBVbmJveCBhcmd1bWVudFxuICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIEJvb2xlYW4pIHtcbiAgICAgICAgYXJnID0gYXJnLnZhbHVlT2YoKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydCh0eXBlb2YgYXJnID09PSAnYm9vbGVhbicsICdFeHBlY3RlZCBhIGJvb2xlYW4gYXJndW1lbnQnKTtcbiAgICAgIHJldHVybiBhcmc7XG4gICAgfTtcbiAgICAvLyBXZSBhc3N1bWUgYW4gJ2FueScgYW5kICdtaXhlZCcgdHlwZXMgcmVxdWlyZSBubyBtYXJzaGFsbGluZy5cbiAgICBjb25zdCBpZGVudGl0eVRyYW5zZm9ybWVyID0gYXJnID0+IGFyZztcblxuICAgIC8vIFJlZ2lzdGVyIHRoZXNlIHRyYW5zZm9ybWVyc1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnc3RyaW5nJywgc3RyaW5nVHJhbnNmb3JtZXIsIHN0cmluZ1RyYW5zZm9ybWVyKTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ251bWJlcicsIG51bWJlclRyYW5zZm9ybWVyLCBudW1iZXJUcmFuc2Zvcm1lcik7XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdib29sZWFuJywgYm9vbGVhblRyYW5zZm9ybWVyLCBib29sZWFuVHJhbnNmb3JtZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnYW55JywgaWRlbnRpdHlUcmFuc2Zvcm1lciwgaWRlbnRpdHlUcmFuc2Zvcm1lcik7XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdtaXhlZCcsIGlkZW50aXR5VHJhbnNmb3JtZXIsIGlkZW50aXR5VHJhbnNmb3JtZXIpO1xuICB9XG5cbiAgX3JlZ2lzdGVyTGl0ZXJhbHMoKTogdm9pZCB7XG4gICAgY29uc3QgbGl0ZXJhbFRyYW5zZm9ybWVyID0gKGFyZywgdHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3N0cmluZy1saXRlcmFsJyB8fCB0eXBlLmtpbmQgPT09ICdudW1iZXItbGl0ZXJhbCcgfHxcbiAgICAgICAgICB0eXBlLmtpbmQgPT09ICdib29sZWFuLWxpdGVyYWwnKTtcbiAgICAgIGludmFyaWFudChhcmcgPT09IHR5cGUudmFsdWUpO1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnc3RyaW5nLWxpdGVyYWwnLCBsaXRlcmFsVHJhbnNmb3JtZXIsIGxpdGVyYWxUcmFuc2Zvcm1lcik7XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdudW1iZXItbGl0ZXJhbCcsIGxpdGVyYWxUcmFuc2Zvcm1lciwgbGl0ZXJhbFRyYW5zZm9ybWVyKTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ2Jvb2xlYW4tbGl0ZXJhbCcsIGxpdGVyYWxUcmFuc2Zvcm1lciwgbGl0ZXJhbFRyYW5zZm9ybWVyKTtcbiAgfVxuXG4gIF9yZWdpc3RlclVuaW9ucygpOiB2b2lkIHtcbiAgICBjb25zdCB1bmlvbkxpdGVyYWxUcmFuc2Zvcm1lciA9IChhcmcsIHR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd1bmlvbicpO1xuICAgICAgY29uc3QgYWx0ZXJuYXRlID0gYXJyYXkuZmluZCh0eXBlLnR5cGVzLCBlbGVtZW50ID0+IHtcbiAgICAgICAgaW52YXJpYW50KGVsZW1lbnQua2luZCA9PT0gJ3N0cmluZy1saXRlcmFsJyB8fCBlbGVtZW50LmtpbmQgPT09ICdudW1iZXItbGl0ZXJhbCdcbiAgICAgICAgICAgIHx8IGVsZW1lbnQua2luZCA9PT0gJ2Jvb2xlYW4tbGl0ZXJhbCcpO1xuICAgICAgICByZXR1cm4gKGFyZyA9PT0gZWxlbWVudC52YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIGludmFyaWFudChhbHRlcm5hdGUpO1xuICAgICAgLy8gVGhpcyBpcyBqdXN0IHRoZSBsaXRlcmFsIHRyYW5zZm9ybWVyIGlubGluZWQgLi4uXG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgY29uc3QgdW5pb25PYmplY3RNYXJzaGFsbGVyID0gKGFyZywgdHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3VuaW9uJyk7XG4gICAgICByZXR1cm4gdGhpcy5fbWFyc2hhbChhcmcsIGZpbmRBbHRlcm5hdGUoYXJnLCB0eXBlKSk7XG4gICAgfTtcbiAgICBjb25zdCB1bmlvbk9iamVjdFVubWFyc2hhbGxlciA9IChhcmcsIHR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd1bmlvbicpO1xuICAgICAgcmV0dXJuIHRoaXMuX3VubWFyc2hhbChhcmcsIGZpbmRBbHRlcm5hdGUoYXJnLCB0eXBlKSk7XG4gICAgfTtcbiAgICBjb25zdCB1bmlvbk1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndW5pb24nKTtcbiAgICAgIGlmICh0eXBlLmRpc2NyaW1pbmFudEZpZWxkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuaW9uT2JqZWN0TWFyc2hhbGxlcihhcmcsIHR5cGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVuaW9uTGl0ZXJhbFRyYW5zZm9ybWVyKGFyZywgdHlwZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCB1bmlvblVubWFyc2hhbGxlciA9IChhcmcsIHR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd1bmlvbicpO1xuICAgICAgaWYgKHR5cGUuZGlzY3JpbWluYW50RmllbGQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5pb25PYmplY3RVbm1hcnNoYWxsZXIoYXJnLCB0eXBlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmlvbkxpdGVyYWxUcmFuc2Zvcm1lcihhcmcsIHR5cGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCd1bmlvbicsIHVuaW9uTWFyc2hhbGxlciwgdW5pb25Vbm1hcnNoYWxsZXIpO1xuICB9XG5cbiAgX3JlZ2lzdGVySW50ZXJzZWN0aW9ucygpOiB2b2lkIHtcbiAgICBjb25zdCBpbnRlcnNlY3Rpb25NYXJzaGFsbGVyID0gKGFyZywgdHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ2ludGVyc2VjdGlvbicpO1xuICAgICAgaW52YXJpYW50KHR5cGUuZmxhdHRlbmVkICE9IG51bGwpO1xuICAgICAgcmV0dXJuIHRoaXMuX21hcnNoYWwoYXJnLCB0eXBlLmZsYXR0ZW5lZCk7XG4gICAgfTtcbiAgICBjb25zdCBpbnRlcnNlY3Rpb25Vbm1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnaW50ZXJzZWN0aW9uJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5mbGF0dGVuZWQgIT0gbnVsbCk7XG4gICAgICByZXR1cm4gdGhpcy5fdW5tYXJzaGFsKGFyZywgdHlwZS5mbGF0dGVuZWQpO1xuICAgIH07XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdpbnRlcnNlY3Rpb24nLCBpbnRlcnNlY3Rpb25NYXJzaGFsbGVyLCBpbnRlcnNlY3Rpb25Vbm1hcnNoYWxsZXIpO1xuICB9XG5cbiAgX3JlZ2lzdGVyU3BlY2lhbFR5cGVzKCk6IHZvaWQge1xuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIGFueSBPYmplY3QgdHlwZVxuICAgIHRoaXMucmVnaXN0ZXJUeXBlKG9iamVjdFR5cGUubmFtZSwgb2JqZWN0ID0+IHtcbiAgICAgIGFzc2VydChvYmplY3QgIT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JywgJ0V4cGVjdGVkIE9iamVjdCBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfSwgb2JqZWN0ID0+IHtcbiAgICAgIGFzc2VydChvYmplY3QgIT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JywgJ0V4cGVjdGVkIE9iamVjdCBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBKYXZhc2NyaXB0IERhdGUgb2JqZWN0c1xuICAgIHRoaXMucmVnaXN0ZXJUeXBlKGRhdGVUeXBlLm5hbWUsIGRhdGUgPT4ge1xuICAgICAgYXNzZXJ0KGRhdGUgaW5zdGFuY2VvZiBEYXRlLCAnRXhwZWN0ZWQgZGF0ZSBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBkYXRlLnRvSlNPTigpO1xuICAgIH0sIGRhdGVTdHIgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnQuXG4gICAgICBkYXRlU3RyID0gKGRhdGVTdHIgaW5zdGFuY2VvZiBTdHJpbmcpID8gZGF0ZVN0ci52YWx1ZU9mKCkgOiBkYXRlU3RyO1xuXG4gICAgICBhc3NlcnQodHlwZW9mIGRhdGVTdHIgPT09ICdzdHJpbmcnLCAnRXhwZWNldGVkIGEgc3RyaW5nIGFyZ3VtZW50LicpO1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGVTdHIpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgUmVnRXhwIG9iamVjdHNcbiAgICB0aGlzLnJlZ2lzdGVyVHlwZShyZWdFeHBUeXBlLm5hbWUsIHJlZ2V4cCA9PiB7XG4gICAgICBhc3NlcnQocmVnZXhwIGluc3RhbmNlb2YgUmVnRXhwLCAnRXhwZWN0ZWQgYSBSZWdFeHAgb2JqZWN0IGFzIGFuIGFyZ3VtZW50Jyk7XG4gICAgICByZXR1cm4gcmVnZXhwLnRvU3RyaW5nKCk7XG4gICAgfSwgcmVnU3RyID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50LlxuICAgICAgcmVnU3RyID0gKHJlZ1N0ciBpbnN0YW5jZW9mIFN0cmluZykgPyByZWdTdHIudmFsdWVPZigpIDogcmVnU3RyO1xuXG4gICAgICBhc3NlcnQodHlwZW9mIHJlZ1N0ciA9PT0gJ3N0cmluZycsICdFeHBlY3RlZCBhIHN0cmluZyBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiB2bS5ydW5JblRoaXNDb250ZXh0KHJlZ1N0cik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBCdWZmZXIgb2JqZWN0cyB0aHJvdWdoIEJhc2U2NCBzdHJpbmdzXG4gICAgdGhpcy5yZWdpc3RlclR5cGUoYnVmZmVyVHlwZS5uYW1lLCBidWZmZXIgPT4ge1xuICAgICAgYXNzZXJ0KGJ1ZmZlciBpbnN0YW5jZW9mIEJ1ZmZlciwgJ0V4cGVjdGVkIGEgYnVmZmVyIGFyZ3VtZW50LicpO1xuICAgICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgfSwgYmFzZTY0c3RyaW5nID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50LlxuICAgICAgYmFzZTY0c3RyaW5nID0gKGJhc2U2NHN0cmluZyBpbnN0YW5jZW9mIFN0cmluZykgPyBiYXNlNjRzdHJpbmcudmFsdWVPZigpIDogYmFzZTY0c3RyaW5nO1xuXG4gICAgICBhc3NlcnQoXG4gICAgICAgIHR5cGVvZiBiYXNlNjRzdHJpbmcgPT09ICdzdHJpbmcnLFxuICAgICAgICBgRXhwZWN0ZWQgYSBiYXNlNjQgc3RyaW5nLiBOb3QgJHt0eXBlb2YgYmFzZTY0c3RyaW5nfWApO1xuICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoYmFzZTY0c3RyaW5nLCAnYmFzZTY0Jyk7XG4gICAgfSk7XG5cbiAgICAvLyBmcy5TdGF0c1xuICAgIHRoaXMucmVnaXN0ZXJUeXBlKGZzU3RhdHNUeXBlLm5hbWUsIHN0YXRzID0+IHtcbiAgICAgIGFzc2VydChzdGF0cyBpbnN0YW5jZW9mIGZzLlN0YXRzKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzdGF0c1RvT2JqZWN0KHN0YXRzKSk7XG4gICAgfSwganNvbiA9PiB7XG4gICAgICBhc3NlcnQodHlwZW9mIGpzb24gPT09ICdzdHJpbmcnKTtcbiAgICAgIHJldHVybiBvYmplY3RUb1N0YXRzKEpTT04ucGFyc2UoanNvbikpO1xuICAgIH0pO1xuICB9XG5cbiAgX3JlZ2lzdGVyQ29udGFpbmVycygpOiB2b2lkIHtcbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBBcnJheXMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdhcnJheScsICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBhc3NlcnQodmFsdWUgaW5zdGFuY2VvZiBBcnJheSwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIEFycmF5LicpO1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ2FycmF5Jyk7XG4gICAgICBjb25zdCBlbGVtVHlwZSA9IHR5cGUudHlwZTtcbiAgICAgIHJldHVybiBzbWFydFByb21pc2VBbGwodmFsdWUubWFwKGVsZW0gPT4gdGhpcy5fbWFyc2hhbChlbGVtLCBlbGVtVHlwZSkpKTtcbiAgICB9LCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgYXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgQXJyYXksICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBBcnJheS4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdhcnJheScpO1xuICAgICAgY29uc3QgZWxlbVR5cGUgPSB0eXBlLnR5cGU7XG4gICAgICByZXR1cm4gc21hcnRQcm9taXNlQWxsKHZhbHVlLm1hcChlbGVtID0+IHRoaXMuX3VubWFyc2hhbChlbGVtLCBlbGVtVHlwZSkpKTtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSBhbmQgRGVzZXJpYWxpemUgT2JqZWN0cy5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ29iamVjdCcsIChvYmo6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBvYmogPT09ICdvYmplY3QnLCAnRXhwZWN0ZWQgYW4gYXJndW1lbnQgb2YgdHlwZSBvYmplY3QuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnb2JqZWN0Jyk7XG4gICAgICBjb25zdCBuZXdPYmogPSB7fTsgLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCBzbyB3ZSBkb24ndCBtdXRhdGUgdGhlIG9yaWdpbmFsIG9uZS5cbiAgICAgIGNvbnN0IHByb21pc2UgPSBjaGVja2VkU21hcnRQcm9taXNlQWxsKHR5cGUuZmllbGRzLm1hcChwcm9wID0+IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNvdXJjZSBvYmplY3QgaGFzIHRoaXMga2V5LlxuICAgICAgICBpZiAob2JqICE9IG51bGwgJiYgb2JqLmhhc093blByb3BlcnR5KHByb3AubmFtZSkpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX21hcnNoYWwob2JqW3Byb3AubmFtZV0sIHByb3AudHlwZSk7XG4gICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRoZW4ocmVzdWx0ID0+IG5ld09ialtwcm9wLm5hbWVdID0gcmVzdWx0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3T2JqW3Byb3AubmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb3Aub3B0aW9uYWwpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcHJvcGVydHkgaXMgb3B0aW9uYWwsIGl0J3Mgb2theSBmb3IgaXQgdG8gYmUgbWlzc2luZy5cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgU291cmNlIG9iamVjdDogJHtKU09OLnN0cmluZ2lmeShvYmopfSBpcyBtaXNzaW5nIHByb3BlcnR5ICR7cHJvcC5uYW1lfS5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIGlmIChwcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKCgpID0+IG5ld09iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3T2JqO1xuICAgIH0sIChvYmo6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBvYmogPT09ICdvYmplY3QnLCAnRXhwZWN0ZWQgYW4gYXJndW1lbnQgb2YgdHlwZSBvYmplY3QuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnb2JqZWN0Jyk7XG4gICAgICBjb25zdCBuZXdPYmogPSB7fTsgLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCBzbyB3ZSBkb24ndCBtdXRhdGUgdGhlIG9yaWdpbmFsIG9uZS5cbiAgICAgIGNvbnN0IHByb21pc2UgPSBjaGVja2VkU21hcnRQcm9taXNlQWxsKHR5cGUuZmllbGRzLm1hcChwcm9wID0+IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNvdXJjZSBvYmplY3QgaGFzIHRoaXMga2V5LlxuICAgICAgICBpZiAob2JqICE9IG51bGwgJiYgb2JqLmhhc093blByb3BlcnR5KHByb3AubmFtZSkpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX3VubWFyc2hhbChvYmpbcHJvcC5uYW1lXSwgcHJvcC50eXBlKTtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudGhlbihyZXN1bHQgPT4gbmV3T2JqW3Byb3AubmFtZV0gPSByZXN1bHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdPYmpbcHJvcC5uYW1lXSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghcHJvcC5vcHRpb25hbCkge1xuICAgICAgICAgIC8vIElmIHRoZSBwcm9wZXJ0eSBpcyBvcHRpb25hbCwgaXQncyBva2F5IGZvciBpdCB0byBiZSBtaXNzaW5nLlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBTb3VyY2Ugb2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KG9iail9IGlzIG1pc3NpbmcgcHJvcGVydHkgJHtwcm9wLm5hbWV9LmAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgICAgaWYgKHByb21pc2UgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oKCkgPT4gbmV3T2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdPYmo7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBTZXRzLlxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnc2V0JywgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdzZXQnKTtcbiAgICAgIGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIFNldCwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIFNldC4nKTtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZVByb21pc2VzID0gW107XG4gICAgICBmb3IgKGNvbnN0IGVsZW0gb2YgdmFsdWUpIHtcbiAgICAgICAgc2VyaWFsaXplUHJvbWlzZXMucHVzaCh0aGlzLl9tYXJzaGFsKGVsZW0sIHR5cGUudHlwZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNtYXJ0UHJvbWlzZUFsbChzZXJpYWxpemVQcm9taXNlcyk7XG4gICAgfSwgYXN5bmMgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnc2V0Jyk7XG4gICAgICBjb25zdCBlbGVtVHlwZSA9IHR5cGUudHlwZTtcbiAgICAgIGNvbnN0IGVsZW1lbnRzID0gYXdhaXQgc21hcnRQcm9taXNlQWxsKHZhbHVlLm1hcChlbGVtID0+IHRoaXMuX3VubWFyc2hhbChlbGVtLCBlbGVtVHlwZSkpKTtcbiAgICAgIHJldHVybiBuZXcgU2V0KGVsZW1lbnRzKTtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIE1hcHMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdtYXAnLCAobWFwOiBNYXAsIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGFzc2VydChtYXAgaW5zdGFuY2VvZiBNYXAsICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBTZXQuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnbWFwJyk7XG4gICAgICBjb25zdCBzZXJpYWxpemVQcm9taXNlcyA9IFtdO1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgbWFwKSB7XG4gICAgICAgIHNlcmlhbGl6ZVByb21pc2VzLnB1c2goY2hlY2tlZFNtYXJ0UHJvbWlzZUFsbChbXG4gICAgICAgICAgdGhpcy5fbWFyc2hhbChrZXksIHR5cGUua2V5VHlwZSksXG4gICAgICAgICAgdGhpcy5fbWFyc2hhbCh2YWx1ZSwgdHlwZS52YWx1ZVR5cGUpLFxuICAgICAgICBdKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc21hcnRQcm9taXNlQWxsKHNlcmlhbGl6ZVByb21pc2VzKTtcbiAgICB9LCBhc3luYyAoc2VyaWFsaXplZDogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBhc3NlcnQoc2VyaWFsaXplZCBpbnN0YW5jZW9mIEFycmF5LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnbWFwJyk7XG4gICAgICBjb25zdCBrZXlUeXBlID0gdHlwZS5rZXlUeXBlO1xuICAgICAgY29uc3QgdmFsdWVUeXBlID0gdHlwZS52YWx1ZVR5cGU7XG4gICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgc21hcnRQcm9taXNlQWxsKFxuICAgICAgICBzZXJpYWxpemVkLm1hcChlbnRyeSA9PiBjaGVja2VkU21hcnRQcm9taXNlQWxsKFtcbiAgICAgICAgICB0aGlzLl91bm1hcnNoYWwoZW50cnlbMF0sIGtleVR5cGUpLFxuICAgICAgICAgIHRoaXMuX3VubWFyc2hhbChlbnRyeVsxXSwgdmFsdWVUeXBlKSxcbiAgICAgICAgXSkpXG4gICAgICApO1xuICAgICAgcmV0dXJuIG5ldyBNYXAoZW50cmllcyk7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBUdXBsZXMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCd0dXBsZScsICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICAvLyBBc3NlcnQgdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXkuXG4gICAgICBhc3NlcnQoQXJyYXkuaXNBcnJheSh2YWx1ZSksICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBBcnJheS4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd0dXBsZScpO1xuICAgICAgY29uc3QgdHlwZXMgPSB0eXBlLnR5cGVzO1xuICAgICAgYXNzZXJ0KHZhbHVlLmxlbmd0aCA9PT0gdHlwZXMubGVuZ3RoLCBgRXhwZWN0ZWQgdHVwbGUgb2YgbGVuZ3RoICR7dHlwZXMubGVuZ3RofS5gKTtcblxuICAgICAgLy8gQ29udmVydCBhbGwgb2YgdGhlIGVsZW1lbnRzIHRocm91Z2ggdGhlIGNvcnJlY3QgbWFyc2hhbGxlci5cbiAgICAgIHJldHVybiBjaGVja2VkU21hcnRQcm9taXNlQWxsKHZhbHVlLm1hcCgoZWxlbSwgaSkgPT4gdGhpcy5fbWFyc2hhbChlbGVtLCB0eXBlc1tpXSkpKTtcbiAgICB9LCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgLy8gQXNzZXJ0IHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LlxuICAgICAgYXNzZXJ0KEFycmF5LmlzQXJyYXkodmFsdWUpLCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndHVwbGUnKTtcbiAgICAgIGNvbnN0IHR5cGVzID0gdHlwZS50eXBlcztcbiAgICAgIGFzc2VydCh2YWx1ZS5sZW5ndGggPT09IHR5cGVzLmxlbmd0aCwgYEV4cGVjdGVkIHR1cGxlIG9mIGxlbmd0aCAke3R5cGVzLmxlbmd0aH0uYCk7XG5cbiAgICAgIC8vIENvbnZlcnQgYWxsIG9mIHRoZSBlbGVtZW50cyB0aHJvdWdoIHRoZSBjb3JyZWN0IHVubWFyc2hhbGxlci5cbiAgICAgIHJldHVybiBjaGVja2VkU21hcnRQcm9taXNlQWxsKHZhbHVlLm1hcCgoZWxlbSwgaSkgPT4gdGhpcy5fdW5tYXJzaGFsKGVsZW0sIHR5cGVzW2ldKSkpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE9iamVjdEZpZWxkQnlOYW1lKHR5cGU6IE9iamVjdFR5cGUsIGZpZWxkTmFtZTogc3RyaW5nKTogT2JqZWN0RmllbGQge1xuICBjb25zdCByZXN1bHQgPSBhcnJheS5maW5kKHR5cGUuZmllbGRzLCBmaWVsZCA9PiBmaWVsZC5uYW1lID09PSBmaWVsZE5hbWUpO1xuICBpbnZhcmlhbnQocmVzdWx0ICE9IG51bGwpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBmaW5kQWx0ZXJuYXRlKGFyZzogT2JqZWN0LCB0eXBlOiBVbmlvblR5cGUpOiBPYmplY3RUeXBlIHtcbiAgY29uc3QgZGlzY3JpbWluYW50RmllbGQgPSB0eXBlLmRpc2NyaW1pbmFudEZpZWxkO1xuICBpbnZhcmlhbnQoZGlzY3JpbWluYW50RmllbGQgIT0gbnVsbCk7XG4gIGNvbnN0IGRpc2NyaW1pbmFudCA9IGFyZ1tkaXNjcmltaW5hbnRGaWVsZF07XG4gIGludmFyaWFudChkaXNjcmltaW5hbnQgIT0gbnVsbCk7XG4gIGNvbnN0IGFsdGVybmF0ZXM6IEFycmF5PE9iamVjdFR5cGU+ID0gKHR5cGUudHlwZXM6IGFueSk7XG4gIGNvbnN0IHJlc3VsdCA9IGFycmF5LmZpbmQoYWx0ZXJuYXRlcywgYWx0ZXJuYXRlID0+IHtcbiAgICBpbnZhcmlhbnQoYWx0ZXJuYXRlLmtpbmQgPT09ICdvYmplY3QnKTtcbiAgICBjb25zdCBhbHRlcm5hdGVUeXBlID0gZ2V0T2JqZWN0RmllbGRCeU5hbWUoYWx0ZXJuYXRlLCBkaXNjcmltaW5hbnRGaWVsZCkudHlwZTtcbiAgICBpbnZhcmlhbnQoYWx0ZXJuYXRlVHlwZS5raW5kID09PSAnc3RyaW5nLWxpdGVyYWwnIHx8IGFsdGVybmF0ZVR5cGUua2luZCA9PT0gJ251bWJlci1saXRlcmFsJ1xuICAgICAgICB8fCBhbHRlcm5hdGVUeXBlLmtpbmQgPT09ICdib29sZWFuLWxpdGVyYWwnKTtcbiAgICByZXR1cm4gYWx0ZXJuYXRlVHlwZS52YWx1ZSA9PT0gZGlzY3JpbWluYW50O1xuICB9KTtcbiAgaW52YXJpYW50KHJlc3VsdCAhPSBudWxsKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==