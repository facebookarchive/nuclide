var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('../../remote-uri');

var getPath = _require2.getPath;

var _require3 = require('../../analytics');

var trackOperationTiming = _require3.trackOperationTiming;

function copyAbsolutePath() {
  trackOperation('copyAbsolutePath', function () {
    var uri = getCurrentNuclideUri();
    if (!uri) {
      return;
    }
    copyToClipboard('Copied absolute path', getPath(uri));
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
      copyToClipboard('Path not contained in any open project.\nCopied absolute path', getPath(uri));
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
      copyToClipboard('Path not contained in any repository.\nCopied absolute path', getPath(uri));
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
  var _require4 = require('../../arcanist-client');

  var getProjectRelativePath = _require4.getProjectRelativePath;

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
  trackOperationTiming('nuclide-clipboard-path:' + eventName, operation);
}

function notify(message) {
  atom.notifications.addInfo(message);
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._subscriptions = new CompositeDisposable();
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

module.exports = {

  activate: function activate(state) {
    if (!activation) {
      activation = new Activation();
    }
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  }
};
//# sourceMappingURL=data:application/json;base64,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QUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQ2xDLHNEQUFzRCxFQUFFLDBCQUEwQixDQUFDLENBQ3BGLENBQUM7QUFDRixRQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQ2xDLG1EQUFtRCxFQUFFLHVCQUF1QixDQUFDLENBQzlFLENBQUM7R0FDSDs7ZUFqQkcsVUFBVTs7V0FtQlAsbUJBQUc7QUFDUixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7U0FyQkcsVUFBVTs7O0FBd0JoQixJQUFJLFVBQXVCLEdBQUcsSUFBSSxDQUFDOztBQUVuQyxNQUFNLENBQUMsT0FBTyxHQUFHOztBQUVmLFVBQVEsRUFBQSxrQkFBQyxLQUFhLEVBQVE7QUFDNUIsUUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLGdCQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztLQUMvQjtHQUNGOztBQUVELFlBQVUsRUFBQSxzQkFBUztBQUNqQixRQUFJLFVBQVUsRUFBRTtBQUNkLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsZ0JBQVUsR0FBRyxJQUFJLENBQUM7S0FDbkI7R0FDRjtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge2dldFBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3Qge3RyYWNrT3BlcmF0aW9uVGltaW5nfSA9IHJlcXVpcmUoJy4uLy4uL2FuYWx5dGljcycpO1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmZ1bmN0aW9uIGNvcHlBYnNvbHV0ZVBhdGgoKTogdm9pZCB7XG4gIHRyYWNrT3BlcmF0aW9uKCdjb3B5QWJzb2x1dGVQYXRoJywgKCkgPT4ge1xuICAgIGNvbnN0IHVyaSA9IGdldEN1cnJlbnROdWNsaWRlVXJpKCk7XG4gICAgaWYgKCF1cmkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29weVRvQ2xpcGJvYXJkKCdDb3BpZWQgYWJzb2x1dGUgcGF0aCcsIGdldFBhdGgodXJpKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjb3B5UHJvamVjdFJlbGF0aXZlUGF0aCgpOiB2b2lkIHtcbiAgdHJhY2tPcGVyYXRpb24oJ2NvcHlQcm9qZWN0UmVsYXRpdmVQYXRoJywgKCkgPT4ge1xuICAgIGNvbnN0IHVyaSA9IGdldEN1cnJlbnROdWNsaWRlVXJpKCk7XG4gICAgaWYgKCF1cmkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9qZWN0UmVsYXRpdmVQYXRoID0gZ2V0QXRvbVByb2plY3RSZWxhdGl2ZVBhdGgodXJpKTtcbiAgICBpZiAocHJvamVjdFJlbGF0aXZlUGF0aCkge1xuICAgICAgY29weVRvQ2xpcGJvYXJkKCdDb3BpZWQgcHJvamVjdCByZWxhdGl2ZSBwYXRoJywgcHJvamVjdFJlbGF0aXZlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvcHlUb0NsaXBib2FyZChcbiAgICAgICAgJ1BhdGggbm90IGNvbnRhaW5lZCBpbiBhbnkgb3BlbiBwcm9qZWN0LlxcbkNvcGllZCBhYnNvbHV0ZSBwYXRoJyxcbiAgICAgICAgZ2V0UGF0aCh1cmkpKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjb3B5UmVwb3NpdG9yeVJlbGF0aXZlUGF0aCgpOiB2b2lkIHtcbiAgdHJhY2tPcGVyYXRpb24oJ2NvcHlSZXBvc2l0b3J5UmVsYXRpdmVQYXRoJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgY29uc3QgdXJpID0gZ2V0Q3VycmVudE51Y2xpZGVVcmkoKTtcbiAgICBpZiAoIXVyaSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZpcnN0IHNvdXJjZSBjb250cm9sIHJlbGF0aXZlLlxuICAgIGNvbnN0IHJlcG9SZWxhdGl2ZVBhdGggPSBnZXRSZXBvc2l0b3J5UmVsYXRpdmVQYXRoKHVyaSk7XG4gICAgaWYgKHJlcG9SZWxhdGl2ZVBhdGgpIHtcbiAgICAgIGNvcHlUb0NsaXBib2FyZCgnQ29waWVkIHJlcG9zaXRvcnkgcmVsYXRpdmUgcGF0aCcsIHJlcG9SZWxhdGl2ZVBhdGgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE5leHQgdHJ5IGFyY2FuaXN0IHJlbGF0aXZlLlxuICAgIGNvbnN0IGFyY1JlbGF0aXZlUGF0aCA9IGF3YWl0IGdldEFyY2FuaXN0UmVsYXRpdmVQYXRoKHVyaSk7XG4gICAgaWYgKGFyY1JlbGF0aXZlUGF0aCkge1xuICAgICAgY29weVRvQ2xpcGJvYXJkKCdDb3BpZWQgYXJjIHByb2plY3QgcmVsYXRpdmUgcGF0aCcsIGFyY1JlbGF0aXZlUGF0aCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTGFzdGx5LCBwcm9qZWN0IGFuZCBhYnNvbHV0ZS5cbiAgICBjb25zdCBwcm9qZWN0UmVsYXRpdmVQYXRoID0gZ2V0QXRvbVByb2plY3RSZWxhdGl2ZVBhdGgodXJpKTtcbiAgICBpZiAocHJvamVjdFJlbGF0aXZlUGF0aCkge1xuICAgICAgY29weVRvQ2xpcGJvYXJkKCdDb3BpZWQgcHJvamVjdCByZWxhdGl2ZSBwYXRoJywgcHJvamVjdFJlbGF0aXZlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvcHlUb0NsaXBib2FyZCgnUGF0aCBub3QgY29udGFpbmVkIGluIGFueSByZXBvc2l0b3J5LlxcbkNvcGllZCBhYnNvbHV0ZSBwYXRoJywgZ2V0UGF0aCh1cmkpKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBdG9tUHJvamVjdFJlbGF0aXZlUGF0aChwYXRoOiBOdWNsaWRlVXJpKTogP3N0cmluZyB7XG4gIGNvbnN0IFtwcm9qZWN0UGF0aCwgcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChwYXRoKTtcbiAgaWYgKCFwcm9qZWN0UGF0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiByZWxhdGl2ZVBhdGg7XG59XG5cbmZ1bmN0aW9uIGdldFJlcG9zaXRvcnlSZWxhdGl2ZVBhdGgocGF0aDogTnVjbGlkZVVyaSk6ID9zdHJpbmcge1xuICAvLyBUT0RPKHBldGVyaGFsKTogcmVwb3NpdG9yeUZvclBhdGggaXMgdGhlIHNhbWUgYXMgcHJvamVjdFJlbGF0aXZlUGF0aFxuICAvLyBvbmx5IGxlc3Mgcm9idXN0LiBXZSdsbCBuZWVkIGEgdmVyc2lvbiBvZiBmaW5kSGdSZXBvc2l0b3J5IHdoaWNoIGlzXG4gIC8vIGF3YXJlIG9mIHJlbW90ZSBwYXRocy5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldEFyY2FuaXN0UmVsYXRpdmVQYXRoKHBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgY29uc3Qge2dldFByb2plY3RSZWxhdGl2ZVBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vYXJjYW5pc3QtY2xpZW50Jyk7XG4gIHJldHVybiBnZXRQcm9qZWN0UmVsYXRpdmVQYXRoKHBhdGgpO1xufVxuXG5mdW5jdGlvbiBjb3B5VG9DbGlwYm9hcmQobWVzc2FnZVByZWZpeDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gIGF0b20uY2xpcGJvYXJkLndyaXRlKHZhbHVlKTtcbiAgbm90aWZ5KGAke21lc3NhZ2VQcmVmaXh9OiBcXGBcXGBcXGAke3ZhbHVlfVxcYFxcYFxcYGApO1xufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50TnVjbGlkZVVyaSgpOiA/TnVjbGlkZVVyaSB7XG4gIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgaWYgKCFlZGl0b3IpIHtcbiAgICBub3RpZnkoJ05vdGhpbmcgY29waWVkLiBObyBhY3RpdmUgdGV4dCBlZGl0b3IuJyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBwYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgaWYgKCFwYXRoKSB7XG4gICAgbm90aWZ5KCdOb3RoaW5nIGNvcGllZC4gQ3VycmVudCB0ZXh0IGVkaXRvciBpcyB1bm5hbWVkLicpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHBhdGg7XG59XG5cbmZ1bmN0aW9uIHRyYWNrT3BlcmF0aW9uKGV2ZW50TmFtZTogc3RyaW5nLCBvcGVyYXRpb246ICgpID0+IG1peGVkKTogdm9pZCB7XG4gIHRyYWNrT3BlcmF0aW9uVGltaW5nKCdudWNsaWRlLWNsaXBib2FyZC1wYXRoOicgKyBldmVudE5hbWUsIG9wZXJhdGlvbik7XG59XG5cbmZ1bmN0aW9uIG5vdGlmeShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8obWVzc2FnZSk7XG59XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdudWNsaWRlLWNsaXBib2FyZC1wYXRoOmNvcHktYWJzb2x1dGUtcGF0aCcsIGNvcHlBYnNvbHV0ZVBhdGgpXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnbnVjbGlkZS1jbGlwYm9hcmQtcGF0aDpjb3B5LXJlcG9zaXRvcnktcmVsYXRpdmUtcGF0aCcsIGNvcHlSZXBvc2l0b3J5UmVsYXRpdmVQYXRoKVxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ251Y2xpZGUtY2xpcGJvYXJkLXBhdGg6Y29weS1wcm9qZWN0LXJlbGF0aXZlLXBhdGgnLCBjb3B5UHJvamVjdFJlbGF0aXZlUGF0aClcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY3RpdmF0ZShzdGF0ZTogP21peGVkKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oKTtcbiAgICB9XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuIl19