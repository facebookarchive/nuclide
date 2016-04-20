Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideAnalytics = require('../../nuclide-analytics');

function copyAbsolutePath() {
  trackOperation('copyAbsolutePath', function () {
    var uri = getCurrentNuclideUri();
    if (!uri) {
      return;
    }
    copyToClipboard('Copied absolute path', (0, _nuclideRemoteUri.getPath)(uri));
  });
}

function copyProjectRelativePath() {
  trackOperation('copyProjectRelativePath', function () {
    var uri = getCurrentNuclideUri();
    if (!uri) {
      return;
    }

    var projectRelativePath = getAtomProjectRelativePath(uri);
    if (projectRelativePath) {
      copyToClipboard('Copied project relative path', projectRelativePath);
    } else {
      copyToClipboard('Path not contained in any open project.\nCopied absolute path', (0, _nuclideRemoteUri.getPath)(uri));
    }
  });
}

function copyRepositoryRelativePath() {
  trackOperation('copyRepositoryRelativePath', _asyncToGenerator(function* () {

    var uri = getCurrentNuclideUri();
    if (!uri) {
      return;
    }

    // First source control relative.
    var repoRelativePath = getRepositoryRelativePath(uri);
    if (repoRelativePath) {
      copyToClipboard('Copied repository relative path', repoRelativePath);
      return;
    }

    // Next try arcanist relative.
    var arcRelativePath = yield getArcanistRelativePath(uri);
    if (arcRelativePath) {
      copyToClipboard('Copied arc project relative path', arcRelativePath);
      return;
    }

    // Lastly, project and absolute.
    var projectRelativePath = getAtomProjectRelativePath(uri);
    if (projectRelativePath) {
      copyToClipboard('Copied project relative path', projectRelativePath);
    } else {
      copyToClipboard('Path not contained in any repository.\nCopied absolute path', (0, _nuclideRemoteUri.getPath)(uri));
    }
  }));
}

function getAtomProjectRelativePath(path) {
  var _atom$project$relativizePath = atom.project.relativizePath(path);

  var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

  var projectPath = _atom$project$relativizePath2[0];
  var relativePath = _atom$project$relativizePath2[1];

  if (!projectPath) {
    return null;
  }
  return relativePath;
}

function getRepositoryRelativePath(path) {
  // TODO(peterhal): repositoryForPath is the same as projectRelativePath
  // only less robust. We'll need a version of findHgRepository which is
  // aware of remote paths.
  return null;
}

function getArcanistRelativePath(path) {
  var _require = require('../../nuclide-arcanist-client');

  var getProjectRelativePath = _require.getProjectRelativePath;

  return getProjectRelativePath(path);
}

function copyToClipboard(messagePrefix, value) {
  atom.clipboard.write(value);
  notify(messagePrefix + ': ```' + value + '```');
}

function getCurrentNuclideUri() {
  var editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    notify('Nothing copied. No active text editor.');
    return null;
  }

  var path = editor.getPath();
  if (!path) {
    notify('Nothing copied. Current text editor is unnamed.');
    return null;
  }

  return path;
}

function trackOperation(eventName, operation) {
  (0, _nuclideAnalytics.trackOperationTiming)('nuclide-clipboard-path:' + eventName, operation);
}

function notify(message) {
  atom.notifications.addInfo(message);
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-absolute-path', copyAbsolutePath));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-repository-relative-path', copyRepositoryRelativePath));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-project-relative-path', copyProjectRelativePath));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (!activation) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}
//# sourceMappingURL=data:application/json;base64,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QUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUNsQyxtREFBbUQsRUFBRSx1QkFBdUIsQ0FBQyxDQUM5RSxDQUFDO0dBQ0g7O2VBakJHLFVBQVU7O1dBbUJQLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1NBckJHLFVBQVU7OztBQXdCaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQzs7QUFFNUIsU0FBUyxRQUFRLENBQUMsS0FBYSxFQUFRO0FBQzVDLE1BQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixjQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztHQUMvQjtDQUNGOztBQUVNLFNBQVMsVUFBVSxHQUFTO0FBQ2pDLE1BQUksVUFBVSxFQUFFO0FBQ2QsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGNBQVUsR0FBRyxJQUFJLENBQUM7R0FDbkI7Q0FDRiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Z2V0UGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmZ1bmN0aW9uIGNvcHlBYnNvbHV0ZVBhdGgoKTogdm9pZCB7XG4gIHRyYWNrT3BlcmF0aW9uKCdjb3B5QWJzb2x1dGVQYXRoJywgKCkgPT4ge1xuICAgIGNvbnN0IHVyaSA9IGdldEN1cnJlbnROdWNsaWRlVXJpKCk7XG4gICAgaWYgKCF1cmkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29weVRvQ2xpcGJvYXJkKCdDb3BpZWQgYWJzb2x1dGUgcGF0aCcsIGdldFBhdGgodXJpKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjb3B5UHJvamVjdFJlbGF0aXZlUGF0aCgpOiB2b2lkIHtcbiAgdHJhY2tPcGVyYXRpb24oJ2NvcHlQcm9qZWN0UmVsYXRpdmVQYXRoJywgKCkgPT4ge1xuICAgIGNvbnN0IHVyaSA9IGdldEN1cnJlbnROdWNsaWRlVXJpKCk7XG4gICAgaWYgKCF1cmkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9qZWN0UmVsYXRpdmVQYXRoID0gZ2V0QXRvbVByb2plY3RSZWxhdGl2ZVBhdGgodXJpKTtcbiAgICBpZiAocHJvamVjdFJlbGF0aXZlUGF0aCkge1xuICAgICAgY29weVRvQ2xpcGJvYXJkKCdDb3BpZWQgcHJvamVjdCByZWxhdGl2ZSBwYXRoJywgcHJvamVjdFJlbGF0aXZlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvcHlUb0NsaXBib2FyZChcbiAgICAgICAgJ1BhdGggbm90IGNvbnRhaW5lZCBpbiBhbnkgb3BlbiBwcm9qZWN0LlxcbkNvcGllZCBhYnNvbHV0ZSBwYXRoJyxcbiAgICAgICAgZ2V0UGF0aCh1cmkpKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjb3B5UmVwb3NpdG9yeVJlbGF0aXZlUGF0aCgpOiB2b2lkIHtcbiAgdHJhY2tPcGVyYXRpb24oJ2NvcHlSZXBvc2l0b3J5UmVsYXRpdmVQYXRoJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgY29uc3QgdXJpID0gZ2V0Q3VycmVudE51Y2xpZGVVcmkoKTtcbiAgICBpZiAoIXVyaSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZpcnN0IHNvdXJjZSBjb250cm9sIHJlbGF0aXZlLlxuICAgIGNvbnN0IHJlcG9SZWxhdGl2ZVBhdGggPSBnZXRSZXBvc2l0b3J5UmVsYXRpdmVQYXRoKHVyaSk7XG4gICAgaWYgKHJlcG9SZWxhdGl2ZVBhdGgpIHtcbiAgICAgIGNvcHlUb0NsaXBib2FyZCgnQ29waWVkIHJlcG9zaXRvcnkgcmVsYXRpdmUgcGF0aCcsIHJlcG9SZWxhdGl2ZVBhdGgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE5leHQgdHJ5IGFyY2FuaXN0IHJlbGF0aXZlLlxuICAgIGNvbnN0IGFyY1JlbGF0aXZlUGF0aCA9IGF3YWl0IGdldEFyY2FuaXN0UmVsYXRpdmVQYXRoKHVyaSk7XG4gICAgaWYgKGFyY1JlbGF0aXZlUGF0aCkge1xuICAgICAgY29weVRvQ2xpcGJvYXJkKCdDb3BpZWQgYXJjIHByb2plY3QgcmVsYXRpdmUgcGF0aCcsIGFyY1JlbGF0aXZlUGF0aCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTGFzdGx5LCBwcm9qZWN0IGFuZCBhYnNvbHV0ZS5cbiAgICBjb25zdCBwcm9qZWN0UmVsYXRpdmVQYXRoID0gZ2V0QXRvbVByb2plY3RSZWxhdGl2ZVBhdGgodXJpKTtcbiAgICBpZiAocHJvamVjdFJlbGF0aXZlUGF0aCkge1xuICAgICAgY29weVRvQ2xpcGJvYXJkKCdDb3BpZWQgcHJvamVjdCByZWxhdGl2ZSBwYXRoJywgcHJvamVjdFJlbGF0aXZlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvcHlUb0NsaXBib2FyZCgnUGF0aCBub3QgY29udGFpbmVkIGluIGFueSByZXBvc2l0b3J5LlxcbkNvcGllZCBhYnNvbHV0ZSBwYXRoJywgZ2V0UGF0aCh1cmkpKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBdG9tUHJvamVjdFJlbGF0aXZlUGF0aChwYXRoOiBOdWNsaWRlVXJpKTogP3N0cmluZyB7XG4gIGNvbnN0IFtwcm9qZWN0UGF0aCwgcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChwYXRoKTtcbiAgaWYgKCFwcm9qZWN0UGF0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiByZWxhdGl2ZVBhdGg7XG59XG5cbmZ1bmN0aW9uIGdldFJlcG9zaXRvcnlSZWxhdGl2ZVBhdGgocGF0aDogTnVjbGlkZVVyaSk6ID9zdHJpbmcge1xuICAvLyBUT0RPKHBldGVyaGFsKTogcmVwb3NpdG9yeUZvclBhdGggaXMgdGhlIHNhbWUgYXMgcHJvamVjdFJlbGF0aXZlUGF0aFxuICAvLyBvbmx5IGxlc3Mgcm9idXN0LiBXZSdsbCBuZWVkIGEgdmVyc2lvbiBvZiBmaW5kSGdSZXBvc2l0b3J5IHdoaWNoIGlzXG4gIC8vIGF3YXJlIG9mIHJlbW90ZSBwYXRocy5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldEFyY2FuaXN0UmVsYXRpdmVQYXRoKHBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgY29uc3Qge2dldFByb2plY3RSZWxhdGl2ZVBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1hcmNhbmlzdC1jbGllbnQnKTtcbiAgcmV0dXJuIGdldFByb2plY3RSZWxhdGl2ZVBhdGgocGF0aCk7XG59XG5cbmZ1bmN0aW9uIGNvcHlUb0NsaXBib2FyZChtZXNzYWdlUHJlZml4OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgYXRvbS5jbGlwYm9hcmQud3JpdGUodmFsdWUpO1xuICBub3RpZnkoYCR7bWVzc2FnZVByZWZpeH06IFxcYFxcYFxcYCR7dmFsdWV9XFxgXFxgXFxgYCk7XG59XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnROdWNsaWRlVXJpKCk6ID9OdWNsaWRlVXJpIHtcbiAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICBpZiAoIWVkaXRvcikge1xuICAgIG5vdGlmeSgnTm90aGluZyBjb3BpZWQuIE5vIGFjdGl2ZSB0ZXh0IGVkaXRvci4nKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICBpZiAoIXBhdGgpIHtcbiAgICBub3RpZnkoJ05vdGhpbmcgY29waWVkLiBDdXJyZW50IHRleHQgZWRpdG9yIGlzIHVubmFtZWQuJyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gcGF0aDtcbn1cblxuZnVuY3Rpb24gdHJhY2tPcGVyYXRpb24oZXZlbnROYW1lOiBzdHJpbmcsIG9wZXJhdGlvbjogKCkgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgdHJhY2tPcGVyYXRpb25UaW1pbmcoJ251Y2xpZGUtY2xpcGJvYXJkLXBhdGg6JyArIGV2ZW50TmFtZSwgb3BlcmF0aW9uKTtcbn1cblxuZnVuY3Rpb24gbm90aWZ5KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtZXNzYWdlKTtcbn1cblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ251Y2xpZGUtY2xpcGJvYXJkLXBhdGg6Y29weS1hYnNvbHV0ZS1wYXRoJywgY29weUFic29sdXRlUGF0aClcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdudWNsaWRlLWNsaXBib2FyZC1wYXRoOmNvcHktcmVwb3NpdG9yeS1yZWxhdGl2ZS1wYXRoJywgY29weVJlcG9zaXRvcnlSZWxhdGl2ZVBhdGgpXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnbnVjbGlkZS1jbGlwYm9hcmQtcGF0aDpjb3B5LXByb2plY3QtcmVsYXRpdmUtcGF0aCcsIGNvcHlQcm9qZWN0UmVsYXRpdmVQYXRoKVxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP21peGVkKTogdm9pZCB7XG4gIGlmICghYWN0aXZhdGlvbikge1xuICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbigpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICBpZiAoYWN0aXZhdGlvbikge1xuICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICB9XG59XG4iXX0=