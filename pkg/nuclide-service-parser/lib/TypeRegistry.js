Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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
 *
 * The MarshallingContext is opaque to the TypeRegistry and allows for adding per-connection
 * context to marshalling transformations.
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
    this._registerKind('nullable', function (value, type, context) {
      if (value === null || value === undefined || type.kind !== 'nullable') {
        return null;
      }
      return _this._marshal(context, value, type.type);
    }, function (value, type, context) {
      if (value === null || value === undefined || type.kind !== 'nullable') {
        return null;
      }
      return _this._unmarshal(context, value, type.type);
    });

    this._registerKind('named', function (value, type, context) {
      (0, _assert3['default'])(type.kind === 'named');
      var namedMarshaller = _this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error('No marshaller found for named type ' + type.name + '.');
      }
      return namedMarshaller.marshaller(value, context);
    }, function (value, type, context) {
      (0, _assert3['default'])(type.kind === 'named');
      var namedMarshaller = _this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error('No marshaller found for named type ' + type.name + '.');
      }
      return namedMarshaller.unmarshaller(value, context);
    });

    this._registerKind('void', function (value, type, context) {
      return Promise.resolve(null);
    }, function (value, type, context) {
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

      this.registerType(name, function (value, context) {
        return _this2._marshal(context, value, type);
      }, function (value, context) {
        return _this2._unmarshal(context, value, type);
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
    value: function marshal(context, value, type) {
      return Promise.resolve(this._marshal(context, value, type));
    }
  }, {
    key: '_marshal',
    value: function _marshal(context, value, type) {
      var kindMarshaller = this._kindMarshallers.get(type.kind);
      if (kindMarshaller == null) {
        throw new Error('No marshaller found for type kind ' + type.kind + '.');
      }
      return kindMarshaller.marshaller(value, type, context);
    }

    /**
     * Unmarshal and object using the appropriate unmarshal function.
     * Ensures the result is actually a Promise.
     * @param value - The value to be marshalled.
     * @param type - The type object (used to find the appropriate function).
     */
  }, {
    key: 'unmarshal',
    value: function unmarshal(context, value, type) {
      return Promise.resolve(this._unmarshal(context, value, type));
    }
  }, {
    key: 'unmarshalArguments',
    value: function unmarshalArguments(context, args, argTypes) {
      var _this3 = this;

      return Promise.all(args.map(function (arg, i) {
        return _this3.unmarshal(context, arg, argTypes[i]);
      }));
    }
  }, {
    key: '_unmarshal',
    value: function _unmarshal(context, value, type) {
      var kindMarshaller = this._kindMarshallers.get(type.kind);
      if (kindMarshaller == null) {
        throw new Error('No unmarshaller found for type kind ' + type.kind + '.');
      }
      return kindMarshaller.unmarshaller(value, type, context);
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
      var numberMarshaller = function numberMarshaller(arg) {
        // Unbox argument.
        if (arg instanceof Number) {
          arg = arg.valueOf();
        }
        (0, _assert2['default'])(typeof arg === 'number', 'Expected a number argument');
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
      var numberUnmarshaller = function numberUnmarshaller(arg) {
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
      this._registerKind('number', numberMarshaller, numberUnmarshaller);
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
      var _this4 = this;

      var unionLiteralTransformer = function unionLiteralTransformer(arg, type) {
        (0, _assert3['default'])(type.kind === 'union');
        var alternate = type.types.find(function (element) {
          (0, _assert3['default'])(element.kind === 'string-literal' || element.kind === 'number-literal' || element.kind === 'boolean-literal');
          return arg === element.value;
        });
        (0, _assert3['default'])(alternate);
        // This is just the literal transformer inlined ...
        return arg;
      };
      var unionObjectMarshaller = function unionObjectMarshaller(arg, type, context) {
        (0, _assert3['default'])(type.kind === 'union');
        return _this4._marshal(context, arg, findAlternate(arg, type));
      };
      var unionObjectUnmarshaller = function unionObjectUnmarshaller(arg, type, context) {
        (0, _assert3['default'])(type.kind === 'union');
        return _this4._unmarshal(context, arg, findAlternate(arg, type));
      };
      var unionMarshaller = function unionMarshaller(arg, type, context) {
        (0, _assert3['default'])(type.kind === 'union');
        if (type.discriminantField != null) {
          return unionObjectMarshaller(arg, type, context);
        } else {
          return unionLiteralTransformer(arg, type);
        }
      };
      var unionUnmarshaller = function unionUnmarshaller(arg, type, context) {
        (0, _assert3['default'])(type.kind === 'union');
        if (type.discriminantField != null) {
          return unionObjectUnmarshaller(arg, type, context);
        } else {
          return unionLiteralTransformer(arg, type);
        }
      };
      this._registerKind('union', unionMarshaller, unionUnmarshaller);
    }
  }, {
    key: '_registerIntersections',
    value: function _registerIntersections() {
      var _this5 = this;

      var intersectionMarshaller = function intersectionMarshaller(arg, type, context) {
        (0, _assert3['default'])(type.kind === 'intersection');
        (0, _assert3['default'])(type.flattened != null);
        return _this5._marshal(context, arg, type.flattened);
      };
      var intersectionUnmarshaller = function intersectionUnmarshaller(arg, type, context) {
        (0, _assert3['default'])(type.kind === 'intersection');
        (0, _assert3['default'])(type.flattened != null);
        return _this5._unmarshal(context, arg, type.flattened);
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
      var _this6 = this;

      // Serialize / Deserialize Arrays.
      this._registerKind('array', function (value, type, context) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'array');
        var elemType = type.type;
        return smartPromiseAll(value.map(function (elem) {
          return _this6._marshal(context, elem, elemType);
        }));
      }, function (value, type, context) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'array');
        var elemType = type.type;
        return smartPromiseAll(value.map(function (elem) {
          return _this6._unmarshal(context, elem, elemType);
        }));
      });

      // Serialize and Deserialize Objects.
      this._registerKind('object', function (obj, type, context) {
        (0, _assert2['default'])(typeof obj === 'object', 'Expected an argument of type object.');
        (0, _assert3['default'])(type.kind === 'object');
        var newObj = {}; // Create a new object so we don't mutate the original one.
        var promise = checkedSmartPromiseAll(type.fields.map(function (prop) {
          // Check if the source object has this key.
          if (obj != null && obj.hasOwnProperty(prop.name)) {
            var _value = _this6._marshal(context, obj[prop.name], prop.type);
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
      }, function (obj, type, context) {
        (0, _assert2['default'])(typeof obj === 'object', 'Expected an argument of type object.');
        (0, _assert3['default'])(type.kind === 'object');
        var newObj = {}; // Create a new object so we don't mutate the original one.
        var promise = checkedSmartPromiseAll(type.fields.map(function (prop) {
          // Check if the source object has this key.
          if (obj != null && obj.hasOwnProperty(prop.name)) {
            var _value2 = _this6._unmarshal(context, obj[prop.name], prop.type);
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
      this._registerKind('set', function (value, type, context) {
        (0, _assert3['default'])(type.kind === 'set');
        (0, _assert2['default'])(value instanceof Set, 'Expected an object of type Set.');
        var serializePromises = [];
        for (var elem of value) {
          serializePromises.push(_this6._marshal(context, elem, type.type));
        }
        return smartPromiseAll(serializePromises);
      }, function (value, type, context) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'set');
        var elemType = type.type;
        var elements = smartPromiseAll(value.map(function (elem) {
          return _this6._unmarshal(context, elem, elemType);
        }));
        if (elements instanceof Promise) {
          return elements.then(function (x) {
            return new Set(x);
          });
        }
        return new Set(elements);
      });

      // Serialize / Deserialize Maps.
      this._registerKind('map', function (map, type, context) {
        (0, _assert2['default'])(map instanceof Map, 'Expected an object of type Set.');
        (0, _assert3['default'])(type.kind === 'map');
        var serializePromises = [];
        for (var _ref3 of map) {
          var _ref2 = _slicedToArray(_ref3, 2);

          var key = _ref2[0];
          var _value3 = _ref2[1];

          serializePromises.push(checkedSmartPromiseAll([_this6._marshal(context, key, type.keyType), _this6._marshal(context, _value3, type.valueType)]));
        }
        return smartPromiseAll(serializePromises);
      }, function (serialized, type, context) {
        (0, _assert2['default'])(serialized instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'map');
        var keyType = type.keyType;
        var valueType = type.valueType;
        var entries = smartPromiseAll(serialized.map(function (entry) {
          return checkedSmartPromiseAll([_this6._unmarshal(context, entry[0], keyType), _this6._unmarshal(context, entry[1], valueType)]);
        }));
        if (entries instanceof Promise) {
          return entries.then(function (x) {
            return new Map(x);
          });
        }
        return new Map(entries);
      });

      // Serialize / Deserialize Tuples.
      this._registerKind('tuple', function (value, type, context) {
        // Assert the length of the array.
        (0, _assert2['default'])(Array.isArray(value), 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'tuple');
        var types = type.types;
        (0, _assert2['default'])(value.length === types.length, 'Expected tuple of length ' + types.length + '.');

        // Convert all of the elements through the correct marshaller.
        return checkedSmartPromiseAll(value.map(function (elem, i) {
          return _this6._marshal(context, elem, types[i]);
        }));
      }, function (value, type, context) {
        // Assert the length of the array.
        (0, _assert2['default'])(Array.isArray(value), 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'tuple');
        var types = type.types;
        (0, _assert2['default'])(value.length === types.length, 'Expected tuple of length ' + types.length + '.');

        // Convert all of the elements through the correct unmarshaller.
        return checkedSmartPromiseAll(value.map(function (elem, i) {
          return _this6._unmarshal(context, elem, types[i]);
        }));
      });
    }
  }]);

  return TypeRegistry;
})();

exports['default'] = TypeRegistry;

function getObjectFieldByName(type, fieldName) {
  var result = type.fields.find(function (field) {
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
  var result = alternates.find(function (alternate) {
    (0, _assert3['default'])(alternate.kind === 'object');
    var alternateType = getObjectFieldByName(alternate, discriminantField).type;
    (0, _assert3['default'])(alternateType.kind === 'string-literal' || alternateType.kind === 'number-literal' || alternateType.kind === 'boolean-literal');
    return alternateType.value === discriminant;
  });
  (0, _assert3['default'])(result != null);
  return result;
}
module.exports = exports['default'];

/** Store marshallers and and unmarshallers, index by the kind of the type. */

/** Store marshallers and and unmarshallers, index by the name of the type. */
//# sourceMappingURL=data:application/json;base64,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QU8sTUFBTSxDQUFDO0NBQ2YiLCJmaWxlIjoiVHlwZVJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHZtIGZyb20gJ3ZtJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmltcG9ydCB0eXBlIHtcbiAgVHlwZSxcbiAgT2JqZWN0VHlwZSxcbiAgT2JqZWN0RmllbGQsXG4gIFVuaW9uVHlwZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge29iamVjdFR5cGUsIGRhdGVUeXBlLCByZWdFeHBUeXBlLCBidWZmZXJUeXBlLCBmc1N0YXRzVHlwZX0gZnJvbSAnLi9idWlsdGluLXR5cGVzJztcblxuXG4vKlxuICogVGhpcyB0eXBlIHJlcHJlc2VudHMgYSBUcmFuc2Zvcm1lciBmdW5jdGlvbiwgd2hpY2ggdGFrZXMgaW4gYSB2YWx1ZSwgYW5kIGVpdGhlciBzZXJpYWxpemVzXG4gKiBvciBkZXNlcmlhbGl6ZXMgaXQuIFRyYW5zZm9ybWVyJ3MgYXJlIGFkZGVkIHRvIGEgcmVnaXN0cnkgYW5kIGluZGV4ZWQgYnkgdGhlIG5hbWUgb2ZcbiAqIHRoZSB0eXBlIHRoZXkgaGFuZGxlIChlZzogJ0RhdGUnKS4gVGhlIHNlY29uZCBhcmd1bWVudCBpcyB0aGUgYWN0dWFsIHR5cGUgb2JqZWN0IHRoYXQgcmVwcmVzZW50XG4gKiB0aGUgdmFsdWUuIFBhcmFtZXRlcml6ZWQgdHlwZXMgbGlrZSBBcnJheSwgb3IgT2JqZWN0IGNhbiB1c2UgdGhpcyB0byByZWN1cnNpdmVseSBjYWxsIG90aGVyXG4gKiB0cmFuc2Zvcm1lcnMuXG4gKlxuICogSW4gdGhlIGludGVyZXN0IG9mIGEgcGVyZm9ybWFuY2UsIGEgdHJhbnNmb3JtZXIgc2hvdWxkIG9ubHkgcmV0dXJuIGEgUHJvbWlzZSBpZiBuZWNlc3NhcnkuXG4gKiAoUHJvbWlzZSBvYmplY3RzIGFuZCBQcm9taXNlLmFsbCBhcmUgdmVyeSBleHBlbnNpdmUgb3BlcmF0aW9ucyBpbiBsYXJnZSBudW1iZXJzKS5cbiAqL1xuZXhwb3J0IHR5cGUgVHJhbnNmb3JtZXI8TWFyc2hhbGxpbmdDb250ZXh0PiA9XG4gICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlLCBjb250ZXh0OiBNYXJzaGFsbGluZ0NvbnRleHQpID0+IChhbnkgfCBQcm9taXNlPGFueT4pO1xuZXhwb3J0IHR5cGUgTmFtZWRUcmFuc2Zvcm1lcjxNYXJzaGFsbGluZ0NvbnRleHQ+XG4gID0gKHZhbHVlOiBhbnksIGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCkgPT4gKGFueSB8IFByb21pc2U8YW55Pik7XG5cbi8vIEVxdWl2YWxlbnQgdG8gUHJvbWlzZS5hbGwsIGJ1dCBhdm9pZHMgd3JhcHBlcnMgaWYgbm90aGluZyBpcyBhY3R1YWxseSBhIHByb21pc2UuXG4vLyBJbnB1dCBtdXN0IGJlIGhvbW9nZW5vdXNseSB0eXBlZC5cbmZ1bmN0aW9uIHNtYXJ0UHJvbWlzZUFsbDxUPihhcnI6IEFycmF5PFQ+KTogQXJyYXk8VD4gfCBQcm9taXNlPEFycmF5PFQ+PiB7XG4gIGlmIChhcnIubGVuZ3RoID09PSAwIHx8ICEoYXJyWzBdIGluc3RhbmNlb2YgUHJvbWlzZSkpIHtcbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIHJldHVybiBQcm9taXNlLmFsbChhcnIpO1xufVxuXG4vLyBTYW1lIGFzIHRoZSBhYm92ZSwgYnV0IHdvcmtzIGZvciBub24taG9tb2dlbm91cyBpbnB1dC5cbmZ1bmN0aW9uIGNoZWNrZWRTbWFydFByb21pc2VBbGwoYXJyOiBBcnJheTxhbnk+KTogQXJyYXk8YW55PiB8IFByb21pc2U8QXJyYXk8YW55Pj4ge1xuICBmb3IgKGNvbnN0IGVsZW0gb2YgYXJyKSB7XG4gICAgaWYgKGVsZW0gaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoYXJyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cblxuZnVuY3Rpb24gc3RhdHNUb09iamVjdChzdGF0czogZnMuU3RhdHMpOiBPYmplY3Qge1xuICBjb25zdCByZXN1bHQgPSB7XG4gICAgZGV2OiBzdGF0cy5kZXYsXG4gICAgbW9kZTogc3RhdHMubW9kZSxcbiAgICBubGluazogc3RhdHMubmxpbmssXG4gICAgdWlkOiBzdGF0cy51aWQsXG4gICAgZ2lkOiBzdGF0cy5naWQsXG4gICAgcmRldjogc3RhdHMucmRldixcbiAgICBibGtzaXplOiBzdGF0cy5ibGtzaXplLFxuICAgIGlubzogc3RhdHMuaW5vLFxuICAgIHNpemU6IHN0YXRzLnNpemUsXG4gICAgYmxvY2tzOiBzdGF0cy5ibG9ja3MsXG4gICAgYXRpbWU6IHN0YXRzLmF0aW1lLnRvSlNPTigpLFxuICAgIG10aW1lOiBzdGF0cy5tdGltZS50b0pTT04oKSxcbiAgICBjdGltZTogc3RhdHMuY3RpbWUudG9KU09OKCksXG4gIH07XG5cbiAgaWYgKHN0YXRzLmJpcnRodGltZSkge1xuICAgIHJldHVybiB7Li4ucmVzdWx0LCBiaXJ0aHRpbWU6IHN0YXRzLmJpcnRodGltZS50b0pTT04oKSB9O1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gb2JqZWN0VG9TdGF0cyhqc29uU3RhdHM6IE9iamVjdCk6IGZzLlN0YXRzIHtcbiAgY29uc3Qgc3RhdHMgPSBuZXcgZnMuU3RhdHMoKTtcblxuICBzdGF0cy5kZXYgPSBqc29uU3RhdHMuZGV2O1xuICBzdGF0cy5tb2RlID0ganNvblN0YXRzLm1vZGU7XG4gIHN0YXRzLm5saW5rID0ganNvblN0YXRzLm5saW5rO1xuICBzdGF0cy51aWQgPSBqc29uU3RhdHMudWlkO1xuICBzdGF0cy5naWQgPSBqc29uU3RhdHMuZ2lkO1xuICBzdGF0cy5yZGV2ID0ganNvblN0YXRzLnJkZXY7XG4gIHN0YXRzLmJsa3NpemUgPSBqc29uU3RhdHMuYmxrc2l6ZTtcbiAgc3RhdHMuaW5vID0ganNvblN0YXRzLmlubztcbiAgc3RhdHMuc2l6ZSA9IGpzb25TdGF0cy5zaXplO1xuICBzdGF0cy5ibG9ja3MgPSBqc29uU3RhdHMuYmxvY2tzO1xuICBzdGF0cy5hdGltZSA9IG5ldyBEYXRlKGpzb25TdGF0cy5hdGltZSk7XG4gIHN0YXRzLm10aW1lID0gbmV3IERhdGUoanNvblN0YXRzLm10aW1lKTtcbiAgc3RhdHMuY3RpbWUgPSBuZXcgRGF0ZShqc29uU3RhdHMuY3RpbWUpO1xuXG4gIGlmIChqc29uU3RhdHMuYmlydGh0aW1lKSB7XG4gICAgLy8gJEZsb3dJc3N1ZVxuICAgIHN0YXRzLmJpcnRodGltZSA9IG5ldyBEYXRlKGpzb25TdGF0cy5iaXJ0aHRpbWUpO1xuICB9XG5cbiAgcmV0dXJuIHN0YXRzO1xufVxuXG4vKlxuICogVGhlIFR5cGVSZWdpc3RyeSBpcyBhIGNlbnRyYWxpemVkIHBsYWNlIHRvIHJlZ2lzdGVyIGZ1bmN0aW9ucyB0aGF0IHNlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemVcbiAqIHR5cGVzLiBUaGlzIGFsbG93cyBmb3IgdHlwZXMgZGVmaW5lZCBpbiBvbmUgc2VydmljZSB0byBpbmNsdWRlIHR5cGVzIGZyb20gYW5vdGhlciBzZXJ2aWNlIGluXG4gKiBhbm90aGVyIGZpbGUuIEl0IGFsc28gYWxsb3dzIHRoZSBhYmlsaXR5IHRvIGFkZCBuZXcgcHJpbWl0aXZlcywgcmFuZ2luZyBmcm9tIEJ1ZmZlciB0byBOdWNsaWRlVXJpXG4gKiB0aGF0IGFyZSBub3QgaGFuZGxlZCBhdCB0aGUgdHJhbnNwb3J0IGxheWVyLiBUaGUga2V5IGNvbmNlcHQgaXMgdGhhdCBtYXJzaGFsbGluZyBmdW5jdGlvbnMgY2FuXG4gKiBiZSByZWN1cnNpdmUsIGNhbGxpbmcgb3RoZXIgbWFyc2hhbGxpbmcgZnVuY3Rpb25zLCBlbmRpbmcgYXQgdGhlIHByaW1pdGl2ZXMuXG4gKlxuICogVGhlIE1hcnNoYWxsaW5nQ29udGV4dCBpcyBvcGFxdWUgdG8gdGhlIFR5cGVSZWdpc3RyeSBhbmQgYWxsb3dzIGZvciBhZGRpbmcgcGVyLWNvbm5lY3Rpb25cbiAqIGNvbnRleHQgdG8gbWFyc2hhbGxpbmcgdHJhbnNmb3JtYXRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlUmVnaXN0cnk8TWFyc2hhbGxpbmdDb250ZXh0PiB7XG4gIC8qKiBTdG9yZSBtYXJzaGFsbGVycyBhbmQgYW5kIHVubWFyc2hhbGxlcnMsIGluZGV4IGJ5IHRoZSBraW5kIG9mIHRoZSB0eXBlLiAqL1xuICBfa2luZE1hcnNoYWxsZXJzOiBNYXA8c3RyaW5nLCB7XG4gICAgICBtYXJzaGFsbGVyOiBUcmFuc2Zvcm1lcjxNYXJzaGFsbGluZ0NvbnRleHQ+O1xuICAgICAgdW5tYXJzaGFsbGVyOiBUcmFuc2Zvcm1lcjxNYXJzaGFsbGluZ0NvbnRleHQ+O1xuICAgIH0+O1xuXG4gIC8qKiBTdG9yZSBtYXJzaGFsbGVycyBhbmQgYW5kIHVubWFyc2hhbGxlcnMsIGluZGV4IGJ5IHRoZSBuYW1lIG9mIHRoZSB0eXBlLiAqL1xuICBfbmFtZWRNYXJzaGFsbGVyczogTWFwPHN0cmluZywge1xuICAgICAgbWFyc2hhbGxlcjogTmFtZWRUcmFuc2Zvcm1lcjxNYXJzaGFsbGluZ0NvbnRleHQ+O1xuICAgICAgdW5tYXJzaGFsbGVyOiBOYW1lZFRyYW5zZm9ybWVyPE1hcnNoYWxsaW5nQ29udGV4dD47XG4gICAgfT47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fa2luZE1hcnNoYWxsZXJzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX25hbWVkTWFyc2hhbGxlcnMgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9yZWdpc3RlclByaW1pdGl2ZXMoKTtcbiAgICB0aGlzLl9yZWdpc3RlclNwZWNpYWxUeXBlcygpO1xuICAgIHRoaXMuX3JlZ2lzdGVyQ29udGFpbmVycygpO1xuICAgIHRoaXMuX3JlZ2lzdGVyTGl0ZXJhbHMoKTtcbiAgICB0aGlzLl9yZWdpc3RlclVuaW9ucygpO1xuICAgIHRoaXMuX3JlZ2lzdGVySW50ZXJzZWN0aW9ucygpO1xuXG4gICAgLy8gUmVnaXN0ZXIgTnVsbGFibGVUeXBlIGFuZCBOYW1lZFR5cGVcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ251bGxhYmxlJywgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUsIGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCkgPT4ge1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdHlwZS5raW5kICE9PSAnbnVsbGFibGUnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX21hcnNoYWwoY29udGV4dCwgdmFsdWUsIHR5cGUudHlwZSk7XG4gICAgfSwgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUsIGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCkgPT4ge1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdHlwZS5raW5kICE9PSAnbnVsbGFibGUnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX3VubWFyc2hhbChjb250ZXh0LCB2YWx1ZSwgdHlwZS50eXBlKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbmFtZWQnLCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSwgY29udGV4dDogTWFyc2hhbGxpbmdDb250ZXh0KSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnbmFtZWQnKTtcbiAgICAgIGNvbnN0IG5hbWVkTWFyc2hhbGxlciA9IHRoaXMuX25hbWVkTWFyc2hhbGxlcnMuZ2V0KHR5cGUubmFtZSk7XG4gICAgICBpZiAobmFtZWRNYXJzaGFsbGVyID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBtYXJzaGFsbGVyIGZvdW5kIGZvciBuYW1lZCB0eXBlICR7dHlwZS5uYW1lfS5gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYW1lZE1hcnNoYWxsZXIubWFyc2hhbGxlcih2YWx1ZSwgY29udGV4dCk7XG4gICAgfSwgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUsIGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ25hbWVkJyk7XG4gICAgICBjb25zdCBuYW1lZE1hcnNoYWxsZXIgPSB0aGlzLl9uYW1lZE1hcnNoYWxsZXJzLmdldCh0eXBlLm5hbWUpO1xuICAgICAgaWYgKG5hbWVkTWFyc2hhbGxlciA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gbWFyc2hhbGxlciBmb3VuZCBmb3IgbmFtZWQgdHlwZSAke3R5cGUubmFtZX0uYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmFtZWRNYXJzaGFsbGVyLnVubWFyc2hhbGxlcih2YWx1ZSwgY29udGV4dCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoXG4gICAgICAndm9pZCcsXG4gICAgICAodmFsdWUsIHR5cGUsIGNvbnRleHQpID0+IFByb21pc2UucmVzb2x2ZShudWxsKSxcbiAgICAgICh2YWx1ZSwgdHlwZSwgY29udGV4dCkgPT4gUHJvbWlzZS5yZXNvbHZlKG51bGwpKTtcbiAgfVxuXG4gIF9yZWdpc3RlcktpbmQoXG4gICAga2luZDogc3RyaW5nLFxuICAgIG1hcnNoYWxsZXI6IFRyYW5zZm9ybWVyPE1hcnNoYWxsaW5nQ29udGV4dD4sXG4gICAgdW5tYXJzaGFsbGVyOiBUcmFuc2Zvcm1lcjxNYXJzaGFsbGluZ0NvbnRleHQ+XG4gICk6IHZvaWQge1xuICAgIGludmFyaWFudCghdGhpcy5fa2luZE1hcnNoYWxsZXJzLmhhcyhraW5kKSk7XG4gICAgdGhpcy5fa2luZE1hcnNoYWxsZXJzLnNldChraW5kLCB7bWFyc2hhbGxlciwgdW5tYXJzaGFsbGVyfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSB0eXBlIGJ5IHByb3ZpZGluZyBib3RoIGEgbWFyc2hhbGxlciBhbmQgYW4gdW5tYXJzaGFsbGVyLiBUaGUgbWFyc2hhbGxlclxuICAgKiB3aWxsIGJlIGNhbGxlZCB0byB0cmFuc2Zvcm0gdGhlIHR5cGUgYmVmb3JlIHNlbmRpbmcgaXQgb3V0IG9udG8gdGhlIG5ldHdvcmssIHdoaWxlIHRoZVxuICAgKiB1bm1hcnNoYWxsZXIgd2lsbCBiZSBjYWxsZWQgb24gdmFsdWVzIGluY29taW5nIGZyb20gdGhlIG5ldHdvcmsuXG4gICAqIEBwYXJhbSB0eXBlTmFtZSAtIFRoZSBzdHJpbmcgbmFtZSBvZiB0aGUgdHlwZSB0aGF0IHRoZSBwcm92aWRlZCBtYXJzaGFsbGVycyBjb252ZXJ0LlxuICAgKiBAcGFyYW0gbWFyc2hhbGxlciAtIFNlcmlhbGl6ZSB0aGUgdHlwZS5cbiAgICogQHBhcmFtIHVubWFyc2hhbGxlciAtIERlc2VyaWFsaXplIHRoZSB0eXBlLlxuICAgKi9cbiAgcmVnaXN0ZXJUeXBlKFxuICAgIHR5cGVOYW1lOiBzdHJpbmcsXG4gICAgbWFyc2hhbGxlcjogTmFtZWRUcmFuc2Zvcm1lcjxNYXJzaGFsbGluZ0NvbnRleHQ+LFxuICAgIHVubWFyc2hhbGxlcjogTmFtZWRUcmFuc2Zvcm1lcjxNYXJzaGFsbGluZ0NvbnRleHQ+LFxuICApOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbmFtZWRNYXJzaGFsbGVycy5oYXModHlwZU5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgdHlwZSBieSB0aGUgbmFtZSAke3R5cGVOYW1lfSBoYXMgYWxyZWFkeSBiZWVuIHJlZ2lzdGVyZWQuYCk7XG4gICAgfVxuICAgIHRoaXMuX25hbWVkTWFyc2hhbGxlcnMuc2V0KHR5cGVOYW1lLCB7bWFyc2hhbGxlciwgdW5tYXJzaGFsbGVyfSk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIGZvciByZWdpc3RlcmluZyB0aGUgbWFyYXNoYWxsZXIvdW5tYXJzaGFsbGVyIGZvciBhIHR5cGUgYWxpYXMuXG4gICAqIEBwYXJhbSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGFsaWFzIHR5cGUuXG4gICAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdGhlIHRoZSBhbGlhcyByZXByZXNlbnRzLlxuICAgKi9cbiAgcmVnaXN0ZXJBbGlhcyhuYW1lOiBzdHJpbmcsIHR5cGU6IFR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLnJlZ2lzdGVyVHlwZShuYW1lLCAodmFsdWUsIGNvbnRleHQpID0+IHRoaXMuX21hcnNoYWwoY29udGV4dCwgdmFsdWUsIHR5cGUpLFxuICAgICAgKHZhbHVlLCBjb250ZXh0KSA9PiB0aGlzLl91bm1hcnNoYWwoY29udGV4dCwgdmFsdWUsIHR5cGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJzaGFsIGFuIG9iamVjdCB1c2luZyB0aGUgYXBwcm9wcmlhdGUgbWFyc2hhbCBmdW5jdGlvbi5cbiAgICogRW5zdXJlcyB0aGUgcmVzdWx0IGlzIGFjdHVhbGx5IGEgUHJvbWlzZS5cbiAgICogQHBhcmFtIHZhbHVlIC0gVGhlIHZhbHVlIHRvIGJlIG1hcnNoYWxsZWQuXG4gICAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgb2JqZWN0ICh1c2VkIHRvIGZpbmQgdGhlIGFwcHJvcHJpYXRlIGZ1bmN0aW9uKS5cbiAgICovXG4gIG1hcnNoYWwoY29udGV4dDogTWFyc2hhbGxpbmdDb250ZXh0LCB2YWx1ZTogYW55LCB0eXBlOiBUeXBlKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX21hcnNoYWwoY29udGV4dCwgdmFsdWUsIHR5cGUpKTtcbiAgfVxuXG4gIF9tYXJzaGFsKGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCwgdmFsdWU6IGFueSwgdHlwZTogVHlwZSk6IGFueSB7XG4gICAgY29uc3Qga2luZE1hcnNoYWxsZXIgPSB0aGlzLl9raW5kTWFyc2hhbGxlcnMuZ2V0KHR5cGUua2luZCk7XG4gICAgaWYgKGtpbmRNYXJzaGFsbGVyID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gbWFyc2hhbGxlciBmb3VuZCBmb3IgdHlwZSBraW5kICR7dHlwZS5raW5kfS5gKTtcbiAgICB9XG4gICAgcmV0dXJuIGtpbmRNYXJzaGFsbGVyLm1hcnNoYWxsZXIodmFsdWUsIHR5cGUsIGNvbnRleHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVubWFyc2hhbCBhbmQgb2JqZWN0IHVzaW5nIHRoZSBhcHByb3ByaWF0ZSB1bm1hcnNoYWwgZnVuY3Rpb24uXG4gICAqIEVuc3VyZXMgdGhlIHJlc3VsdCBpcyBhY3R1YWxseSBhIFByb21pc2UuXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBiZSBtYXJzaGFsbGVkLlxuICAgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIG9iamVjdCAodXNlZCB0byBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmdW5jdGlvbikuXG4gICAqL1xuICB1bm1hcnNoYWwoY29udGV4dDogTWFyc2hhbGxpbmdDb250ZXh0LCB2YWx1ZTogYW55LCB0eXBlOiBUeXBlKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX3VubWFyc2hhbChjb250ZXh0LCB2YWx1ZSwgdHlwZSkpO1xuICB9XG5cbiAgdW5tYXJzaGFsQXJndW1lbnRzKFxuICAgIGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCxcbiAgICBhcmdzOiBBcnJheTxhbnk+LFxuICAgIGFyZ1R5cGVzOiBBcnJheTxUeXBlPlxuICApOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoYXJncy5tYXAoKGFyZywgaSkgPT4gdGhpcy51bm1hcnNoYWwoY29udGV4dCwgYXJnLCBhcmdUeXBlc1tpXSkpKTtcbiAgfVxuXG4gIF91bm1hcnNoYWwoY29udGV4dDogTWFyc2hhbGxpbmdDb250ZXh0LCB2YWx1ZTogYW55LCB0eXBlOiBUeXBlKTogYW55IHtcbiAgICBjb25zdCBraW5kTWFyc2hhbGxlciA9IHRoaXMuX2tpbmRNYXJzaGFsbGVycy5nZXQodHlwZS5raW5kKTtcbiAgICBpZiAoa2luZE1hcnNoYWxsZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyB1bm1hcnNoYWxsZXIgZm91bmQgZm9yIHR5cGUga2luZCAke3R5cGUua2luZH0uYCk7XG4gICAgfVxuICAgIHJldHVybiBraW5kTWFyc2hhbGxlci51bm1hcnNoYWxsZXIodmFsdWUsIHR5cGUsIGNvbnRleHQpO1xuICB9XG5cbiAgX3JlZ2lzdGVyUHJpbWl0aXZlcygpOiB2b2lkIHtcbiAgICAvLyBTaW5jZSBzdHJpbmcsIG51bWJlciwgYW5kIGJvb2xlYW4gYXJlIEpTT04gcHJpbWl0aXZlcyxcbiAgICAvLyB0aGV5IHJlcXVpcmUgbm8gbWFyc2hhbGxpbmcuIEluc3RlYWQsIHNpbXBseSBjcmVhdGUgd3JhcHBlZCB0cmFuc2Zvcm1lcnNcbiAgICAvLyB0aGF0IGFzc2VydCB0aGUgdHlwZSBvZiB0aGVpciBhcmd1bWVudC5cbiAgICBjb25zdCBzdHJpbmdUcmFuc2Zvcm1lciA9IGFyZyA9PiB7XG4gICAgICAvLyBVbmJveCBhcmd1bWVudC5cbiAgICAgIGFyZyA9IChhcmcgaW5zdGFuY2VvZiBTdHJpbmcpID8gYXJnLnZhbHVlT2YoKSA6IGFyZztcbiAgICAgIGFzc2VydCh0eXBlb2YgYXJnID09PSAnc3RyaW5nJywgJ0V4cGVjdGVkIGEgc3RyaW5nIGFyZ3VtZW50Jyk7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgY29uc3QgbnVtYmVyTWFyc2hhbGxlciA9IGFyZyA9PiB7XG4gICAgICAvLyBVbmJveCBhcmd1bWVudC5cbiAgICAgIGlmIChhcmcgaW5zdGFuY2VvZiBOdW1iZXIpIHtcbiAgICAgICAgYXJnID0gYXJnLnZhbHVlT2YoKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydCh0eXBlb2YgYXJnID09PSAnbnVtYmVyJywgJ0V4cGVjdGVkIGEgbnVtYmVyIGFyZ3VtZW50Jyk7XG4gICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShhcmcpKSB7XG4gICAgICAgIGlmIChhcmcgPT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSkge1xuICAgICAgICAgIGFyZyA9ICdORUdBVElWRV9JTkZJTklUWSc7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJnID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgICAgICBhcmcgPSAnUE9TSVRJVkVfSU5GSU5JVFknO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyZyA9ICdOYU4nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgY29uc3QgbnVtYmVyVW5tYXJzaGFsbGVyID0gYXJnID0+IHtcbiAgICAgIGlmICh0eXBlb2YgYXJnID09PSAnc3RyaW5nJykge1xuICAgICAgICBzd2l0Y2ggKGFyZykge1xuICAgICAgICAgIGNhc2UgJ05FR0FUSVZFX0lORklOSVRZJzpcbiAgICAgICAgICAgIGFyZyA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ1BPU0lUSVZFX0lORklOSVRZJzpcbiAgICAgICAgICAgIGFyZyA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ05hTic6XG4gICAgICAgICAgICBhcmcgPSBOdW1iZXIuTmFOO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIFRoaXMgd2lsbCBhc3NlcnQgYmVsb3dcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFyZyBpbnN0YW5jZW9mIE51bWJlcikge1xuICAgICAgICBhcmcgPSBhcmcudmFsdWVPZigpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0KHR5cGVvZiBhcmcgPT09ICdudW1iZXInLCAnRXhwZWN0ZWQgYSBudW1iZXIgYXJndW1lbnQnKTtcbiAgICAgIHJldHVybiBhcmc7XG4gICAgfTtcbiAgICBjb25zdCBib29sZWFuVHJhbnNmb3JtZXIgPSBhcmcgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnRcbiAgICAgIGlmIChhcmcgaW5zdGFuY2VvZiBCb29sZWFuKSB7XG4gICAgICAgIGFyZyA9IGFyZy52YWx1ZU9mKCk7XG4gICAgICB9XG4gICAgICBhc3NlcnQodHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nLCAnRXhwZWN0ZWQgYSBib29sZWFuIGFyZ3VtZW50Jyk7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgLy8gV2UgYXNzdW1lIGFuICdhbnknIGFuZCAnbWl4ZWQnIHR5cGVzIHJlcXVpcmUgbm8gbWFyc2hhbGxpbmcuXG4gICAgY29uc3QgaWRlbnRpdHlUcmFuc2Zvcm1lciA9IGFyZyA9PiBhcmc7XG5cbiAgICAvLyBSZWdpc3RlciB0aGVzZSB0cmFuc2Zvcm1lcnNcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ3N0cmluZycsIHN0cmluZ1RyYW5zZm9ybWVyLCBzdHJpbmdUcmFuc2Zvcm1lcik7XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdudW1iZXInLCBudW1iZXJNYXJzaGFsbGVyLCBudW1iZXJVbm1hcnNoYWxsZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnYm9vbGVhbicsIGJvb2xlYW5UcmFuc2Zvcm1lciwgYm9vbGVhblRyYW5zZm9ybWVyKTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ2FueScsIGlkZW50aXR5VHJhbnNmb3JtZXIsIGlkZW50aXR5VHJhbnNmb3JtZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbWl4ZWQnLCBpZGVudGl0eVRyYW5zZm9ybWVyLCBpZGVudGl0eVRyYW5zZm9ybWVyKTtcbiAgfVxuXG4gIF9yZWdpc3RlckxpdGVyYWxzKCk6IHZvaWQge1xuICAgIGNvbnN0IGxpdGVyYWxUcmFuc2Zvcm1lciA9IChhcmcsIHR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdzdHJpbmctbGl0ZXJhbCcgfHwgdHlwZS5raW5kID09PSAnbnVtYmVyLWxpdGVyYWwnIHx8XG4gICAgICAgICAgdHlwZS5raW5kID09PSAnYm9vbGVhbi1saXRlcmFsJyk7XG4gICAgICBpbnZhcmlhbnQoYXJnID09PSB0eXBlLnZhbHVlKTtcbiAgICAgIHJldHVybiBhcmc7XG4gICAgfTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ3N0cmluZy1saXRlcmFsJywgbGl0ZXJhbFRyYW5zZm9ybWVyLCBsaXRlcmFsVHJhbnNmb3JtZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbnVtYmVyLWxpdGVyYWwnLCBsaXRlcmFsVHJhbnNmb3JtZXIsIGxpdGVyYWxUcmFuc2Zvcm1lcik7XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdib29sZWFuLWxpdGVyYWwnLCBsaXRlcmFsVHJhbnNmb3JtZXIsIGxpdGVyYWxUcmFuc2Zvcm1lcik7XG4gIH1cblxuICBfcmVnaXN0ZXJVbmlvbnMoKTogdm9pZCB7XG4gICAgY29uc3QgdW5pb25MaXRlcmFsVHJhbnNmb3JtZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndW5pb24nKTtcbiAgICAgIGNvbnN0IGFsdGVybmF0ZSA9IHR5cGUudHlwZXMuZmluZChlbGVtZW50ID0+IHtcbiAgICAgICAgaW52YXJpYW50KGVsZW1lbnQua2luZCA9PT0gJ3N0cmluZy1saXRlcmFsJyB8fCBlbGVtZW50LmtpbmQgPT09ICdudW1iZXItbGl0ZXJhbCdcbiAgICAgICAgICAgIHx8IGVsZW1lbnQua2luZCA9PT0gJ2Jvb2xlYW4tbGl0ZXJhbCcpO1xuICAgICAgICByZXR1cm4gKGFyZyA9PT0gZWxlbWVudC52YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIGludmFyaWFudChhbHRlcm5hdGUpO1xuICAgICAgLy8gVGhpcyBpcyBqdXN0IHRoZSBsaXRlcmFsIHRyYW5zZm9ybWVyIGlubGluZWQgLi4uXG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgY29uc3QgdW5pb25PYmplY3RNYXJzaGFsbGVyID0gKGFyZywgdHlwZSwgY29udGV4dCkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3VuaW9uJyk7XG4gICAgICByZXR1cm4gdGhpcy5fbWFyc2hhbChjb250ZXh0LCBhcmcsIGZpbmRBbHRlcm5hdGUoYXJnLCB0eXBlKSk7XG4gICAgfTtcbiAgICBjb25zdCB1bmlvbk9iamVjdFVubWFyc2hhbGxlciA9IChhcmcsIHR5cGUsIGNvbnRleHQpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd1bmlvbicpO1xuICAgICAgcmV0dXJuIHRoaXMuX3VubWFyc2hhbChjb250ZXh0LCBhcmcsIGZpbmRBbHRlcm5hdGUoYXJnLCB0eXBlKSk7XG4gICAgfTtcbiAgICBjb25zdCB1bmlvbk1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlLCBjb250ZXh0KSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndW5pb24nKTtcbiAgICAgIGlmICh0eXBlLmRpc2NyaW1pbmFudEZpZWxkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuaW9uT2JqZWN0TWFyc2hhbGxlcihhcmcsIHR5cGUsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVuaW9uTGl0ZXJhbFRyYW5zZm9ybWVyKGFyZywgdHlwZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCB1bmlvblVubWFyc2hhbGxlciA9IChhcmcsIHR5cGUsIGNvbnRleHQpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd1bmlvbicpO1xuICAgICAgaWYgKHR5cGUuZGlzY3JpbWluYW50RmllbGQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5pb25PYmplY3RVbm1hcnNoYWxsZXIoYXJnLCB0eXBlLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmlvbkxpdGVyYWxUcmFuc2Zvcm1lcihhcmcsIHR5cGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCd1bmlvbicsIHVuaW9uTWFyc2hhbGxlciwgdW5pb25Vbm1hcnNoYWxsZXIpO1xuICB9XG5cbiAgX3JlZ2lzdGVySW50ZXJzZWN0aW9ucygpOiB2b2lkIHtcbiAgICBjb25zdCBpbnRlcnNlY3Rpb25NYXJzaGFsbGVyID0gKGFyZywgdHlwZSwgY29udGV4dCkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ2ludGVyc2VjdGlvbicpO1xuICAgICAgaW52YXJpYW50KHR5cGUuZmxhdHRlbmVkICE9IG51bGwpO1xuICAgICAgcmV0dXJuIHRoaXMuX21hcnNoYWwoY29udGV4dCwgYXJnLCB0eXBlLmZsYXR0ZW5lZCk7XG4gICAgfTtcbiAgICBjb25zdCBpbnRlcnNlY3Rpb25Vbm1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlLCBjb250ZXh0KSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnaW50ZXJzZWN0aW9uJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5mbGF0dGVuZWQgIT0gbnVsbCk7XG4gICAgICByZXR1cm4gdGhpcy5fdW5tYXJzaGFsKGNvbnRleHQsIGFyZywgdHlwZS5mbGF0dGVuZWQpO1xuICAgIH07XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdpbnRlcnNlY3Rpb24nLCBpbnRlcnNlY3Rpb25NYXJzaGFsbGVyLCBpbnRlcnNlY3Rpb25Vbm1hcnNoYWxsZXIpO1xuICB9XG5cbiAgX3JlZ2lzdGVyU3BlY2lhbFR5cGVzKCk6IHZvaWQge1xuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIGFueSBPYmplY3QgdHlwZVxuICAgIHRoaXMucmVnaXN0ZXJUeXBlKG9iamVjdFR5cGUubmFtZSwgb2JqZWN0ID0+IHtcbiAgICAgIGFzc2VydChvYmplY3QgIT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JywgJ0V4cGVjdGVkIE9iamVjdCBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfSwgb2JqZWN0ID0+IHtcbiAgICAgIGFzc2VydChvYmplY3QgIT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JywgJ0V4cGVjdGVkIE9iamVjdCBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBKYXZhc2NyaXB0IERhdGUgb2JqZWN0c1xuICAgIHRoaXMucmVnaXN0ZXJUeXBlKGRhdGVUeXBlLm5hbWUsIGRhdGUgPT4ge1xuICAgICAgYXNzZXJ0KGRhdGUgaW5zdGFuY2VvZiBEYXRlLCAnRXhwZWN0ZWQgZGF0ZSBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBkYXRlLnRvSlNPTigpO1xuICAgIH0sIGRhdGVTdHIgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnQuXG4gICAgICBkYXRlU3RyID0gKGRhdGVTdHIgaW5zdGFuY2VvZiBTdHJpbmcpID8gZGF0ZVN0ci52YWx1ZU9mKCkgOiBkYXRlU3RyO1xuXG4gICAgICBhc3NlcnQodHlwZW9mIGRhdGVTdHIgPT09ICdzdHJpbmcnLCAnRXhwZWNldGVkIGEgc3RyaW5nIGFyZ3VtZW50LicpO1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGVTdHIpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgUmVnRXhwIG9iamVjdHNcbiAgICB0aGlzLnJlZ2lzdGVyVHlwZShyZWdFeHBUeXBlLm5hbWUsIHJlZ2V4cCA9PiB7XG4gICAgICBhc3NlcnQocmVnZXhwIGluc3RhbmNlb2YgUmVnRXhwLCAnRXhwZWN0ZWQgYSBSZWdFeHAgb2JqZWN0IGFzIGFuIGFyZ3VtZW50Jyk7XG4gICAgICByZXR1cm4gcmVnZXhwLnRvU3RyaW5nKCk7XG4gICAgfSwgcmVnU3RyID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50LlxuICAgICAgcmVnU3RyID0gKHJlZ1N0ciBpbnN0YW5jZW9mIFN0cmluZykgPyByZWdTdHIudmFsdWVPZigpIDogcmVnU3RyO1xuXG4gICAgICBhc3NlcnQodHlwZW9mIHJlZ1N0ciA9PT0gJ3N0cmluZycsICdFeHBlY3RlZCBhIHN0cmluZyBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiB2bS5ydW5JblRoaXNDb250ZXh0KHJlZ1N0cik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBCdWZmZXIgb2JqZWN0cyB0aHJvdWdoIEJhc2U2NCBzdHJpbmdzXG4gICAgdGhpcy5yZWdpc3RlclR5cGUoYnVmZmVyVHlwZS5uYW1lLCBidWZmZXIgPT4ge1xuICAgICAgYXNzZXJ0KGJ1ZmZlciBpbnN0YW5jZW9mIEJ1ZmZlciwgJ0V4cGVjdGVkIGEgYnVmZmVyIGFyZ3VtZW50LicpO1xuICAgICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgfSwgYmFzZTY0c3RyaW5nID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50LlxuICAgICAgYmFzZTY0c3RyaW5nID0gKGJhc2U2NHN0cmluZyBpbnN0YW5jZW9mIFN0cmluZykgPyBiYXNlNjRzdHJpbmcudmFsdWVPZigpIDogYmFzZTY0c3RyaW5nO1xuXG4gICAgICBhc3NlcnQoXG4gICAgICAgIHR5cGVvZiBiYXNlNjRzdHJpbmcgPT09ICdzdHJpbmcnLFxuICAgICAgICBgRXhwZWN0ZWQgYSBiYXNlNjQgc3RyaW5nLiBOb3QgJHt0eXBlb2YgYmFzZTY0c3RyaW5nfWApO1xuICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoYmFzZTY0c3RyaW5nLCAnYmFzZTY0Jyk7XG4gICAgfSk7XG5cbiAgICAvLyBmcy5TdGF0c1xuICAgIHRoaXMucmVnaXN0ZXJUeXBlKGZzU3RhdHNUeXBlLm5hbWUsIHN0YXRzID0+IHtcbiAgICAgIGFzc2VydChzdGF0cyBpbnN0YW5jZW9mIGZzLlN0YXRzKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzdGF0c1RvT2JqZWN0KHN0YXRzKSk7XG4gICAgfSwganNvbiA9PiB7XG4gICAgICBhc3NlcnQodHlwZW9mIGpzb24gPT09ICdzdHJpbmcnKTtcbiAgICAgIHJldHVybiBvYmplY3RUb1N0YXRzKEpTT04ucGFyc2UoanNvbikpO1xuICAgIH0pO1xuICB9XG5cbiAgX3JlZ2lzdGVyQ29udGFpbmVycygpOiB2b2lkIHtcbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBBcnJheXMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdhcnJheScsICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlLCBjb250ZXh0OiBNYXJzaGFsbGluZ0NvbnRleHQpID0+IHtcbiAgICAgIGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnYXJyYXknKTtcbiAgICAgIGNvbnN0IGVsZW1UeXBlID0gdHlwZS50eXBlO1xuICAgICAgcmV0dXJuIHNtYXJ0UHJvbWlzZUFsbCh2YWx1ZS5tYXAoZWxlbSA9PiB0aGlzLl9tYXJzaGFsKGNvbnRleHQsIGVsZW0sIGVsZW1UeXBlKSkpO1xuICAgIH0sICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlLCBjb250ZXh0OiBNYXJzaGFsbGluZ0NvbnRleHQpID0+IHtcbiAgICAgIGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnYXJyYXknKTtcbiAgICAgIGNvbnN0IGVsZW1UeXBlID0gdHlwZS50eXBlO1xuICAgICAgcmV0dXJuIHNtYXJ0UHJvbWlzZUFsbCh2YWx1ZS5tYXAoZWxlbSA9PiB0aGlzLl91bm1hcnNoYWwoY29udGV4dCwgZWxlbSwgZWxlbVR5cGUpKSk7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgYW5kIERlc2VyaWFsaXplIE9iamVjdHMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdvYmplY3QnLCAob2JqOiBhbnksIHR5cGU6IFR5cGUsIGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCkgPT4ge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBvYmogPT09ICdvYmplY3QnLCAnRXhwZWN0ZWQgYW4gYXJndW1lbnQgb2YgdHlwZSBvYmplY3QuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnb2JqZWN0Jyk7XG4gICAgICBjb25zdCBuZXdPYmogPSB7fTsgLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCBzbyB3ZSBkb24ndCBtdXRhdGUgdGhlIG9yaWdpbmFsIG9uZS5cbiAgICAgIGNvbnN0IHByb21pc2UgPSBjaGVja2VkU21hcnRQcm9taXNlQWxsKHR5cGUuZmllbGRzLm1hcChwcm9wID0+IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNvdXJjZSBvYmplY3QgaGFzIHRoaXMga2V5LlxuICAgICAgICBpZiAob2JqICE9IG51bGwgJiYgb2JqLmhhc093blByb3BlcnR5KHByb3AubmFtZSkpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX21hcnNoYWwoY29udGV4dCwgb2JqW3Byb3AubmFtZV0sIHByb3AudHlwZSk7XG4gICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRoZW4ocmVzdWx0ID0+IG5ld09ialtwcm9wLm5hbWVdID0gcmVzdWx0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3T2JqW3Byb3AubmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb3Aub3B0aW9uYWwpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcHJvcGVydHkgaXMgb3B0aW9uYWwsIGl0J3Mgb2theSBmb3IgaXQgdG8gYmUgbWlzc2luZy5cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgU291cmNlIG9iamVjdDogJHtKU09OLnN0cmluZ2lmeShvYmopfSBpcyBtaXNzaW5nIHByb3BlcnR5ICR7cHJvcC5uYW1lfS5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIGlmIChwcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKCgpID0+IG5ld09iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3T2JqO1xuICAgIH0sIChvYmo6IGFueSwgdHlwZTogVHlwZSwgY29udGV4dDogTWFyc2hhbGxpbmdDb250ZXh0KSA9PiB7XG4gICAgICBhc3NlcnQodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcsICdFeHBlY3RlZCBhbiBhcmd1bWVudCBvZiB0eXBlIG9iamVjdC4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdvYmplY3QnKTtcbiAgICAgIGNvbnN0IG5ld09iaiA9IHt9OyAvLyBDcmVhdGUgYSBuZXcgb2JqZWN0IHNvIHdlIGRvbid0IG11dGF0ZSB0aGUgb3JpZ2luYWwgb25lLlxuICAgICAgY29uc3QgcHJvbWlzZSA9IGNoZWNrZWRTbWFydFByb21pc2VBbGwodHlwZS5maWVsZHMubWFwKHByb3AgPT4ge1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgc291cmNlIG9iamVjdCBoYXMgdGhpcyBrZXkuXG4gICAgICAgIGlmIChvYmogIT0gbnVsbCAmJiBvYmouaGFzT3duUHJvcGVydHkocHJvcC5uYW1lKSkge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fdW5tYXJzaGFsKGNvbnRleHQsIG9ialtwcm9wLm5hbWVdLCBwcm9wLnR5cGUpO1xuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50aGVuKHJlc3VsdCA9PiBuZXdPYmpbcHJvcC5uYW1lXSA9IHJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld09ialtwcm9wLm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFwcm9wLm9wdGlvbmFsKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHByb3BlcnR5IGlzIG9wdGlvbmFsLCBpdCdzIG9rYXkgZm9yIGl0IHRvIGJlIG1pc3NpbmcuXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFNvdXJjZSBvYmplY3Q6ICR7SlNPTi5zdHJpbmdpZnkob2JqKX0gaXMgbWlzc2luZyBwcm9wZXJ0eSAke3Byb3AubmFtZX0uYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgICBpZiAocHJvbWlzZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbigoKSA9PiBuZXdPYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld09iajtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIFNldHMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdzZXQnLCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSwgY29udGV4dDogTWFyc2hhbGxpbmdDb250ZXh0KSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnc2V0Jyk7XG4gICAgICBhc3NlcnQodmFsdWUgaW5zdGFuY2VvZiBTZXQsICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBTZXQuJyk7XG4gICAgICBjb25zdCBzZXJpYWxpemVQcm9taXNlcyA9IFtdO1xuICAgICAgZm9yIChjb25zdCBlbGVtIG9mIHZhbHVlKSB7XG4gICAgICAgIHNlcmlhbGl6ZVByb21pc2VzLnB1c2godGhpcy5fbWFyc2hhbChjb250ZXh0LCBlbGVtLCB0eXBlLnR5cGUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbWFydFByb21pc2VBbGwoc2VyaWFsaXplUHJvbWlzZXMpO1xuICAgIH0sICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlLCBjb250ZXh0OiBNYXJzaGFsbGluZ0NvbnRleHQpID0+IHtcbiAgICAgIGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnc2V0Jyk7XG4gICAgICBjb25zdCBlbGVtVHlwZSA9IHR5cGUudHlwZTtcbiAgICAgIGNvbnN0IGVsZW1lbnRzID0gc21hcnRQcm9taXNlQWxsKHZhbHVlLm1hcChlbGVtID0+IHRoaXMuX3VubWFyc2hhbChjb250ZXh0LCBlbGVtLCBlbGVtVHlwZSkpKTtcbiAgICAgIGlmIChlbGVtZW50cyBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnRzLnRoZW4oeCA9PiBuZXcgU2V0KHgpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgU2V0KGVsZW1lbnRzKTtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIE1hcHMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdtYXAnLCAobWFwOiBNYXAsIHR5cGU6IFR5cGUsIGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCkgPT4ge1xuICAgICAgYXNzZXJ0KG1hcCBpbnN0YW5jZW9mIE1hcCwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIFNldC4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdtYXAnKTtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZVByb21pc2VzID0gW107XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBtYXApIHtcbiAgICAgICAgc2VyaWFsaXplUHJvbWlzZXMucHVzaChjaGVja2VkU21hcnRQcm9taXNlQWxsKFtcbiAgICAgICAgICB0aGlzLl9tYXJzaGFsKGNvbnRleHQsIGtleSwgdHlwZS5rZXlUeXBlKSxcbiAgICAgICAgICB0aGlzLl9tYXJzaGFsKGNvbnRleHQsIHZhbHVlLCB0eXBlLnZhbHVlVHlwZSksXG4gICAgICAgIF0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbWFydFByb21pc2VBbGwoc2VyaWFsaXplUHJvbWlzZXMpO1xuICAgIH0sIChzZXJpYWxpemVkOiBhbnksIHR5cGU6IFR5cGUsIGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCkgPT4ge1xuICAgICAgYXNzZXJ0KHNlcmlhbGl6ZWQgaW5zdGFuY2VvZiBBcnJheSwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIEFycmF5LicpO1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ21hcCcpO1xuICAgICAgY29uc3Qga2V5VHlwZSA9IHR5cGUua2V5VHlwZTtcbiAgICAgIGNvbnN0IHZhbHVlVHlwZSA9IHR5cGUudmFsdWVUeXBlO1xuICAgICAgY29uc3QgZW50cmllcyA9IHNtYXJ0UHJvbWlzZUFsbChcbiAgICAgICAgc2VyaWFsaXplZC5tYXAoZW50cnkgPT4gY2hlY2tlZFNtYXJ0UHJvbWlzZUFsbChbXG4gICAgICAgICAgdGhpcy5fdW5tYXJzaGFsKGNvbnRleHQsIGVudHJ5WzBdLCBrZXlUeXBlKSxcbiAgICAgICAgICB0aGlzLl91bm1hcnNoYWwoY29udGV4dCwgZW50cnlbMV0sIHZhbHVlVHlwZSksXG4gICAgICAgIF0pKVxuICAgICAgKTtcbiAgICAgIGlmIChlbnRyaWVzIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gZW50cmllcy50aGVuKHggPT4gbmV3IE1hcCh4KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IE1hcChlbnRyaWVzKTtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIFR1cGxlcy5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ3R1cGxlJywgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUsIGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCkgPT4ge1xuICAgICAgLy8gQXNzZXJ0IHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LlxuICAgICAgYXNzZXJ0KEFycmF5LmlzQXJyYXkodmFsdWUpLCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndHVwbGUnKTtcbiAgICAgIGNvbnN0IHR5cGVzID0gdHlwZS50eXBlcztcbiAgICAgIGFzc2VydCh2YWx1ZS5sZW5ndGggPT09IHR5cGVzLmxlbmd0aCwgYEV4cGVjdGVkIHR1cGxlIG9mIGxlbmd0aCAke3R5cGVzLmxlbmd0aH0uYCk7XG5cbiAgICAgIC8vIENvbnZlcnQgYWxsIG9mIHRoZSBlbGVtZW50cyB0aHJvdWdoIHRoZSBjb3JyZWN0IG1hcnNoYWxsZXIuXG4gICAgICByZXR1cm4gY2hlY2tlZFNtYXJ0UHJvbWlzZUFsbCh2YWx1ZS5tYXAoKGVsZW0sIGkpID0+IHRoaXMuX21hcnNoYWwoY29udGV4dCwgZWxlbSwgdHlwZXNbaV0pKSk7XG4gICAgfSwgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUsIGNvbnRleHQ6IE1hcnNoYWxsaW5nQ29udGV4dCkgPT4ge1xuICAgICAgLy8gQXNzZXJ0IHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LlxuICAgICAgYXNzZXJ0KEFycmF5LmlzQXJyYXkodmFsdWUpLCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndHVwbGUnKTtcbiAgICAgIGNvbnN0IHR5cGVzID0gdHlwZS50eXBlcztcbiAgICAgIGFzc2VydCh2YWx1ZS5sZW5ndGggPT09IHR5cGVzLmxlbmd0aCwgYEV4cGVjdGVkIHR1cGxlIG9mIGxlbmd0aCAke3R5cGVzLmxlbmd0aH0uYCk7XG5cbiAgICAgIC8vIENvbnZlcnQgYWxsIG9mIHRoZSBlbGVtZW50cyB0aHJvdWdoIHRoZSBjb3JyZWN0IHVubWFyc2hhbGxlci5cbiAgICAgIHJldHVybiBjaGVja2VkU21hcnRQcm9taXNlQWxsKFxuICAgICAgICAgIHZhbHVlLm1hcCgoZWxlbSwgaSkgPT4gdGhpcy5fdW5tYXJzaGFsKGNvbnRleHQsIGVsZW0sIHR5cGVzW2ldKSkpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE9iamVjdEZpZWxkQnlOYW1lKHR5cGU6IE9iamVjdFR5cGUsIGZpZWxkTmFtZTogc3RyaW5nKTogT2JqZWN0RmllbGQge1xuICBjb25zdCByZXN1bHQgPSB0eXBlLmZpZWxkcy5maW5kKGZpZWxkID0+IGZpZWxkLm5hbWUgPT09IGZpZWxkTmFtZSk7XG4gIGludmFyaWFudChyZXN1bHQgIT0gbnVsbCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGZpbmRBbHRlcm5hdGUoYXJnOiBPYmplY3QsIHR5cGU6IFVuaW9uVHlwZSk6IE9iamVjdFR5cGUge1xuICBjb25zdCBkaXNjcmltaW5hbnRGaWVsZCA9IHR5cGUuZGlzY3JpbWluYW50RmllbGQ7XG4gIGludmFyaWFudChkaXNjcmltaW5hbnRGaWVsZCAhPSBudWxsKTtcbiAgY29uc3QgZGlzY3JpbWluYW50ID0gYXJnW2Rpc2NyaW1pbmFudEZpZWxkXTtcbiAgaW52YXJpYW50KGRpc2NyaW1pbmFudCAhPSBudWxsKTtcbiAgY29uc3QgYWx0ZXJuYXRlczogQXJyYXk8T2JqZWN0VHlwZT4gPSAodHlwZS50eXBlczogYW55KTtcbiAgY29uc3QgcmVzdWx0ID0gYWx0ZXJuYXRlcy5maW5kKGFsdGVybmF0ZSA9PiB7XG4gICAgaW52YXJpYW50KGFsdGVybmF0ZS5raW5kID09PSAnb2JqZWN0Jyk7XG4gICAgY29uc3QgYWx0ZXJuYXRlVHlwZSA9IGdldE9iamVjdEZpZWxkQnlOYW1lKGFsdGVybmF0ZSwgZGlzY3JpbWluYW50RmllbGQpLnR5cGU7XG4gICAgaW52YXJpYW50KGFsdGVybmF0ZVR5cGUua2luZCA9PT0gJ3N0cmluZy1saXRlcmFsJyB8fCBhbHRlcm5hdGVUeXBlLmtpbmQgPT09ICdudW1iZXItbGl0ZXJhbCdcbiAgICAgICAgfHwgYWx0ZXJuYXRlVHlwZS5raW5kID09PSAnYm9vbGVhbi1saXRlcmFsJyk7XG4gICAgcmV0dXJuIGFsdGVybmF0ZVR5cGUudmFsdWUgPT09IGRpc2NyaW1pbmFudDtcbiAgfSk7XG4gIGludmFyaWFudChyZXN1bHQgIT0gbnVsbCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=