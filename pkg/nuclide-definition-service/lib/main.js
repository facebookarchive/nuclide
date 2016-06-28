Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeDefinitionProvider = consumeDefinitionProvider;
exports.provideDefinitionService = provideDefinitionService;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsAtomProviderRegistry2;

function _commonsAtomProviderRegistry() {
  return _commonsAtomProviderRegistry2 = _interopRequireDefault(require('../../commons-atom/ProviderRegistry'));
}

// position is the first char of the definition's identifier, while range
// includes the entire definition. For example in:
//   class Foo { }
// position should be the 'F' in Foo, while range should span the 'c' in class
// to the '}'
// id is a string which uniquely identifies this symbol in a project. It is not suitable
// for display to humans.
// name is a string suitable for display to humans.
// projectRoot is the root directory of the project containing this definition.
// name is required, and projectRoot is encouraged, when returning multiple results.

// Definition queries supply a point.
// The returned queryRange is the range within which the returned definition is valid.
// Typically queryRange spans the containing identifier around the query point.

// Provides definitions for a set of language grammars.

// Provides definitions given a file & position.
// Relies on per-language(grammar) providers to provide results.

var Service = (function () {
  function Service() {
    _classCallCheck(this, Service);

    this._providers = new (_commonsAtomProviderRegistry2 || _commonsAtomProviderRegistry()).default();
  }

  _createClass(Service, [{
    key: 'dispose',
    value: function dispose() {}
  }, {
    key: 'getDefinition',
    value: _asyncToGenerator(function* (editor, position) {
      var provider = this._providers.getProviderForEditor(editor);
      return provider == null ? null : (yield provider.getDefinition(editor, position));
    })
  }, {
    key: 'consumeDefinitionProvider',
    value: function consumeDefinitionProvider(provider) {
      var _this = this;

      this._providers.addProvider(provider);
      return new (_atom2 || _atom()).Disposable(function () {
        _this._providers.removeProvider(provider);
      });
    }
  }]);

  return Service;
})();

exports.Service = Service;

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Service(state);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function consumeDefinitionProvider(provider) {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.consumeDefinitionProvider(provider);
}

function provideDefinitionService() {
  (0, (_assert2 || _assert()).default)(activation != null);
  return {
    getDefinition: activation.getDefinition.bind(activation)
  };
}

// If there are multiple providers for a given grammar, the one with the highest priority will be
// used.