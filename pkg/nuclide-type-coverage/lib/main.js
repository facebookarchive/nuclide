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
exports.getDiagnosticsProvider = getDiagnosticsProvider;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsAtomActiveEditorRegistry;

function _load_commonsAtomActiveEditorRegistry() {
  return _commonsAtomActiveEditorRegistry = _interopRequireDefault(require('../../commons-atom/ActiveEditorRegistry'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _StatusBarTile;

function _load_StatusBarTile() {
  return _StatusBarTile = require('./StatusBarTile');
}

var _coverageDiagnostics;

function _load_coverageDiagnostics() {
  return _coverageDiagnostics = require('./coverageDiagnostics');
}

var STATUS_BAR_PRIORITY = 1000;

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._toggleEvents = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._shouldRenderDiagnostics = this._toggleEvents.scan(function (prev) {
      return !prev;
    }, false);

    this._disposables = new (_atom || _load_atom()).CompositeDisposable();
    this._activeEditorRegistry = new (_commonsAtomActiveEditorRegistry || _load_commonsAtomActiveEditorRegistry()).default(resultFunction, { updateOnEdit: false });

    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-type-coverage:toggle-inline-display', function () {
      return _this._toggleEvents.next();
    }));

    this._disposables.add(new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._toggleEvents.subscribe(function () {
      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-type-coverage:toggle');
    })));
  }

  _createClass(Activation, [{
    key: 'consumeCoverageProvider',
    value: function consumeCoverageProvider(provider) {
      return this._activeEditorRegistry.consumeProvider(provider);
    }
  }, {
    key: 'consumeStatusBar',
    value: function consumeStatusBar(statusBar) {
      var _this2 = this;

      var item = document.createElement('div');
      item.className = 'inline-block';

      var statusBarTile = statusBar.addLeftTile({
        item: item,
        priority: STATUS_BAR_PRIORITY
      });

      var resultStream = this._activeEditorRegistry.getResultsStream();
      (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement((_StatusBarTile || _load_StatusBarTile()).StatusBarTile, {
        results: resultStream,
        isActive: this._shouldRenderDiagnostics,
        onClick: function () {
          return _this2._toggleEvents.next();
        }
      }), item);
      var disposable = new (_atom || _load_atom()).Disposable(function () {
        (_reactForAtom || _load_reactForAtom()).ReactDOM.unmountComponentAtNode(item);
        statusBarTile.destroy();
      });
      this._disposables.add(disposable);
      return disposable;
    }
  }, {
    key: 'getDiagnosticsProvider',
    value: function getDiagnosticsProvider() {
      return (0, (_coverageDiagnostics || _load_coverageDiagnostics()).diagnosticProviderForResultStream)(this._activeEditorRegistry.getResultsStream(), this._shouldRenderDiagnostics);
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
  (0, (_assert || _load_assert()).default)(activation != null);
  return activation.consumeCoverageProvider(provider);
}

function consumeStatusBar(statusBar) {
  (0, (_assert || _load_assert()).default)(activation != null);
  return activation.consumeStatusBar(statusBar);
}

function getDiagnosticsProvider() {
  (0, (_assert || _load_assert()).default)(activation != null);
  return activation.getDiagnosticsProvider();
}