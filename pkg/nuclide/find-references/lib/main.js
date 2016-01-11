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
  (0, _analytics.track)('find-references:activate', {
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
      (0, _analytics.track)('find-references:error', { message: data.message });
      showError(data.message);
    } else if (!data.references.length) {
      (0, _analytics.track)('find-references:success', { resultCount: '0' });
      showError('No references found.');
    } else {
      var _baseUri = data.baseUri;
      var _referencedSymbolName = data.referencedSymbolName;
      var _references = data.references;

      (0, _analytics.track)('find-references:success', {
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

    var _require = require('../../logging');

    var getLogger = _require.getLogger;

    getLogger().error('Exception in nuclide-find-references', e);
    showError(e);
  }
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require('atom');

var _commons = require('../../commons');

var _analytics = require('../../analytics');

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

module.exports = {

  activate: function activate(state) {
    subscriptions = new _atom.CompositeDisposable();
    subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-find-references:activate', _asyncToGenerator(function* () {
      var view = yield tryCreateView();
      if (view != null) {
        (function () {
          // Generate a unique identifier.
          var crypto = require('crypto');
          var id = (crypto.randomBytes(8) || '').toString('hex');
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
      supported = _commons.array.compact(supported);
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
  },

  deactivate: function deactivate() {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
    providers = [];
  },

  consumeProvider: function consumeProvider(provider) {
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

};

// Return true if your provider supports finding references for the provided TextEditor.

// `findReferences` will only be called if `isEditorSupported` previously returned true
// for the given TextEditor.
//# sourceMappingURL=data:application/json;base64,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ZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3pCO0FBQ0Qsd0JBQWtCLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMxQyxVQUFJLGFBQWEsRUFBRTs7QUFDakIsY0FBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFNO0FBQzNDLDhCQUFrQixVQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEMsZ0JBQUksYUFBYSxFQUFFO0FBQ2pCLDJCQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ2xDO1dBQ0YsQ0FBQyxDQUFDO0FBQ0gsdUJBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7O09BQy9CO0tBQ0YsRUFBQyxDQUFDLENBQUM7R0FDTDs7QUFFRCxZQUFVLEVBQUEsc0JBQVM7QUFDakIsUUFBSSxhQUFhLEVBQUU7QUFDakIsbUJBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QixtQkFBYSxHQUFHLElBQUksQ0FBQztLQUN0QjtBQUNELGFBQVMsR0FBRyxFQUFFLENBQUM7R0FDaEI7O0FBRUQsaUJBQWUsRUFBQSx5QkFBQyxRQUFnQyxFQUFRO0FBQ3RELGFBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRXpCLHNCQUFrQixDQUFDLE9BQU8sbUJBQUMsV0FBTyxTQUFTLEVBQUUsTUFBTSxFQUFLO0FBQ3RELFVBQUksTUFBTSxRQUFRLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDNUMsWUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDckIseUJBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN6QjtBQUNELGlCQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzFCO0tBQ0YsRUFBQyxDQUFDO0dBQ0o7O0NBRUYsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1JlZmVyZW5jZX0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmV4cG9ydCB0eXBlIEZpbmRSZWZlcmVuY2VzRGF0YSA9IHtcbiAgdHlwZTogJ2RhdGEnLFxuICBiYXNlVXJpOiBzdHJpbmcsXG4gIHJlZmVyZW5jZWRTeW1ib2xOYW1lOiBzdHJpbmcsXG4gIHJlZmVyZW5jZXM6IEFycmF5PFJlZmVyZW5jZT4sXG59O1xuXG5leHBvcnQgdHlwZSBGaW5kUmVmZXJlbmNlc0Vycm9yID0ge1xuICB0eXBlOiAnZXJyb3InLFxuICBtZXNzYWdlOiBzdHJpbmcsXG59O1xuXG5leHBvcnQgdHlwZSBGaW5kUmVmZXJlbmNlc1JldHVybiA9IEZpbmRSZWZlcmVuY2VzRGF0YSB8IEZpbmRSZWZlcmVuY2VzRXJyb3I7XG5cbmV4cG9ydCB0eXBlIEZpbmRSZWZlcmVuY2VzUHJvdmlkZXIgPSB7XG4gIC8vIFJldHVybiB0cnVlIGlmIHlvdXIgcHJvdmlkZXIgc3VwcG9ydHMgZmluZGluZyByZWZlcmVuY2VzIGZvciB0aGUgcHJvdmlkZWQgVGV4dEVkaXRvci5cbiAgaXNFZGl0b3JTdXBwb3J0ZWQoZWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTxib29sZWFuPjtcblxuICAvLyBgZmluZFJlZmVyZW5jZXNgIHdpbGwgb25seSBiZSBjYWxsZWQgaWYgYGlzRWRpdG9yU3VwcG9ydGVkYCBwcmV2aW91c2x5IHJldHVybmVkIHRydWVcbiAgLy8gZm9yIHRoZSBnaXZlbiBUZXh0RWRpdG9yLlxuICBmaW5kUmVmZXJlbmNlcyhlZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTw/RmluZFJlZmVyZW5jZXNSZXR1cm4+O1xufTtcblxuY29uc3QgRklORF9SRUZFUkVOQ0VTX1VSSSA9ICdhdG9tOi8vbnVjbGlkZS9maW5kLXJlZmVyZW5jZXMvJztcblxubGV0IHN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcbmxldCBwcm92aWRlcnM6IEFycmF5PEZpbmRSZWZlcmVuY2VzUHJvdmlkZXI+ID0gW107XG5jb25zdCBzdXBwb3J0ZWRQcm92aWRlcnM6IE1hcDxUZXh0RWRpdG9yLCBBcnJheTxGaW5kUmVmZXJlbmNlc1Byb3ZpZGVyPj4gPSBuZXcgTWFwKCk7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFByb3ZpZGVyRGF0YSgpOiBQcm9taXNlPD9GaW5kUmVmZXJlbmNlc1JldHVybj4ge1xuICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gIGlmICghZWRpdG9yKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgcGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gIGlmICghcGF0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHBvaW50ID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gIHRyYWNrKCdmaW5kLXJlZmVyZW5jZXM6YWN0aXZhdGUnLCB7XG4gICAgcGF0aCxcbiAgICByb3c6IHBvaW50LnJvdy50b1N0cmluZygpLFxuICAgIGNvbHVtbjogcG9pbnQuY29sdW1uLnRvU3RyaW5nKCksXG4gIH0pO1xuICBjb25zdCBzdXBwb3J0ZWQgPSBzdXBwb3J0ZWRQcm92aWRlcnMuZ2V0KGVkaXRvcik7XG4gIGlmICghc3VwcG9ydGVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgcHJvdmlkZXJEYXRhID0gYXdhaXQgUHJvbWlzZS5hbGwoc3VwcG9ydGVkLm1hcChcbiAgICBwcm92aWRlciA9PiBwcm92aWRlci5maW5kUmVmZXJlbmNlcyhlZGl0b3IsIHBvaW50KVxuICApKTtcbiAgcmV0dXJuIHByb3ZpZGVyRGF0YS5maWx0ZXIoeCA9PiAhIXgpWzBdO1xufVxuXG5mdW5jdGlvbiBzaG93RXJyb3IobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignbnVjbGlkZS1maW5kLXJlZmVyZW5jZXM6ICcgKyBtZXNzYWdlLCB7ZGlzbWlzc2FibGU6IHRydWV9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdHJ5Q3JlYXRlVmlldygpOiBQcm9taXNlPD9IVE1MRWxlbWVudD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBnZXRQcm92aWRlckRhdGEoKTtcbiAgICBpZiAoZGF0YSA9PSBudWxsKSB7XG4gICAgICBzaG93RXJyb3IoJ1N5bWJvbCByZWZlcmVuY2VzIGFyZSBub3QgYXZhaWxhYmxlIGZvciB0aGlzIHByb2plY3QuJyk7XG4gICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgIHRyYWNrKCdmaW5kLXJlZmVyZW5jZXM6ZXJyb3InLCB7bWVzc2FnZTogZGF0YS5tZXNzYWdlfSk7XG4gICAgICBzaG93RXJyb3IoZGF0YS5tZXNzYWdlKTtcbiAgICB9IGVsc2UgaWYgKCFkYXRhLnJlZmVyZW5jZXMubGVuZ3RoKSB7XG4gICAgICB0cmFjaygnZmluZC1yZWZlcmVuY2VzOnN1Y2Nlc3MnLCB7cmVzdWx0Q291bnQ6ICcwJ30pO1xuICAgICAgc2hvd0Vycm9yKCdObyByZWZlcmVuY2VzIGZvdW5kLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7YmFzZVVyaSwgcmVmZXJlbmNlZFN5bWJvbE5hbWUsIHJlZmVyZW5jZXN9ID0gZGF0YTtcbiAgICAgIHRyYWNrKCdmaW5kLXJlZmVyZW5jZXM6c3VjY2VzcycsIHtcbiAgICAgICAgYmFzZVVyaSxcbiAgICAgICAgcmVmZXJlbmNlZFN5bWJvbE5hbWUsXG4gICAgICAgIHJlc3VsdENvdW50OiByZWZlcmVuY2VzLmxlbmd0aC50b1N0cmluZygpLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBGaW5kUmVmZXJlbmNlc01vZGVsID0gcmVxdWlyZSgnLi9GaW5kUmVmZXJlbmNlc01vZGVsJyk7XG4gICAgICBjb25zdCBtb2RlbCA9IG5ldyBGaW5kUmVmZXJlbmNlc01vZGVsKFxuICAgICAgICBiYXNlVXJpLFxuICAgICAgICByZWZlcmVuY2VkU3ltYm9sTmFtZSxcbiAgICAgICAgcmVmZXJlbmNlc1xuICAgICAgKTtcblxuICAgICAgY29uc3QgRmluZFJlZmVyZW5jZXNFbGVtZW50ID0gcmVxdWlyZSgnLi9GaW5kUmVmZXJlbmNlc0VsZW1lbnQnKTtcbiAgICAgIHJldHVybiBuZXcgRmluZFJlZmVyZW5jZXNFbGVtZW50KCkuaW5pdGlhbGl6ZShtb2RlbCk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gVE9ETyhwZXRlcmhhbCk6IFJlbW92ZSB0aGlzIHdoZW4gdW5oYW5kbGVkIHJlamVjdGlvbnMgaGF2ZSBhIGRlZmF1bHQgaGFuZGxlci5cbiAgICBjb25zdCB7Z2V0TG9nZ2VyfSA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKTtcbiAgICBnZXRMb2dnZXIoKS5lcnJvcignRXhjZXB0aW9uIGluIG51Y2xpZGUtZmluZC1yZWZlcmVuY2VzJywgZSk7XG4gICAgc2hvd0Vycm9yKGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuYWJsZUZvckVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgY29uc3QgZWxlbSA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpO1xuICBlbGVtLmNsYXNzTGlzdC5hZGQoJ2VuYWJsZS1udWNsaWRlLWZpbmQtcmVmZXJlbmNlcycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY3RpdmF0ZShzdGF0ZTogP2FueSk6IHZvaWQge1xuICAgIHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ251Y2xpZGUtZmluZC1yZWZlcmVuY2VzOmFjdGl2YXRlJyxcbiAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdmlldyA9IGF3YWl0IHRyeUNyZWF0ZVZpZXcoKTtcbiAgICAgICAgaWYgKHZpZXcgIT0gbnVsbCkge1xuICAgICAgICAgIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGlkZW50aWZpZXIuXG4gICAgICAgICAgY29uc3QgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG4gICAgICAgICAgY29uc3QgaWQgPSAoY3J5cHRvLnJhbmRvbUJ5dGVzKDgpIHx8ICcnKS50b1N0cmluZygnaGV4Jyk7XG4gICAgICAgICAgY29uc3QgdXJpID0gRklORF9SRUZFUkVOQ0VTX1VSSSArIGlkO1xuICAgICAgICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIoKG5ld1VyaSkgPT4ge1xuICAgICAgICAgICAgaWYgKHVyaSA9PT0gbmV3VXJpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB2aWV3O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4odXJpKTtcbiAgICAgICAgICAvLyBUaGUgbmV3IHRhYiBvcGVucyBpbnN0YW50bHksIHNvIHRoaXMgaXMgbm8gbG9uZ2VyIG5lZWRlZC5cbiAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICkpO1xuXG4gICAgLy8gTWFyayB0ZXh0IGVkaXRvcnMgd2l0aCBhIHdvcmtpbmcgcHJvdmlkZXIgd2l0aCBhIHNwZWNpYWwgQ1NTIGNsYXNzLlxuICAgIC8vIFRoaXMgZW5zdXJlcyB0aGUgY29udGV4dCBtZW51IG9wdGlvbiBvbmx5IGFwcGVhcnMgaW4gc3VwcG9ydGVkIHByb2plY3RzLlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhhc3luYyAoZWRpdG9yKSA9PiB7XG4gICAgICBjb25zdCBwYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmICghcGF0aCB8fCBzdXBwb3J0ZWRQcm92aWRlcnMuZ2V0KGVkaXRvcikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGV0IHN1cHBvcnRlZCA9IGF3YWl0IFByb21pc2UuYWxsKHByb3ZpZGVycy5tYXAoXG4gICAgICAgIGFzeW5jIChwcm92aWRlcikgPT4ge1xuICAgICAgICAgIGlmIChhd2FpdCBwcm92aWRlci5pc0VkaXRvclN1cHBvcnRlZChlZGl0b3IpKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuICAgICAgKSk7XG4gICAgICBzdXBwb3J0ZWQgPSBhcnJheS5jb21wYWN0KHN1cHBvcnRlZCk7XG4gICAgICBpZiAoc3VwcG9ydGVkLmxlbmd0aCkge1xuICAgICAgICBlbmFibGVGb3JFZGl0b3IoZWRpdG9yKTtcbiAgICAgIH1cbiAgICAgIHN1cHBvcnRlZFByb3ZpZGVycy5zZXQoZWRpdG9yLCBzdXBwb3J0ZWQpO1xuICAgICAgaWYgKHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZGlzcG9zYWJsZSA9IGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgIHN1cHBvcnRlZFByb3ZpZGVycy5kZWxldGUoZWRpdG9yKTtcbiAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy5yZW1vdmUoZGlzcG9zYWJsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoZGlzcG9zYWJsZSk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgaWYgKHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICAgIHByb3ZpZGVycyA9IFtdO1xuICB9LFxuXG4gIGNvbnN1bWVQcm92aWRlcihwcm92aWRlcjogRmluZFJlZmVyZW5jZXNQcm92aWRlcik6IHZvaWQge1xuICAgIHByb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgICAvLyBFZGl0b3JzIGFyZSBvZnRlbiBvcGVuIGJlZm9yZSBwcm92aWRlcnMgbG9hZCwgc28gdXBkYXRlIGV4aXN0aW5nIG9uZXMgdG9vLlxuICAgIHN1cHBvcnRlZFByb3ZpZGVycy5mb3JFYWNoKGFzeW5jIChzdXBwb3J0ZWQsIGVkaXRvcikgPT4ge1xuICAgICAgaWYgKGF3YWl0IHByb3ZpZGVyLmlzRWRpdG9yU3VwcG9ydGVkKGVkaXRvcikpIHtcbiAgICAgICAgaWYgKCFzdXBwb3J0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgZW5hYmxlRm9yRWRpdG9yKGVkaXRvcik7XG4gICAgICAgIH1cbiAgICAgICAgc3VwcG9ydGVkLnB1c2gocHJvdmlkZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG59O1xuIl19