Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _process = require('./process');

var SCRIBE_CAT_COMMAND = 'scribe_cat';

/**
 * A wrapper of `scribe_cat` (https://github.com/facebookarchive/scribe/blob/master/examples/scribe_cat)
 * command. User could call `new ScribeProcess($scribeCategoryName)` to create a process and then
 * call `scribeProcess.write($object)` to save an JSON schemaed Object into scribe category.
 * It will also recover from `scribe_cat` failure automatically.
 */

var ScribeProcess = (function () {
  function ScribeProcess(scribeCategory) {
    _classCallCheck(this, ScribeProcess);

    this._scribeCategory = scribeCategory;
    this._childProcessRunning = new WeakMap();
    this._getOrCreateChildProcess();
  }

  /**
   * Check if `scribe_cat` exists in PATH.
   */

  _createClass(ScribeProcess, [{
    key: 'write',

    /**
     * Write an Object to scribe category using JSON.stringify.
     *
     * @param message the object to write.
     * @param replacer optional replacer function which alters the behavior of the
     *        stringification process. refer
     *        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
     *        for more information.
     */
    value: _asyncToGenerator(function* (message, replacer) {
      var os = require('os');
      var child = yield this._getOrCreateChildProcess();
      return new Promise(function (resolve, reject) {
        child.stdin.write('' + JSON.stringify(message) + os.EOL, resolve);
      });
    })
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      if (this._childPromise) {
        var child = yield this._childPromise;
        if (this._childProcessRunning.get(child)) {
          child.kill();
        }
      }
    })
  }, {
    key: '_getOrCreateChildProcess',
    value: function _getOrCreateChildProcess() {
      var _this = this;

      if (this._childPromise) {
        return this._childPromise;
      }

      this._childPromise = (0, _process.safeSpawn)(SCRIBE_CAT_COMMAND, [this._scribeCategory]).then(function (child) {
        child.stdin.setDefaultEncoding('utf8');
        _this._childProcessRunning.set(child, true);
        child.on('error', function (error) {
          _this._childPromise = null;
          _this._childProcessRunning.set(child, false);
        });
        child.on('exit', function (e) {
          _this._childPromise = null;
          _this._childProcessRunning.set(child, false);
        });
        return child;
      });

      return this._childPromise;
    }
  }], [{
    key: 'isScribeCatOnPath',
    value: _asyncToGenerator(function* () {
      var _ref = yield (0, _process.checkOutput)('which', [SCRIBE_CAT_COMMAND]);

      var exitCode = _ref.exitCode;

      return exitCode === 0;
    })
  }]);

  return ScribeProcess;
})();

exports.ScribeProcess = ScribeProcess;
var __test__ = {
  setScribeCatCommand: function setScribeCatCommand(newCommand) {
    var originalCommand = SCRIBE_CAT_COMMAND;
    SCRIBE_CAT_COMMAND = newCommand;
    return originalCommand;
  }
};
exports.__test__ = __test__;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNjcmliZVByb2Nlc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VCQVdxQyxXQUFXOztBQUVoRCxJQUFJLGtCQUFrQixHQUFHLFlBQVksQ0FBQzs7Ozs7Ozs7O0lBUXpCLGFBQWE7QUFLYixXQUxBLGFBQWEsQ0FLWixjQUFzQixFQUFFOzBCQUx6QixhQUFhOztBQU10QixRQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztBQUN0QyxRQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztHQUNqQzs7Ozs7O2VBVFUsYUFBYTs7Ozs7Ozs7Ozs7OzZCQTRCYixXQUFDLE9BQXdCLEVBQUUsUUFBb0IsRUFBaUI7QUFDekUsVUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLFVBQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7QUFDcEQsYUFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsYUFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLE1BQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFJLE9BQU8sQ0FBQyxDQUFDO09BQ25FLENBQUMsQ0FBQztLQUNKOzs7NkJBRVksYUFBa0I7QUFDN0IsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLFlBQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUN2QyxZQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDeEMsZUFBSyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2Q7T0FDRjtLQUNGOzs7V0FFdUIsb0NBQXdDOzs7QUFDOUQsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLGVBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztPQUMzQjs7QUFFRCxVQUFJLENBQUMsYUFBYSxHQUFHLHdCQUFVLGtCQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQ3JFLElBQUksQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUNiLGFBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkMsY0FBSyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDLGFBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ3pCLGdCQUFLLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsZ0JBQUssb0JBQW9CLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztTQUM3QyxDQUFDLENBQUM7QUFDSCxhQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNwQixnQkFBSyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLGdCQUFLLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDN0MsQ0FBQyxDQUFDO0FBQ0gsZUFBTyxLQUFLLENBQUM7T0FDZCxDQUFDLENBQUM7O0FBRVAsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0tBQzNCOzs7NkJBcEQ2QixhQUFxQjtpQkFDOUIsTUFBTSwwQkFBWSxPQUFPLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztVQUE1RCxRQUFRLFFBQVIsUUFBUTs7QUFDZixhQUFPLFFBQVEsS0FBSyxDQUFDLENBQUM7S0FDdkI7OztTQWpCVSxhQUFhOzs7O0FBcUVuQixJQUFNLFFBQVEsR0FBRztBQUN0QixxQkFBbUIsRUFBQSw2QkFBQyxVQUFrQixFQUFVO0FBQzlDLFFBQU0sZUFBZSxHQUFHLGtCQUFrQixDQUFDO0FBQzNDLHNCQUFrQixHQUFHLFVBQVUsQ0FBQztBQUNoQyxXQUFPLGVBQWUsQ0FBQztHQUN4QjtDQUNGLENBQUMiLCJmaWxlIjoiU2NyaWJlUHJvY2Vzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Y2hlY2tPdXRwdXQsIHNhZmVTcGF3bn0gZnJvbSAnLi9wcm9jZXNzJztcblxubGV0IFNDUklCRV9DQVRfQ09NTUFORCA9ICdzY3JpYmVfY2F0JztcblxuLyoqXG4gKiBBIHdyYXBwZXIgb2YgYHNjcmliZV9jYXRgIChodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2thcmNoaXZlL3NjcmliZS9ibG9iL21hc3Rlci9leGFtcGxlcy9zY3JpYmVfY2F0KVxuICogY29tbWFuZC4gVXNlciBjb3VsZCBjYWxsIGBuZXcgU2NyaWJlUHJvY2Vzcygkc2NyaWJlQ2F0ZWdvcnlOYW1lKWAgdG8gY3JlYXRlIGEgcHJvY2VzcyBhbmQgdGhlblxuICogY2FsbCBgc2NyaWJlUHJvY2Vzcy53cml0ZSgkb2JqZWN0KWAgdG8gc2F2ZSBhbiBKU09OIHNjaGVtYWVkIE9iamVjdCBpbnRvIHNjcmliZSBjYXRlZ29yeS5cbiAqIEl0IHdpbGwgYWxzbyByZWNvdmVyIGZyb20gYHNjcmliZV9jYXRgIGZhaWx1cmUgYXV0b21hdGljYWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIFNjcmliZVByb2Nlc3Mge1xuICBfc2NyaWJlQ2F0ZWdvcnk6IHN0cmluZztcbiAgX2NoaWxkUHJvbWlzZTogP1Byb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+O1xuICBfY2hpbGRQcm9jZXNzUnVubmluZzogV2Vha01hcDxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcywgYm9vbGVhbj47XG5cbiAgY29uc3RydWN0b3Ioc2NyaWJlQ2F0ZWdvcnk6IHN0cmluZykge1xuICAgIHRoaXMuX3NjcmliZUNhdGVnb3J5ID0gc2NyaWJlQ2F0ZWdvcnk7XG4gICAgdGhpcy5fY2hpbGRQcm9jZXNzUnVubmluZyA9IG5ldyBXZWFrTWFwKCk7XG4gICAgdGhpcy5fZ2V0T3JDcmVhdGVDaGlsZFByb2Nlc3MoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBgc2NyaWJlX2NhdGAgZXhpc3RzIGluIFBBVEguXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgaXNTY3JpYmVDYXRPblBhdGgoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qge2V4aXRDb2RlfSA9IGF3YWl0IGNoZWNrT3V0cHV0KCd3aGljaCcsIFtTQ1JJQkVfQ0FUX0NPTU1BTkRdKTtcbiAgICByZXR1cm4gZXhpdENvZGUgPT09IDA7XG4gIH1cblxuICAvKipcbiAgICogV3JpdGUgYW4gT2JqZWN0IHRvIHNjcmliZSBjYXRlZ29yeSB1c2luZyBKU09OLnN0cmluZ2lmeS5cbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgdGhlIG9iamVjdCB0byB3cml0ZS5cbiAgICogQHBhcmFtIHJlcGxhY2VyIG9wdGlvbmFsIHJlcGxhY2VyIGZ1bmN0aW9uIHdoaWNoIGFsdGVycyB0aGUgYmVoYXZpb3Igb2YgdGhlXG4gICAqICAgICAgICBzdHJpbmdpZmljYXRpb24gcHJvY2Vzcy4gcmVmZXJcbiAgICogICAgICAgIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0pTT04vc3RyaW5naWZ5XG4gICAqICAgICAgICBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGFzeW5jIHdyaXRlKG1lc3NhZ2U6IHN0cmluZyB8IE9iamVjdCwgcmVwbGFjZXI/OiAoKT0+bWl4ZWQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBvcyA9IHJlcXVpcmUoJ29zJyk7XG4gICAgY29uc3QgY2hpbGQgPSBhd2FpdCB0aGlzLl9nZXRPckNyZWF0ZUNoaWxkUHJvY2VzcygpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjaGlsZC5zdGRpbi53cml0ZShgJHtKU09OLnN0cmluZ2lmeShtZXNzYWdlKX0ke29zLkVPTH1gLCByZXNvbHZlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2NoaWxkUHJvbWlzZSkge1xuICAgICAgY29uc3QgY2hpbGQgPSBhd2FpdCB0aGlzLl9jaGlsZFByb21pc2U7XG4gICAgICBpZiAodGhpcy5fY2hpbGRQcm9jZXNzUnVubmluZy5nZXQoY2hpbGQpKSB7XG4gICAgICAgIGNoaWxkLmtpbGwoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfZ2V0T3JDcmVhdGVDaGlsZFByb2Nlc3MoKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICAgIGlmICh0aGlzLl9jaGlsZFByb21pc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jaGlsZFByb21pc2U7XG4gICAgfVxuXG4gICAgdGhpcy5fY2hpbGRQcm9taXNlID0gc2FmZVNwYXduKFNDUklCRV9DQVRfQ09NTUFORCwgW3RoaXMuX3NjcmliZUNhdGVnb3J5XSlcbiAgICAgICAgLnRoZW4oY2hpbGQgPT4ge1xuICAgICAgICAgIGNoaWxkLnN0ZGluLnNldERlZmF1bHRFbmNvZGluZygndXRmOCcpO1xuICAgICAgICAgIHRoaXMuX2NoaWxkUHJvY2Vzc1J1bm5pbmcuc2V0KGNoaWxkLCB0cnVlKTtcbiAgICAgICAgICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZFByb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRQcm9jZXNzUnVubmluZy5zZXQoY2hpbGQsIGZhbHNlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjaGlsZC5vbignZXhpdCcsIGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkUHJvY2Vzc1J1bm5pbmcuc2V0KGNoaWxkLCBmYWxzZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLl9jaGlsZFByb21pc2U7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IF9fdGVzdF9fID0ge1xuICBzZXRTY3JpYmVDYXRDb21tYW5kKG5ld0NvbW1hbmQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3Qgb3JpZ2luYWxDb21tYW5kID0gU0NSSUJFX0NBVF9DT01NQU5EO1xuICAgIFNDUklCRV9DQVRfQ09NTUFORCA9IG5ld0NvbW1hbmQ7XG4gICAgcmV0dXJuIG9yaWdpbmFsQ29tbWFuZDtcbiAgfSxcbn07XG4iXX0=