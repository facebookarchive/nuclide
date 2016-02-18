var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../../commons');

var array = _require.array;

var RemoteControlService = (function () {

  /**
   * @param getModel function always returning the latest singleton model.
   *
   * NB: Deactivating and reactivating will result in a new Model instance (and
   * new instances of everything else). This object exists in other packages
   * outside of any model, so objects vended early must still always manipulate
   * the latest model's state.
   */

  function RemoteControlService(getModel) {
    _classCallCheck(this, RemoteControlService);

    this._getModel = getModel;
  }

  _createClass(RemoteControlService, [{
    key: 'debugLLDB',
    value: function debugLLDB(pid, basepath) {
      // Nullable values are captured as nullable in lambdas, as they may change
      // between lambda capture and lambda evaluation. Assigning to a
      // non-nullable value after checking placates flow in this regard.
      var modelNullable = this._getModel();
      if (!modelNullable) {
        return Promise.reject(new Error('Package is not activated.'));
      }
      var model = modelNullable;
      return model.getStore().getProcessInfoList('lldb').then(function (processes) {
        var process = array.find(processes, function (p) {
          return p.pid === pid;
        });
        if (process) {
          process.basepath = basepath;
          model.getActions().startDebugging(process);
        } else {
          throw new Error('Requested process not found: ' + pid + '.');
        }
      });
    }
  }, {
    key: 'debugHhvm',
    value: function debugHhvm(processInfo) {
      var modelNullable = this._getModel();
      if (!modelNullable) {
        return Promise.reject(new Error('Package is not activated.'));
      }
      var model = modelNullable;
      return model.getActions().startDebugging(processInfo);
    }
  }, {
    key: 'debugNode',
    value: function debugNode(pid) {
      var model = this._getModel();
      if (!model) {
        return Promise.reject(new Error('Package is not activated.'));
      }
      return model.getStore().getProcessInfoList('node').then(function (processes) {
        var proc = array.find(processes, function (p) {
          return p.pid === pid;
        });
        if (proc) {
          model.getActions().startDebugging(proc);
        } else {
          Promise.reject('No node process to debug.');
        }
      });
    }
  }]);

  return RemoteControlService;
})();

module.exports = RemoteControlService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZUNvbnRyb2xTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQVdnQixPQUFPLENBQUMsa0JBQWtCLENBQUM7O0lBQXBDLEtBQUssWUFBTCxLQUFLOztJQUlOLG9CQUFvQjs7Ozs7Ozs7Ozs7QUFXYixXQVhQLG9CQUFvQixDQVdaLFFBQThCLEVBQUU7MEJBWHhDLG9CQUFvQjs7QUFZdEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7R0FDM0I7O2VBYkcsb0JBQW9COztXQWVmLG1CQUFDLEdBQVcsRUFBRSxRQUFnQixFQUFpQjs7OztBQUl0RCxVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLGFBQWEsRUFBRTtBQUNsQixlQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO09BQy9EO0FBQ0QsVUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDO0FBQzVCLGFBQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUMvQyxJQUFJLENBQUMsVUFBQSxTQUFTLEVBQUk7QUFDakIsWUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBQSxDQUFDO2lCQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRztTQUFBLENBQUMsQ0FBQztBQUMxRCxZQUFJLE9BQU8sRUFBRTtBQUNYLGlCQUFPLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUM1QixlQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzVDLE1BQU07QUFDTCxnQkFBTSxJQUFJLEtBQUssbUNBQWlDLEdBQUcsT0FBSSxDQUFDO1NBQ3pEO09BQ0YsQ0FBQyxDQUFDO0tBQ047OztXQUVRLG1CQUFDLFdBQWdDLEVBQWlCO0FBQ3pELFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN2QyxVQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLGVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7T0FDL0Q7QUFDRCxVQUFNLEtBQUssR0FBRyxhQUFhLENBQUM7QUFDNUIsYUFBTyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3ZEOzs7V0FFUSxtQkFBQyxHQUFXLEVBQWlCO0FBQ3BDLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1YsZUFBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztPQUMvRDtBQUNELGFBQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUMvQyxJQUFJLENBQUMsVUFBQSxTQUFTLEVBQUk7QUFDakIsWUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBQSxDQUFDO2lCQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRztTQUFBLENBQUMsQ0FBQztBQUN2RCxZQUFJLElBQUksRUFBRTtBQUNSLGVBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekMsTUFBTTtBQUNMLGlCQUFPLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7U0FDN0M7T0FDRixDQUFDLENBQUM7S0FDTjs7O1NBM0RHLG9CQUFvQjs7O0FBOEQxQixNQUFNLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDIiwiZmlsZSI6IlJlbW90ZUNvbnRyb2xTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge2FycmF5fSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKTtcbmltcG9ydCB0eXBlIERlYnVnZ2VyTW9kZWwgZnJvbSAnLi9EZWJ1Z2dlck1vZGVsJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyUHJvY2Vzc0luZm8gZnJvbSAnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJztcblxuY2xhc3MgUmVtb3RlQ29udHJvbFNlcnZpY2Uge1xuICBfZ2V0TW9kZWw6ICgpID0+ID9EZWJ1Z2dlck1vZGVsO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZ2V0TW9kZWwgZnVuY3Rpb24gYWx3YXlzIHJldHVybmluZyB0aGUgbGF0ZXN0IHNpbmdsZXRvbiBtb2RlbC5cbiAgICpcbiAgICogTkI6IERlYWN0aXZhdGluZyBhbmQgcmVhY3RpdmF0aW5nIHdpbGwgcmVzdWx0IGluIGEgbmV3IE1vZGVsIGluc3RhbmNlIChhbmRcbiAgICogbmV3IGluc3RhbmNlcyBvZiBldmVyeXRoaW5nIGVsc2UpLiBUaGlzIG9iamVjdCBleGlzdHMgaW4gb3RoZXIgcGFja2FnZXNcbiAgICogb3V0c2lkZSBvZiBhbnkgbW9kZWwsIHNvIG9iamVjdHMgdmVuZGVkIGVhcmx5IG11c3Qgc3RpbGwgYWx3YXlzIG1hbmlwdWxhdGVcbiAgICogdGhlIGxhdGVzdCBtb2RlbCdzIHN0YXRlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZ2V0TW9kZWw6ICgpID0+ID9EZWJ1Z2dlck1vZGVsKSB7XG4gICAgdGhpcy5fZ2V0TW9kZWwgPSBnZXRNb2RlbDtcbiAgfVxuXG4gIGRlYnVnTExEQihwaWQ6IG51bWJlciwgYmFzZXBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIE51bGxhYmxlIHZhbHVlcyBhcmUgY2FwdHVyZWQgYXMgbnVsbGFibGUgaW4gbGFtYmRhcywgYXMgdGhleSBtYXkgY2hhbmdlXG4gICAgLy8gYmV0d2VlbiBsYW1iZGEgY2FwdHVyZSBhbmQgbGFtYmRhIGV2YWx1YXRpb24uIEFzc2lnbmluZyB0byBhXG4gICAgLy8gbm9uLW51bGxhYmxlIHZhbHVlIGFmdGVyIGNoZWNraW5nIHBsYWNhdGVzIGZsb3cgaW4gdGhpcyByZWdhcmQuXG4gICAgY29uc3QgbW9kZWxOdWxsYWJsZSA9IHRoaXMuX2dldE1vZGVsKCk7XG4gICAgaWYgKCFtb2RlbE51bGxhYmxlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdQYWNrYWdlIGlzIG5vdCBhY3RpdmF0ZWQuJykpO1xuICAgIH1cbiAgICBjb25zdCBtb2RlbCA9IG1vZGVsTnVsbGFibGU7XG4gICAgcmV0dXJuIG1vZGVsLmdldFN0b3JlKCkuZ2V0UHJvY2Vzc0luZm9MaXN0KCdsbGRiJylcbiAgICAgIC50aGVuKHByb2Nlc3NlcyA9PiB7XG4gICAgICAgIGNvbnN0IHByb2Nlc3MgPSBhcnJheS5maW5kKHByb2Nlc3NlcywgcCA9PiBwLnBpZCA9PT0gcGlkKTtcbiAgICAgICAgaWYgKHByb2Nlc3MpIHtcbiAgICAgICAgICBwcm9jZXNzLmJhc2VwYXRoID0gYmFzZXBhdGg7XG4gICAgICAgICAgbW9kZWwuZ2V0QWN0aW9ucygpLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVxdWVzdGVkIHByb2Nlc3Mgbm90IGZvdW5kOiAke3BpZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZGVidWdIaHZtKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbW9kZWxOdWxsYWJsZSA9IHRoaXMuX2dldE1vZGVsKCk7XG4gICAgaWYgKCFtb2RlbE51bGxhYmxlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdQYWNrYWdlIGlzIG5vdCBhY3RpdmF0ZWQuJykpO1xuICAgIH1cbiAgICBjb25zdCBtb2RlbCA9IG1vZGVsTnVsbGFibGU7XG4gICAgcmV0dXJuIG1vZGVsLmdldEFjdGlvbnMoKS5zdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbyk7XG4gIH1cblxuICBkZWJ1Z05vZGUocGlkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtb2RlbCA9IHRoaXMuX2dldE1vZGVsKCk7XG4gICAgaWYgKCFtb2RlbCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignUGFja2FnZSBpcyBub3QgYWN0aXZhdGVkLicpKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZGVsLmdldFN0b3JlKCkuZ2V0UHJvY2Vzc0luZm9MaXN0KCdub2RlJylcbiAgICAgIC50aGVuKHByb2Nlc3NlcyA9PiB7XG4gICAgICAgIGNvbnN0IHByb2MgPSBhcnJheS5maW5kKHByb2Nlc3NlcywgcCA9PiBwLnBpZCA9PT0gcGlkKTtcbiAgICAgICAgaWYgKHByb2MpIHtcbiAgICAgICAgICBtb2RlbC5nZXRBY3Rpb25zKCkuc3RhcnREZWJ1Z2dpbmcocHJvYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUHJvbWlzZS5yZWplY3QoJ05vIG5vZGUgcHJvY2VzcyB0byBkZWJ1Zy4nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVDb250cm9sU2VydmljZTtcbiJdfQ==