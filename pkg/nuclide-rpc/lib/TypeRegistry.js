Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _assert4;

function _assert3() {
  return _assert4 = _interopRequireDefault(require('assert'));
}

var _vm2;

function _vm() {
  return _vm2 = _interopRequireDefault(require('vm'));
}

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _builtinTypes2;

function _builtinTypes() {
  return _builtinTypes2 = require('./builtin-types');
}

var _location2;

function _location() {
  return _location2 = require('./location');
}

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
  var stats = new (_fs2 || _fs()).default.Stats();

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
 * The ObjectRegistry is opaque to the TypeRegistry and allows for adding per-connection
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
      (0, (_assert4 || _assert3()).default)(type.kind === 'named');
      var namedMarshaller = _this._namedMarshallers.get(type.name);
      if (namedMarshaller == null) {
        throw new Error('No marshaller found for named type ' + type.name + '.');
      }
      return namedMarshaller.marshaller(value, context);
    }, function (value, type, context) {
      (0, (_assert4 || _assert3()).default)(type.kind === 'named');
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
      (0, (_assert4 || _assert3()).default)(!this._kindMarshallers.has(kind));
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
    value: function registerType(typeName, location, marshaller, unmarshaller) {
      var existingMarshaller = this._namedMarshallers.get(typeName);
      if (existingMarshaller != null) {
        // If the locations are equal then assume that the types are equal.
        if (!(0, (_location2 || _location()).locationsEqual)(existingMarshaller.location, location)) {
          throw new Error((0, (_location2 || _location()).locationToString)(location) + ': A type by the name ' + typeName + ' has already' + (' been registered at ' + (0, (_location2 || _location()).locationToString)(existingMarshaller.location) + '.'));
        }
      } else {
        this._namedMarshallers.set(typeName, { location: location, marshaller: marshaller, unmarshaller: unmarshaller });
      }
    }

    /**
     * Helper function for registering the marashaller/unmarshaller for a type alias.
     * @param name - The name of the alias type.
     * @param type - The type the the alias represents.
     */
  }, {
    key: 'registerAlias',
    value: function registerAlias(name, location, type) {
      var _this2 = this;

      this.registerType(name, location, function (value, context) {
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
  }, {
    key: 'marshalArguments',
    value: _asyncToGenerator(function* (context, args, argTypes) {
      var _this3 = this;

      var marshalledargs = yield Promise.all(argTypes.map(function (param, i) {
        return _this3.marshal(context, args[i], param.type);
      }));
      var result = {};
      marshalledargs.forEach(function (arg, i) {
        result[argTypes[i].name] = arg;
      });
      return result;
    })

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
      var _this4 = this;

      return Promise.all(argTypes.map(function (arg, i) {
        (0, (_assert4 || _assert3()).default)(Object.hasOwnProperty.call(args, arg.name), 'unmarshalArguments: Missing argument: ' + arg.name);
        return _this4.unmarshal(context, args[arg.name], arg.type);
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
        (0, (_assert2 || _assert()).default)(typeof arg === 'string', 'Expected a string argument');
        return arg;
      };
      var numberMarshaller = function numberMarshaller(arg) {
        // Unbox argument.
        if (arg instanceof Number) {
          arg = arg.valueOf();
        }
        (0, (_assert2 || _assert()).default)(typeof arg === 'number', 'Expected a number argument');
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
        (0, (_assert2 || _assert()).default)(typeof arg === 'number', 'Expected a number argument');
        return arg;
      };
      var booleanTransformer = function booleanTransformer(arg) {
        // Unbox argument
        if (arg instanceof Boolean) {
          arg = arg.valueOf();
        }
        (0, (_assert2 || _assert()).default)(typeof arg === 'boolean', 'Expected a boolean argument');
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
        (0, (_assert4 || _assert3()).default)(type.kind === 'string-literal' || type.kind === 'number-literal' || type.kind === 'boolean-literal');
        (0, (_assert4 || _assert3()).default)(arg === type.value);
        return arg;
      };
      this._registerKind('string-literal', literalTransformer, literalTransformer);
      this._registerKind('number-literal', literalTransformer, literalTransformer);
      this._registerKind('boolean-literal', literalTransformer, literalTransformer);
    }
  }, {
    key: '_registerUnions',
    value: function _registerUnions() {
      var _this5 = this;

      var unionLiteralTransformer = function unionLiteralTransformer(arg, type) {
        (0, (_assert4 || _assert3()).default)(type.kind === 'union');
        var alternate = type.types.find(function (element) {
          (0, (_assert4 || _assert3()).default)(element.kind === 'string-literal' || element.kind === 'number-literal' || element.kind === 'boolean-literal');
          return arg === element.value;
        });
        (0, (_assert4 || _assert3()).default)(alternate);
        // This is just the literal transformer inlined ...
        return arg;
      };
      var unionObjectMarshaller = function unionObjectMarshaller(arg, type, context) {
        (0, (_assert4 || _assert3()).default)(type.kind === 'union');
        return _this5._marshal(context, arg, findAlternate(arg, type));
      };
      var unionObjectUnmarshaller = function unionObjectUnmarshaller(arg, type, context) {
        (0, (_assert4 || _assert3()).default)(type.kind === 'union');
        return _this5._unmarshal(context, arg, findAlternate(arg, type));
      };
      var unionMarshaller = function unionMarshaller(arg, type, context) {
        (0, (_assert4 || _assert3()).default)(type.kind === 'union');
        if (type.discriminantField != null) {
          return unionObjectMarshaller(arg, type, context);
        } else {
          return unionLiteralTransformer(arg, type);
        }
      };
      var unionUnmarshaller = function unionUnmarshaller(arg, type, context) {
        (0, (_assert4 || _assert3()).default)(type.kind === 'union');
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
      var _this6 = this;

      var intersectionMarshaller = function intersectionMarshaller(arg, type, context) {
        (0, (_assert4 || _assert3()).default)(type.kind === 'intersection');
        (0, (_assert4 || _assert3()).default)(type.flattened != null);
        return _this6._marshal(context, arg, type.flattened);
      };
      var intersectionUnmarshaller = function intersectionUnmarshaller(arg, type, context) {
        (0, (_assert4 || _assert3()).default)(type.kind === 'intersection');
        (0, (_assert4 || _assert3()).default)(type.flattened != null);
        return _this6._unmarshal(context, arg, type.flattened);
      };
      this._registerKind('intersection', intersectionMarshaller, intersectionUnmarshaller);
    }
  }, {
    key: '_registerSpecialTypes',
    value: function _registerSpecialTypes() {
      // Serialize / Deserialize any Object type
      this.registerType((_builtinTypes2 || _builtinTypes()).objectType.name, (_builtinTypes2 || _builtinTypes()).builtinLocation, function (object) {
        (0, (_assert2 || _assert()).default)(object != null && typeof object === 'object', 'Expected Object argument.');
        return object;
      }, function (object) {
        (0, (_assert2 || _assert()).default)(object != null && typeof object === 'object', 'Expected Object argument.');
        return object;
      });

      // Serialize / Deserialize Javascript Date objects
      this.registerType((_builtinTypes2 || _builtinTypes()).dateType.name, (_builtinTypes2 || _builtinTypes()).builtinLocation, function (date) {
        (0, (_assert2 || _assert()).default)(date instanceof Date, 'Expected date argument.');
        return date.toJSON();
      }, function (dateStr) {
        // Unbox argument.
        dateStr = dateStr instanceof String ? dateStr.valueOf() : dateStr;

        (0, (_assert2 || _assert()).default)(typeof dateStr === 'string', 'Expeceted a string argument.');
        return new Date(dateStr);
      });

      // Serialize / Deserialize RegExp objects
      this.registerType((_builtinTypes2 || _builtinTypes()).regExpType.name, (_builtinTypes2 || _builtinTypes()).builtinLocation, function (regexp) {
        (0, (_assert2 || _assert()).default)(regexp instanceof RegExp, 'Expected a RegExp object as an argument');
        return regexp.toString();
      }, function (regStr) {
        // Unbox argument.
        regStr = regStr instanceof String ? regStr.valueOf() : regStr;

        (0, (_assert2 || _assert()).default)(typeof regStr === 'string', 'Expected a string argument.');
        return (_vm2 || _vm()).default.runInThisContext(regStr);
      });

      // Serialize / Deserialize Buffer objects through Base64 strings
      this.registerType((_builtinTypes2 || _builtinTypes()).bufferType.name, (_builtinTypes2 || _builtinTypes()).builtinLocation, function (buffer) {
        (0, (_assert2 || _assert()).default)(buffer instanceof Buffer, 'Expected a buffer argument.');
        return buffer.toString('base64');
      }, function (base64string) {
        // Unbox argument.
        base64string = base64string instanceof String ? base64string.valueOf() : base64string;

        (0, (_assert2 || _assert()).default)(typeof base64string === 'string', 'Expected a base64 string. Not ' + typeof base64string);
        return new Buffer(base64string, 'base64');
      });

      // fs.Stats
      this.registerType((_builtinTypes2 || _builtinTypes()).fsStatsType.name, (_builtinTypes2 || _builtinTypes()).builtinLocation, function (stats) {
        (0, (_assert2 || _assert()).default)(stats instanceof (_fs2 || _fs()).default.Stats);
        return JSON.stringify(statsToObject(stats));
      }, function (json) {
        (0, (_assert2 || _assert()).default)(typeof json === 'string');
        return objectToStats(JSON.parse(json));
      });
    }
  }, {
    key: '_registerContainers',
    value: function _registerContainers() {
      var _this7 = this;

      // Serialize / Deserialize Arrays.
      this._registerKind('array', function (value, type, context) {
        (0, (_assert2 || _assert()).default)(value instanceof Array, 'Expected an object of type Array.');
        (0, (_assert4 || _assert3()).default)(type.kind === 'array');
        var elemType = type.type;
        return smartPromiseAll(value.map(function (elem) {
          return _this7._marshal(context, elem, elemType);
        }));
      }, function (value, type, context) {
        (0, (_assert2 || _assert()).default)(value instanceof Array, 'Expected an object of type Array.');
        (0, (_assert4 || _assert3()).default)(type.kind === 'array');
        var elemType = type.type;
        return smartPromiseAll(value.map(function (elem) {
          return _this7._unmarshal(context, elem, elemType);
        }));
      });

      // Serialize and Deserialize Objects.
      this._registerKind('object', function (obj, type, context) {
        (0, (_assert2 || _assert()).default)(typeof obj === 'object', 'Expected an argument of type object.');
        (0, (_assert4 || _assert3()).default)(type.kind === 'object');
        var newObj = {}; // Create a new object so we don't mutate the original one.
        var promise = checkedSmartPromiseAll(type.fields.map(function (prop) {
          // Check if the source object has this key.
          if (obj != null && obj.hasOwnProperty(prop.name)) {
            var _value = _this7._marshal(context, obj[prop.name], prop.type);
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
        (0, (_assert2 || _assert()).default)(typeof obj === 'object', 'Expected an argument of type object.');
        (0, (_assert4 || _assert3()).default)(type.kind === 'object');
        var newObj = {}; // Create a new object so we don't mutate the original one.
        var promise = checkedSmartPromiseAll(type.fields.map(function (prop) {
          // Check if the source object has this key.
          if (obj != null && obj.hasOwnProperty(prop.name)) {
            var _value2 = _this7._unmarshal(context, obj[prop.name], prop.type);
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
        (0, (_assert4 || _assert3()).default)(type.kind === 'set');
        (0, (_assert2 || _assert()).default)(value instanceof Set, 'Expected an object of type Set.');
        var serializePromises = [];
        for (var elem of value) {
          serializePromises.push(_this7._marshal(context, elem, type.type));
        }
        return smartPromiseAll(serializePromises);
      }, function (value, type, context) {
        (0, (_assert2 || _assert()).default)(value instanceof Array, 'Expected an object of type Array.');
        (0, (_assert4 || _assert3()).default)(type.kind === 'set');
        var elemType = type.type;
        var elements = smartPromiseAll(value.map(function (elem) {
          return _this7._unmarshal(context, elem, elemType);
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
        (0, (_assert2 || _assert()).default)(map instanceof Map, 'Expected an object of type Set.');
        (0, (_assert4 || _assert3()).default)(type.kind === 'map');
        var serializePromises = [];
        for (var _ref3 of map) {
          var _ref2 = _slicedToArray(_ref3, 2);

          var key = _ref2[0];
          var _value3 = _ref2[1];

          serializePromises.push(checkedSmartPromiseAll([_this7._marshal(context, key, type.keyType), _this7._marshal(context, _value3, type.valueType)]));
        }
        return smartPromiseAll(serializePromises);
      }, function (serialized, type, context) {
        (0, (_assert2 || _assert()).default)(serialized instanceof Array, 'Expected an object of type Array.');
        (0, (_assert4 || _assert3()).default)(type.kind === 'map');
        var keyType = type.keyType;
        var valueType = type.valueType;
        var entries = smartPromiseAll(serialized.map(function (entry) {
          return checkedSmartPromiseAll([_this7._unmarshal(context, entry[0], keyType), _this7._unmarshal(context, entry[1], valueType)]);
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
        (0, (_assert2 || _assert()).default)(Array.isArray(value), 'Expected an object of type Array.');
        (0, (_assert4 || _assert3()).default)(type.kind === 'tuple');
        var types = type.types;
        (0, (_assert2 || _assert()).default)(value.length === types.length, 'Expected tuple of length ' + types.length + '.');

        // Convert all of the elements through the correct marshaller.
        return checkedSmartPromiseAll(value.map(function (elem, i) {
          return _this7._marshal(context, elem, types[i]);
        }));
      }, function (value, type, context) {
        // Assert the length of the array.
        (0, (_assert2 || _assert()).default)(Array.isArray(value), 'Expected an object of type Array.');
        (0, (_assert4 || _assert3()).default)(type.kind === 'tuple');
        var types = type.types;
        (0, (_assert2 || _assert()).default)(value.length === types.length, 'Expected tuple of length ' + types.length + '.');

        // Convert all of the elements through the correct unmarshaller.
        return checkedSmartPromiseAll(value.map(function (elem, i) {
          return _this7._unmarshal(context, elem, types[i]);
        }));
      });
    }
  }]);

  return TypeRegistry;
})();

exports.TypeRegistry = TypeRegistry;

function getObjectFieldByName(type, fieldName) {
  var result = type.fields.find(function (field) {
    return field.name === fieldName;
  });
  (0, (_assert4 || _assert3()).default)(result != null);
  return result;
}

function findAlternate(arg, type) {
  var discriminantField = type.discriminantField;
  (0, (_assert4 || _assert3()).default)(discriminantField != null);
  var discriminant = arg[discriminantField];
  (0, (_assert4 || _assert3()).default)(discriminant != null);
  var alternates = type.types;
  var result = alternates.find(function (alternate) {
    (0, (_assert4 || _assert3()).default)(alternate.kind === 'object');
    var alternateType = getObjectFieldByName(alternate, discriminantField).type;
    (0, (_assert4 || _assert3()).default)(alternateType.kind === 'string-literal' || alternateType.kind === 'number-literal' || alternateType.kind === 'boolean-literal');
    return alternateType.value === discriminant;
  });
  (0, (_assert4 || _assert3()).default)(result != null);
  return result;
}

/** Store marshallers and and unmarshallers, index by the kind of the type. */

/** Store marshallers and and unmarshallers, index by the name of the type. */