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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var datatip = _asyncToGenerator(function* (editor, position) {
  if (!(yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_DIAGNOSTICS_DATATIPS, 0))) {
    return null;
  }
  (0, (_assert2 || _assert()).default)(fileDiagnostics);
  var messagesForFile = fileDiagnostics.get(editor);
  if (messagesForFile == null) {
    return null;
  }
  var messagesAtPosition = messagesForFile.filter(function (message) {
    return message.range != null && message.range.containsPoint(position);
  });
  if (messagesAtPosition.length === 0) {
    return null;
  }

  var _messagesAtPosition = _slicedToArray(messagesAtPosition, 1);

  var message = _messagesAtPosition[0];
  var range = message.range;

  (0, (_assert2 || _assert()).default)(range);
  return {
    component: (0, (_DiagnosticsDatatipComponent2 || _DiagnosticsDatatipComponent()).makeDiagnosticsDatatipComponent)(message),
    pinnable: false,
    range: range
  };
});

exports.datatip = datatip;
exports.consumeDatatipService = consumeDatatipService;
exports.activate = activate;
exports.consumeDiagnosticUpdates = consumeDiagnosticUpdates;
exports.deactivate = deactivate;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _DiagnosticsDatatipComponent2;

function _DiagnosticsDatatipComponent() {
  return _DiagnosticsDatatipComponent2 = require('./DiagnosticsDatatipComponent');
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var GK_DIAGNOSTICS_DATATIPS = 'nuclide_diagnostics_datatips';

var DATATIP_PACKAGE_NAME = 'nuclide-diagnostics-datatip';

function getDatatipProvider() {
  return {
    // show this datatip for every type of file
    validForScope: function validForScope(scope) {
      return true;
    },
    providerName: DATATIP_PACKAGE_NAME,
    inclusionPriority: 1,
    datatip: datatip
  };
}

function consumeDatatipService(service) {
  var datatipProvider = getDatatipProvider();
  (0, (_assert2 || _assert()).default)(disposables);
  service.addProvider(datatipProvider);
  var disposable = new (_atom2 || _atom()).Disposable(function () {
    return service.removeProvider(datatipProvider);
  });
  disposables.add(disposable);
  return disposable;
}

var disposables = null;
var fileDiagnostics = null;

function activate(state) {
  disposables = new (_atom2 || _atom()).CompositeDisposable();
  fileDiagnostics = new WeakMap();
}

function consumeDiagnosticUpdates(diagnosticUpdater) {
  (0, (_assert2 || _assert()).default)(disposables);
  disposables.add(atom.workspace.observeTextEditors(function (editor) {
    (0, (_assert2 || _assert()).default)(fileDiagnostics);
    var filePath = editor.getPath();
    if (!filePath) {
      return;
    }
    fileDiagnostics.set(editor, []);
    var callback = function callback(update) {
      (0, (_assert2 || _assert()).default)(fileDiagnostics);
      fileDiagnostics.set(editor, update.messages);
    };
    var disposable = diagnosticUpdater.onFileMessagesDidUpdate(callback, filePath);

    editor.onDidDestroy(function () {
      disposable.dispose();
      if (fileDiagnostics != null) {
        fileDiagnostics.delete(editor);
      }
    });
    (0, (_assert2 || _assert()).default)(disposables);
    disposables.add(disposable);
  }));
}

function deactivate() {
  if (disposables != null) {
    disposables.dispose();
    disposables = null;
  }
  fileDiagnostics = null;
}