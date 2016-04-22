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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var MercurialConflictContext = (function () {
  function MercurialConflictContext(hgRepository, workingDirectory, priority) {
    _classCallCheck(this, MercurialConflictContext);

    this._hgRepository = hgRepository;
    this.workingDirectory = workingDirectory;
    this.priority = priority;
    this.resolveText = 'Resolve';
  }

  _createClass(MercurialConflictContext, [{
    key: 'readConflicts',
    value: function readConflicts() {
      // TODO(most)
      return Promise.resolve([{
        message: 'both changed',
        path: 'test.txt',
        resolveMessage: 'Resolve'
      }]);
    }
  }, {
    key: 'isResolvedFile',
    value: function isResolvedFile(filePath) {
      return Promise.resolve(true);
    }
  }, {
    key: 'checkoutSide',
    value: function checkoutSide(sideName, filePath) {
      // TODO(most)
      return Promise.resolve();
    }
  }, {
    key: 'resolveFile',
    value: function resolveFile(filePath) {
      // TODO(most): mark as resolved.
      return Promise.resolve();
    }

    // Deletermine if that's a rebase or merge operation.
  }, {
    key: 'isRebasing',
    value: function isRebasing() {
      // TODO(most)
      return true;
    }
  }, {
    key: 'joinPath',
    value: function joinPath(relativePath) {
      return _nuclideRemoteUri2['default'].join(this.workingDirectory.getPath(), relativePath);
    }
  }]);

  return MercurialConflictContext;
})();

exports.MercurialConflictContext = MercurialConflictContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1lcmN1cmlhbENvbmZsaWN0Q29udGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBZ0JzQiwwQkFBMEI7Ozs7SUFFbkMsd0JBQXdCO0FBUXhCLFdBUkEsd0JBQXdCLENBU2pDLFlBQWdDLEVBQ2hDLGdCQUFrRCxFQUNsRCxRQUFnQixFQUNoQjswQkFaUyx3QkFBd0I7O0FBYWpDLFFBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO0FBQ2xDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztBQUN6QyxRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUN6QixRQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztHQUM5Qjs7ZUFqQlUsd0JBQXdCOztXQW1CdEIseUJBQWtDOztBQUU3QyxhQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QixlQUFPLEVBQUUsY0FBYztBQUN2QixZQUFJLEVBQUUsVUFBVTtBQUNoQixzQkFBYyxFQUFFLFNBQVM7T0FDMUIsQ0FBQyxDQUFDLENBQUM7S0FDTDs7O1dBRWEsd0JBQUMsUUFBb0IsRUFBb0I7QUFDckQsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzlCOzs7V0FFVyxzQkFBQyxRQUEwQixFQUFFLFFBQW9CLEVBQWlCOztBQUU1RSxhQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMxQjs7O1dBRVUscUJBQUMsUUFBb0IsRUFBaUI7O0FBRS9DLGFBQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzFCOzs7OztXQUdTLHNCQUFZOztBQUVwQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFTyxrQkFBQyxZQUFvQixFQUFjO0FBQ3pDLGFBQU8sOEJBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUN0RTs7O1NBbERVLHdCQUF3QiIsImZpbGUiOiJNZXJjdXJpYWxDb25mbGljdENvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmVtb3RlRGlyZWN0b3J5fSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge0NoZWNrb3V0U2lkZU5hbWUsIE1lcmdlQ29uZmxpY3R9IGZyb20gJy4uJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmV4cG9ydCBjbGFzcyBNZXJjdXJpYWxDb25mbGljdENvbnRleHQge1xuXG4gIF9oZ1JlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudDtcblxuICB3b3JraW5nRGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSB8IFJlbW90ZURpcmVjdG9yeTtcbiAgcmVzb2x2ZVRleHQ6IHN0cmluZztcbiAgcHJpb3JpdHk6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBoZ1JlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCxcbiAgICB3b3JraW5nRGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSB8IFJlbW90ZURpcmVjdG9yeSxcbiAgICBwcmlvcml0eTogbnVtYmVyLFxuICApIHtcbiAgICB0aGlzLl9oZ1JlcG9zaXRvcnkgPSBoZ1JlcG9zaXRvcnk7XG4gICAgdGhpcy53b3JraW5nRGlyZWN0b3J5ID0gd29ya2luZ0RpcmVjdG9yeTtcbiAgICB0aGlzLnByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgdGhpcy5yZXNvbHZlVGV4dCA9ICdSZXNvbHZlJztcbiAgfVxuXG4gIHJlYWRDb25mbGljdHMoKTogUHJvbWlzZTxBcnJheTxNZXJnZUNvbmZsaWN0Pj4ge1xuICAgIC8vIFRPRE8obW9zdClcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFt7XG4gICAgICBtZXNzYWdlOiAnYm90aCBjaGFuZ2VkJyxcbiAgICAgIHBhdGg6ICd0ZXN0LnR4dCcsXG4gICAgICByZXNvbHZlTWVzc2FnZTogJ1Jlc29sdmUnLFxuICAgIH1dKTtcbiAgfVxuXG4gIGlzUmVzb2x2ZWRGaWxlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbiAgfVxuXG4gIGNoZWNrb3V0U2lkZShzaWRlTmFtZTogQ2hlY2tvdXRTaWRlTmFtZSwgZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBUT0RPKG1vc3QpXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgcmVzb2x2ZUZpbGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBUT0RPKG1vc3QpOiBtYXJrIGFzIHJlc29sdmVkLlxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8vIERlbGV0ZXJtaW5lIGlmIHRoYXQncyBhIHJlYmFzZSBvciBtZXJnZSBvcGVyYXRpb24uXG4gIGlzUmViYXNpbmcoKTogYm9vbGVhbiB7XG4gICAgLy8gVE9ETyhtb3N0KVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgam9pblBhdGgocmVsYXRpdmVQYXRoOiBzdHJpbmcpOiBOdWNsaWRlVXJpIHtcbiAgICByZXR1cm4gcmVtb3RlVXJpLmpvaW4odGhpcy53b3JraW5nRGlyZWN0b3J5LmdldFBhdGgoKSwgcmVsYXRpdmVQYXRoKTtcbiAgfVxufVxuIl19