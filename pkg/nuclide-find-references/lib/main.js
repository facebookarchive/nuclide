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

var getProviderData = _asyncToGenerator(function* () {
  var editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return null;
  }
  var path = editor.getPath();
  if (!path) {
    return null;
  }
  var point = editor.getCursorBufferPosition();
  (0, _nuclideAnalytics.track)('find-references:activate', {
    path: path,
    row: point.row.toString(),
    column: point.column.toString()
  });
  var supported = supportedProviders.get(editor);
  if (!supported) {
    return null;
  }
  var providerData = yield Promise.all(supported.map(function (provider) {
    return provider.findReferences(editor, point);
  }));
  return providerData.filter(function (x) {
    return !!x;
  })[0];
});

var tryCreateView = _asyncToGenerator(function* () {
  try {
    var data = yield getProviderData();
    if (data == null) {
      showError('Symbol references are not available for this project.');
    } else if (data.type === 'error') {
      (0, _nuclideAnalytics.track)('find-references:error', { message: data.message });
      showError(data.message);
    } else if (!data.references.length) {
      (0, _nuclideAnalytics.track)('find-references:success', { resultCount: '0' });
      showError('No references found.');
    } else {
      var _baseUri = data.baseUri;
      var _referencedSymbolName = data.referencedSymbolName;
      var _references = data.references;

      (0, _nuclideAnalytics.track)('find-references:success', {
        baseUri: _baseUri,
        referencedSymbolName: _referencedSymbolName,
        resultCount: _references.length.toString()
      });
      var FindReferencesModel = require('./FindReferencesModel');
      var model = new FindReferencesModel(_baseUri, _referencedSymbolName, _references);

      var FindReferencesElement = require('./FindReferencesElement');
      return new FindReferencesElement().initialize(model);
    }
  } catch (e) {
    // TODO(peterhal): Remove this when unhandled rejections have a default handler.

    var _require = require('../../nuclide-logging');

    var getLogger = _require.getLogger;

    getLogger().error('Exception in nuclide-find-references', e);
    showError(e);
  }
});

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeProvider = consumeProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _atom = require('atom');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideAnalytics = require('../../nuclide-analytics');

var FIND_REFERENCES_URI = 'atom://nuclide/find-references/';

var subscriptions = null;
var providers = [];
var supportedProviders = new Map();

function showError(message) {
  atom.notifications.addError('nuclide-find-references: ' + message, { dismissable: true });
}

function enableForEditor(editor) {
  var elem = atom.views.getView(editor);
  elem.classList.add('enable-nuclide-find-references');
}

function activate(state) {
  subscriptions = new _atom.CompositeDisposable();
  subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-find-references:activate', _asyncToGenerator(function* () {
    var view = yield tryCreateView();
    if (view != null) {
      (function () {
        // Generate a unique identifier.
        var id = (_crypto2['default'].randomBytes(8) || '').toString('hex');
        var uri = FIND_REFERENCES_URI + id;
        var disposable = atom.workspace.addOpener(function (newUri) {
          if (uri === newUri) {
            return view;
          }
        });
        atom.workspace.open(uri);
        // The new tab opens instantly, so this is no longer needed.
        disposable.dispose();
      })();
    }
  })));

  // Mark text editors with a working provider with a special CSS class.
  // This ensures the context menu option only appears in supported projects.
  subscriptions.add(atom.workspace.observeTextEditors(_asyncToGenerator(function* (editor) {
    var path = editor.getPath();
    if (!path || supportedProviders.get(editor)) {
      return;
    }
    var supported = yield Promise.all(providers.map(_asyncToGenerator(function* (provider) {
      if (yield provider.isEditorSupported(editor)) {
        return provider;
      }
      return null;
    })));
    supported = _nuclideCommons.array.compact(supported);
    if (supported.length) {
      enableForEditor(editor);
    }
    supportedProviders.set(editor, supported);
    if (subscriptions) {
      (function () {
        var disposable = editor.onDidDestroy(function () {
          supportedProviders['delete'](editor);
          if (subscriptions) {
            subscriptions.remove(disposable);
          }
        });
        subscriptions.add(disposable);
      })();
    }
  })));

  // Enable text copy from the symbol reference view
  subscriptions.add(atom.commands.add('nuclide-find-references-view', 'core:copy', function () {
    var selectedText = window.getSelection().toString();
    atom.clipboard.write(selectedText);
  }));
}

function deactivate() {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  providers = [];
}

function consumeProvider(provider) {
  providers.push(provider);
  // Editors are often open before providers load, so update existing ones too.
  supportedProviders.forEach(_asyncToGenerator(function* (supported, editor) {
    if (yield provider.isEditorSupported(editor)) {
      if (!supported.length) {
        enableForEditor(editor);
      }
      supported.push(provider);
    }
  }));
}

// Return true if your provider supports finding references for the provided TextEditor.

// `findReferences` will only be called if `isEditorSupported` previously returned true
// for the given TextEditor.
//# sourceMappingURL=data:application/json;base64,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Q0QsZUFBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMxQjtHQUNGLEVBQUMsQ0FBQztDQUNKIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmVmZXJlbmNlfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbmV4cG9ydCB0eXBlIEZpbmRSZWZlcmVuY2VzRGF0YSA9IHtcbiAgdHlwZTogJ2RhdGEnO1xuICBiYXNlVXJpOiBzdHJpbmc7XG4gIHJlZmVyZW5jZWRTeW1ib2xOYW1lOiBzdHJpbmc7XG4gIHJlZmVyZW5jZXM6IEFycmF5PFJlZmVyZW5jZT47XG59O1xuXG5leHBvcnQgdHlwZSBGaW5kUmVmZXJlbmNlc0Vycm9yID0ge1xuICB0eXBlOiAnZXJyb3InO1xuICBtZXNzYWdlOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBGaW5kUmVmZXJlbmNlc1JldHVybiA9IEZpbmRSZWZlcmVuY2VzRGF0YSB8IEZpbmRSZWZlcmVuY2VzRXJyb3I7XG5cbmV4cG9ydCB0eXBlIEZpbmRSZWZlcmVuY2VzUHJvdmlkZXIgPSB7XG4gIC8vIFJldHVybiB0cnVlIGlmIHlvdXIgcHJvdmlkZXIgc3VwcG9ydHMgZmluZGluZyByZWZlcmVuY2VzIGZvciB0aGUgcHJvdmlkZWQgVGV4dEVkaXRvci5cbiAgaXNFZGl0b3JTdXBwb3J0ZWQoZWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTxib29sZWFuPjtcblxuICAvLyBgZmluZFJlZmVyZW5jZXNgIHdpbGwgb25seSBiZSBjYWxsZWQgaWYgYGlzRWRpdG9yU3VwcG9ydGVkYCBwcmV2aW91c2x5IHJldHVybmVkIHRydWVcbiAgLy8gZm9yIHRoZSBnaXZlbiBUZXh0RWRpdG9yLlxuICBmaW5kUmVmZXJlbmNlcyhlZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTw/RmluZFJlZmVyZW5jZXNSZXR1cm4+O1xufTtcblxuY29uc3QgRklORF9SRUZFUkVOQ0VTX1VSSSA9ICdhdG9tOi8vbnVjbGlkZS9maW5kLXJlZmVyZW5jZXMvJztcblxubGV0IHN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcbmxldCBwcm92aWRlcnM6IEFycmF5PEZpbmRSZWZlcmVuY2VzUHJvdmlkZXI+ID0gW107XG5jb25zdCBzdXBwb3J0ZWRQcm92aWRlcnM6IE1hcDxUZXh0RWRpdG9yLCBBcnJheTxGaW5kUmVmZXJlbmNlc1Byb3ZpZGVyPj4gPSBuZXcgTWFwKCk7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFByb3ZpZGVyRGF0YSgpOiBQcm9taXNlPD9GaW5kUmVmZXJlbmNlc1JldHVybj4ge1xuICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gIGlmICghZWRpdG9yKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgcGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gIGlmICghcGF0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHBvaW50ID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gIHRyYWNrKCdmaW5kLXJlZmVyZW5jZXM6YWN0aXZhdGUnLCB7XG4gICAgcGF0aCxcbiAgICByb3c6IHBvaW50LnJvdy50b1N0cmluZygpLFxuICAgIGNvbHVtbjogcG9pbnQuY29sdW1uLnRvU3RyaW5nKCksXG4gIH0pO1xuICBjb25zdCBzdXBwb3J0ZWQgPSBzdXBwb3J0ZWRQcm92aWRlcnMuZ2V0KGVkaXRvcik7XG4gIGlmICghc3VwcG9ydGVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgcHJvdmlkZXJEYXRhID0gYXdhaXQgUHJvbWlzZS5hbGwoc3VwcG9ydGVkLm1hcChcbiAgICBwcm92aWRlciA9PiBwcm92aWRlci5maW5kUmVmZXJlbmNlcyhlZGl0b3IsIHBvaW50KVxuICApKTtcbiAgcmV0dXJuIHByb3ZpZGVyRGF0YS5maWx0ZXIoeCA9PiAhIXgpWzBdO1xufVxuXG5mdW5jdGlvbiBzaG93RXJyb3IobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignbnVjbGlkZS1maW5kLXJlZmVyZW5jZXM6ICcgKyBtZXNzYWdlLCB7ZGlzbWlzc2FibGU6IHRydWV9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdHJ5Q3JlYXRlVmlldygpOiBQcm9taXNlPD9IVE1MRWxlbWVudD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBnZXRQcm92aWRlckRhdGEoKTtcbiAgICBpZiAoZGF0YSA9PSBudWxsKSB7XG4gICAgICBzaG93RXJyb3IoJ1N5bWJvbCByZWZlcmVuY2VzIGFyZSBub3QgYXZhaWxhYmxlIGZvciB0aGlzIHByb2plY3QuJyk7XG4gICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgIHRyYWNrKCdmaW5kLXJlZmVyZW5jZXM6ZXJyb3InLCB7bWVzc2FnZTogZGF0YS5tZXNzYWdlfSk7XG4gICAgICBzaG93RXJyb3IoZGF0YS5tZXNzYWdlKTtcbiAgICB9IGVsc2UgaWYgKCFkYXRhLnJlZmVyZW5jZXMubGVuZ3RoKSB7XG4gICAgICB0cmFjaygnZmluZC1yZWZlcmVuY2VzOnN1Y2Nlc3MnLCB7cmVzdWx0Q291bnQ6ICcwJ30pO1xuICAgICAgc2hvd0Vycm9yKCdObyByZWZlcmVuY2VzIGZvdW5kLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7YmFzZVVyaSwgcmVmZXJlbmNlZFN5bWJvbE5hbWUsIHJlZmVyZW5jZXN9ID0gZGF0YTtcbiAgICAgIHRyYWNrKCdmaW5kLXJlZmVyZW5jZXM6c3VjY2VzcycsIHtcbiAgICAgICAgYmFzZVVyaSxcbiAgICAgICAgcmVmZXJlbmNlZFN5bWJvbE5hbWUsXG4gICAgICAgIHJlc3VsdENvdW50OiByZWZlcmVuY2VzLmxlbmd0aC50b1N0cmluZygpLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBGaW5kUmVmZXJlbmNlc01vZGVsID0gcmVxdWlyZSgnLi9GaW5kUmVmZXJlbmNlc01vZGVsJyk7XG4gICAgICBjb25zdCBtb2RlbCA9IG5ldyBGaW5kUmVmZXJlbmNlc01vZGVsKFxuICAgICAgICBiYXNlVXJpLFxuICAgICAgICByZWZlcmVuY2VkU3ltYm9sTmFtZSxcbiAgICAgICAgcmVmZXJlbmNlc1xuICAgICAgKTtcblxuICAgICAgY29uc3QgRmluZFJlZmVyZW5jZXNFbGVtZW50ID0gcmVxdWlyZSgnLi9GaW5kUmVmZXJlbmNlc0VsZW1lbnQnKTtcbiAgICAgIHJldHVybiBuZXcgRmluZFJlZmVyZW5jZXNFbGVtZW50KCkuaW5pdGlhbGl6ZShtb2RlbCk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gVE9ETyhwZXRlcmhhbCk6IFJlbW92ZSB0aGlzIHdoZW4gdW5oYW5kbGVkIHJlamVjdGlvbnMgaGF2ZSBhIGRlZmF1bHQgaGFuZGxlci5cbiAgICBjb25zdCB7Z2V0TG9nZ2VyfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpO1xuICAgIGdldExvZ2dlcigpLmVycm9yKCdFeGNlcHRpb24gaW4gbnVjbGlkZS1maW5kLXJlZmVyZW5jZXMnLCBlKTtcbiAgICBzaG93RXJyb3IoZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5hYmxlRm9yRWRpdG9yKGVkaXRvcjogVGV4dEVkaXRvcik6IHZvaWQge1xuICBjb25zdCBlbGVtID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcik7XG4gIGVsZW0uY2xhc3NMaXN0LmFkZCgnZW5hYmxlLW51Y2xpZGUtZmluZC1yZWZlcmVuY2VzJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP2FueSk6IHZvaWQge1xuICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICdudWNsaWRlLWZpbmQtcmVmZXJlbmNlczphY3RpdmF0ZScsXG4gICAgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgdmlldyA9IGF3YWl0IHRyeUNyZWF0ZVZpZXcoKTtcbiAgICAgIGlmICh2aWV3ICE9IG51bGwpIHtcbiAgICAgICAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgaWRlbnRpZmllci5cbiAgICAgICAgY29uc3QgaWQgPSAoY3J5cHRvLnJhbmRvbUJ5dGVzKDgpIHx8ICcnKS50b1N0cmluZygnaGV4Jyk7XG4gICAgICAgIGNvbnN0IHVyaSA9IEZJTkRfUkVGRVJFTkNFU19VUkkgKyBpZDtcbiAgICAgICAgY29uc3QgZGlzcG9zYWJsZSA9IGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcihuZXdVcmkgPT4ge1xuICAgICAgICAgIGlmICh1cmkgPT09IG5ld1VyaSkge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXc7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbih1cmkpO1xuICAgICAgICAvLyBUaGUgbmV3IHRhYiBvcGVucyBpbnN0YW50bHksIHNvIHRoaXMgaXMgbm8gbG9uZ2VyIG5lZWRlZC5cbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfVxuICApKTtcblxuICAvLyBNYXJrIHRleHQgZWRpdG9ycyB3aXRoIGEgd29ya2luZyBwcm92aWRlciB3aXRoIGEgc3BlY2lhbCBDU1MgY2xhc3MuXG4gIC8vIFRoaXMgZW5zdXJlcyB0aGUgY29udGV4dCBtZW51IG9wdGlvbiBvbmx5IGFwcGVhcnMgaW4gc3VwcG9ydGVkIHByb2plY3RzLlxuICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoYXN5bmMgZWRpdG9yID0+IHtcbiAgICBjb25zdCBwYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIXBhdGggfHwgc3VwcG9ydGVkUHJvdmlkZXJzLmdldChlZGl0b3IpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBzdXBwb3J0ZWQgPSBhd2FpdCBQcm9taXNlLmFsbChwcm92aWRlcnMubWFwKFxuICAgICAgYXN5bmMgcHJvdmlkZXIgPT4ge1xuICAgICAgICBpZiAoYXdhaXQgcHJvdmlkZXIuaXNFZGl0b3JTdXBwb3J0ZWQoZWRpdG9yKSkge1xuICAgICAgICAgIHJldHVybiBwcm92aWRlcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0sXG4gICAgKSk7XG4gICAgc3VwcG9ydGVkID0gYXJyYXkuY29tcGFjdChzdXBwb3J0ZWQpO1xuICAgIGlmIChzdXBwb3J0ZWQubGVuZ3RoKSB7XG4gICAgICBlbmFibGVGb3JFZGl0b3IoZWRpdG9yKTtcbiAgICB9XG4gICAgc3VwcG9ydGVkUHJvdmlkZXJzLnNldChlZGl0b3IsIHN1cHBvcnRlZCk7XG4gICAgaWYgKHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgc3VwcG9ydGVkUHJvdmlkZXJzLmRlbGV0ZShlZGl0b3IpO1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbnMucmVtb3ZlKGRpc3Bvc2FibGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpc3Bvc2FibGUpO1xuICAgIH1cbiAgfSkpO1xuXG4gIC8vIEVuYWJsZSB0ZXh0IGNvcHkgZnJvbSB0aGUgc3ltYm9sIHJlZmVyZW5jZSB2aWV3XG4gIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICdudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy12aWV3JyxcbiAgICAnY29yZTpjb3B5JyxcbiAgICAoKSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3RlZFRleHQgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKTtcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNlbGVjdGVkVGV4dCk7XG4gICAgfVxuICApKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gIGlmIChzdWJzY3JpcHRpb25zKSB7XG4gICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gIH1cbiAgcHJvdmlkZXJzID0gW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lUHJvdmlkZXIocHJvdmlkZXI6IEZpbmRSZWZlcmVuY2VzUHJvdmlkZXIpOiB2b2lkIHtcbiAgcHJvdmlkZXJzLnB1c2gocHJvdmlkZXIpO1xuICAvLyBFZGl0b3JzIGFyZSBvZnRlbiBvcGVuIGJlZm9yZSBwcm92aWRlcnMgbG9hZCwgc28gdXBkYXRlIGV4aXN0aW5nIG9uZXMgdG9vLlxuICBzdXBwb3J0ZWRQcm92aWRlcnMuZm9yRWFjaChhc3luYyAoc3VwcG9ydGVkLCBlZGl0b3IpID0+IHtcbiAgICBpZiAoYXdhaXQgcHJvdmlkZXIuaXNFZGl0b3JTdXBwb3J0ZWQoZWRpdG9yKSkge1xuICAgICAgaWYgKCFzdXBwb3J0ZWQubGVuZ3RoKSB7XG4gICAgICAgIGVuYWJsZUZvckVkaXRvcihlZGl0b3IpO1xuICAgICAgfVxuICAgICAgc3VwcG9ydGVkLnB1c2gocHJvdmlkZXIpO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=