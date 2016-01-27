

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var subscriptions = null;

module.exports = {

  activate: function activate(state) {
    if (subscriptions) {
      return;
    }

    var formatCode = require('./formatCode');

    var _require2 = require('./settings');

    var calculateOptions = _require2.calculateOptions;
    var observeSettings = _require2.observeSettings;

    var localSubscriptions = new CompositeDisposable();
    localSubscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-format-js:format',
    // Atom prevents in-command modification to text editor content.
    function () {
      return process.nextTick(function () {
        return formatCode(options);
      });
    }));

    // Keep settings up to date with Nuclide config and precalculate options.
    var settings = undefined;
    var options = undefined;
    localSubscriptions.add(observeSettings(function (newSettings) {
      settings = newSettings;
      options = calculateOptions(settings);
    }));

    // Format code on save if settings say so
    localSubscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      localSubscriptions.add(editor.onDidSave(function () {
        if (settings.runOnSave) {
          process.nextTick(function () {
            return formatCode(options, editor);
          });
        }
      }));
    }));

    // Work around flow refinements.
    subscriptions = localSubscriptions;
  },

  deactivate: function deactivate() {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztlQWM4QixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF0QyxtQkFBbUIsWUFBbkIsbUJBQW1COztBQUUxQixJQUFJLGFBQW1DLEdBQUcsSUFBSSxDQUFDOztBQUUvQyxNQUFNLENBQUMsT0FBTyxHQUFHOztBQUVmLFVBQVEsRUFBQSxrQkFBQyxLQUFjLEVBQVE7QUFDN0IsUUFBSSxhQUFhLEVBQUU7QUFDakIsYUFBTztLQUNSOztBQUVELFFBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQzs7b0JBQ0csT0FBTyxDQUFDLFlBQVksQ0FBQzs7UUFBM0QsZ0JBQWdCLGFBQWhCLGdCQUFnQjtRQUFFLGVBQWUsYUFBZixlQUFlOztBQUV6QyxRQUFNLGtCQUFrQixHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUNyRCxzQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ3RDLGtCQUFrQixFQUNsQiwwQkFBMEI7O0FBRTFCO2FBQU0sT0FBTyxDQUFDLFFBQVEsQ0FBQztlQUFNLFVBQVUsQ0FBQyxPQUFPLENBQUM7T0FBQSxDQUFDO0tBQUEsQ0FDbEQsQ0FBQyxDQUFDOzs7QUFHSCxRQUFJLFFBQWtCLFlBQUEsQ0FBQztBQUN2QixRQUFJLE9BQXNCLFlBQUEsQ0FBQztBQUMzQixzQkFBa0IsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLFVBQUEsV0FBVyxFQUFJO0FBQ3BELGNBQVEsR0FBRyxXQUFXLENBQUM7QUFDdkIsYUFBTyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3RDLENBQUMsQ0FBQyxDQUFDOzs7QUFHSixzQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUNqRSx3QkFBa0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFNO0FBQzVDLFlBQUksUUFBUSxDQUFDLFNBQVMsRUFBRTtBQUN0QixpQkFBTyxDQUFDLFFBQVEsQ0FBQzttQkFBTSxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztXQUFBLENBQUMsQ0FBQztTQUNyRDtPQUNGLENBQUMsQ0FBQyxDQUFDO0tBQ0wsQ0FBQyxDQUFDLENBQUM7OztBQUdKLGlCQUFhLEdBQUcsa0JBQWtCLENBQUM7R0FDcEM7O0FBRUQsWUFBVSxFQUFBLHNCQUFTO0FBQ2pCLFFBQUksYUFBYSxFQUFFO0FBQ2pCLG1CQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDeEIsbUJBQWEsR0FBRyxJQUFJLENBQUM7S0FDdEI7R0FDRjtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtTb3VyY2VPcHRpb25zfSBmcm9tICcuLi8uLi9mb3JtYXQtanMtYmFzZS9saWIvb3B0aW9ucy9Tb3VyY2VPcHRpb25zJztcbmltcG9ydCB0eXBlIHtTZXR0aW5nc30gZnJvbSAnLi9zZXR0aW5ncyc7XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxubGV0IHN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZvcm1hdENvZGUgPSByZXF1aXJlKCcuL2Zvcm1hdENvZGUnKTtcbiAgICBjb25zdCB7IGNhbGN1bGF0ZU9wdGlvbnMsIG9ic2VydmVTZXR0aW5ncyB9ID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpO1xuXG4gICAgY29uc3QgbG9jYWxTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBsb2NhbFN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ251Y2xpZGUtZm9ybWF0LWpzOmZvcm1hdCcsXG4gICAgICAvLyBBdG9tIHByZXZlbnRzIGluLWNvbW1hbmQgbW9kaWZpY2F0aW9uIHRvIHRleHQgZWRpdG9yIGNvbnRlbnQuXG4gICAgICAoKSA9PiBwcm9jZXNzLm5leHRUaWNrKCgpID0+IGZvcm1hdENvZGUob3B0aW9ucykpXG4gICAgKSk7XG5cbiAgICAvLyBLZWVwIHNldHRpbmdzIHVwIHRvIGRhdGUgd2l0aCBOdWNsaWRlIGNvbmZpZyBhbmQgcHJlY2FsY3VsYXRlIG9wdGlvbnMuXG4gICAgbGV0IHNldHRpbmdzOiBTZXR0aW5ncztcbiAgICBsZXQgb3B0aW9uczogU291cmNlT3B0aW9ucztcbiAgICBsb2NhbFN1YnNjcmlwdGlvbnMuYWRkKG9ic2VydmVTZXR0aW5ncyhuZXdTZXR0aW5ncyA9PiB7XG4gICAgICBzZXR0aW5ncyA9IG5ld1NldHRpbmdzO1xuICAgICAgb3B0aW9ucyA9IGNhbGN1bGF0ZU9wdGlvbnMoc2V0dGluZ3MpO1xuICAgIH0pKTtcblxuICAgIC8vIEZvcm1hdCBjb2RlIG9uIHNhdmUgaWYgc2V0dGluZ3Mgc2F5IHNvXG4gICAgbG9jYWxTdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHtcbiAgICAgIGxvY2FsU3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkU2F2ZSgoKSA9PiB7XG4gICAgICAgIGlmIChzZXR0aW5ncy5ydW5PblNhdmUpIHtcbiAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IGZvcm1hdENvZGUob3B0aW9ucywgZWRpdG9yKSk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICB9KSk7XG5cbiAgICAvLyBXb3JrIGFyb3VuZCBmbG93IHJlZmluZW1lbnRzLlxuICAgIHN1YnNjcmlwdGlvbnMgPSBsb2NhbFN1YnNjcmlwdGlvbnM7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xuICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICBzdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuIl19