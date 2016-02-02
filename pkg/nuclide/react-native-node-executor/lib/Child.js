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
          method: payload.method,
          arguments: payload.arguments
        }
      });
    }
  }]);

  return Child;
})();

exports['default'] = Child;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoaWxkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFXbUIsZUFBZTs7b0JBQ2pCLE1BQU07Ozs7SUFLRixLQUFLO0FBT2IsV0FQUSxLQUFLLENBT1osT0FBNEIsRUFBRSxPQUFxQixFQUFFOzs7MEJBUDlDLEtBQUs7O0FBUXRCLFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQzs7Ozs7QUFLL0IsUUFBSSxDQUFDLEtBQUssR0FBRyx5QkFBSyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0FBQy9FLFFBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFBLE9BQU8sRUFBSTtBQUNsQyxVQUFJLE1BQUssb0JBQW9CLEtBQUssT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUNqRCxjQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsTUFBSyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUQsY0FBSyxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQztPQUNoQztBQUNELFlBQUssUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2hELENBQUMsQ0FBQztHQUNKOztlQXZCa0IsS0FBSzs7V0F5QnBCLGdCQUFrQjs7O0FBQ3BCLGFBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFLO0FBQy9CLGVBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBTTtBQUMzQixhQUFHLEVBQUUsQ0FBQztTQUNQLENBQUMsQ0FBQztBQUNILGVBQUssS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO09BQ25CLENBQUMsQ0FBQztLQUNKOzs7V0FFUyxvQkFBQyxNQUFjLEVBQUUsTUFBYyxFQUFFLEVBQVUsRUFBRTtBQUNyRCxVQUFJLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0FBQy9CLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ2QsVUFBRSxFQUFGLEVBQUU7QUFDRixVQUFFLEVBQUUsWUFBWTtBQUNoQixZQUFJLEVBQUU7QUFDSixnQkFBTSxFQUFOLE1BQU07QUFDTixnQkFBTSxFQUFOLE1BQU07U0FDUDtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFTyxrQkFBQyxPQUFlLEVBQUUsRUFBVSxFQUFFO0FBQ3BDLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ2QsVUFBRSxFQUFGLEVBQUU7QUFDRixVQUFFLEVBQUUsTUFBTTtBQUNWLFlBQUksRUFBRTtBQUNKLGdCQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07QUFDdEIsbUJBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztTQUM3QjtPQUNGLENBQUMsQ0FBQztLQUNKOzs7U0F2RGtCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6IkNoaWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtmb3JrfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgdHlwZSB7U2VydmVyUmVwbHlDYWxsYmFja30gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGlsZCB7XG5cbiAgX29uUmVwbHk6IFNlcnZlclJlcGx5Q2FsbGJhY2s7XG4gIF9wcm9jOiBPYmplY3Q7XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9leGVjU2NyaXB0TWVzc2FnZUlkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Iob25SZXBseTogU2VydmVyUmVwbHlDYWxsYmFjaywgZW1pdHRlcjogRXZlbnRFbWl0dGVyKSB7XG4gICAgdGhpcy5fb25SZXBseSA9IG9uUmVwbHk7XG4gICAgdGhpcy5fZW1pdHRlciA9IGVtaXR0ZXI7XG4gICAgdGhpcy5fZXhlY1NjcmlwdE1lc3NhZ2VJZCA9IC0xO1xuXG4gICAgLy8gVE9ETyhuYXR0aHUpOiBBdG9tIHYxLjIuMCB3aWxsIHVwZ3JhZGUgRWxlY3Ryb24gdG8gdjAuMzQuMCB3aGljaCBpbiB0dXJuIHZlbmRvcnMgaW4gbm9kZSA0LlxuICAgIC8vIE9uY2Ugd2UgdXBncmFkZSB0byB0aGF0IHZlcnNpb24gb2YgYXRvbSwgd2UgY2FuIHJlbW92ZSB0aGUgYGV4ZWNQYXRoYCBhcmd1bWVudCBhbmQgbGV0IEF0b21cbiAgICAvLyBpbnZva2UgdGhlIHN1YnByb2Nlc3Mgc2NyaXB0LlxuICAgIHRoaXMuX3Byb2MgPSBmb3JrKHBhdGguam9pbihfX2Rpcm5hbWUsICdleGVjdXRvci5qcycpLCBbXSwge2V4ZWNQYXRoOiAnbm9kZSd9KTtcbiAgICB0aGlzLl9wcm9jLm9uKCdtZXNzYWdlJywgcGF5bG9hZCA9PiB7XG4gICAgICBpZiAodGhpcy5fZXhlY1NjcmlwdE1lc3NhZ2VJZCA9PT0gcGF5bG9hZC5yZXBseUlkKSB7XG4gICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZXZhbF9hcHBsaWNhdGlvbl9zY3JpcHQnLCB0aGlzLl9wcm9jLnBpZCk7XG4gICAgICAgIHRoaXMuX2V4ZWNTY3JpcHRNZXNzYWdlSWQgPSAtMTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX29uUmVwbHkocGF5bG9hZC5yZXBseUlkLCBwYXlsb2FkLnJlc3VsdCk7XG4gICAgfSk7XG4gIH1cblxuICBraWxsKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMuX3Byb2Mub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICByZXMoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcHJvYy5raWxsKCk7XG4gICAgfSk7XG4gIH1cblxuICBleGVjU2NyaXB0KHNjcmlwdDogc3RyaW5nLCBpbmplY3Q6IHN0cmluZywgaWQ6IG51bWJlcikge1xuICAgIHRoaXMuX2V4ZWNTY3JpcHRNZXNzYWdlSWQgPSBpZDtcbiAgICB0aGlzLl9wcm9jLnNlbmQoe1xuICAgICAgaWQsXG4gICAgICBvcDogJ2V2YWxTY3JpcHQnLFxuICAgICAgZGF0YToge1xuICAgICAgICBzY3JpcHQsXG4gICAgICAgIGluamVjdCxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBleGVjQ2FsbChwYXlsb2FkOiBPYmplY3QsIGlkOiBudW1iZXIpIHtcbiAgICB0aGlzLl9wcm9jLnNlbmQoe1xuICAgICAgaWQsXG4gICAgICBvcDogJ2NhbGwnLFxuICAgICAgZGF0YToge1xuICAgICAgICBtZXRob2Q6IHBheWxvYWQubWV0aG9kLFxuICAgICAgICBhcmd1bWVudHM6IHBheWxvYWQuYXJndW1lbnRzLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuIl19