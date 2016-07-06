Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ShellMessageManager2;

function _ShellMessageManager() {
  return _ShellMessageManager2 = require('./ShellMessageManager');
}

var ShellActivation = (function () {
  function ShellActivation() {
    _classCallCheck(this, ShellActivation);

    // TODO: Enable following when RN changes land. Don't forget to call dispose in `dispose()`!
    // this._disposables = new CompositeDisposable(
    //   atom.commands.add('atom-workspace', {
    //     'nuclide-react-native:reload-app': () => this._reload(),
    //   }),
    // );
    this._shellManager = new (_ShellMessageManager2 || _ShellMessageManager()).ShellMessageManager();
  }

  _createClass(ShellActivation, [{
    key: 'dispose',
    value: function dispose() {}
  }, {
    key: '_reload',
    value: function _reload() {
      var message = {
        version: 1,
        target: 'bridge',
        action: 'reload'
      };
      this._shellManager.send(message);
    }
  }]);

  return ShellActivation;
})();

exports.ShellActivation = ShellActivation;