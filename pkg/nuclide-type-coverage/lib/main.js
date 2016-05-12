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

var resultFunction = _asyncToGenerator(function* (provider, editor) {
  if (!(yield (0, (_nuclideCommons2 || _nuclideCommons()).passesGK)(GK_TYPE_COVERAGE, 0))) {
    return null;
  }
  var path = editor.getPath();
  if (path == null) {
    return null;
  }
  return yield provider.getCoverage(path);
});

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeCoverageProvider = consumeCoverageProvider;
exports.consumeStatusBar = consumeStatusBar;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideActiveEditorBasedService2;

function _nuclideActiveEditorBasedService() {
  return _nuclideActiveEditorBasedService2 = require('../../nuclide-active-editor-based-service');
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var _StatusBarTile2;

function _StatusBarTile() {
  return _StatusBarTile2 = require('./StatusBarTile');
}

var STATUS_BAR_PRIORITY = 1000;
var GK_TYPE_COVERAGE = 'nuclide_type_coverage';

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._activeEditorBasedService = new (_nuclideActiveEditorBasedService2 || _nuclideActiveEditorBasedService()).ActiveEditorBasedService(resultFunction, { updateOnEdit: false });
  }

  _createClass(Activation, [{
    key: 'consumeCoverageProvider',
    value: function consumeCoverageProvider(provider) {
      return this._activeEditorBasedService.consumeProvider(provider);
    }
  }, {
    key: 'consumeStatusBar',
    value: function consumeStatusBar(statusBar) {
      var item = document.createElement('div');
      item.className = 'inline-block';

      var statusBarTile = statusBar.addLeftTile({
        item: item,
        priority: STATUS_BAR_PRIORITY
      });

      var resultStream = this._activeEditorBasedService.getResultsStream();
      (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_StatusBarTile2 || _StatusBarTile()).StatusBarTile, { results: resultStream }), item);
      var disposable = new (_atom2 || _atom()).Disposable(function () {
        statusBarTile.destroy();
      });
      this._disposables.add(disposable);
      return disposable;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function consumeCoverageProvider(provider) {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.consumeCoverageProvider(provider);
}

function consumeStatusBar(statusBar) {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.consumeStatusBar(statusBar);
}