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

var _analytics = require('../../../analytics');

var NUCLIDE_SERVICE_MONITOR_URI = 'nuclide-service-monitor://view';

var subscriptions = undefined;

module.exports = {

  activate: function activate(state) {
    (0, _assert2['default'])(!subscriptions);
    subscriptions = new _atom.CompositeDisposable();

    subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-service-monitor:show-monitor', function () {
      atom.workspace.open(NUCLIDE_SERVICE_MONITOR_URI);
      (0, _analytics.track)('nuclide-service-monitor:open');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFXa0MsTUFBTTs7c0NBQ0wsMEJBQTBCOzs7O3NCQUN2QyxRQUFROzs7O3lCQUNWLG9CQUFvQjs7QUFFeEMsSUFBTSwyQkFBMkIsR0FBRyxnQ0FBZ0MsQ0FBQzs7QUFFckUsSUFBSSxhQUFtQyxZQUFBLENBQUM7O0FBRXhDLE1BQU0sQ0FBQyxPQUFPLEdBQUc7O0FBRWYsVUFBUSxFQUFBLGtCQUFDLEtBQWMsRUFBUTtBQUM3Qiw2QkFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzFCLGlCQUFhLEdBQUcsK0JBQXlCLENBQUM7O0FBRTFDLGlCQUFhLENBQUMsR0FBRyxDQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNmLGdCQUFnQixFQUNoQixzQ0FBc0MsRUFDdEMsWUFBTTtBQUNKLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDakQsNEJBQU0sOEJBQThCLENBQUMsQ0FBQztLQUN2QyxDQUNGLENBQ0YsQ0FBQzs7QUFFRixpQkFBYSxDQUFDLEdBQUcsQ0FDZixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNwQyxVQUFJLFNBQVMsS0FBSywyQkFBMkIsRUFBRTtBQUM3QyxlQUFPO09BQ1I7O0FBRUQsVUFBTSxJQUFJLEdBQUcseUNBQTRCLENBQUM7QUFDMUMsVUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNkLGFBQUssRUFBRSxrQkFBa0I7QUFDekIsb0JBQVksRUFBRSxFQUFFO09BQ2pCLENBQUMsQ0FBQztBQUNILGFBQU8sSUFBSSxDQUFDO0tBQ2IsQ0FBQyxDQUNILENBQUM7R0FDSDs7QUFFRCxZQUFVLEVBQUEsc0JBQVM7QUFDakIsNkJBQVUsYUFBYSxDQUFDLENBQUM7QUFDekIsaUJBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QixpQkFBYSxHQUFHLElBQUksQ0FBQztHQUN0QjtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgU2VydmljZU1vbml0b3JQYW5lSXRlbSBmcm9tICcuL1NlcnZpY2VNb25pdG9yUGFuZUl0ZW0nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vLi4vYW5hbHl0aWNzJztcblxuY29uc3QgTlVDTElERV9TRVJWSUNFX01PTklUT1JfVVJJID0gJ251Y2xpZGUtc2VydmljZS1tb25pdG9yOi8vdmlldyc7XG5cbmxldCBzdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQoIXN1YnNjcmlwdGlvbnMpO1xuICAgIHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICAgJ251Y2xpZGUtc2VydmljZS1tb25pdG9yOnNob3ctbW9uaXRvcicsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKE5VQ0xJREVfU0VSVklDRV9NT05JVE9SX1VSSSk7XG4gICAgICAgICAgdHJhY2soJ251Y2xpZGUtc2VydmljZS1tb25pdG9yOm9wZW4nKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcih1cmlUb09wZW4gPT4ge1xuICAgICAgICBpZiAodXJpVG9PcGVuICE9PSBOVUNMSURFX1NFUlZJQ0VfTU9OSVRPUl9VUkkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYW5lID0gbmV3IFNlcnZpY2VNb25pdG9yUGFuZUl0ZW0oKTtcbiAgICAgICAgcGFuZS5pbml0aWFsaXplKHtcbiAgICAgICAgICB0aXRsZTogJ051Y2xpZGUgU2VydmljZXMnLFxuICAgICAgICAgIGluaXRpYWxQcm9wczoge30sXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGFuZTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBzdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgfSxcbn07XG4iXX0=