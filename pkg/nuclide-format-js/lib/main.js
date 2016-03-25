

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztlQWM4QixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF0QyxtQkFBbUIsWUFBbkIsbUJBQW1COztBQUUxQixJQUFJLGFBQW1DLEdBQUcsSUFBSSxDQUFDOztBQUUvQyxNQUFNLENBQUMsT0FBTyxHQUFHOztBQUVmLFVBQVEsRUFBQSxrQkFBQyxLQUFjLEVBQVE7QUFDN0IsUUFBSSxhQUFhLEVBQUU7QUFDakIsYUFBTztLQUNSOztBQUVELFFBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQzs7b0JBQ0csT0FBTyxDQUFDLFlBQVksQ0FBQzs7UUFBM0QsZ0JBQWdCLGFBQWhCLGdCQUFnQjtRQUFFLGVBQWUsYUFBZixlQUFlOztBQUV6QyxRQUFNLGtCQUFrQixHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUNyRCxzQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ3RDLGtCQUFrQixFQUNsQiwwQkFBMEI7O0FBRTFCO2FBQU0sT0FBTyxDQUFDLFFBQVEsQ0FBQztlQUFNLFVBQVUsQ0FBQyxPQUFPLENBQUM7T0FBQSxDQUFDO0tBQUEsQ0FDbEQsQ0FBQyxDQUFDOzs7QUFHSCxRQUFJLFFBQWtCLFlBQUEsQ0FBQztBQUN2QixRQUFJLE9BQXNCLFlBQUEsQ0FBQztBQUMzQixzQkFBa0IsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLFVBQUEsV0FBVyxFQUFJO0FBQ3BELGNBQVEsR0FBRyxXQUFXLENBQUM7QUFDdkIsYUFBTyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3RDLENBQUMsQ0FBQyxDQUFDOzs7QUFHSixzQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUNqRSx3QkFBa0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFNO0FBQzVDLFlBQUksUUFBUSxDQUFDLFNBQVMsRUFBRTtBQUN0QixpQkFBTyxDQUFDLFFBQVEsQ0FBQzttQkFBTSxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztXQUFBLENBQUMsQ0FBQztTQUNyRDtPQUNGLENBQUMsQ0FBQyxDQUFDO0tBQ0wsQ0FBQyxDQUFDLENBQUM7OztBQUdKLGlCQUFhLEdBQUcsa0JBQWtCLENBQUM7R0FDcEM7O0FBRUQsWUFBVSxFQUFBLHNCQUFTO0FBQ2pCLFFBQUksYUFBYSxFQUFFO0FBQ2pCLG1CQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDeEIsbUJBQWEsR0FBRyxJQUFJLENBQUM7S0FDdEI7R0FDRjtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtTb3VyY2VPcHRpb25zfSBmcm9tICcuLi8uLi9udWNsaWRlLWZvcm1hdC1qcy1iYXNlL2xpYi9vcHRpb25zL1NvdXJjZU9wdGlvbnMnO1xuaW1wb3J0IHR5cGUge1NldHRpbmdzfSBmcm9tICcuL3NldHRpbmdzJztcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5sZXQgc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGUgPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZm9ybWF0Q29kZSA9IHJlcXVpcmUoJy4vZm9ybWF0Q29kZScpO1xuICAgIGNvbnN0IHsgY2FsY3VsYXRlT3B0aW9ucywgb2JzZXJ2ZVNldHRpbmdzIH0gPSByZXF1aXJlKCcuL3NldHRpbmdzJyk7XG5cbiAgICBjb25zdCBsb2NhbFN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGxvY2FsU3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnbnVjbGlkZS1mb3JtYXQtanM6Zm9ybWF0JyxcbiAgICAgIC8vIEF0b20gcHJldmVudHMgaW4tY29tbWFuZCBtb2RpZmljYXRpb24gdG8gdGV4dCBlZGl0b3IgY29udGVudC5cbiAgICAgICgpID0+IHByb2Nlc3MubmV4dFRpY2soKCkgPT4gZm9ybWF0Q29kZShvcHRpb25zKSlcbiAgICApKTtcblxuICAgIC8vIEtlZXAgc2V0dGluZ3MgdXAgdG8gZGF0ZSB3aXRoIE51Y2xpZGUgY29uZmlnIGFuZCBwcmVjYWxjdWxhdGUgb3B0aW9ucy5cbiAgICBsZXQgc2V0dGluZ3M6IFNldHRpbmdzO1xuICAgIGxldCBvcHRpb25zOiBTb3VyY2VPcHRpb25zO1xuICAgIGxvY2FsU3Vic2NyaXB0aW9ucy5hZGQob2JzZXJ2ZVNldHRpbmdzKG5ld1NldHRpbmdzID0+IHtcbiAgICAgIHNldHRpbmdzID0gbmV3U2V0dGluZ3M7XG4gICAgICBvcHRpb25zID0gY2FsY3VsYXRlT3B0aW9ucyhzZXR0aW5ncyk7XG4gICAgfSkpO1xuXG4gICAgLy8gRm9ybWF0IGNvZGUgb24gc2F2ZSBpZiBzZXR0aW5ncyBzYXkgc29cbiAgICBsb2NhbFN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhlZGl0b3IgPT4ge1xuICAgICAgbG9jYWxTdWJzY3JpcHRpb25zLmFkZChlZGl0b3Iub25EaWRTYXZlKCgpID0+IHtcbiAgICAgICAgaWYgKHNldHRpbmdzLnJ1bk9uU2F2ZSkge1xuICAgICAgICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4gZm9ybWF0Q29kZShvcHRpb25zLCBlZGl0b3IpKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH0pKTtcblxuICAgIC8vIFdvcmsgYXJvdW5kIGZsb3cgcmVmaW5lbWVudHMuXG4gICAgc3Vic2NyaXB0aW9ucyA9IGxvY2FsU3Vic2NyaXB0aW9ucztcbiAgfSxcblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XG4gICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgfSxcbn07XG4iXX0=