function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _ServiceMonitorPaneItem = require('./ServiceMonitorPaneItem');

var _ServiceMonitorPaneItem2 = _interopRequireDefault(_ServiceMonitorPaneItem);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideAnalytics = require('../../nuclide-analytics');

var NUCLIDE_SERVICE_MONITOR_URI = 'nuclide-service-monitor://view';

var subscriptions = undefined;

module.exports = {

  activate: function activate(state) {
    (0, _assert2['default'])(!subscriptions);
    subscriptions = new _atom.CompositeDisposable();

    subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-service-monitor:show-monitor', function () {
      atom.workspace.open(NUCLIDE_SERVICE_MONITOR_URI);
      (0, _nuclideAnalytics.track)('nuclide-service-monitor:open');
    }));

    subscriptions.add(atom.workspace.addOpener(function (uriToOpen) {
      if (uriToOpen !== NUCLIDE_SERVICE_MONITOR_URI) {
        return;
      }

      var pane = new _ServiceMonitorPaneItem2['default']();
      pane.initialize({
        title: 'Nuclide Services',
        initialProps: {}
      });
      return pane;
    }));
  },

  deactivate: function deactivate() {
    (0, _assert2['default'])(subscriptions);
    subscriptions.dispose();
    subscriptions = null;
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFXa0MsTUFBTTs7c0NBQ0wsMEJBQTBCOzs7O3NCQUN2QyxRQUFROzs7O2dDQUNWLHlCQUF5Qjs7QUFFN0MsSUFBTSwyQkFBMkIsR0FBRyxnQ0FBZ0MsQ0FBQzs7QUFFckUsSUFBSSxhQUFtQyxZQUFBLENBQUM7O0FBRXhDLE1BQU0sQ0FBQyxPQUFPLEdBQUc7O0FBRWYsVUFBUSxFQUFBLGtCQUFDLEtBQWMsRUFBUTtBQUM3Qiw2QkFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzFCLGlCQUFhLEdBQUcsK0JBQXlCLENBQUM7O0FBRTFDLGlCQUFhLENBQUMsR0FBRyxDQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNmLGdCQUFnQixFQUNoQixzQ0FBc0MsRUFDdEMsWUFBTTtBQUNKLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDakQsbUNBQU0sOEJBQThCLENBQUMsQ0FBQztLQUN2QyxDQUNGLENBQ0YsQ0FBQzs7QUFFRixpQkFBYSxDQUFDLEdBQUcsQ0FDZixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNwQyxVQUFJLFNBQVMsS0FBSywyQkFBMkIsRUFBRTtBQUM3QyxlQUFPO09BQ1I7O0FBRUQsVUFBTSxJQUFJLEdBQUcseUNBQTRCLENBQUM7QUFDMUMsVUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNkLGFBQUssRUFBRSxrQkFBa0I7QUFDekIsb0JBQVksRUFBRSxFQUFFO09BQ2pCLENBQUMsQ0FBQztBQUNILGFBQU8sSUFBSSxDQUFDO0tBQ2IsQ0FBQyxDQUNILENBQUM7R0FDSDs7QUFFRCxZQUFVLEVBQUEsc0JBQVM7QUFDakIsNkJBQVUsYUFBYSxDQUFDLENBQUM7QUFDekIsaUJBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QixpQkFBYSxHQUFHLElBQUksQ0FBQztHQUN0QjtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgU2VydmljZU1vbml0b3JQYW5lSXRlbSBmcm9tICcuL1NlcnZpY2VNb25pdG9yUGFuZUl0ZW0nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuXG5jb25zdCBOVUNMSURFX1NFUlZJQ0VfTU9OSVRPUl9VUkkgPSAnbnVjbGlkZS1zZXJ2aWNlLW1vbml0b3I6Ly92aWV3JztcblxubGV0IHN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICAgIGludmFyaWFudCghc3Vic2NyaXB0aW9ucyk7XG4gICAgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICAnbnVjbGlkZS1zZXJ2aWNlLW1vbml0b3I6c2hvdy1tb25pdG9yJyxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oTlVDTElERV9TRVJWSUNFX01PTklUT1JfVVJJKTtcbiAgICAgICAgICB0cmFjaygnbnVjbGlkZS1zZXJ2aWNlLW1vbml0b3I6b3BlbicpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcblxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKHVyaVRvT3BlbiA9PiB7XG4gICAgICAgIGlmICh1cmlUb09wZW4gIT09IE5VQ0xJREVfU0VSVklDRV9NT05JVE9SX1VSSSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhbmUgPSBuZXcgU2VydmljZU1vbml0b3JQYW5lSXRlbSgpO1xuICAgICAgICBwYW5lLmluaXRpYWxpemUoe1xuICAgICAgICAgIHRpdGxlOiAnTnVjbGlkZSBTZXJ2aWNlcycsXG4gICAgICAgICAgaW5pdGlhbFByb3BzOiB7fSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYW5lO1xuICAgICAgfSlcbiAgICApO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICB9LFxufTtcbiJdfQ==