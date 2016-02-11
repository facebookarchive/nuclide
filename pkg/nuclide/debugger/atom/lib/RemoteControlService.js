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
          model.getActions().attachToProcess(process);
        } else {
          throw new Error('Requested process not found: ' + pid + '.');
        }
      });
    }
  }, {
    key: 'debugHhvm',
    value: function debugHhvm(scriptTarget) {
      var modelNullable = this._getModel();
      if (!modelNullable) {
        return Promise.reject(new Error('Package is not activated.'));
      }
      var model = modelNullable;
      return model.getStore().getProcessInfoList('hhvm').then(function (processes) {
        // TODO[jeffreytan]: currently HHVM debugger getProcessInfoList() always
        // returns the first remote server for attaching we should modify it to
        // return all available remote servers.
        if (processes.length > 0) {
          model.getActions().attachToProcess(processes[0], scriptTarget);
        } else {
          Promise.reject('No hhvm process to debug.');
        }
      });
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
          model.getActions().attachToProcess(proc);
        } else {
          Promise.reject('No node process to debug.');
        }
      });
    }
  }]);

  return RemoteControlService;
})();

module.exports = RemoteControlService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZUNvbnRyb2xTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQVdnQixPQUFPLENBQUMsa0JBQWtCLENBQUM7O0lBQXBDLEtBQUssWUFBTCxLQUFLOztJQUdOLG9CQUFvQjs7Ozs7Ozs7Ozs7QUFXYixXQVhQLG9CQUFvQixDQVdaLFFBQThCLEVBQUU7MEJBWHhDLG9CQUFvQjs7QUFZdEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7R0FDM0I7O2VBYkcsb0JBQW9COztXQWVmLG1CQUFDLEdBQVcsRUFBRSxRQUFnQixFQUFXOzs7O0FBSWhELFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN2QyxVQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLGVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7T0FDL0Q7QUFDRCxVQUFNLEtBQUssR0FBRyxhQUFhLENBQUM7QUFDNUIsYUFBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQy9DLElBQUksQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNqQixZQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUM7aUJBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHO1NBQUEsQ0FBQyxDQUFDO0FBQzFELFlBQUksT0FBTyxFQUFFO0FBQ1gsaUJBQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzVCLGVBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDN0MsTUFBTTtBQUNMLGdCQUFNLElBQUksS0FBSyxtQ0FBaUMsR0FBRyxPQUFJLENBQUM7U0FDekQ7T0FDRixDQUFDLENBQUM7S0FDTjs7O1dBRVEsbUJBQUMsWUFBcUIsRUFBVztBQUN4QyxVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLGFBQWEsRUFBRTtBQUNsQixlQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO09BQy9EO0FBQ0QsVUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDO0FBQzVCLGFBQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUMvQyxJQUFJLENBQUMsVUFBQSxTQUFTLEVBQUk7Ozs7QUFJakIsWUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN4QixlQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztTQUNoRSxNQUFNO0FBQ0wsaUJBQU8sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUM3QztPQUNGLENBQUMsQ0FBQztLQUNOOzs7V0FFUSxtQkFBQyxHQUFXLEVBQVc7QUFDOUIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQy9CLFVBQUksQ0FBQyxLQUFLLEVBQUU7QUFDVixlQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO09BQy9EO0FBQ0QsYUFBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQy9DLElBQUksQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNqQixZQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUM7aUJBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHO1NBQUEsQ0FBQyxDQUFDO0FBQ3ZELFlBQUksSUFBSSxFQUFFO0FBQ1IsZUFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMxQyxNQUFNO0FBQ0wsaUJBQU8sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUM3QztPQUNGLENBQUMsQ0FBQztLQUNOOzs7U0FyRUcsb0JBQW9COzs7QUF3RTFCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsb0JBQW9CLENBQUMiLCJmaWxlIjoiUmVtb3RlQ29udHJvbFNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7YXJyYXl9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9ucycpO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJNb2RlbCBmcm9tICcuL0RlYnVnZ2VyTW9kZWwnO1xuXG5jbGFzcyBSZW1vdGVDb250cm9sU2VydmljZSB7XG4gIF9nZXRNb2RlbDogKCkgPT4gP0RlYnVnZ2VyTW9kZWw7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBnZXRNb2RlbCBmdW5jdGlvbiBhbHdheXMgcmV0dXJuaW5nIHRoZSBsYXRlc3Qgc2luZ2xldG9uIG1vZGVsLlxuICAgKlxuICAgKiBOQjogRGVhY3RpdmF0aW5nIGFuZCByZWFjdGl2YXRpbmcgd2lsbCByZXN1bHQgaW4gYSBuZXcgTW9kZWwgaW5zdGFuY2UgKGFuZFxuICAgKiBuZXcgaW5zdGFuY2VzIG9mIGV2ZXJ5dGhpbmcgZWxzZSkuIFRoaXMgb2JqZWN0IGV4aXN0cyBpbiBvdGhlciBwYWNrYWdlc1xuICAgKiBvdXRzaWRlIG9mIGFueSBtb2RlbCwgc28gb2JqZWN0cyB2ZW5kZWQgZWFybHkgbXVzdCBzdGlsbCBhbHdheXMgbWFuaXB1bGF0ZVxuICAgKiB0aGUgbGF0ZXN0IG1vZGVsJ3Mgc3RhdGUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihnZXRNb2RlbDogKCkgPT4gP0RlYnVnZ2VyTW9kZWwpIHtcbiAgICB0aGlzLl9nZXRNb2RlbCA9IGdldE1vZGVsO1xuICB9XG5cbiAgZGVidWdMTERCKHBpZDogbnVtYmVyLCBiYXNlcGF0aDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgLy8gTnVsbGFibGUgdmFsdWVzIGFyZSBjYXB0dXJlZCBhcyBudWxsYWJsZSBpbiBsYW1iZGFzLCBhcyB0aGV5IG1heSBjaGFuZ2VcbiAgICAvLyBiZXR3ZWVuIGxhbWJkYSBjYXB0dXJlIGFuZCBsYW1iZGEgZXZhbHVhdGlvbi4gQXNzaWduaW5nIHRvIGFcbiAgICAvLyBub24tbnVsbGFibGUgdmFsdWUgYWZ0ZXIgY2hlY2tpbmcgcGxhY2F0ZXMgZmxvdyBpbiB0aGlzIHJlZ2FyZC5cbiAgICBjb25zdCBtb2RlbE51bGxhYmxlID0gdGhpcy5fZ2V0TW9kZWwoKTtcbiAgICBpZiAoIW1vZGVsTnVsbGFibGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1BhY2thZ2UgaXMgbm90IGFjdGl2YXRlZC4nKSk7XG4gICAgfVxuICAgIGNvbnN0IG1vZGVsID0gbW9kZWxOdWxsYWJsZTtcbiAgICByZXR1cm4gbW9kZWwuZ2V0U3RvcmUoKS5nZXRQcm9jZXNzSW5mb0xpc3QoJ2xsZGInKVxuICAgICAgLnRoZW4ocHJvY2Vzc2VzID0+IHtcbiAgICAgICAgY29uc3QgcHJvY2VzcyA9IGFycmF5LmZpbmQocHJvY2Vzc2VzLCBwID0+IHAucGlkID09PSBwaWQpO1xuICAgICAgICBpZiAocHJvY2Vzcykge1xuICAgICAgICAgIHByb2Nlc3MuYmFzZXBhdGggPSBiYXNlcGF0aDtcbiAgICAgICAgICBtb2RlbC5nZXRBY3Rpb25zKCkuYXR0YWNoVG9Qcm9jZXNzKHByb2Nlc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVxdWVzdGVkIHByb2Nlc3Mgbm90IGZvdW5kOiAke3BpZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZGVidWdIaHZtKHNjcmlwdFRhcmdldDogP3N0cmluZyk6IFByb21pc2Uge1xuICAgIGNvbnN0IG1vZGVsTnVsbGFibGUgPSB0aGlzLl9nZXRNb2RlbCgpO1xuICAgIGlmICghbW9kZWxOdWxsYWJsZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignUGFja2FnZSBpcyBub3QgYWN0aXZhdGVkLicpKTtcbiAgICB9XG4gICAgY29uc3QgbW9kZWwgPSBtb2RlbE51bGxhYmxlO1xuICAgIHJldHVybiBtb2RlbC5nZXRTdG9yZSgpLmdldFByb2Nlc3NJbmZvTGlzdCgnaGh2bScpXG4gICAgICAudGhlbihwcm9jZXNzZXMgPT4ge1xuICAgICAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiBjdXJyZW50bHkgSEhWTSBkZWJ1Z2dlciBnZXRQcm9jZXNzSW5mb0xpc3QoKSBhbHdheXNcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgZmlyc3QgcmVtb3RlIHNlcnZlciBmb3IgYXR0YWNoaW5nIHdlIHNob3VsZCBtb2RpZnkgaXQgdG9cbiAgICAgICAgLy8gcmV0dXJuIGFsbCBhdmFpbGFibGUgcmVtb3RlIHNlcnZlcnMuXG4gICAgICAgIGlmIChwcm9jZXNzZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIG1vZGVsLmdldEFjdGlvbnMoKS5hdHRhY2hUb1Byb2Nlc3MocHJvY2Vzc2VzWzBdLCBzY3JpcHRUYXJnZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFByb21pc2UucmVqZWN0KCdObyBoaHZtIHByb2Nlc3MgdG8gZGVidWcuJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZGVidWdOb2RlKHBpZDogbnVtYmVyKTogUHJvbWlzZSB7XG4gICAgY29uc3QgbW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuICAgIGlmICghbW9kZWwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1BhY2thZ2UgaXMgbm90IGFjdGl2YXRlZC4nKSk7XG4gICAgfVxuICAgIHJldHVybiBtb2RlbC5nZXRTdG9yZSgpLmdldFByb2Nlc3NJbmZvTGlzdCgnbm9kZScpXG4gICAgICAudGhlbihwcm9jZXNzZXMgPT4ge1xuICAgICAgICBjb25zdCBwcm9jID0gYXJyYXkuZmluZChwcm9jZXNzZXMsIHAgPT4gcC5waWQgPT09IHBpZCk7XG4gICAgICAgIGlmIChwcm9jKSB7XG4gICAgICAgICAgbW9kZWwuZ2V0QWN0aW9ucygpLmF0dGFjaFRvUHJvY2Vzcyhwcm9jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBQcm9taXNlLnJlamVjdCgnTm8gbm9kZSBwcm9jZXNzIHRvIGRlYnVnLicpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbW90ZUNvbnRyb2xTZXJ2aWNlO1xuIl19