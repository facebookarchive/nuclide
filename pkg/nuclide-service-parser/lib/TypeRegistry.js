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

var _nuclideCommons = require('../../nuclide-commons');

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
      var _this3 = this;

      var unionLiteralTransformer = function unionLiteralTransformer(arg, type) {
        (0, _assert3['default'])(type.kind === 'union');
        var alternate = _nuclideCommons.array.find(type.types, function (element) {
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
      }, function (value, type) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'set');
        var elemType = type.type;
        var elements = smartPromiseAll(value.map(function (elem) {
          return _this5._unmarshal(elem, elemType);
        }));
        if (elements instanceof Promise) {
          return elements.then(function (x) {
            return new Set(x);
          });
        }
        return new Set(elements);
      });

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
      }, function (serialized, type) {
        (0, _assert2['default'])(serialized instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'map');
        var keyType = type.keyType;
        var valueType = type.valueType;
        var entries = smartPromiseAll(serialized.map(function (entry) {
          return checkedSmartPromiseAll([_this5._unmarshal(entry[0], keyType), _this5._unmarshal(entry[1], valueType)]);
        }));
        if (entries instanceof Promise) {
          return entries.then(function (x) {
            return new Map(x);
          });
        }
        return new Map(entries);
      });

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
  var result = _nuclideCommons.array.find(type.fields, function (field) {
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
  var result = _nuclideCommons.array.find(alternates, function (alternate) {
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
//# sourceMappingURL=data:application/json;base64,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YSxDQUFDLElBQUksS0FBSyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELFdBQU8sYUFBYSxDQUFDLEtBQUssS0FBSyxZQUFZLENBQUM7R0FDN0MsQ0FBQyxDQUFDO0FBQ0gsMkJBQVUsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzFCLFNBQU8sTUFBTSxDQUFDO0NBQ2YiLCJmaWxlIjoiVHlwZVJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHZtIGZyb20gJ3ZtJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbmltcG9ydCB0eXBlIHtcbiAgVHlwZSxcbiAgT2JqZWN0VHlwZSxcbiAgT2JqZWN0RmllbGQsXG4gIFVuaW9uVHlwZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge29iamVjdFR5cGUsIGRhdGVUeXBlLCByZWdFeHBUeXBlLCBidWZmZXJUeXBlLCBmc1N0YXRzVHlwZX0gZnJvbSAnLi9idWlsdGluLXR5cGVzJztcblxuXG4vKlxuICogVGhpcyB0eXBlIHJlcHJlc2VudHMgYSBUcmFuc2Zvcm1lciBmdW5jdGlvbiwgd2hpY2ggdGFrZXMgaW4gYSB2YWx1ZSwgYW5kIGVpdGhlciBzZXJpYWxpemVzXG4gKiBvciBkZXNlcmlhbGl6ZXMgaXQuIFRyYW5zZm9ybWVyJ3MgYXJlIGFkZGVkIHRvIGEgcmVnaXN0cnkgYW5kIGluZGV4ZWQgYnkgdGhlIG5hbWUgb2ZcbiAqIHRoZSB0eXBlIHRoZXkgaGFuZGxlIChlZzogJ0RhdGUnKS4gVGhlIHNlY29uZCBhcmd1bWVudCBpcyB0aGUgYWN0dWFsIHR5cGUgb2JqZWN0IHRoYXQgcmVwcmVzZW50XG4gKiB0aGUgdmFsdWUuIFBhcmFtZXRlcml6ZWQgdHlwZXMgbGlrZSBBcnJheSwgb3IgT2JqZWN0IGNhbiB1c2UgdGhpcyB0byByZWN1cnNpdmVseSBjYWxsIG90aGVyXG4gKiB0cmFuc2Zvcm1lcnMuXG4gKlxuICogSW4gdGhlIGludGVyZXN0IG9mIGEgcGVyZm9ybWFuY2UsIGEgdHJhbnNmb3JtZXIgc2hvdWxkIG9ubHkgcmV0dXJuIGEgUHJvbWlzZSBpZiBuZWNlc3NhcnkuXG4gKiAoUHJvbWlzZSBvYmplY3RzIGFuZCBQcm9taXNlLmFsbCBhcmUgdmVyeSBleHBlbnNpdmUgb3BlcmF0aW9ucyBpbiBsYXJnZSBudW1iZXJzKS5cbiAqL1xuZXhwb3J0IHR5cGUgVHJhbnNmb3JtZXI8VD4gPSAodmFsdWU6IFQsIHR5cGU6IFR5cGUpID0+IChUIHwgUHJvbWlzZTxUPik7XG5leHBvcnQgdHlwZSBOYW1lZFRyYW5zZm9ybWVyPFQ+ID0gKHZhbHVlOiBUKSA9PiAoVCB8IFByb21pc2U8VD4pO1xuXG4vLyBFcXVpdmFsZW50IHRvIFByb21pc2UuYWxsLCBidXQgYXZvaWRzIHdyYXBwZXJzIGlmIG5vdGhpbmcgaXMgYWN0dWFsbHkgYSBwcm9taXNlLlxuLy8gSW5wdXQgbXVzdCBiZSBob21vZ2Vub3VzbHkgdHlwZWQuXG5mdW5jdGlvbiBzbWFydFByb21pc2VBbGw8VD4oYXJyOiBBcnJheTxUPik6IEFycmF5PFQ+IHwgUHJvbWlzZTxBcnJheTxUPj4ge1xuICBpZiAoYXJyLmxlbmd0aCA9PT0gMCB8fCAhKGFyclswXSBpbnN0YW5jZW9mIFByb21pc2UpKSB7XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5hbGwoYXJyKTtcbn1cblxuLy8gU2FtZSBhcyB0aGUgYWJvdmUsIGJ1dCB3b3JrcyBmb3Igbm9uLWhvbW9nZW5vdXMgaW5wdXQuXG5mdW5jdGlvbiBjaGVja2VkU21hcnRQcm9taXNlQWxsKGFycjogQXJyYXk8YW55Pik6IEFycmF5PGFueT4gfCBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgZm9yIChjb25zdCBlbGVtIG9mIGFycikge1xuICAgIGlmIChlbGVtIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGFycik7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnI7XG59XG5cbmZ1bmN0aW9uIHN0YXRzVG9PYmplY3Qoc3RhdHM6IGZzLlN0YXRzKTogT2JqZWN0IHtcbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIGRldjogc3RhdHMuZGV2LFxuICAgIG1vZGU6IHN0YXRzLm1vZGUsXG4gICAgbmxpbms6IHN0YXRzLm5saW5rLFxuICAgIHVpZDogc3RhdHMudWlkLFxuICAgIGdpZDogc3RhdHMuZ2lkLFxuICAgIHJkZXY6IHN0YXRzLnJkZXYsXG4gICAgYmxrc2l6ZTogc3RhdHMuYmxrc2l6ZSxcbiAgICBpbm86IHN0YXRzLmlubyxcbiAgICBzaXplOiBzdGF0cy5zaXplLFxuICAgIGJsb2Nrczogc3RhdHMuYmxvY2tzLFxuICAgIGF0aW1lOiBzdGF0cy5hdGltZS50b0pTT04oKSxcbiAgICBtdGltZTogc3RhdHMubXRpbWUudG9KU09OKCksXG4gICAgY3RpbWU6IHN0YXRzLmN0aW1lLnRvSlNPTigpLFxuICB9O1xuXG4gIGlmIChzdGF0cy5iaXJ0aHRpbWUpIHtcbiAgICByZXR1cm4gey4uLnJlc3VsdCwgYmlydGh0aW1lOiBzdGF0cy5iaXJ0aHRpbWUudG9KU09OKCkgfTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RhdHMoanNvblN0YXRzOiBPYmplY3QpOiBmcy5TdGF0cyB7XG4gIGNvbnN0IHN0YXRzID0gbmV3IGZzLlN0YXRzKCk7XG5cbiAgc3RhdHMuZGV2ID0ganNvblN0YXRzLmRldjtcbiAgc3RhdHMubW9kZSA9IGpzb25TdGF0cy5tb2RlO1xuICBzdGF0cy5ubGluayA9IGpzb25TdGF0cy5ubGluaztcbiAgc3RhdHMudWlkID0ganNvblN0YXRzLnVpZDtcbiAgc3RhdHMuZ2lkID0ganNvblN0YXRzLmdpZDtcbiAgc3RhdHMucmRldiA9IGpzb25TdGF0cy5yZGV2O1xuICBzdGF0cy5ibGtzaXplID0ganNvblN0YXRzLmJsa3NpemU7XG4gIHN0YXRzLmlubyA9IGpzb25TdGF0cy5pbm87XG4gIHN0YXRzLnNpemUgPSBqc29uU3RhdHMuc2l6ZTtcbiAgc3RhdHMuYmxvY2tzID0ganNvblN0YXRzLmJsb2NrcztcbiAgc3RhdHMuYXRpbWUgPSBuZXcgRGF0ZShqc29uU3RhdHMuYXRpbWUpO1xuICBzdGF0cy5tdGltZSA9IG5ldyBEYXRlKGpzb25TdGF0cy5tdGltZSk7XG4gIHN0YXRzLmN0aW1lID0gbmV3IERhdGUoanNvblN0YXRzLmN0aW1lKTtcblxuICBpZiAoanNvblN0YXRzLmJpcnRodGltZSkge1xuICAgIC8vICRGbG93SXNzdWVcbiAgICBzdGF0cy5iaXJ0aHRpbWUgPSBuZXcgRGF0ZShqc29uU3RhdHMuYmlydGh0aW1lKTtcbiAgfVxuXG4gIHJldHVybiBzdGF0cztcbn1cblxuLypcbiAqIFRoZSBUeXBlUmVnaXN0cnkgaXMgYSBjZW50cmFsaXplZCBwbGFjZSB0byByZWdpc3RlciBmdW5jdGlvbnMgdGhhdCBzZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplXG4gKiB0eXBlcy4gVGhpcyBhbGxvd3MgZm9yIHR5cGVzIGRlZmluZWQgaW4gb25lIHNlcnZpY2UgdG8gaW5jbHVkZSB0eXBlcyBmcm9tIGFub3RoZXIgc2VydmljZSBpblxuICogYW5vdGhlciBmaWxlLiBJdCBhbHNvIGFsbG93cyB0aGUgYWJpbGl0eSB0byBhZGQgbmV3IHByaW1pdGl2ZXMsIHJhbmdpbmcgZnJvbSBCdWZmZXIgdG8gTnVjbGlkZVVyaVxuICogdGhhdCBhcmUgbm90IGhhbmRsZWQgYXQgdGhlIHRyYW5zcG9ydCBsYXllci4gVGhlIGtleSBjb25jZXB0IGlzIHRoYXQgbWFyc2hhbGxpbmcgZnVuY3Rpb25zIGNhblxuICogYmUgcmVjdXJzaXZlLCBjYWxsaW5nIG90aGVyIG1hcnNoYWxsaW5nIGZ1bmN0aW9ucywgZW5kaW5nIGF0IHRoZSBwcmltaXRpdmVzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlUmVnaXN0cnkge1xuICAvKiogU3RvcmUgbWFyaHNhbGxlcnMgYW5kIGFuZCB1bm1hcnNoYWxsZXJzLCBpbmRleCBieSB0aGUga2luZCBvZiB0aGUgdHlwZS4gKi9cbiAgX2tpbmRNYXJzaGFsbGVyczogTWFwPHN0cmluZywge1xuICAgICAgbWFyc2hhbGxlcjogVHJhbnNmb3JtZXI7XG4gICAgICB1bm1hcnNoYWxsZXI6IFRyYW5zZm9ybWVyO1xuICAgIH0+O1xuXG4gIC8qKiBTdG9yZSBtYXJoc2FsbGVycyBhbmQgYW5kIHVubWFyc2hhbGxlcnMsIGluZGV4IGJ5IHRoZSBuYW1lIG9mIHRoZSB0eXBlLiAqL1xuICBfbmFtZWRNYXJzaGFsbGVyczogTWFwPHN0cmluZywge1xuICAgICAgbWFyc2hhbGxlcjogTmFtZWRUcmFuc2Zvcm1lcjtcbiAgICAgIHVubWFyc2hhbGxlcjogTmFtZWRUcmFuc2Zvcm1lcjtcbiAgICB9PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9raW5kTWFyc2hhbGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fbmFtZWRNYXJzaGFsbGVycyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyUHJpbWl0aXZlcygpO1xuICAgIHRoaXMuX3JlZ2lzdGVyU3BlY2lhbFR5cGVzKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJDb250YWluZXJzKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJMaXRlcmFscygpO1xuICAgIHRoaXMuX3JlZ2lzdGVyVW5pb25zKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJJbnRlcnNlY3Rpb25zKCk7XG5cbiAgICAvLyBSZWdpc3RlciBOdWxsYWJsZVR5cGUgYW5kIE5hbWVkVHlwZVxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbnVsbGFibGUnLCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdHlwZS5raW5kICE9PSAnbnVsbGFibGUnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX21hcnNoYWwodmFsdWUsIHR5cGUudHlwZSk7XG4gICAgfSwgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHR5cGUua2luZCAhPT0gJ251bGxhYmxlJykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl91bm1hcnNoYWwodmFsdWUsIHR5cGUudHlwZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ25hbWVkJywgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICduYW1lZCcpO1xuICAgICAgY29uc3QgbmFtZWRNYXJzaGFsbGVyID0gdGhpcy5fbmFtZWRNYXJzaGFsbGVycy5nZXQodHlwZS5uYW1lKTtcbiAgICAgIGlmIChuYW1lZE1hcnNoYWxsZXIgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIG1hcnNoYWxsZXIgZm91bmQgZm9yIG5hbWVkIHR5cGUgJHt0eXBlLm5hbWV9LmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hbWVkTWFyc2hhbGxlci5tYXJzaGFsbGVyKHZhbHVlKTtcbiAgICB9LCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ25hbWVkJyk7XG4gICAgICBjb25zdCBuYW1lZE1hcnNoYWxsZXIgPSB0aGlzLl9uYW1lZE1hcnNoYWxsZXJzLmdldCh0eXBlLm5hbWUpO1xuICAgICAgaWYgKG5hbWVkTWFyc2hhbGxlciA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gbWFyc2hhbGxlciBmb3VuZCBmb3IgbmFtZWQgdHlwZSAke3R5cGUubmFtZX0uYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmFtZWRNYXJzaGFsbGVyLnVubWFyc2hhbGxlcih2YWx1ZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoXG4gICAgICAndm9pZCcsXG4gICAgICAodmFsdWUsIHR5cGUpID0+IFByb21pc2UucmVzb2x2ZShudWxsKSxcbiAgICAgICh2YWx1ZSwgdHlwZSkgPT4gUHJvbWlzZS5yZXNvbHZlKG51bGwpKTtcbiAgfVxuXG4gIF9yZWdpc3RlcktpbmQoa2luZDogc3RyaW5nLCBtYXJzaGFsbGVyOiBUcmFuc2Zvcm1lciwgdW5tYXJzaGFsbGVyOiBUcmFuc2Zvcm1lcik6IHZvaWQge1xuICAgIGludmFyaWFudCghdGhpcy5fa2luZE1hcnNoYWxsZXJzLmhhcyhraW5kKSk7XG4gICAgdGhpcy5fa2luZE1hcnNoYWxsZXJzLnNldChraW5kLCB7bWFyc2hhbGxlciwgdW5tYXJzaGFsbGVyfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSB0eXBlIGJ5IHByb3ZpZGluZyBib3RoIGEgbWFyc2hhbGxlciBhbmQgYW4gdW5tYXJzaGFsbGVyLiBUaGUgbWFyc2hhbGxlclxuICAgKiB3aWxsIGJlIGNhbGxlZCB0byB0cmFuc2Zvcm0gdGhlIHR5cGUgYmVmb3JlIHNlbmRpbmcgaXQgb3V0IG9udG8gdGhlIG5ldHdvcmssIHdoaWxlIHRoZVxuICAgKiB1bm1hcnNoYWxsZXIgd2lsbCBiZSBjYWxsZWQgb24gdmFsdWVzIGluY29taW5nIGZyb20gdGhlIG5ldHdvcmsuXG4gICAqIEBwYXJhbSB0eXBlTmFtZSAtIFRoZSBzdHJpbmcgbmFtZSBvZiB0aGUgdHlwZSB0aGF0IHRoZSBwcm92aWRlZCBtYXJzaGFsbGVycyBjb252ZXJ0LlxuICAgKiBAcGFyYW0gbWFyc2hhbGxlciAtIFNlcmlhbGl6ZSB0aGUgdHlwZS5cbiAgICogQHBhcmFtIHVubWFyc2hhbGxlciAtIERlc2VyaWFsaXplIHRoZSB0eXBlLlxuICAgKi9cbiAgcmVnaXN0ZXJUeXBlKFxuICAgIHR5cGVOYW1lOiBzdHJpbmcsXG4gICAgbWFyc2hhbGxlcjogTmFtZWRUcmFuc2Zvcm1lcixcbiAgICB1bm1hcnNoYWxsZXI6IE5hbWVkVHJhbnNmb3JtZXIsXG4gICk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9uYW1lZE1hcnNoYWxsZXJzLmhhcyh0eXBlTmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQSB0eXBlIGJ5IHRoZSBuYW1lICR7dHlwZU5hbWV9IGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZC5gKTtcbiAgICB9XG4gICAgdGhpcy5fbmFtZWRNYXJzaGFsbGVycy5zZXQodHlwZU5hbWUsIHttYXJzaGFsbGVyLCB1bm1hcnNoYWxsZXJ9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIHJlZ2lzdGVyaW5nIHRoZSBtYXJhc2hhbGxlci91bm1hcnNoYWxsZXIgZm9yIGEgdHlwZSBhbGlhcy5cbiAgICogQHBhcmFtIG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgYWxpYXMgdHlwZS5cbiAgICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0aGUgdGhlIGFsaWFzIHJlcHJlc2VudHMuXG4gICAqL1xuICByZWdpc3RlckFsaWFzKG5hbWU6IHN0cmluZywgdHlwZTogVHlwZSk6IHZvaWQge1xuICAgIHRoaXMucmVnaXN0ZXJUeXBlKG5hbWUsIHZhbHVlID0+IHRoaXMuX21hcnNoYWwodmFsdWUsIHR5cGUpLFxuICAgICAgdmFsdWUgPT4gdGhpcy5fdW5tYXJzaGFsKHZhbHVlLCB0eXBlKSk7XG4gIH1cblxuICAvKipcbiAgICogTWFyc2hhbCBhbiBvYmplY3QgdXNpbmcgdGhlIGFwcHJvcHJpYXRlIG1hcnNoYWwgZnVuY3Rpb24uXG4gICAqIEVuc3VyZXMgdGhlIHJlc3VsdCBpcyBhY3R1YWxseSBhIFByb21pc2UuXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBiZSBtYXJzaGFsbGVkLlxuICAgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIG9iamVjdCAodXNlZCB0byBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmdW5jdGlvbikuXG4gICAqL1xuICBtYXJzaGFsKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fbWFyc2hhbCh2YWx1ZSwgdHlwZSkpO1xuICB9XG5cbiAgX21hcnNoYWwodmFsdWU6IGFueSwgdHlwZTogVHlwZSk6IGFueSB7XG4gICAgY29uc3Qga2luZE1hcnNoYWxsZXIgPSB0aGlzLl9raW5kTWFyc2hhbGxlcnMuZ2V0KHR5cGUua2luZCk7XG4gICAgaWYgKGtpbmRNYXJzaGFsbGVyID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gbWFyc2hhbGxlciBmb3VuZCBmb3IgdHlwZSBraW5kICR7dHlwZS5raW5kfS5gKTtcbiAgICB9XG4gICAgcmV0dXJuIGtpbmRNYXJzaGFsbGVyLm1hcnNoYWxsZXIodmFsdWUsIHR5cGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVubWFyc2hhbCBhbmQgb2JqZWN0IHVzaW5nIHRoZSBhcHByb3ByaWF0ZSB1bm1hcnNoYWwgZnVuY3Rpb24uXG4gICAqIEVuc3VyZXMgdGhlIHJlc3VsdCBpcyBhY3R1YWxseSBhIFByb21pc2UuXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBiZSBtYXJzaGFsbGVkLlxuICAgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIG9iamVjdCAodXNlZCB0byBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmdW5jdGlvbikuXG4gICAqL1xuICB1bm1hcnNoYWwodmFsdWU6IGFueSwgdHlwZTogVHlwZSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl91bm1hcnNoYWwodmFsdWUsIHR5cGUpKTtcbiAgfVxuXG4gIF91bm1hcnNoYWwodmFsdWU6IGFueSwgdHlwZTogVHlwZSk6IGFueSB7XG4gICAgY29uc3Qga2luZE1hcnNoYWxsZXIgPSB0aGlzLl9raW5kTWFyc2hhbGxlcnMuZ2V0KHR5cGUua2luZCk7XG4gICAgaWYgKGtpbmRNYXJzaGFsbGVyID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gdW5tYXJzaGFsbGVyIGZvdW5kIGZvciB0eXBlIGtpbmQgJHt0eXBlLmtpbmR9LmApO1xuICAgIH1cbiAgICByZXR1cm4ga2luZE1hcnNoYWxsZXIudW5tYXJzaGFsbGVyKHZhbHVlLCB0eXBlKTtcbiAgfVxuXG4gIF9yZWdpc3RlclByaW1pdGl2ZXMoKTogdm9pZCB7XG4gICAgLy8gU2luY2Ugc3RyaW5nLCBudW1iZXIsIGFuZCBib29sZWFuIGFyZSBKU09OIHByaW1pdGl2ZXMsXG4gICAgLy8gdGhleSByZXF1aXJlIG5vIG1hcnNoYWxsaW5nLiBJbnN0ZWFkLCBzaW1wbHkgY3JlYXRlIHdyYXBwZWQgdHJhbnNmb3JtZXJzXG4gICAgLy8gdGhhdCBhc3NlcnQgdGhlIHR5cGUgb2YgdGhlaXIgYXJndW1lbnQuXG4gICAgY29uc3Qgc3RyaW5nVHJhbnNmb3JtZXIgPSBhcmcgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnQuXG4gICAgICBhcmcgPSAoYXJnIGluc3RhbmNlb2YgU3RyaW5nKSA/IGFyZy52YWx1ZU9mKCkgOiBhcmc7XG4gICAgICBhc3NlcnQodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycsICdFeHBlY3RlZCBhIHN0cmluZyBhcmd1bWVudCcpO1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICAgIGNvbnN0IG51bWJlck1hcnNoYWxsZXIgPSBhcmcgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnQuXG4gICAgICBpZiAoYXJnIGluc3RhbmNlb2YgTnVtYmVyKSB7XG4gICAgICAgIGFyZyA9IGFyZy52YWx1ZU9mKCk7XG4gICAgICB9XG4gICAgICBhc3NlcnQodHlwZW9mIGFyZyA9PT0gJ251bWJlcicsICdFeHBlY3RlZCBhIG51bWJlciBhcmd1bWVudCcpO1xuICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoYXJnKSkge1xuICAgICAgICBpZiAoYXJnID09PSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgICAgICBhcmcgPSAnTkVHQVRJVkVfSU5GSU5JVFknO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZyA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgICAgICAgYXJnID0gJ1BPU0lUSVZFX0lORklOSVRZJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhcmcgPSAnTmFOJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICAgIGNvbnN0IG51bWJlclVubWFyc2hhbGxlciA9IGFyZyA9PiB7XG4gICAgICBpZiAodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc3dpdGNoIChhcmcpIHtcbiAgICAgICAgICBjYXNlICdORUdBVElWRV9JTkZJTklUWSc6XG4gICAgICAgICAgICBhcmcgPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdQT1NJVElWRV9JTkZJTklUWSc6XG4gICAgICAgICAgICBhcmcgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdOYU4nOlxuICAgICAgICAgICAgYXJnID0gTnVtYmVyLk5hTjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBUaGlzIHdpbGwgYXNzZXJ0IGJlbG93XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhcmcgaW5zdGFuY2VvZiBOdW1iZXIpIHtcbiAgICAgICAgYXJnID0gYXJnLnZhbHVlT2YoKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydCh0eXBlb2YgYXJnID09PSAnbnVtYmVyJywgJ0V4cGVjdGVkIGEgbnVtYmVyIGFyZ3VtZW50Jyk7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgY29uc3QgYm9vbGVhblRyYW5zZm9ybWVyID0gYXJnID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50XG4gICAgICBpZiAoYXJnIGluc3RhbmNlb2YgQm9vbGVhbikge1xuICAgICAgICBhcmcgPSBhcmcudmFsdWVPZigpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0KHR5cGVvZiBhcmcgPT09ICdib29sZWFuJywgJ0V4cGVjdGVkIGEgYm9vbGVhbiBhcmd1bWVudCcpO1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICAgIC8vIFdlIGFzc3VtZSBhbiAnYW55JyBhbmQgJ21peGVkJyB0eXBlcyByZXF1aXJlIG5vIG1hcnNoYWxsaW5nLlxuICAgIGNvbnN0IGlkZW50aXR5VHJhbnNmb3JtZXIgPSBhcmcgPT4gYXJnO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGhlc2UgdHJhbnNmb3JtZXJzXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdzdHJpbmcnLCBzdHJpbmdUcmFuc2Zvcm1lciwgc3RyaW5nVHJhbnNmb3JtZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbnVtYmVyJywgbnVtYmVyTWFyc2hhbGxlciwgbnVtYmVyVW5tYXJzaGFsbGVyKTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ2Jvb2xlYW4nLCBib29sZWFuVHJhbnNmb3JtZXIsIGJvb2xlYW5UcmFuc2Zvcm1lcik7XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdhbnknLCBpZGVudGl0eVRyYW5zZm9ybWVyLCBpZGVudGl0eVRyYW5zZm9ybWVyKTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ21peGVkJywgaWRlbnRpdHlUcmFuc2Zvcm1lciwgaWRlbnRpdHlUcmFuc2Zvcm1lcik7XG4gIH1cblxuICBfcmVnaXN0ZXJMaXRlcmFscygpOiB2b2lkIHtcbiAgICBjb25zdCBsaXRlcmFsVHJhbnNmb3JtZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnc3RyaW5nLWxpdGVyYWwnIHx8IHR5cGUua2luZCA9PT0gJ251bWJlci1saXRlcmFsJyB8fFxuICAgICAgICAgIHR5cGUua2luZCA9PT0gJ2Jvb2xlYW4tbGl0ZXJhbCcpO1xuICAgICAgaW52YXJpYW50KGFyZyA9PT0gdHlwZS52YWx1ZSk7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdzdHJpbmctbGl0ZXJhbCcsIGxpdGVyYWxUcmFuc2Zvcm1lciwgbGl0ZXJhbFRyYW5zZm9ybWVyKTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ251bWJlci1saXRlcmFsJywgbGl0ZXJhbFRyYW5zZm9ybWVyLCBsaXRlcmFsVHJhbnNmb3JtZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnYm9vbGVhbi1saXRlcmFsJywgbGl0ZXJhbFRyYW5zZm9ybWVyLCBsaXRlcmFsVHJhbnNmb3JtZXIpO1xuICB9XG5cbiAgX3JlZ2lzdGVyVW5pb25zKCk6IHZvaWQge1xuICAgIGNvbnN0IHVuaW9uTGl0ZXJhbFRyYW5zZm9ybWVyID0gKGFyZywgdHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3VuaW9uJyk7XG4gICAgICBjb25zdCBhbHRlcm5hdGUgPSBhcnJheS5maW5kKHR5cGUudHlwZXMsIGVsZW1lbnQgPT4ge1xuICAgICAgICBpbnZhcmlhbnQoZWxlbWVudC5raW5kID09PSAnc3RyaW5nLWxpdGVyYWwnIHx8IGVsZW1lbnQua2luZCA9PT0gJ251bWJlci1saXRlcmFsJ1xuICAgICAgICAgICAgfHwgZWxlbWVudC5raW5kID09PSAnYm9vbGVhbi1saXRlcmFsJyk7XG4gICAgICAgIHJldHVybiAoYXJnID09PSBlbGVtZW50LnZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgaW52YXJpYW50KGFsdGVybmF0ZSk7XG4gICAgICAvLyBUaGlzIGlzIGp1c3QgdGhlIGxpdGVyYWwgdHJhbnNmb3JtZXIgaW5saW5lZCAuLi5cbiAgICAgIHJldHVybiBhcmc7XG4gICAgfTtcbiAgICBjb25zdCB1bmlvbk9iamVjdE1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndW5pb24nKTtcbiAgICAgIHJldHVybiB0aGlzLl9tYXJzaGFsKGFyZywgZmluZEFsdGVybmF0ZShhcmcsIHR5cGUpKTtcbiAgICB9O1xuICAgIGNvbnN0IHVuaW9uT2JqZWN0VW5tYXJzaGFsbGVyID0gKGFyZywgdHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3VuaW9uJyk7XG4gICAgICByZXR1cm4gdGhpcy5fdW5tYXJzaGFsKGFyZywgZmluZEFsdGVybmF0ZShhcmcsIHR5cGUpKTtcbiAgICB9O1xuICAgIGNvbnN0IHVuaW9uTWFyc2hhbGxlciA9IChhcmcsIHR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd1bmlvbicpO1xuICAgICAgaWYgKHR5cGUuZGlzY3JpbWluYW50RmllbGQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5pb25PYmplY3RNYXJzaGFsbGVyKGFyZywgdHlwZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdW5pb25MaXRlcmFsVHJhbnNmb3JtZXIoYXJnLCB0eXBlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHVuaW9uVW5tYXJzaGFsbGVyID0gKGFyZywgdHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3VuaW9uJyk7XG4gICAgICBpZiAodHlwZS5kaXNjcmltaW5hbnRGaWVsZCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB1bmlvbk9iamVjdFVubWFyc2hhbGxlcihhcmcsIHR5cGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVuaW9uTGl0ZXJhbFRyYW5zZm9ybWVyKGFyZywgdHlwZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ3VuaW9uJywgdW5pb25NYXJzaGFsbGVyLCB1bmlvblVubWFyc2hhbGxlcik7XG4gIH1cblxuICBfcmVnaXN0ZXJJbnRlcnNlY3Rpb25zKCk6IHZvaWQge1xuICAgIGNvbnN0IGludGVyc2VjdGlvbk1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnaW50ZXJzZWN0aW9uJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5mbGF0dGVuZWQgIT0gbnVsbCk7XG4gICAgICByZXR1cm4gdGhpcy5fbWFyc2hhbChhcmcsIHR5cGUuZmxhdHRlbmVkKTtcbiAgICB9O1xuICAgIGNvbnN0IGludGVyc2VjdGlvblVubWFyc2hhbGxlciA9IChhcmcsIHR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdpbnRlcnNlY3Rpb24nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmZsYXR0ZW5lZCAhPSBudWxsKTtcbiAgICAgIHJldHVybiB0aGlzLl91bm1hcnNoYWwoYXJnLCB0eXBlLmZsYXR0ZW5lZCk7XG4gICAgfTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ2ludGVyc2VjdGlvbicsIGludGVyc2VjdGlvbk1hcnNoYWxsZXIsIGludGVyc2VjdGlvblVubWFyc2hhbGxlcik7XG4gIH1cblxuICBfcmVnaXN0ZXJTcGVjaWFsVHlwZXMoKTogdm9pZCB7XG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgYW55IE9iamVjdCB0eXBlXG4gICAgdGhpcy5yZWdpc3RlclR5cGUob2JqZWN0VHlwZS5uYW1lLCBvYmplY3QgPT4ge1xuICAgICAgYXNzZXJ0KG9iamVjdCAhPSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnLCAnRXhwZWN0ZWQgT2JqZWN0IGFyZ3VtZW50LicpO1xuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9LCBvYmplY3QgPT4ge1xuICAgICAgYXNzZXJ0KG9iamVjdCAhPSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnLCAnRXhwZWN0ZWQgT2JqZWN0IGFyZ3VtZW50LicpO1xuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIEphdmFzY3JpcHQgRGF0ZSBvYmplY3RzXG4gICAgdGhpcy5yZWdpc3RlclR5cGUoZGF0ZVR5cGUubmFtZSwgZGF0ZSA9PiB7XG4gICAgICBhc3NlcnQoZGF0ZSBpbnN0YW5jZW9mIERhdGUsICdFeHBlY3RlZCBkYXRlIGFyZ3VtZW50LicpO1xuICAgICAgcmV0dXJuIGRhdGUudG9KU09OKCk7XG4gICAgfSwgZGF0ZVN0ciA9PiB7XG4gICAgICAvLyBVbmJveCBhcmd1bWVudC5cbiAgICAgIGRhdGVTdHIgPSAoZGF0ZVN0ciBpbnN0YW5jZW9mIFN0cmluZykgPyBkYXRlU3RyLnZhbHVlT2YoKSA6IGRhdGVTdHI7XG5cbiAgICAgIGFzc2VydCh0eXBlb2YgZGF0ZVN0ciA9PT0gJ3N0cmluZycsICdFeHBlY2V0ZWQgYSBzdHJpbmcgYXJndW1lbnQuJyk7XG4gICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZVN0cik7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBSZWdFeHAgb2JqZWN0c1xuICAgIHRoaXMucmVnaXN0ZXJUeXBlKHJlZ0V4cFR5cGUubmFtZSwgcmVnZXhwID0+IHtcbiAgICAgIGFzc2VydChyZWdleHAgaW5zdGFuY2VvZiBSZWdFeHAsICdFeHBlY3RlZCBhIFJlZ0V4cCBvYmplY3QgYXMgYW4gYXJndW1lbnQnKTtcbiAgICAgIHJldHVybiByZWdleHAudG9TdHJpbmcoKTtcbiAgICB9LCByZWdTdHIgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnQuXG4gICAgICByZWdTdHIgPSAocmVnU3RyIGluc3RhbmNlb2YgU3RyaW5nKSA/IHJlZ1N0ci52YWx1ZU9mKCkgOiByZWdTdHI7XG5cbiAgICAgIGFzc2VydCh0eXBlb2YgcmVnU3RyID09PSAnc3RyaW5nJywgJ0V4cGVjdGVkIGEgc3RyaW5nIGFyZ3VtZW50LicpO1xuICAgICAgcmV0dXJuIHZtLnJ1bkluVGhpc0NvbnRleHQocmVnU3RyKTtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIEJ1ZmZlciBvYmplY3RzIHRocm91Z2ggQmFzZTY0IHN0cmluZ3NcbiAgICB0aGlzLnJlZ2lzdGVyVHlwZShidWZmZXJUeXBlLm5hbWUsIGJ1ZmZlciA9PiB7XG4gICAgICBhc3NlcnQoYnVmZmVyIGluc3RhbmNlb2YgQnVmZmVyLCAnRXhwZWN0ZWQgYSBidWZmZXIgYXJndW1lbnQuJyk7XG4gICAgICByZXR1cm4gYnVmZmVyLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICB9LCBiYXNlNjRzdHJpbmcgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnQuXG4gICAgICBiYXNlNjRzdHJpbmcgPSAoYmFzZTY0c3RyaW5nIGluc3RhbmNlb2YgU3RyaW5nKSA/IGJhc2U2NHN0cmluZy52YWx1ZU9mKCkgOiBiYXNlNjRzdHJpbmc7XG5cbiAgICAgIGFzc2VydChcbiAgICAgICAgdHlwZW9mIGJhc2U2NHN0cmluZyA9PT0gJ3N0cmluZycsXG4gICAgICAgIGBFeHBlY3RlZCBhIGJhc2U2NCBzdHJpbmcuIE5vdCAke3R5cGVvZiBiYXNlNjRzdHJpbmd9YCk7XG4gICAgICByZXR1cm4gbmV3IEJ1ZmZlcihiYXNlNjRzdHJpbmcsICdiYXNlNjQnKTtcbiAgICB9KTtcblxuICAgIC8vIGZzLlN0YXRzXG4gICAgdGhpcy5yZWdpc3RlclR5cGUoZnNTdGF0c1R5cGUubmFtZSwgc3RhdHMgPT4ge1xuICAgICAgYXNzZXJ0KHN0YXRzIGluc3RhbmNlb2YgZnMuU3RhdHMpO1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHN0YXRzVG9PYmplY3Qoc3RhdHMpKTtcbiAgICB9LCBqc29uID0+IHtcbiAgICAgIGFzc2VydCh0eXBlb2YganNvbiA9PT0gJ3N0cmluZycpO1xuICAgICAgcmV0dXJuIG9iamVjdFRvU3RhdHMoSlNPTi5wYXJzZShqc29uKSk7XG4gICAgfSk7XG4gIH1cblxuICBfcmVnaXN0ZXJDb250YWluZXJzKCk6IHZvaWQge1xuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIEFycmF5cy5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ2FycmF5JywgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnYXJyYXknKTtcbiAgICAgIGNvbnN0IGVsZW1UeXBlID0gdHlwZS50eXBlO1xuICAgICAgcmV0dXJuIHNtYXJ0UHJvbWlzZUFsbCh2YWx1ZS5tYXAoZWxlbSA9PiB0aGlzLl9tYXJzaGFsKGVsZW0sIGVsZW1UeXBlKSkpO1xuICAgIH0sICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBhc3NlcnQodmFsdWUgaW5zdGFuY2VvZiBBcnJheSwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIEFycmF5LicpO1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ2FycmF5Jyk7XG4gICAgICBjb25zdCBlbGVtVHlwZSA9IHR5cGUudHlwZTtcbiAgICAgIHJldHVybiBzbWFydFByb21pc2VBbGwodmFsdWUubWFwKGVsZW0gPT4gdGhpcy5fdW5tYXJzaGFsKGVsZW0sIGVsZW1UeXBlKSkpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIGFuZCBEZXNlcmlhbGl6ZSBPYmplY3RzLlxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnb2JqZWN0JywgKG9iajogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBhc3NlcnQodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcsICdFeHBlY3RlZCBhbiBhcmd1bWVudCBvZiB0eXBlIG9iamVjdC4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdvYmplY3QnKTtcbiAgICAgIGNvbnN0IG5ld09iaiA9IHt9OyAvLyBDcmVhdGUgYSBuZXcgb2JqZWN0IHNvIHdlIGRvbid0IG11dGF0ZSB0aGUgb3JpZ2luYWwgb25lLlxuICAgICAgY29uc3QgcHJvbWlzZSA9IGNoZWNrZWRTbWFydFByb21pc2VBbGwodHlwZS5maWVsZHMubWFwKHByb3AgPT4ge1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgc291cmNlIG9iamVjdCBoYXMgdGhpcyBrZXkuXG4gICAgICAgIGlmIChvYmogIT0gbnVsbCAmJiBvYmouaGFzT3duUHJvcGVydHkocHJvcC5uYW1lKSkge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fbWFyc2hhbChvYmpbcHJvcC5uYW1lXSwgcHJvcC50eXBlKTtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudGhlbihyZXN1bHQgPT4gbmV3T2JqW3Byb3AubmFtZV0gPSByZXN1bHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdPYmpbcHJvcC5uYW1lXSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghcHJvcC5vcHRpb25hbCkge1xuICAgICAgICAgIC8vIElmIHRoZSBwcm9wZXJ0eSBpcyBvcHRpb25hbCwgaXQncyBva2F5IGZvciBpdCB0byBiZSBtaXNzaW5nLlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBTb3VyY2Ugb2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KG9iail9IGlzIG1pc3NpbmcgcHJvcGVydHkgJHtwcm9wLm5hbWV9LmAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgICAgaWYgKHByb21pc2UgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oKCkgPT4gbmV3T2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdPYmo7XG4gICAgfSwgKG9iajogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICBhc3NlcnQodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcsICdFeHBlY3RlZCBhbiBhcmd1bWVudCBvZiB0eXBlIG9iamVjdC4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdvYmplY3QnKTtcbiAgICAgIGNvbnN0IG5ld09iaiA9IHt9OyAvLyBDcmVhdGUgYSBuZXcgb2JqZWN0IHNvIHdlIGRvbid0IG11dGF0ZSB0aGUgb3JpZ2luYWwgb25lLlxuICAgICAgY29uc3QgcHJvbWlzZSA9IGNoZWNrZWRTbWFydFByb21pc2VBbGwodHlwZS5maWVsZHMubWFwKHByb3AgPT4ge1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgc291cmNlIG9iamVjdCBoYXMgdGhpcyBrZXkuXG4gICAgICAgIGlmIChvYmogIT0gbnVsbCAmJiBvYmouaGFzT3duUHJvcGVydHkocHJvcC5uYW1lKSkge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fdW5tYXJzaGFsKG9ialtwcm9wLm5hbWVdLCBwcm9wLnR5cGUpO1xuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50aGVuKHJlc3VsdCA9PiBuZXdPYmpbcHJvcC5uYW1lXSA9IHJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld09ialtwcm9wLm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFwcm9wLm9wdGlvbmFsKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHByb3BlcnR5IGlzIG9wdGlvbmFsLCBpdCdzIG9rYXkgZm9yIGl0IHRvIGJlIG1pc3NpbmcuXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFNvdXJjZSBvYmplY3Q6ICR7SlNPTi5zdHJpbmdpZnkob2JqKX0gaXMgbWlzc2luZyBwcm9wZXJ0eSAke3Byb3AubmFtZX0uYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgICBpZiAocHJvbWlzZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbigoKSA9PiBuZXdPYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld09iajtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIFNldHMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdzZXQnLCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3NldCcpO1xuICAgICAgYXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgU2V0LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgU2V0LicpO1xuICAgICAgY29uc3Qgc2VyaWFsaXplUHJvbWlzZXMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZWxlbSBvZiB2YWx1ZSkge1xuICAgICAgICBzZXJpYWxpemVQcm9taXNlcy5wdXNoKHRoaXMuX21hcnNoYWwoZWxlbSwgdHlwZS50eXBlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc21hcnRQcm9taXNlQWxsKHNlcmlhbGl6ZVByb21pc2VzKTtcbiAgICB9LCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgYXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgQXJyYXksICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBBcnJheS4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdzZXQnKTtcbiAgICAgIGNvbnN0IGVsZW1UeXBlID0gdHlwZS50eXBlO1xuICAgICAgY29uc3QgZWxlbWVudHMgPSBzbWFydFByb21pc2VBbGwodmFsdWUubWFwKGVsZW0gPT4gdGhpcy5fdW5tYXJzaGFsKGVsZW0sIGVsZW1UeXBlKSkpO1xuICAgICAgaWYgKGVsZW1lbnRzIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gZWxlbWVudHMudGhlbih4ID0+IG5ldyBTZXQoeCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBTZXQoZWxlbWVudHMpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgTWFwcy5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ21hcCcsIChtYXA6IE1hcCwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgYXNzZXJ0KG1hcCBpbnN0YW5jZW9mIE1hcCwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIFNldC4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdtYXAnKTtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZVByb21pc2VzID0gW107XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBtYXApIHtcbiAgICAgICAgc2VyaWFsaXplUHJvbWlzZXMucHVzaChjaGVja2VkU21hcnRQcm9taXNlQWxsKFtcbiAgICAgICAgICB0aGlzLl9tYXJzaGFsKGtleSwgdHlwZS5rZXlUeXBlKSxcbiAgICAgICAgICB0aGlzLl9tYXJzaGFsKHZhbHVlLCB0eXBlLnZhbHVlVHlwZSksXG4gICAgICAgIF0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbWFydFByb21pc2VBbGwoc2VyaWFsaXplUHJvbWlzZXMpO1xuICAgIH0sIChzZXJpYWxpemVkOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGFzc2VydChzZXJpYWxpemVkIGluc3RhbmNlb2YgQXJyYXksICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBBcnJheS4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdtYXAnKTtcbiAgICAgIGNvbnN0IGtleVR5cGUgPSB0eXBlLmtleVR5cGU7XG4gICAgICBjb25zdCB2YWx1ZVR5cGUgPSB0eXBlLnZhbHVlVHlwZTtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBzbWFydFByb21pc2VBbGwoXG4gICAgICAgIHNlcmlhbGl6ZWQubWFwKGVudHJ5ID0+IGNoZWNrZWRTbWFydFByb21pc2VBbGwoW1xuICAgICAgICAgIHRoaXMuX3VubWFyc2hhbChlbnRyeVswXSwga2V5VHlwZSksXG4gICAgICAgICAgdGhpcy5fdW5tYXJzaGFsKGVudHJ5WzFdLCB2YWx1ZVR5cGUpLFxuICAgICAgICBdKSlcbiAgICAgICk7XG4gICAgICBpZiAoZW50cmllcyBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIGVudHJpZXMudGhlbih4ID0+IG5ldyBNYXAoeCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBNYXAoZW50cmllcyk7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBUdXBsZXMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCd0dXBsZScsICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICAvLyBBc3NlcnQgdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXkuXG4gICAgICBhc3NlcnQoQXJyYXkuaXNBcnJheSh2YWx1ZSksICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBBcnJheS4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd0dXBsZScpO1xuICAgICAgY29uc3QgdHlwZXMgPSB0eXBlLnR5cGVzO1xuICAgICAgYXNzZXJ0KHZhbHVlLmxlbmd0aCA9PT0gdHlwZXMubGVuZ3RoLCBgRXhwZWN0ZWQgdHVwbGUgb2YgbGVuZ3RoICR7dHlwZXMubGVuZ3RofS5gKTtcblxuICAgICAgLy8gQ29udmVydCBhbGwgb2YgdGhlIGVsZW1lbnRzIHRocm91Z2ggdGhlIGNvcnJlY3QgbWFyc2hhbGxlci5cbiAgICAgIHJldHVybiBjaGVja2VkU21hcnRQcm9taXNlQWxsKHZhbHVlLm1hcCgoZWxlbSwgaSkgPT4gdGhpcy5fbWFyc2hhbChlbGVtLCB0eXBlc1tpXSkpKTtcbiAgICB9LCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgLy8gQXNzZXJ0IHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LlxuICAgICAgYXNzZXJ0KEFycmF5LmlzQXJyYXkodmFsdWUpLCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndHVwbGUnKTtcbiAgICAgIGNvbnN0IHR5cGVzID0gdHlwZS50eXBlcztcbiAgICAgIGFzc2VydCh2YWx1ZS5sZW5ndGggPT09IHR5cGVzLmxlbmd0aCwgYEV4cGVjdGVkIHR1cGxlIG9mIGxlbmd0aCAke3R5cGVzLmxlbmd0aH0uYCk7XG5cbiAgICAgIC8vIENvbnZlcnQgYWxsIG9mIHRoZSBlbGVtZW50cyB0aHJvdWdoIHRoZSBjb3JyZWN0IHVubWFyc2hhbGxlci5cbiAgICAgIHJldHVybiBjaGVja2VkU21hcnRQcm9taXNlQWxsKHZhbHVlLm1hcCgoZWxlbSwgaSkgPT4gdGhpcy5fdW5tYXJzaGFsKGVsZW0sIHR5cGVzW2ldKSkpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE9iamVjdEZpZWxkQnlOYW1lKHR5cGU6IE9iamVjdFR5cGUsIGZpZWxkTmFtZTogc3RyaW5nKTogT2JqZWN0RmllbGQge1xuICBjb25zdCByZXN1bHQgPSBhcnJheS5maW5kKHR5cGUuZmllbGRzLCBmaWVsZCA9PiBmaWVsZC5uYW1lID09PSBmaWVsZE5hbWUpO1xuICBpbnZhcmlhbnQocmVzdWx0ICE9IG51bGwpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBmaW5kQWx0ZXJuYXRlKGFyZzogT2JqZWN0LCB0eXBlOiBVbmlvblR5cGUpOiBPYmplY3RUeXBlIHtcbiAgY29uc3QgZGlzY3JpbWluYW50RmllbGQgPSB0eXBlLmRpc2NyaW1pbmFudEZpZWxkO1xuICBpbnZhcmlhbnQoZGlzY3JpbWluYW50RmllbGQgIT0gbnVsbCk7XG4gIGNvbnN0IGRpc2NyaW1pbmFudCA9IGFyZ1tkaXNjcmltaW5hbnRGaWVsZF07XG4gIGludmFyaWFudChkaXNjcmltaW5hbnQgIT0gbnVsbCk7XG4gIGNvbnN0IGFsdGVybmF0ZXM6IEFycmF5PE9iamVjdFR5cGU+ID0gKHR5cGUudHlwZXM6IGFueSk7XG4gIGNvbnN0IHJlc3VsdCA9IGFycmF5LmZpbmQoYWx0ZXJuYXRlcywgYWx0ZXJuYXRlID0+IHtcbiAgICBpbnZhcmlhbnQoYWx0ZXJuYXRlLmtpbmQgPT09ICdvYmplY3QnKTtcbiAgICBjb25zdCBhbHRlcm5hdGVUeXBlID0gZ2V0T2JqZWN0RmllbGRCeU5hbWUoYWx0ZXJuYXRlLCBkaXNjcmltaW5hbnRGaWVsZCkudHlwZTtcbiAgICBpbnZhcmlhbnQoYWx0ZXJuYXRlVHlwZS5raW5kID09PSAnc3RyaW5nLWxpdGVyYWwnIHx8IGFsdGVybmF0ZVR5cGUua2luZCA9PT0gJ251bWJlci1saXRlcmFsJ1xuICAgICAgICB8fCBhbHRlcm5hdGVUeXBlLmtpbmQgPT09ICdib29sZWFuLWxpdGVyYWwnKTtcbiAgICByZXR1cm4gYWx0ZXJuYXRlVHlwZS52YWx1ZSA9PT0gZGlzY3JpbWluYW50O1xuICB9KTtcbiAgaW52YXJpYW50KHJlc3VsdCAhPSBudWxsKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==