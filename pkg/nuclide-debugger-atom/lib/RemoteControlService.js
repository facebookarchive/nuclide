var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
        var process = processes.find(function (p) {
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
    key: 'debugNode',
    value: function debugNode(pid) {
      var model = this._getModel();
      if (!model) {
        return Promise.reject(new Error('Package is not activated.'));
      }
      return model.getStore().getProcessInfoList('node').then(function (processes) {
        var proc = processes.find(function (p) {
          return p.pid === pid;
        });
        if (proc) {
          model.getActions().startDebugging(proc);
        } else {
          Promise.reject('No node process to debug.');
        }
      });
    }
  }, {
    key: 'startDebugging',
    value: _asyncToGenerator(function* (processInfo) {
      var model = this._getModel();
      if (model == null) {
        throw new Error('Package is not activated.');
      }
      yield model.getActions().startDebugging(processInfo);
    })
  }, {
    key: 'isInDebuggingMode',
    value: function isInDebuggingMode(providerName) {
      var model = this._getModel();
      if (model == null) {
        throw new Error('Package is not activated.');
      }
      var session = model.getStore().getDebuggerInstance();
      return session != null && session.getProviderName() === providerName;
    }
  }, {
    key: 'killDebugger',
    value: function killDebugger() {
      var model = this._getModel();
      if (model == null) {
        throw new Error('Package is not activated.');
      }
      model.getActions().stopDebugging();
    }
  }]);

  return RemoteControlService;
})();

module.exports = RemoteControlService;
//# sourceMappingURL=data:application/json;base64,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SyxZQUFZLENBQUM7S0FDdEU7OztXQUVXLHdCQUFTO0FBQ25CLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMvQixVQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDakIsY0FBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO09BQzlDO0FBQ0QsV0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ3BDOzs7U0EzRUcsb0JBQW9COzs7QUE4RTFCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsb0JBQW9CLENBQUMiLCJmaWxlIjoiUmVtb3RlQ29udHJvbFNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBEZWJ1Z2dlck1vZGVsIGZyb20gJy4vRGVidWdnZXJNb2RlbCc7XG5pbXBvcnQgdHlwZSBEZWJ1Z2dlclByb2Nlc3NJbmZvIGZyb20gJy4vRGVidWdnZXJQcm9jZXNzSW5mbyc7XG5cbmNsYXNzIFJlbW90ZUNvbnRyb2xTZXJ2aWNlIHtcbiAgX2dldE1vZGVsOiAoKSA9PiA/RGVidWdnZXJNb2RlbDtcblxuICAvKipcbiAgICogQHBhcmFtIGdldE1vZGVsIGZ1bmN0aW9uIGFsd2F5cyByZXR1cm5pbmcgdGhlIGxhdGVzdCBzaW5nbGV0b24gbW9kZWwuXG4gICAqXG4gICAqIE5COiBEZWFjdGl2YXRpbmcgYW5kIHJlYWN0aXZhdGluZyB3aWxsIHJlc3VsdCBpbiBhIG5ldyBNb2RlbCBpbnN0YW5jZSAoYW5kXG4gICAqIG5ldyBpbnN0YW5jZXMgb2YgZXZlcnl0aGluZyBlbHNlKS4gVGhpcyBvYmplY3QgZXhpc3RzIGluIG90aGVyIHBhY2thZ2VzXG4gICAqIG91dHNpZGUgb2YgYW55IG1vZGVsLCBzbyBvYmplY3RzIHZlbmRlZCBlYXJseSBtdXN0IHN0aWxsIGFsd2F5cyBtYW5pcHVsYXRlXG4gICAqIHRoZSBsYXRlc3QgbW9kZWwncyBzdGF0ZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGdldE1vZGVsOiAoKSA9PiA/RGVidWdnZXJNb2RlbCkge1xuICAgIHRoaXMuX2dldE1vZGVsID0gZ2V0TW9kZWw7XG4gIH1cblxuICBkZWJ1Z0xMREIocGlkOiBudW1iZXIsIGJhc2VwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBOdWxsYWJsZSB2YWx1ZXMgYXJlIGNhcHR1cmVkIGFzIG51bGxhYmxlIGluIGxhbWJkYXMsIGFzIHRoZXkgbWF5IGNoYW5nZVxuICAgIC8vIGJldHdlZW4gbGFtYmRhIGNhcHR1cmUgYW5kIGxhbWJkYSBldmFsdWF0aW9uLiBBc3NpZ25pbmcgdG8gYVxuICAgIC8vIG5vbi1udWxsYWJsZSB2YWx1ZSBhZnRlciBjaGVja2luZyBwbGFjYXRlcyBmbG93IGluIHRoaXMgcmVnYXJkLlxuICAgIGNvbnN0IG1vZGVsTnVsbGFibGUgPSB0aGlzLl9nZXRNb2RlbCgpO1xuICAgIGlmICghbW9kZWxOdWxsYWJsZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignUGFja2FnZSBpcyBub3QgYWN0aXZhdGVkLicpKTtcbiAgICB9XG4gICAgY29uc3QgbW9kZWwgPSBtb2RlbE51bGxhYmxlO1xuICAgIHJldHVybiBtb2RlbC5nZXRTdG9yZSgpLmdldFByb2Nlc3NJbmZvTGlzdCgnbGxkYicpXG4gICAgICAudGhlbihwcm9jZXNzZXMgPT4ge1xuICAgICAgICBjb25zdCBwcm9jZXNzID0gcHJvY2Vzc2VzLmZpbmQocCA9PiBwLnBpZCA9PT0gcGlkKTtcbiAgICAgICAgaWYgKHByb2Nlc3MpIHtcbiAgICAgICAgICBwcm9jZXNzLmJhc2VwYXRoID0gYmFzZXBhdGg7XG4gICAgICAgICAgbW9kZWwuZ2V0QWN0aW9ucygpLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVxdWVzdGVkIHByb2Nlc3Mgbm90IGZvdW5kOiAke3BpZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZGVidWdOb2RlKHBpZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuICAgIGlmICghbW9kZWwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1BhY2thZ2UgaXMgbm90IGFjdGl2YXRlZC4nKSk7XG4gICAgfVxuICAgIHJldHVybiBtb2RlbC5nZXRTdG9yZSgpLmdldFByb2Nlc3NJbmZvTGlzdCgnbm9kZScpXG4gICAgICAudGhlbihwcm9jZXNzZXMgPT4ge1xuICAgICAgICBjb25zdCBwcm9jID0gcHJvY2Vzc2VzLmZpbmQocCA9PiBwLnBpZCA9PT0gcGlkKTtcbiAgICAgICAgaWYgKHByb2MpIHtcbiAgICAgICAgICBtb2RlbC5nZXRBY3Rpb25zKCkuc3RhcnREZWJ1Z2dpbmcocHJvYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUHJvbWlzZS5yZWplY3QoJ05vIG5vZGUgcHJvY2VzcyB0byBkZWJ1Zy4nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBhc3luYyBzdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mbyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwoKTtcbiAgICBpZiAobW9kZWwgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYWNrYWdlIGlzIG5vdCBhY3RpdmF0ZWQuJyk7XG4gICAgfVxuICAgIGF3YWl0IG1vZGVsLmdldEFjdGlvbnMoKS5zdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbyk7XG4gIH1cblxuICBpc0luRGVidWdnaW5nTW9kZShwcm92aWRlck5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwoKTtcbiAgICBpZiAobW9kZWwgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYWNrYWdlIGlzIG5vdCBhY3RpdmF0ZWQuJyk7XG4gICAgfVxuICAgIGNvbnN0IHNlc3Npb24gPSBtb2RlbC5nZXRTdG9yZSgpLmdldERlYnVnZ2VySW5zdGFuY2UoKTtcbiAgICByZXR1cm4gc2Vzc2lvbiAhPSBudWxsICYmIHNlc3Npb24uZ2V0UHJvdmlkZXJOYW1lKCkgPT09IHByb3ZpZGVyTmFtZTtcbiAgfVxuXG4gIGtpbGxEZWJ1Z2dlcigpOiB2b2lkIHtcbiAgICBjb25zdCBtb2RlbCA9IHRoaXMuX2dldE1vZGVsKCk7XG4gICAgaWYgKG1vZGVsID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGFja2FnZSBpcyBub3QgYWN0aXZhdGVkLicpO1xuICAgIH1cbiAgICBtb2RlbC5nZXRBY3Rpb25zKCkuc3RvcERlYnVnZ2luZygpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlQ29udHJvbFNlcnZpY2U7XG4iXX0=