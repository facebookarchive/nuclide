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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _UnescapedUnicodeDatatip2;

function _UnescapedUnicodeDatatip() {
  return _UnescapedUnicodeDatatip2 = _interopRequireDefault(require('./UnescapedUnicodeDatatip'));
}

var UnicodeDatatipManager = (function () {
  function UnicodeDatatipManager() {
    _classCallCheck(this, UnicodeDatatipManager);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
  }

  _createClass(UnicodeDatatipManager, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeDatatipService',
    value: function consumeDatatipService(service) {
      var _this = this;

      var datatipProvider = {
        datatip: function datatip(editor, position) {
          return (0, (_UnescapedUnicodeDatatip2 || _UnescapedUnicodeDatatip()).default)(editor, position);
        },
        validForScope: function validForScope(scope) {
          return true;
        },
        providerName: 'nuclide-unicode-escapes',
        inclusionPriority: 1
      };

      service.addProvider(datatipProvider);
      this.datatipService = service;
      var disposable = new (_atom2 || _atom()).Disposable(function () {
        service.removeProvider(datatipProvider);
        _this.datatipService = null;
      });
      this._disposables.add(disposable);
      return disposable;
    }
  }]);

  return UnicodeDatatipManager;
})();

exports.default = UnicodeDatatipManager;
module.exports = exports.default;