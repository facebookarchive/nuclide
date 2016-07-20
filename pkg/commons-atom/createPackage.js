Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createPackage;

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

/**
 * Create an Atom package from an Activation constructor.
 *
 * Atom packages are obstensibly singletons, however they contain `activate()` and `deactivate()`
 * lifecycle methods which can be called multiple times. There's no use-case (so far as we know) for
 * invoking any other package methods while a package is not activated. Therefore, it makes more
 * sense to build packages as instances, constructed when a package is activated and destroyed when
 * the package is deactivated.
 */

function createPackage(Activation) {
  var activation = null;
  var pkg = {};

  // Proxy method calls on the package to the activation object.

  var _loop = function (property) {
    if (typeof Activation.prototype[property] !== 'function') {
      return 'continue';
    }
    if (property === 'constructor') {
      return 'continue';
    }
    if (property === 'activate') {
      throw new Error('Your activation class contains an "activate" method, but that work should be done in the' + ' constructor.');
    }
    if (property === 'deactivate') {
      throw new Error('Your activation class contains an "deactivate" method. Please use "dispose" instead.');
    }

    pkg[property] = function () {
      var _activation;

      (0, (_assert2 || _assert()).default)(activation != null, 'Package not activated');
      return (_activation = activation)[property].apply(_activation, arguments);
    };
  };

  for (var property of getPropertyList(Activation.prototype)) {
    var _ret = _loop(property);

    if (_ret === 'continue') continue;
  }

  return _extends({}, pkg, {

    /**
     * Calling `activate()` creates a new instance.
     */
    activate: function activate(initialState) {
      (0, (_assert2 || _assert()).default)(activation == null, 'Package already activated');
      activation = new Activation(initialState);
    },

    /**
     * The `deactivate()` method is special-cased to null our activation instance reference.
     */
    deactivate: function deactivate() {
      (0, (_assert2 || _assert()).default)(activation != null, 'Package not activated');
      if (typeof activation.dispose === 'function') {
        activation.dispose();
      }
      activation = null;
    }
  });
}

function getPrototypeChain(prototype) {
  var prototypes = [];
  while (prototype != null) {
    prototypes.push(prototype);
    prototype = Object.getPrototypeOf(prototype);
  }
  return prototypes;
}

/**
 * List the properties (including inherited ones) of the provided prototype, excluding the ones
 * inherited from `Object`.
 */
function getPropertyList(prototype) {
  var properties = [];
  for (var proto of getPrototypeChain(prototype)) {
    if (proto === Object.prototype) {
      break;
    }
    for (var property of Object.getOwnPropertyNames(proto)) {
      properties.push(property);
    }
  }
  return properties;
}
module.exports = exports.default;