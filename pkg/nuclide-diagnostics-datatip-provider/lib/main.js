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
  if (!(yield (0, _nuclideCommons.passesGK)(GK_DEBUGGER_DATATIPS, GK_TIMEOUT))) {
    return null;
  }
  (0, _assert2['default'])(fileDiagnostics);
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

  (0, _assert2['default'])(range);
  return {
    component: (0, _DiagnosticsDatatipComponent.makeDiagnosticsDatatipComponent)(message),
    pinnable: false,
    range: range
  };
});

exports.datatip = datatip;
exports.consumeDatatipService = consumeDatatipService;
exports.activate = activate;
exports.consumeDiagnosticUpdates = consumeDiagnosticUpdates;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _DiagnosticsDatatipComponent = require('./DiagnosticsDatatipComponent');

var _nuclideCommons = require('../../nuclide-commons');

var GK_DEBUGGER_DATATIPS = 'nuclide_diagnostics_datatips';
var GK_TIMEOUT = 1000;

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
  (0, _assert2['default'])(disposables);
  service.addProvider(datatipProvider);
  var disposable = new _atom.Disposable(function () {
    return service.removeProvider(datatipProvider);
  });
  disposables.add(disposable);
  return disposable;
}

var disposables = null;
var fileDiagnostics = null;

function activate(state) {
  disposables = new _atom.CompositeDisposable();
  fileDiagnostics = new WeakMap();
}

function consumeDiagnosticUpdates(diagnosticUpdater) {
  (0, _assert2['default'])(disposables);
  disposables.add(atom.workspace.observeTextEditors(function (editor) {
    (0, _assert2['default'])(fileDiagnostics);
    var filePath = editor.getPath();
    if (!filePath) {
      return;
    }
    fileDiagnostics.set(editor, []);
    var callback = function callback(update) {
      (0, _assert2['default'])(fileDiagnostics);
      fileDiagnostics.set(editor, update.messages);
    };
    var disposable = diagnosticUpdater.onFileMessagesDidUpdate(callback, filePath);

    editor.onDidDestroy(function () {
      disposable.dispose();
      if (fileDiagnostics != null) {
        fileDiagnostics['delete'](editor);
      }
    });
    (0, _assert2['default'])(disposables);
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
//# sourceMappingURL=data:application/json;base64,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LE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNoQyxRQUFNLFFBQVEsR0FBRyxTQUFYLFFBQVEsQ0FBSSxNQUFNLEVBQXdCO0FBQzlDLCtCQUFVLGVBQWUsQ0FBQyxDQUFDO0FBQzNCLHFCQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDOUMsQ0FBQztBQUNGLFFBQU0sVUFBVSxHQUFHLGlCQUFpQixDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFakYsVUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFNO0FBQ3hCLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsVUFBSSxlQUFlLElBQUksSUFBSSxFQUFFO0FBQzNCLHVCQUFlLFVBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNoQztLQUNGLENBQUMsQ0FBQztBQUNILDZCQUFVLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZCLGVBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDN0IsQ0FBQyxDQUFDLENBQUM7Q0FDTDs7QUFFTSxTQUFTLFVBQVUsR0FBUztBQUNqQyxNQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDdkIsZUFBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3RCLGVBQVcsR0FBRyxJQUFJLENBQUM7R0FDcEI7QUFDRCxpQkFBZSxHQUFHLElBQUksQ0FBQztDQUN4QiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBEYXRhdGlwLFxuICBEYXRhdGlwUHJvdmlkZXIsXG4gIERhdGF0aXBTZXJ2aWNlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRhdGF0aXAtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7XG4gIERpYWdub3N0aWNVcGRhdGVyLFxuICBGaWxlTWVzc2FnZVVwZGF0ZSxcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuXG5pbXBvcnQge1xuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBEaXNwb3NhYmxlLFxufSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7bWFrZURpYWdub3N0aWNzRGF0YXRpcENvbXBvbmVudH0gZnJvbSAnLi9EaWFnbm9zdGljc0RhdGF0aXBDb21wb25lbnQnO1xuaW1wb3J0IHtwYXNzZXNHS30gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuXG5jb25zdCBHS19ERUJVR0dFUl9EQVRBVElQUyA9ICdudWNsaWRlX2RpYWdub3N0aWNzX2RhdGF0aXBzJztcbmNvbnN0IEdLX1RJTUVPVVQgPSAxMDAwO1xuXG5jb25zdCBEQVRBVElQX1BBQ0tBR0VfTkFNRSA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWRhdGF0aXAnO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRhdGF0aXAoZWRpdG9yOiBUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCk6IFByb21pc2U8P0RhdGF0aXA+IHtcbiAgaWYgKCFhd2FpdCBwYXNzZXNHSyhHS19ERUJVR0dFUl9EQVRBVElQUywgR0tfVElNRU9VVCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpbnZhcmlhbnQoZmlsZURpYWdub3N0aWNzKTtcbiAgY29uc3QgbWVzc2FnZXNGb3JGaWxlID0gZmlsZURpYWdub3N0aWNzLmdldChlZGl0b3IpO1xuICBpZiAobWVzc2FnZXNGb3JGaWxlID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBtZXNzYWdlc0F0UG9zaXRpb24gPSBtZXNzYWdlc0ZvckZpbGUuZmlsdGVyKFxuICAgIG1lc3NhZ2UgPT4gbWVzc2FnZS5yYW5nZSAhPSBudWxsICYmIG1lc3NhZ2UucmFuZ2UuY29udGFpbnNQb2ludChwb3NpdGlvbilcbiAgKTtcbiAgaWYgKG1lc3NhZ2VzQXRQb3NpdGlvbi5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBbbWVzc2FnZV0gPSBtZXNzYWdlc0F0UG9zaXRpb247XG4gIGNvbnN0IHtyYW5nZX0gPSBtZXNzYWdlO1xuICBpbnZhcmlhbnQocmFuZ2UpO1xuICByZXR1cm4ge1xuICAgIGNvbXBvbmVudDogbWFrZURpYWdub3N0aWNzRGF0YXRpcENvbXBvbmVudChtZXNzYWdlKSxcbiAgICBwaW5uYWJsZTogZmFsc2UsXG4gICAgcmFuZ2U6IHJhbmdlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXREYXRhdGlwUHJvdmlkZXIoKTogRGF0YXRpcFByb3ZpZGVyIHtcbiAgcmV0dXJuIHtcbiAgICAvLyBzaG93IHRoaXMgZGF0YXRpcCBmb3IgZXZlcnkgdHlwZSBvZiBmaWxlXG4gICAgdmFsaWRGb3JTY29wZTogKHNjb3BlOiBzdHJpbmcpID0+IHRydWUsXG4gICAgcHJvdmlkZXJOYW1lOiBEQVRBVElQX1BBQ0tBR0VfTkFNRSxcbiAgICBpbmNsdXNpb25Qcmlvcml0eTogMSxcbiAgICBkYXRhdGlwLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZURhdGF0aXBTZXJ2aWNlKHNlcnZpY2U6IERhdGF0aXBTZXJ2aWNlKTogSURpc3Bvc2FibGUge1xuICBjb25zdCBkYXRhdGlwUHJvdmlkZXIgPSBnZXREYXRhdGlwUHJvdmlkZXIoKTtcbiAgaW52YXJpYW50KGRpc3Bvc2FibGVzKTtcbiAgc2VydmljZS5hZGRQcm92aWRlcihkYXRhdGlwUHJvdmlkZXIpO1xuICBjb25zdCBkaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUoKCkgPT4gc2VydmljZS5yZW1vdmVQcm92aWRlcihkYXRhdGlwUHJvdmlkZXIpKTtcbiAgZGlzcG9zYWJsZXMuYWRkKGRpc3Bvc2FibGUpO1xuICByZXR1cm4gZGlzcG9zYWJsZTtcbn1cblxubGV0IGRpc3Bvc2FibGVzOiA/Q29tcG9zaXRlRGlzcG9zYWJsZSA9IG51bGw7XG5sZXQgZmlsZURpYWdub3N0aWNzOiA/V2Vha01hcDxUZXh0RWRpdG9yLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP21peGVkKTogdm9pZCB7XG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgZmlsZURpYWdub3N0aWNzID0gbmV3IFdlYWtNYXAoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVEaWFnbm9zdGljVXBkYXRlcyhkaWFnbm9zdGljVXBkYXRlcjogRGlhZ25vc3RpY1VwZGF0ZXIpOiB2b2lkIHtcbiAgaW52YXJpYW50KGRpc3Bvc2FibGVzKTtcbiAgZGlzcG9zYWJsZXMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycygoZWRpdG9yOiBUZXh0RWRpdG9yKSA9PiB7XG4gICAgaW52YXJpYW50KGZpbGVEaWFnbm9zdGljcyk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZmlsZURpYWdub3N0aWNzLnNldChlZGl0b3IsIFtdKTtcbiAgICBjb25zdCBjYWxsYmFjayA9ICh1cGRhdGU6IEZpbGVNZXNzYWdlVXBkYXRlKSA9PiB7XG4gICAgICBpbnZhcmlhbnQoZmlsZURpYWdub3N0aWNzKTtcbiAgICAgIGZpbGVEaWFnbm9zdGljcy5zZXQoZWRpdG9yLCB1cGRhdGUubWVzc2FnZXMpO1xuICAgIH07XG4gICAgY29uc3QgZGlzcG9zYWJsZSA9IGRpYWdub3N0aWNVcGRhdGVyLm9uRmlsZU1lc3NhZ2VzRGlkVXBkYXRlKGNhbGxiYWNrLCBmaWxlUGF0aCk7XG5cbiAgICBlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgaWYgKGZpbGVEaWFnbm9zdGljcyAhPSBudWxsKSB7XG4gICAgICAgIGZpbGVEaWFnbm9zdGljcy5kZWxldGUoZWRpdG9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpbnZhcmlhbnQoZGlzcG9zYWJsZXMpO1xuICAgIGRpc3Bvc2FibGVzLmFkZChkaXNwb3NhYmxlKTtcbiAgfSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgaWYgKGRpc3Bvc2FibGVzICE9IG51bGwpIHtcbiAgICBkaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgZGlzcG9zYWJsZXMgPSBudWxsO1xuICB9XG4gIGZpbGVEaWFnbm9zdGljcyA9IG51bGw7XG59XG4iXX0=