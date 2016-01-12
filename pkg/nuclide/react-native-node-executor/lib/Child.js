Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _child_process = require('child_process');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var Child = (function () {
  function Child(onReply, emitter) {
    var _this = this;

    _classCallCheck(this, Child);

    this._onReply = onReply;
    this._emitter = emitter;
    this._execScriptMessageId = -1;

    // TODO(natthu): Atom v1.2.0 will upgrade Electron to v0.34.0 which in turn vendors in node 4.
    // Once we upgrade to that version of atom, we can remove the `execPath` argument and let Atom
    // invoke the subprocess script.
    this._proc = (0, _child_process.fork)(_path2['default'].join(__dirname, 'executor.js'), [], { execPath: 'node' });
    this._proc.on('message', function (payload) {
      if (_this._execScriptMessageId === payload.replyId) {
        _this._emitter.emit('eval_application_script', _this._proc.pid);
        _this._execScriptMessageId = -1;
      }
      _this._onReply(payload.replyId, payload.result);
    });
  }

  _createClass(Child, [{
    key: 'kill',
    value: function kill() {
      var _this2 = this;

      return new Promise(function (res, rej) {
        _this2._proc.on('close', function () {
          res();
        });
        _this2._proc.kill();
      });
    }
  }, {
    key: 'execScript',
    value: function execScript(script, inject, id) {
      this._execScriptMessageId = id;
      this._proc.send({
        id: id,
        op: 'evalScript',
        data: {
          script: script,
          inject: inject
        }
      });
    }
  }, {
    key: 'execCall',
    value: function execCall(payload, id) {
      this._proc.send({
        id: id,
        op: 'call',
        data: {
          moduleName: payload.moduleName,
          moduleMethod: payload.moduleMethod,
          arguments: payload.arguments
        }
      });
    }
  }]);

  return Child;
})();

exports['default'] = Child;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoaWxkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFXbUIsZUFBZTs7b0JBQ2pCLE1BQU07Ozs7SUFLRixLQUFLO0FBT2IsV0FQUSxLQUFLLENBT1osT0FBNEIsRUFBRSxPQUFxQixFQUFFOzs7MEJBUDlDLEtBQUs7O0FBUXRCLFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQzs7Ozs7QUFLL0IsUUFBSSxDQUFDLEtBQUssR0FBRyx5QkFBSyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0FBQy9FLFFBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFBLE9BQU8sRUFBSTtBQUNsQyxVQUFJLE1BQUssb0JBQW9CLEtBQUssT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUNqRCxjQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsTUFBSyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUQsY0FBSyxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQztPQUNoQztBQUNELFlBQUssUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2hELENBQUMsQ0FBQztHQUNKOztlQXZCa0IsS0FBSzs7V0F5QnBCLGdCQUFrQjs7O0FBQ3BCLGFBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFLO0FBQy9CLGVBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBTTtBQUMzQixhQUFHLEVBQUUsQ0FBQztTQUNQLENBQUMsQ0FBQztBQUNILGVBQUssS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO09BQ25CLENBQUMsQ0FBQztLQUNKOzs7V0FFUyxvQkFBQyxNQUFjLEVBQUUsTUFBYyxFQUFFLEVBQVUsRUFBRTtBQUNyRCxVQUFJLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0FBQy9CLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ2QsVUFBRSxFQUFGLEVBQUU7QUFDRixVQUFFLEVBQUUsWUFBWTtBQUNoQixZQUFJLEVBQUU7QUFDSixnQkFBTSxFQUFOLE1BQU07QUFDTixnQkFBTSxFQUFOLE1BQU07U0FDUDtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFTyxrQkFBQyxPQUFlLEVBQUUsRUFBVSxFQUFFO0FBQ3BDLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ2QsVUFBRSxFQUFGLEVBQUU7QUFDRixVQUFFLEVBQUUsTUFBTTtBQUNWLFlBQUksRUFBRTtBQUNKLG9CQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7QUFDOUIsc0JBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtBQUNsQyxtQkFBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1NBQzdCO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztTQXhEa0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoiQ2hpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2Zvcmt9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB0eXBlIHtTZXJ2ZXJSZXBseUNhbGxiYWNrfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoaWxkIHtcblxuICBfb25SZXBseTogU2VydmVyUmVwbHlDYWxsYmFjaztcbiAgX3Byb2M6IE9iamVjdDtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX2V4ZWNTY3JpcHRNZXNzYWdlSWQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihvblJlcGx5OiBTZXJ2ZXJSZXBseUNhbGxiYWNrLCBlbWl0dGVyOiBFdmVudEVtaXR0ZXIpIHtcbiAgICB0aGlzLl9vblJlcGx5ID0gb25SZXBseTtcbiAgICB0aGlzLl9lbWl0dGVyID0gZW1pdHRlcjtcbiAgICB0aGlzLl9leGVjU2NyaXB0TWVzc2FnZUlkID0gLTE7XG5cbiAgICAvLyBUT0RPKG5hdHRodSk6IEF0b20gdjEuMi4wIHdpbGwgdXBncmFkZSBFbGVjdHJvbiB0byB2MC4zNC4wIHdoaWNoIGluIHR1cm4gdmVuZG9ycyBpbiBub2RlIDQuXG4gICAgLy8gT25jZSB3ZSB1cGdyYWRlIHRvIHRoYXQgdmVyc2lvbiBvZiBhdG9tLCB3ZSBjYW4gcmVtb3ZlIHRoZSBgZXhlY1BhdGhgIGFyZ3VtZW50IGFuZCBsZXQgQXRvbVxuICAgIC8vIGludm9rZSB0aGUgc3VicHJvY2VzcyBzY3JpcHQuXG4gICAgdGhpcy5fcHJvYyA9IGZvcmsocGF0aC5qb2luKF9fZGlybmFtZSwgJ2V4ZWN1dG9yLmpzJyksIFtdLCB7ZXhlY1BhdGg6ICdub2RlJ30pO1xuICAgIHRoaXMuX3Byb2Mub24oJ21lc3NhZ2UnLCBwYXlsb2FkID0+IHtcbiAgICAgIGlmICh0aGlzLl9leGVjU2NyaXB0TWVzc2FnZUlkID09PSBwYXlsb2FkLnJlcGx5SWQpIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdldmFsX2FwcGxpY2F0aW9uX3NjcmlwdCcsIHRoaXMuX3Byb2MucGlkKTtcbiAgICAgICAgdGhpcy5fZXhlY1NjcmlwdE1lc3NhZ2VJZCA9IC0xO1xuICAgICAgfVxuICAgICAgdGhpcy5fb25SZXBseShwYXlsb2FkLnJlcGx5SWQsIHBheWxvYWQucmVzdWx0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGtpbGwoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdGhpcy5fcHJvYy5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgIHJlcygpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9wcm9jLmtpbGwoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4ZWNTY3JpcHQoc2NyaXB0OiBzdHJpbmcsIGluamVjdDogc3RyaW5nLCBpZDogbnVtYmVyKSB7XG4gICAgdGhpcy5fZXhlY1NjcmlwdE1lc3NhZ2VJZCA9IGlkO1xuICAgIHRoaXMuX3Byb2Muc2VuZCh7XG4gICAgICBpZCxcbiAgICAgIG9wOiAnZXZhbFNjcmlwdCcsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHNjcmlwdCxcbiAgICAgICAgaW5qZWN0LFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGV4ZWNDYWxsKHBheWxvYWQ6IE9iamVjdCwgaWQ6IG51bWJlcikge1xuICAgIHRoaXMuX3Byb2Muc2VuZCh7XG4gICAgICBpZCxcbiAgICAgIG9wOiAnY2FsbCcsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIG1vZHVsZU5hbWU6IHBheWxvYWQubW9kdWxlTmFtZSxcbiAgICAgICAgbW9kdWxlTWV0aG9kOiBwYXlsb2FkLm1vZHVsZU1ldGhvZCxcbiAgICAgICAgYXJndW1lbnRzOiBwYXlsb2FkLmFyZ3VtZW50cyxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==