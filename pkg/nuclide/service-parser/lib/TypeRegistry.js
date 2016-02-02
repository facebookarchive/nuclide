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
        // $FlowIssue - flesh out the vm module.
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
      var _this4 = this;

      // Serialize / Deserialize Arrays.
      this._registerKind('array', function (value, type) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'array');
        var elemType = type.type;
        return smartPromiseAll(value.map(function (elem) {
          return _this4._marshal(elem, elemType);
        }));
      }, function (value, type) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'array');
        var elemType = type.type;
        return smartPromiseAll(value.map(function (elem) {
          return _this4._unmarshal(elem, elemType);
        }));
      });

      // Serialize and Deserialize Objects.
      this._registerKind('object', function (obj, type) {
        (0, _assert2['default'])(typeof obj === 'object', 'Expected an argument of type object.');
        (0, _assert3['default'])(type.kind === 'object');
        var newObj = {}; // Create a new object so we don't mutate the original one.
        var promise = checkedSmartPromiseAll(type.fields.map(function (prop) {
          // Check if the source object has this key.
          if (obj.hasOwnProperty(prop.name)) {
            var _value = _this4._marshal(obj[prop.name], prop.type);
            if (_value instanceof Promise) {
              return _value.then(function (result) {
                return newObj[prop.name] = result;
              });
            } else {
              newObj[prop.name] = _value;
            }
          } else if (!prop.optional) {
            // If the property is optional, it's okay for it to be missing.
            throw new Error('Source object is missing property ' + prop.name + '.');
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
          if (obj.hasOwnProperty(prop.name)) {
            var _value2 = _this4._unmarshal(obj[prop.name], prop.type);
            if (_value2 instanceof Promise) {
              return _value2.then(function (result) {
                return newObj[prop.name] = result;
              });
            } else {
              newObj[prop.name] = _value2;
            }
          } else if (!prop.optional) {
            // If the property is optional, it's okay for it to be missing.
            throw new Error('Source object is missing property ' + prop.name + '.');
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
          serializePromises.push(_this4._marshal(elem, type.type));
        }
        return smartPromiseAll(serializePromises);
      }, _asyncToGenerator(function* (value, type) {
        (0, _assert2['default'])(value instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'set');
        var elemType = type.type;
        var elements = yield smartPromiseAll(value.map(function (elem) {
          return _this4._unmarshal(elem, elemType);
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

          serializePromises.push(checkedSmartPromiseAll([_this4._marshal(key, type.keyType), _this4._marshal(_value3, type.valueType)]));
        }
        return smartPromiseAll(serializePromises);
      }, _asyncToGenerator(function* (serialized, type) {
        (0, _assert2['default'])(serialized instanceof Array, 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'map');
        var keyType = type.keyType;
        var valueType = type.valueType;
        var entries = yield smartPromiseAll(serialized.map(function (entry) {
          return checkedSmartPromiseAll([_this4._unmarshal(entry[0], keyType), _this4._unmarshal(entry[1], valueType)]);
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
          return _this4._marshal(elem, types[i]);
        }));
      }, function (value, type) {
        // Assert the length of the array.
        (0, _assert2['default'])(Array.isArray(value), 'Expected an object of type Array.');
        (0, _assert3['default'])(type.kind === 'tuple');
        var types = type.types;
        (0, _assert2['default'])(value.length === types.length, 'Expected tuple of length ' + types.length + '.');

        // Convert all of the elements through the correct unmarshaller.
        return checkedSmartPromiseAll(value.map(function (elem, i) {
          return _this4._unmarshal(elem, types[i]);
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDOUUsNkJBQVUsYUFBYSxDQUFDLElBQUksS0FBSyxnQkFBZ0IsSUFBSSxhQUFhLENBQUMsSUFBSSxLQUFLLGdCQUFnQixJQUNyRixhQUFhLENBQUMsSUFBSSxLQUFLLGlCQUFpQixDQUFDLENBQUM7QUFDakQsV0FBTyxhQUFhLENBQUMsS0FBSyxLQUFLLFlBQVksQ0FBQztHQUM3QyxDQUFDLENBQUM7QUFDSCwyQkFBVSxNQUFNLElBQUksSUFBSSxDQUFDLENBQUM7QUFDMUIsU0FBTyxNQUFNLENBQUM7Q0FDZiIsImZpbGUiOiJUeXBlUmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgdm0gZnJvbSAndm0nO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5cbmltcG9ydCB0eXBlIHtcbiAgVHlwZSxcbiAgT2JqZWN0VHlwZSxcbiAgT2JqZWN0RmllbGQsXG4gIFVuaW9uVHlwZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge29iamVjdFR5cGUsIGRhdGVUeXBlLCByZWdFeHBUeXBlLCBidWZmZXJUeXBlLCBmc1N0YXRzVHlwZX0gZnJvbSAnLi9idWlsdGluLXR5cGVzJztcblxuXG4vKlxuICogVGhpcyB0eXBlIHJlcHJlc2VudHMgYSBUcmFuc2Zvcm1lciBmdW5jdGlvbiwgd2hpY2ggdGFrZXMgaW4gYSB2YWx1ZSwgYW5kIGVpdGhlciBzZXJpYWxpemVzXG4gKiBvciBkZXNlcmlhbGl6ZXMgaXQuIFRyYW5zZm9ybWVyJ3MgYXJlIGFkZGVkIHRvIGEgcmVnaXN0cnkgYW5kIGluZGV4ZWQgYnkgdGhlIG5hbWUgb2ZcbiAqIHRoZSB0eXBlIHRoZXkgaGFuZGxlIChlZzogJ0RhdGUnKS4gVGhlIHNlY29uZCBhcmd1bWVudCBpcyB0aGUgYWN0dWFsIHR5cGUgb2JqZWN0IHRoYXQgcmVwcmVzZW50XG4gKiB0aGUgdmFsdWUuIFBhcmFtZXRlcml6ZWQgdHlwZXMgbGlrZSBBcnJheSwgb3IgT2JqZWN0IGNhbiB1c2UgdGhpcyB0byByZWN1cnNpdmVseSBjYWxsIG90aGVyXG4gKiB0cmFuc2Zvcm1lcnMuXG4gKlxuICogSW4gdGhlIGludGVyZXN0IG9mIGEgcGVyZm9ybWFuY2UsIGEgdHJhbnNmb3JtZXIgc2hvdWxkIG9ubHkgcmV0dXJuIGEgUHJvbWlzZSBpZiBuZWNlc3NhcnkuXG4gKiAoUHJvbWlzZSBvYmplY3RzIGFuZCBQcm9taXNlLmFsbCBhcmUgdmVyeSBleHBlbnNpdmUgb3BlcmF0aW9ucyBpbiBsYXJnZSBudW1iZXJzKS5cbiAqL1xuZXhwb3J0IHR5cGUgVHJhbnNmb3JtZXI8VD4gPSAodmFsdWU6IFQsIHR5cGU6IFR5cGUpID0+IChUIHwgUHJvbWlzZTxUPik7XG5leHBvcnQgdHlwZSBOYW1lZFRyYW5zZm9ybWVyPFQ+ID0gKHZhbHVlOiBUKSA9PiAoVCB8IFByb21pc2U8VD4pO1xuXG4vLyBFcXVpdmFsZW50IHRvIFByb21pc2UuYWxsLCBidXQgYXZvaWRzIHdyYXBwZXJzIGlmIG5vdGhpbmcgaXMgYWN0dWFsbHkgYSBwcm9taXNlLlxuLy8gSW5wdXQgbXVzdCBiZSBob21vZ2Vub3VzbHkgdHlwZWQuXG5mdW5jdGlvbiBzbWFydFByb21pc2VBbGw8VD4oYXJyOiBBcnJheTxUPik6IEFycmF5PFQ+IHwgUHJvbWlzZTxBcnJheTxUPj4ge1xuICBpZiAoYXJyLmxlbmd0aCA9PT0gMCB8fCAhKGFyclswXSBpbnN0YW5jZW9mIFByb21pc2UpKSB7XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5hbGwoYXJyKTtcbn1cblxuLy8gU2FtZSBhcyB0aGUgYWJvdmUsIGJ1dCB3b3JrcyBmb3Igbm9uLWhvbW9nZW5vdXMgaW5wdXQuXG5mdW5jdGlvbiBjaGVja2VkU21hcnRQcm9taXNlQWxsKGFycjogQXJyYXk8YW55Pik6IEFycmF5PGFueT4gfCBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgZm9yIChjb25zdCBlbGVtIG9mIGFycikge1xuICAgIGlmIChlbGVtIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGFycik7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnI7XG59XG5cbmZ1bmN0aW9uIHN0YXRzVG9PYmplY3Qoc3RhdHM6IGZzLlN0YXRzKTogT2JqZWN0IHtcbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIGRldjogc3RhdHMuZGV2LFxuICAgIG1vZGU6IHN0YXRzLm1vZGUsXG4gICAgbmxpbms6IHN0YXRzLm5saW5rLFxuICAgIHVpZDogc3RhdHMudWlkLFxuICAgIGdpZDogc3RhdHMuZ2lkLFxuICAgIHJkZXY6IHN0YXRzLnJkZXYsXG4gICAgYmxrc2l6ZTogc3RhdHMuYmxrc2l6ZSxcbiAgICBpbm86IHN0YXRzLmlubyxcbiAgICBzaXplOiBzdGF0cy5zaXplLFxuICAgIGJsb2Nrczogc3RhdHMuYmxvY2tzLFxuICAgIGF0aW1lOiBzdGF0cy5hdGltZS50b0pTT04oKSxcbiAgICBtdGltZTogc3RhdHMubXRpbWUudG9KU09OKCksXG4gICAgY3RpbWU6IHN0YXRzLmN0aW1lLnRvSlNPTigpLFxuICB9O1xuXG4gIGlmIChzdGF0cy5iaXJ0aHRpbWUpIHtcbiAgICByZXR1cm4gey4uLnJlc3VsdCwgYmlydGh0aW1lOiBzdGF0cy5iaXJ0aHRpbWUudG9KU09OKCkgfTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RhdHMoanNvblN0YXRzOiBPYmplY3QpOiBmcy5TdGF0cyB7XG4gIGNvbnN0IHN0YXRzID0gbmV3IGZzLlN0YXRzKCk7XG5cbiAgc3RhdHMuZGV2ID0ganNvblN0YXRzLmRldjtcbiAgc3RhdHMubW9kZSA9IGpzb25TdGF0cy5tb2RlO1xuICBzdGF0cy5ubGluayA9IGpzb25TdGF0cy5ubGluaztcbiAgc3RhdHMudWlkID0ganNvblN0YXRzLnVpZDtcbiAgc3RhdHMuZ2lkID0ganNvblN0YXRzLmdpZDtcbiAgc3RhdHMucmRldiA9IGpzb25TdGF0cy5yZGV2O1xuICBzdGF0cy5ibGtzaXplID0ganNvblN0YXRzLmJsa3NpemU7XG4gIHN0YXRzLmlubyA9IGpzb25TdGF0cy5pbm87XG4gIHN0YXRzLnNpemUgPSBqc29uU3RhdHMuc2l6ZTtcbiAgc3RhdHMuYmxvY2tzID0ganNvblN0YXRzLmJsb2NrcztcbiAgc3RhdHMuYXRpbWUgPSBuZXcgRGF0ZShqc29uU3RhdHMuYXRpbWUpO1xuICBzdGF0cy5tdGltZSA9IG5ldyBEYXRlKGpzb25TdGF0cy5tdGltZSk7XG4gIHN0YXRzLmN0aW1lID0gbmV3IERhdGUoanNvblN0YXRzLmN0aW1lKTtcblxuICBpZiAoanNvblN0YXRzLmJpcnRodGltZSkge1xuICAgIC8vICRGbG93SXNzdWVcbiAgICBzdGF0cy5iaXJ0aHRpbWUgPSBuZXcgRGF0ZShqc29uU3RhdHMuYmlydGh0aW1lKTtcbiAgfVxuXG4gIHJldHVybiBzdGF0cztcbn1cblxuLypcbiAqIFRoZSBUeXBlUmVnaXN0cnkgaXMgYSBjZW50cmFsaXplZCBwbGFjZSB0byByZWdpc3RlciBmdW5jdGlvbnMgdGhhdCBzZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplXG4gKiB0eXBlcy4gVGhpcyBhbGxvd3MgZm9yIHR5cGVzIGRlZmluZWQgaW4gb25lIHNlcnZpY2UgdG8gaW5jbHVkZSB0eXBlcyBmcm9tIGFub3RoZXIgc2VydmljZSBpblxuICogYW5vdGhlciBmaWxlLiBJdCBhbHNvIGFsbG93cyB0aGUgYWJpbGl0eSB0byBhZGQgbmV3IHByaW1pdGl2ZXMsIHJhbmdpbmcgZnJvbSBCdWZmZXIgdG8gTnVjbGlkZVVyaVxuICogdGhhdCBhcmUgbm90IGhhbmRsZWQgYXQgdGhlIHRyYW5zcG9ydCBsYXllci4gVGhlIGtleSBjb25jZXB0IGlzIHRoYXQgbWFyc2hhbGxpbmcgZnVuY3Rpb25zIGNhblxuICogYmUgcmVjdXJzaXZlLCBjYWxsaW5nIG90aGVyIG1hcnNoYWxsaW5nIGZ1bmN0aW9ucywgZW5kaW5nIGF0IHRoZSBwcmltaXRpdmVzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlUmVnaXN0cnkge1xuICAvKiogU3RvcmUgbWFyaHNhbGxlcnMgYW5kIGFuZCB1bm1hcnNoYWxsZXJzLCBpbmRleCBieSB0aGUga2luZCBvZiB0aGUgdHlwZS4gKi9cbiAgX2tpbmRNYXJzaGFsbGVyczogTWFwPHN0cmluZywge1xuICAgICAgbWFyc2hhbGxlcjogVHJhbnNmb3JtZXI7XG4gICAgICB1bm1hcnNoYWxsZXI6IFRyYW5zZm9ybWVyO1xuICAgIH0+O1xuXG4gIC8qKiBTdG9yZSBtYXJoc2FsbGVycyBhbmQgYW5kIHVubWFyc2hhbGxlcnMsIGluZGV4IGJ5IHRoZSBuYW1lIG9mIHRoZSB0eXBlLiAqL1xuICBfbmFtZWRNYXJzaGFsbGVyczogTWFwPHN0cmluZywge1xuICAgICAgbWFyc2hhbGxlcjogTmFtZWRUcmFuc2Zvcm1lcjtcbiAgICAgIHVubWFyc2hhbGxlcjogTmFtZWRUcmFuc2Zvcm1lcjtcbiAgICB9PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9raW5kTWFyc2hhbGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fbmFtZWRNYXJzaGFsbGVycyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyUHJpbWl0aXZlcygpO1xuICAgIHRoaXMuX3JlZ2lzdGVyU3BlY2lhbFR5cGVzKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJDb250YWluZXJzKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJMaXRlcmFscygpO1xuICAgIHRoaXMuX3JlZ2lzdGVyVW5pb25zKCk7XG5cbiAgICAvLyBSZWdpc3RlciBOdWxsYWJsZVR5cGUgYW5kIE5hbWVkVHlwZVxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbnVsbGFibGUnLCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdHlwZS5raW5kICE9PSAnbnVsbGFibGUnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX21hcnNoYWwodmFsdWUsIHR5cGUudHlwZSk7XG4gICAgfSwgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHR5cGUua2luZCAhPT0gJ251bGxhYmxlJykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl91bm1hcnNoYWwodmFsdWUsIHR5cGUudHlwZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ25hbWVkJywgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICduYW1lZCcpO1xuICAgICAgY29uc3QgbmFtZWRNYXJzaGFsbGVyID0gdGhpcy5fbmFtZWRNYXJzaGFsbGVycy5nZXQodHlwZS5uYW1lKTtcbiAgICAgIGlmIChuYW1lZE1hcnNoYWxsZXIgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIG1hcnNoYWxsZXIgZm91bmQgZm9yIG5hbWVkIHR5cGUgJHt0eXBlLm5hbWV9LmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hbWVkTWFyc2hhbGxlci5tYXJzaGFsbGVyKHZhbHVlKTtcbiAgICB9LCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ25hbWVkJyk7XG4gICAgICBjb25zdCBuYW1lZE1hcnNoYWxsZXIgPSB0aGlzLl9uYW1lZE1hcnNoYWxsZXJzLmdldCh0eXBlLm5hbWUpO1xuICAgICAgaWYgKG5hbWVkTWFyc2hhbGxlciA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gbWFyc2hhbGxlciBmb3VuZCBmb3IgbmFtZWQgdHlwZSAke3R5cGUubmFtZX0uYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmFtZWRNYXJzaGFsbGVyLnVubWFyc2hhbGxlcih2YWx1ZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoXG4gICAgICAndm9pZCcsXG4gICAgICAodmFsdWUsIHR5cGUpID0+IFByb21pc2UucmVzb2x2ZShudWxsKSxcbiAgICAgICh2YWx1ZSwgdHlwZSkgPT4gUHJvbWlzZS5yZXNvbHZlKG51bGwpKTtcbiAgfVxuXG4gIF9yZWdpc3RlcktpbmQoa2luZDogc3RyaW5nLCBtYXJzaGFsbGVyOiBUcmFuc2Zvcm1lciwgdW5tYXJzaGFsbGVyOiBUcmFuc2Zvcm1lcik6IHZvaWQge1xuICAgIGludmFyaWFudCghdGhpcy5fa2luZE1hcnNoYWxsZXJzLmhhcyhraW5kKSk7XG4gICAgdGhpcy5fa2luZE1hcnNoYWxsZXJzLnNldChraW5kLCB7bWFyc2hhbGxlciwgdW5tYXJzaGFsbGVyfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSB0eXBlIGJ5IHByb3ZpZGluZyBib3RoIGEgbWFyc2hhbGxlciBhbmQgYW4gdW5tYXJzaGFsbGVyLiBUaGUgbWFyc2hhbGxlclxuICAgKiB3aWxsIGJlIGNhbGxlZCB0byB0cmFuc2Zvcm0gdGhlIHR5cGUgYmVmb3JlIHNlbmRpbmcgaXQgb3V0IG9udG8gdGhlIG5ldHdvcmssIHdoaWxlIHRoZVxuICAgKiB1bm1hcnNoYWxsZXIgd2lsbCBiZSBjYWxsZWQgb24gdmFsdWVzIGluY29taW5nIGZyb20gdGhlIG5ldHdvcmsuXG4gICAqIEBwYXJhbSB0eXBlTmFtZSAtIFRoZSBzdHJpbmcgbmFtZSBvZiB0aGUgdHlwZSB0aGF0IHRoZSBwcm92aWRlZCBtYXJzaGFsbGVycyBjb252ZXJ0LlxuICAgKiBAcGFyYW0gbWFyc2hhbGxlciAtIFNlcmlhbGl6ZSB0aGUgdHlwZS5cbiAgICogQHBhcmFtIHVubWFyc2hhbGxlciAtIERlc2VyaWFsaXplIHRoZSB0eXBlLlxuICAgKi9cbiAgcmVnaXN0ZXJUeXBlKFxuICAgIHR5cGVOYW1lOiBzdHJpbmcsXG4gICAgbWFyc2hhbGxlcjogTmFtZWRUcmFuc2Zvcm1lcixcbiAgICB1bm1hcnNoYWxsZXI6IE5hbWVkVHJhbnNmb3JtZXIsXG4gICk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9uYW1lZE1hcnNoYWxsZXJzLmhhcyh0eXBlTmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQSB0eXBlIGJ5IHRoZSBuYW1lICR7dHlwZU5hbWV9IGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZC5gKTtcbiAgICB9XG4gICAgdGhpcy5fbmFtZWRNYXJzaGFsbGVycy5zZXQodHlwZU5hbWUsIHttYXJzaGFsbGVyLCB1bm1hcnNoYWxsZXJ9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIHJlZ2lzdGVyaW5nIHRoZSBtYXJhc2hhbGxlci91bm1hcnNoYWxsZXIgZm9yIGEgdHlwZSBhbGlhcy5cbiAgICogQHBhcmFtIG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgYWxpYXMgdHlwZS5cbiAgICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0aGUgdGhlIGFsaWFzIHJlcHJlc2VudHMuXG4gICAqL1xuICByZWdpc3RlckFsaWFzKG5hbWU6IHN0cmluZywgdHlwZTogVHlwZSk6IHZvaWQge1xuICAgIHRoaXMucmVnaXN0ZXJUeXBlKG5hbWUsIHZhbHVlID0+IHRoaXMuX21hcnNoYWwodmFsdWUsIHR5cGUpLFxuICAgICAgdmFsdWUgPT4gdGhpcy5fdW5tYXJzaGFsKHZhbHVlLCB0eXBlKSk7XG4gIH1cblxuICAvKipcbiAgICogTWFyc2hhbCBhbiBvYmplY3QgdXNpbmcgdGhlIGFwcHJvcHJpYXRlIG1hcnNoYWwgZnVuY3Rpb24uXG4gICAqIEVuc3VyZXMgdGhlIHJlc3VsdCBpcyBhY3R1YWxseSBhIFByb21pc2UuXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBiZSBtYXJzaGFsbGVkLlxuICAgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIG9iamVjdCAodXNlZCB0byBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmdW5jdGlvbikuXG4gICAqL1xuICBtYXJzaGFsKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fbWFyc2hhbCh2YWx1ZSwgdHlwZSkpO1xuICB9XG5cbiAgX21hcnNoYWwodmFsdWU6IGFueSwgdHlwZTogVHlwZSk6IGFueSB7XG4gICAgY29uc3Qga2luZE1hcnNoYWxsZXIgPSB0aGlzLl9raW5kTWFyc2hhbGxlcnMuZ2V0KHR5cGUua2luZCk7XG4gICAgaWYgKGtpbmRNYXJzaGFsbGVyID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gbWFyc2hhbGxlciBmb3VuZCBmb3IgdHlwZSBraW5kICR7dHlwZS5raW5kfS5gKTtcbiAgICB9XG4gICAgcmV0dXJuIGtpbmRNYXJzaGFsbGVyLm1hcnNoYWxsZXIodmFsdWUsIHR5cGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVubWFyc2hhbCBhbmQgb2JqZWN0IHVzaW5nIHRoZSBhcHByb3ByaWF0ZSB1bm1hcnNoYWwgZnVuY3Rpb24uXG4gICAqIEVuc3VyZXMgdGhlIHJlc3VsdCBpcyBhY3R1YWxseSBhIFByb21pc2UuXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBiZSBtYXJzaGFsbGVkLlxuICAgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIG9iamVjdCAodXNlZCB0byBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmdW5jdGlvbikuXG4gICAqL1xuICB1bm1hcnNoYWwodmFsdWU6IGFueSwgdHlwZTogVHlwZSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl91bm1hcnNoYWwodmFsdWUsIHR5cGUpKTtcbiAgfVxuXG4gIF91bm1hcnNoYWwodmFsdWU6IGFueSwgdHlwZTogVHlwZSk6IGFueSB7XG4gICAgY29uc3Qga2luZE1hcnNoYWxsZXIgPSB0aGlzLl9raW5kTWFyc2hhbGxlcnMuZ2V0KHR5cGUua2luZCk7XG4gICAgaWYgKGtpbmRNYXJzaGFsbGVyID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gdW5tYXJzaGFsbGVyIGZvdW5kIGZvciB0eXBlIGtpbmQgJHt0eXBlLmtpbmR9LmApO1xuICAgIH1cbiAgICByZXR1cm4ga2luZE1hcnNoYWxsZXIudW5tYXJzaGFsbGVyKHZhbHVlLCB0eXBlKTtcbiAgfVxuXG4gIF9yZWdpc3RlclByaW1pdGl2ZXMoKTogdm9pZCB7XG4gICAgLy8gU2luY2Ugc3RyaW5nLCBudW1iZXIsIGFuZCBib29sZWFuIGFyZSBKU09OIHByaW1pdGl2ZXMsXG4gICAgLy8gdGhleSByZXF1aXJlIG5vIG1hcnNoYWxsaW5nLiBJbnN0ZWFkLCBzaW1wbHkgY3JlYXRlIHdyYXBwZWQgdHJhbnNmb3JtZXJzXG4gICAgLy8gdGhhdCBhc3NlcnQgdGhlIHR5cGUgb2YgdGhlaXIgYXJndW1lbnQuXG4gICAgY29uc3Qgc3RyaW5nVHJhbnNmb3JtZXIgPSBhcmcgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnQuXG4gICAgICBhcmcgPSAoYXJnIGluc3RhbmNlb2YgU3RyaW5nKSA/IGFyZy52YWx1ZU9mKCkgOiBhcmc7XG4gICAgICBhc3NlcnQodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycsICdFeHBlY3RlZCBhIHN0cmluZyBhcmd1bWVudCcpO1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICAgIGNvbnN0IG51bWJlclRyYW5zZm9ybWVyID0gYXJnID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50LlxuICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIE51bWJlcikge1xuICAgICAgICBhcmcgPSBhcmcudmFsdWVPZigpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0KHR5cGVvZiBhcmcgPT09ICdudW1iZXInLCAnRXhwZWN0ZWQgYSBudW1iZXIgYXJndW1lbnQnKTtcbiAgICAgIHJldHVybiBhcmc7XG4gICAgfTtcbiAgICBjb25zdCBib29sZWFuVHJhbnNmb3JtZXIgPSBhcmcgPT4ge1xuICAgICAgLy8gVW5ib3ggYXJndW1lbnRcbiAgICAgIGlmIChhcmcgaW5zdGFuY2VvZiBCb29sZWFuKSB7XG4gICAgICAgIGFyZyA9IGFyZy52YWx1ZU9mKCk7XG4gICAgICB9XG4gICAgICBhc3NlcnQodHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nLCAnRXhwZWN0ZWQgYSBib29sZWFuIGFyZ3VtZW50Jyk7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gICAgLy8gV2UgYXNzdW1lIGFuICdhbnknIGFuZCAnbWl4ZWQnIHR5cGVzIHJlcXVpcmUgbm8gbWFyc2hhbGxpbmcuXG4gICAgY29uc3QgaWRlbnRpdHlUcmFuc2Zvcm1lciA9IGFyZyA9PiBhcmc7XG5cbiAgICAvLyBSZWdpc3RlciB0aGVzZSB0cmFuc2Zvcm1lcnNcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ3N0cmluZycsIHN0cmluZ1RyYW5zZm9ybWVyLCBzdHJpbmdUcmFuc2Zvcm1lcik7XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdudW1iZXInLCBudW1iZXJUcmFuc2Zvcm1lciwgbnVtYmVyVHJhbnNmb3JtZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnYm9vbGVhbicsIGJvb2xlYW5UcmFuc2Zvcm1lciwgYm9vbGVhblRyYW5zZm9ybWVyKTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ2FueScsIGlkZW50aXR5VHJhbnNmb3JtZXIsIGlkZW50aXR5VHJhbnNmb3JtZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbWl4ZWQnLCBpZGVudGl0eVRyYW5zZm9ybWVyLCBpZGVudGl0eVRyYW5zZm9ybWVyKTtcbiAgfVxuXG4gIF9yZWdpc3RlckxpdGVyYWxzKCk6IHZvaWQge1xuICAgIGNvbnN0IGxpdGVyYWxUcmFuc2Zvcm1lciA9IChhcmcsIHR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdzdHJpbmctbGl0ZXJhbCcgfHwgdHlwZS5raW5kID09PSAnbnVtYmVyLWxpdGVyYWwnIHx8XG4gICAgICAgICAgdHlwZS5raW5kID09PSAnYm9vbGVhbi1saXRlcmFsJyk7XG4gICAgICBpbnZhcmlhbnQoYXJnID09PSB0eXBlLnZhbHVlKTtcbiAgICAgIHJldHVybiBhcmc7XG4gICAgfTtcbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ3N0cmluZy1saXRlcmFsJywgbGl0ZXJhbFRyYW5zZm9ybWVyLCBsaXRlcmFsVHJhbnNmb3JtZXIpO1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnbnVtYmVyLWxpdGVyYWwnLCBsaXRlcmFsVHJhbnNmb3JtZXIsIGxpdGVyYWxUcmFuc2Zvcm1lcik7XG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdib29sZWFuLWxpdGVyYWwnLCBsaXRlcmFsVHJhbnNmb3JtZXIsIGxpdGVyYWxUcmFuc2Zvcm1lcik7XG4gIH1cblxuICBfcmVnaXN0ZXJVbmlvbnMoKTogdm9pZCB7XG4gICAgY29uc3QgdW5pb25MaXRlcmFsVHJhbnNmb3JtZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndW5pb24nKTtcbiAgICAgIGNvbnN0IGFsdGVybmF0ZSA9IGFycmF5LmZpbmQodHlwZS50eXBlcywgZWxlbWVudCA9PiB7XG4gICAgICAgIGludmFyaWFudChlbGVtZW50LmtpbmQgPT09ICdzdHJpbmctbGl0ZXJhbCcgfHwgZWxlbWVudC5raW5kID09PSAnbnVtYmVyLWxpdGVyYWwnXG4gICAgICAgICAgICB8fCBlbGVtZW50LmtpbmQgPT09ICdib29sZWFuLWxpdGVyYWwnKTtcbiAgICAgICAgcmV0dXJuIChhcmcgPT09IGVsZW1lbnQudmFsdWUpO1xuICAgICAgfSk7XG4gICAgICBpbnZhcmlhbnQoYWx0ZXJuYXRlKTtcbiAgICAgIC8vIFRoaXMgaXMganVzdCB0aGUgbGl0ZXJhbCB0cmFuc2Zvcm1lciBpbmxpbmVkIC4uLlxuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICAgIGNvbnN0IHVuaW9uT2JqZWN0TWFyc2hhbGxlciA9IChhcmcsIHR5cGUpID0+IHtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd1bmlvbicpO1xuICAgICAgcmV0dXJuIHRoaXMuX21hcnNoYWwoYXJnLCBmaW5kQWx0ZXJuYXRlKGFyZywgdHlwZSkpO1xuICAgIH07XG4gICAgY29uc3QgdW5pb25PYmplY3RVbm1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndW5pb24nKTtcbiAgICAgIHJldHVybiB0aGlzLl91bm1hcnNoYWwoYXJnLCBmaW5kQWx0ZXJuYXRlKGFyZywgdHlwZSkpO1xuICAgIH07XG4gICAgY29uc3QgdW5pb25NYXJzaGFsbGVyID0gKGFyZywgdHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3VuaW9uJyk7XG4gICAgICBpZiAodHlwZS5kaXNjcmltaW5hbnRGaWVsZCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB1bmlvbk9iamVjdE1hcnNoYWxsZXIoYXJnLCB0eXBlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmlvbkxpdGVyYWxUcmFuc2Zvcm1lcihhcmcsIHR5cGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgdW5pb25Vbm1hcnNoYWxsZXIgPSAoYXJnLCB0eXBlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAndW5pb24nKTtcbiAgICAgIGlmICh0eXBlLmRpc2NyaW1pbmFudEZpZWxkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuaW9uT2JqZWN0VW5tYXJzaGFsbGVyKGFyZywgdHlwZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdW5pb25MaXRlcmFsVHJhbnNmb3JtZXIoYXJnLCB0eXBlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgndW5pb24nLCB1bmlvbk1hcnNoYWxsZXIsIHVuaW9uVW5tYXJzaGFsbGVyKTtcbiAgfVxuXG4gIF9yZWdpc3RlclNwZWNpYWxUeXBlcygpOiB2b2lkIHtcbiAgICAvLyBTZXJpYWxpemUgLyBEZXNlcmlhbGl6ZSBhbnkgT2JqZWN0IHR5cGVcbiAgICB0aGlzLnJlZ2lzdGVyVHlwZShvYmplY3RUeXBlLm5hbWUsIG9iamVjdCA9PiB7XG4gICAgICBhc3NlcnQob2JqZWN0ICE9IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcsICdFeHBlY3RlZCBPYmplY3QgYXJndW1lbnQuJyk7XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH0sIG9iamVjdCA9PiB7XG4gICAgICBhc3NlcnQob2JqZWN0ICE9IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcsICdFeHBlY3RlZCBPYmplY3QgYXJndW1lbnQuJyk7XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgSmF2YXNjcmlwdCBEYXRlIG9iamVjdHNcbiAgICB0aGlzLnJlZ2lzdGVyVHlwZShkYXRlVHlwZS5uYW1lLCBkYXRlID0+IHtcbiAgICAgIGFzc2VydChkYXRlIGluc3RhbmNlb2YgRGF0ZSwgJ0V4cGVjdGVkIGRhdGUgYXJndW1lbnQuJyk7XG4gICAgICByZXR1cm4gZGF0ZS50b0pTT04oKTtcbiAgICB9LCBkYXRlU3RyID0+IHtcbiAgICAgIC8vIFVuYm94IGFyZ3VtZW50LlxuICAgICAgZGF0ZVN0ciA9IChkYXRlU3RyIGluc3RhbmNlb2YgU3RyaW5nKSA/IGRhdGVTdHIudmFsdWVPZigpIDogZGF0ZVN0cjtcblxuICAgICAgYXNzZXJ0KHR5cGVvZiBkYXRlU3RyID09PSAnc3RyaW5nJywgJ0V4cGVjZXRlZCBhIHN0cmluZyBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlU3RyKTtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIFJlZ0V4cCBvYmplY3RzXG4gICAgdGhpcy5yZWdpc3RlclR5cGUocmVnRXhwVHlwZS5uYW1lLCByZWdleHAgPT4ge1xuICAgICAgYXNzZXJ0KHJlZ2V4cCBpbnN0YW5jZW9mIFJlZ0V4cCwgJ0V4cGVjdGVkIGEgUmVnRXhwIG9iamVjdCBhcyBhbiBhcmd1bWVudCcpO1xuICAgICAgcmV0dXJuIHJlZ2V4cC50b1N0cmluZygpO1xuICAgIH0sIHJlZ1N0ciA9PiB7XG4gICAgICAvLyBVbmJveCBhcmd1bWVudC5cbiAgICAgIHJlZ1N0ciA9IChyZWdTdHIgaW5zdGFuY2VvZiBTdHJpbmcpID8gcmVnU3RyLnZhbHVlT2YoKSA6IHJlZ1N0cjtcblxuICAgICAgYXNzZXJ0KHR5cGVvZiByZWdTdHIgPT09ICdzdHJpbmcnLCAnRXhwZWN0ZWQgYSBzdHJpbmcgYXJndW1lbnQuJyk7XG4gICAgICAvLyAkRmxvd0lzc3VlIC0gZmxlc2ggb3V0IHRoZSB2bSBtb2R1bGUuXG4gICAgICByZXR1cm4gdm0ucnVuSW5UaGlzQ29udGV4dChyZWdTdHIpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgQnVmZmVyIG9iamVjdHMgdGhyb3VnaCBCYXNlNjQgc3RyaW5nc1xuICAgIHRoaXMucmVnaXN0ZXJUeXBlKGJ1ZmZlclR5cGUubmFtZSwgYnVmZmVyID0+IHtcbiAgICAgIGFzc2VydChidWZmZXIgaW5zdGFuY2VvZiBCdWZmZXIsICdFeHBlY3RlZCBhIGJ1ZmZlciBhcmd1bWVudC4nKTtcbiAgICAgIHJldHVybiBidWZmZXIudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgIH0sIGJhc2U2NHN0cmluZyA9PiB7XG4gICAgICAvLyBVbmJveCBhcmd1bWVudC5cbiAgICAgIGJhc2U2NHN0cmluZyA9IChiYXNlNjRzdHJpbmcgaW5zdGFuY2VvZiBTdHJpbmcpID8gYmFzZTY0c3RyaW5nLnZhbHVlT2YoKSA6IGJhc2U2NHN0cmluZztcblxuICAgICAgYXNzZXJ0KFxuICAgICAgICB0eXBlb2YgYmFzZTY0c3RyaW5nID09PSAnc3RyaW5nJyxcbiAgICAgICAgYEV4cGVjdGVkIGEgYmFzZTY0IHN0cmluZy4gTm90ICR7dHlwZW9mIGJhc2U2NHN0cmluZ31gKTtcbiAgICAgIHJldHVybiBuZXcgQnVmZmVyKGJhc2U2NHN0cmluZywgJ2Jhc2U2NCcpO1xuICAgIH0pO1xuXG4gICAgLy8gZnMuU3RhdHNcbiAgICB0aGlzLnJlZ2lzdGVyVHlwZShmc1N0YXRzVHlwZS5uYW1lLCBzdGF0cyA9PiB7XG4gICAgICBhc3NlcnQoc3RhdHMgaW5zdGFuY2VvZiBmcy5TdGF0cyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc3RhdHNUb09iamVjdChzdGF0cykpO1xuICAgIH0sIGpzb24gPT4ge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBqc29uID09PSAnc3RyaW5nJyk7XG4gICAgICByZXR1cm4gb2JqZWN0VG9TdGF0cyhKU09OLnBhcnNlKGpzb24pKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9yZWdpc3RlckNvbnRhaW5lcnMoKTogdm9pZCB7XG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgQXJyYXlzLlxuICAgIHRoaXMuX3JlZ2lzdGVyS2luZCgnYXJyYXknLCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgYXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgQXJyYXksICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBBcnJheS4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdhcnJheScpO1xuICAgICAgY29uc3QgZWxlbVR5cGUgPSB0eXBlLnR5cGU7XG4gICAgICByZXR1cm4gc21hcnRQcm9taXNlQWxsKHZhbHVlLm1hcChlbGVtID0+IHRoaXMuX21hcnNoYWwoZWxlbSwgZWxlbVR5cGUpKSk7XG4gICAgfSwgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgQXJyYXkuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnYXJyYXknKTtcbiAgICAgIGNvbnN0IGVsZW1UeXBlID0gdHlwZS50eXBlO1xuICAgICAgcmV0dXJuIHNtYXJ0UHJvbWlzZUFsbCh2YWx1ZS5tYXAoZWxlbSA9PiB0aGlzLl91bm1hcnNoYWwoZWxlbSwgZWxlbVR5cGUpKSk7XG4gICAgfSk7XG5cbiAgICAvLyBTZXJpYWxpemUgYW5kIERlc2VyaWFsaXplIE9iamVjdHMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdvYmplY3QnLCAob2JqOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGFzc2VydCh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JywgJ0V4cGVjdGVkIGFuIGFyZ3VtZW50IG9mIHR5cGUgb2JqZWN0LicpO1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ29iamVjdCcpO1xuICAgICAgY29uc3QgbmV3T2JqID0ge307IC8vIENyZWF0ZSBhIG5ldyBvYmplY3Qgc28gd2UgZG9uJ3QgbXV0YXRlIHRoZSBvcmlnaW5hbCBvbmUuXG4gICAgICBjb25zdCBwcm9taXNlID0gY2hlY2tlZFNtYXJ0UHJvbWlzZUFsbCh0eXBlLmZpZWxkcy5tYXAocHJvcCA9PiB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBzb3VyY2Ugb2JqZWN0IGhhcyB0aGlzIGtleS5cbiAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wLm5hbWUpKSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9tYXJzaGFsKG9ialtwcm9wLm5hbWVdLCBwcm9wLnR5cGUpO1xuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50aGVuKChyZXN1bHQpID0+IG5ld09ialtwcm9wLm5hbWVdID0gcmVzdWx0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3T2JqW3Byb3AubmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb3Aub3B0aW9uYWwpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcHJvcGVydHkgaXMgb3B0aW9uYWwsIGl0J3Mgb2theSBmb3IgaXQgdG8gYmUgbWlzc2luZy5cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNvdXJjZSBvYmplY3QgaXMgbWlzc2luZyBwcm9wZXJ0eSAke3Byb3AubmFtZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIGlmIChwcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKCgpID0+IG5ld09iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3T2JqO1xuICAgIH0sIChvYmo6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBvYmogPT09ICdvYmplY3QnLCAnRXhwZWN0ZWQgYW4gYXJndW1lbnQgb2YgdHlwZSBvYmplY3QuJyk7XG4gICAgICBpbnZhcmlhbnQodHlwZS5raW5kID09PSAnb2JqZWN0Jyk7XG4gICAgICBjb25zdCBuZXdPYmogPSB7fTsgLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCBzbyB3ZSBkb24ndCBtdXRhdGUgdGhlIG9yaWdpbmFsIG9uZS5cbiAgICAgIGNvbnN0IHByb21pc2UgPSBjaGVja2VkU21hcnRQcm9taXNlQWxsKHR5cGUuZmllbGRzLm1hcChwcm9wID0+IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNvdXJjZSBvYmplY3QgaGFzIHRoaXMga2V5LlxuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3AubmFtZSkpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX3VubWFyc2hhbChvYmpbcHJvcC5uYW1lXSwgcHJvcC50eXBlKTtcbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudGhlbigocmVzdWx0KSA9PiBuZXdPYmpbcHJvcC5uYW1lXSA9IHJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld09ialtwcm9wLm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFwcm9wLm9wdGlvbmFsKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHByb3BlcnR5IGlzIG9wdGlvbmFsLCBpdCdzIG9rYXkgZm9yIGl0IHRvIGJlIG1pc3NpbmcuXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTb3VyY2Ugb2JqZWN0IGlzIG1pc3NpbmcgcHJvcGVydHkgJHtwcm9wLm5hbWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgICBpZiAocHJvbWlzZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbigoKSA9PiBuZXdPYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld09iajtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIFNldHMuXG4gICAgdGhpcy5fcmVnaXN0ZXJLaW5kKCdzZXQnLCAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3NldCcpO1xuICAgICAgYXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgU2V0LCAnRXhwZWN0ZWQgYW4gb2JqZWN0IG9mIHR5cGUgU2V0LicpO1xuICAgICAgY29uc3Qgc2VyaWFsaXplUHJvbWlzZXMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZWxlbSBvZiB2YWx1ZSkge1xuICAgICAgICBzZXJpYWxpemVQcm9taXNlcy5wdXNoKHRoaXMuX21hcnNoYWwoZWxlbSwgdHlwZS50eXBlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc21hcnRQcm9taXNlQWxsKHNlcmlhbGl6ZVByb21pc2VzKTtcbiAgICB9LCBhc3luYyAodmFsdWU6IGFueSwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgYXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgQXJyYXksICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBBcnJheS4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdzZXQnKTtcbiAgICAgIGNvbnN0IGVsZW1UeXBlID0gdHlwZS50eXBlO1xuICAgICAgY29uc3QgZWxlbWVudHMgPSBhd2FpdCBzbWFydFByb21pc2VBbGwodmFsdWUubWFwKGVsZW0gPT4gdGhpcy5fdW5tYXJzaGFsKGVsZW0sIGVsZW1UeXBlKSkpO1xuICAgICAgcmV0dXJuIG5ldyBTZXQoZWxlbWVudHMpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VyaWFsaXplIC8gRGVzZXJpYWxpemUgTWFwcy5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ21hcCcsIChtYXA6IE1hcCwgdHlwZTogVHlwZSkgPT4ge1xuICAgICAgYXNzZXJ0KG1hcCBpbnN0YW5jZW9mIE1hcCwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIFNldC4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdtYXAnKTtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZVByb21pc2VzID0gW107XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBtYXApIHtcbiAgICAgICAgc2VyaWFsaXplUHJvbWlzZXMucHVzaChjaGVja2VkU21hcnRQcm9taXNlQWxsKFtcbiAgICAgICAgICB0aGlzLl9tYXJzaGFsKGtleSwgdHlwZS5rZXlUeXBlKSxcbiAgICAgICAgICB0aGlzLl9tYXJzaGFsKHZhbHVlLCB0eXBlLnZhbHVlVHlwZSksXG4gICAgICAgIF0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbWFydFByb21pc2VBbGwoc2VyaWFsaXplUHJvbWlzZXMpO1xuICAgIH0sIGFzeW5jIChzZXJpYWxpemVkOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIGFzc2VydChzZXJpYWxpemVkIGluc3RhbmNlb2YgQXJyYXksICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBBcnJheS4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICdtYXAnKTtcbiAgICAgIGNvbnN0IGtleVR5cGUgPSB0eXBlLmtleVR5cGU7XG4gICAgICBjb25zdCB2YWx1ZVR5cGUgPSB0eXBlLnZhbHVlVHlwZTtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBzbWFydFByb21pc2VBbGwoXG4gICAgICAgIHNlcmlhbGl6ZWQubWFwKGVudHJ5ID0+IGNoZWNrZWRTbWFydFByb21pc2VBbGwoW1xuICAgICAgICAgIHRoaXMuX3VubWFyc2hhbChlbnRyeVswXSwga2V5VHlwZSksXG4gICAgICAgICAgdGhpcy5fdW5tYXJzaGFsKGVudHJ5WzFdLCB2YWx1ZVR5cGUpLFxuICAgICAgICBdKSlcbiAgICAgICk7XG4gICAgICByZXR1cm4gbmV3IE1hcChlbnRyaWVzKTtcbiAgICB9KTtcblxuICAgIC8vIFNlcmlhbGl6ZSAvIERlc2VyaWFsaXplIFR1cGxlcy5cbiAgICB0aGlzLl9yZWdpc3RlcktpbmQoJ3R1cGxlJywgKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUpID0+IHtcbiAgICAgIC8vIEFzc2VydCB0aGUgbGVuZ3RoIG9mIHRoZSBhcnJheS5cbiAgICAgIGFzc2VydChBcnJheS5pc0FycmF5KHZhbHVlKSwgJ0V4cGVjdGVkIGFuIG9iamVjdCBvZiB0eXBlIEFycmF5LicpO1xuICAgICAgaW52YXJpYW50KHR5cGUua2luZCA9PT0gJ3R1cGxlJyk7XG4gICAgICBjb25zdCB0eXBlcyA9IHR5cGUudHlwZXM7XG4gICAgICBhc3NlcnQodmFsdWUubGVuZ3RoID09PSB0eXBlcy5sZW5ndGgsIGBFeHBlY3RlZCB0dXBsZSBvZiBsZW5ndGggJHt0eXBlcy5sZW5ndGh9LmApO1xuXG4gICAgICAvLyBDb252ZXJ0IGFsbCBvZiB0aGUgZWxlbWVudHMgdGhyb3VnaCB0aGUgY29ycmVjdCBtYXJzaGFsbGVyLlxuICAgICAgcmV0dXJuIGNoZWNrZWRTbWFydFByb21pc2VBbGwodmFsdWUubWFwKChlbGVtLCBpKSA9PiB0aGlzLl9tYXJzaGFsKGVsZW0sIHR5cGVzW2ldKSkpO1xuICAgIH0sICh2YWx1ZTogYW55LCB0eXBlOiBUeXBlKSA9PiB7XG4gICAgICAvLyBBc3NlcnQgdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXkuXG4gICAgICBhc3NlcnQoQXJyYXkuaXNBcnJheSh2YWx1ZSksICdFeHBlY3RlZCBhbiBvYmplY3Qgb2YgdHlwZSBBcnJheS4nKTtcbiAgICAgIGludmFyaWFudCh0eXBlLmtpbmQgPT09ICd0dXBsZScpO1xuICAgICAgY29uc3QgdHlwZXMgPSB0eXBlLnR5cGVzO1xuICAgICAgYXNzZXJ0KHZhbHVlLmxlbmd0aCA9PT0gdHlwZXMubGVuZ3RoLCBgRXhwZWN0ZWQgdHVwbGUgb2YgbGVuZ3RoICR7dHlwZXMubGVuZ3RofS5gKTtcblxuICAgICAgLy8gQ29udmVydCBhbGwgb2YgdGhlIGVsZW1lbnRzIHRocm91Z2ggdGhlIGNvcnJlY3QgdW5tYXJzaGFsbGVyLlxuICAgICAgcmV0dXJuIGNoZWNrZWRTbWFydFByb21pc2VBbGwodmFsdWUubWFwKChlbGVtLCBpKSA9PiB0aGlzLl91bm1hcnNoYWwoZWxlbSwgdHlwZXNbaV0pKSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0T2JqZWN0RmllbGRCeU5hbWUodHlwZTogT2JqZWN0VHlwZSwgZmllbGROYW1lOiBzdHJpbmcpOiBPYmplY3RGaWVsZCB7XG4gIGNvbnN0IHJlc3VsdCA9IGFycmF5LmZpbmQodHlwZS5maWVsZHMsIGZpZWxkID0+IGZpZWxkLm5hbWUgPT09IGZpZWxkTmFtZSk7XG4gIGludmFyaWFudChyZXN1bHQgIT0gbnVsbCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGZpbmRBbHRlcm5hdGUoYXJnOiBPYmplY3QsIHR5cGU6IFVuaW9uVHlwZSk6IE9iamVjdFR5cGUge1xuICBjb25zdCBkaXNjcmltaW5hbnRGaWVsZCA9IHR5cGUuZGlzY3JpbWluYW50RmllbGQ7XG4gIGludmFyaWFudChkaXNjcmltaW5hbnRGaWVsZCAhPSBudWxsKTtcbiAgY29uc3QgZGlzY3JpbWluYW50ID0gYXJnW2Rpc2NyaW1pbmFudEZpZWxkXTtcbiAgaW52YXJpYW50KGRpc2NyaW1pbmFudCAhPSBudWxsKTtcbiAgY29uc3QgYWx0ZXJuYXRlczogQXJyYXk8T2JqZWN0VHlwZT4gPSAodHlwZS50eXBlczogYW55KTtcbiAgY29uc3QgcmVzdWx0ID0gYXJyYXkuZmluZChhbHRlcm5hdGVzLCBhbHRlcm5hdGUgPT4ge1xuICAgIGludmFyaWFudChhbHRlcm5hdGUua2luZCA9PT0gJ29iamVjdCcpO1xuICAgIGNvbnN0IGFsdGVybmF0ZVR5cGUgPSBnZXRPYmplY3RGaWVsZEJ5TmFtZShhbHRlcm5hdGUsIGRpc2NyaW1pbmFudEZpZWxkKS50eXBlO1xuICAgIGludmFyaWFudChhbHRlcm5hdGVUeXBlLmtpbmQgPT09ICdzdHJpbmctbGl0ZXJhbCcgfHwgYWx0ZXJuYXRlVHlwZS5raW5kID09PSAnbnVtYmVyLWxpdGVyYWwnXG4gICAgICAgIHx8IGFsdGVybmF0ZVR5cGUua2luZCA9PT0gJ2Jvb2xlYW4tbGl0ZXJhbCcpO1xuICAgIHJldHVybiBhbHRlcm5hdGVUeXBlLnZhbHVlID09PSBkaXNjcmltaW5hbnQ7XG4gIH0pO1xuICBpbnZhcmlhbnQocmVzdWx0ICE9IG51bGwpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIl19