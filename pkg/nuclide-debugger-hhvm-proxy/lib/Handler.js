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

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _ClientCallback = require('./ClientCallback');

var Handler = (function () {
  function Handler(domain, clientCallback) {
    _classCallCheck(this, Handler);

    this._domain = domain;
    this._clientCallback = clientCallback;
  }

  _createClass(Handler, [{
    key: 'getDomain',
    value: function getDomain() {
      return this._domain;
    }
  }, {
    key: 'handleMethod',
    value: function handleMethod(id, method, params) {
      throw new Error('absrtact');
    }
  }, {
    key: 'unknownMethod',
    value: function unknownMethod(id, method, params) {
      var message = 'Unknown chrome dev tools method: ' + this.getDomain() + '.' + method;
      _utils2['default'].log(message);
      this.replyWithError(id, message);
    }
  }, {
    key: 'replyWithError',
    value: function replyWithError(id, error) {
      this._clientCallback.replyWithError(id, error);
    }
  }, {
    key: 'replyToCommand',
    value: function replyToCommand(id, result, error) {
      this._clientCallback.replyToCommand(id, result, error);
    }
  }, {
    key: 'sendMethod',
    value: function sendMethod(method, params) {
      this._clientCallback.sendMethod(this._clientCallback.getServerMessageObservable(), method, params);
    }
  }, {
    key: 'sendUserMessage',
    value: function sendUserMessage(type, message) {
      this._clientCallback.sendUserMessage(type, message);
    }
  }]);

  return Handler;
})();

module.exports = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbmRsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7cUJBV21CLFNBQVM7Ozs7OEJBQ0Msa0JBQWtCOztJQUd6QyxPQUFPO0FBSUEsV0FKUCxPQUFPLENBS1QsTUFBYyxFQUNkLGNBQThCLEVBQzlCOzBCQVBFLE9BQU87O0FBUVQsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7R0FDdkM7O2VBVkcsT0FBTzs7V0FZRixxQkFBVztBQUNsQixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDckI7OztXQUVXLHNCQUFDLEVBQVUsRUFBRSxNQUFjLEVBQUUsTUFBYyxFQUFXO0FBQ2hFLFlBQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDN0I7OztXQUVZLHVCQUFDLEVBQVUsRUFBRSxNQUFjLEVBQUUsTUFBZSxFQUFRO0FBQy9ELFVBQU0sT0FBTyxHQUFHLG1DQUFtQyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO0FBQ3RGLHlCQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwQixVQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNsQzs7O1dBRWEsd0JBQUMsRUFBVSxFQUFFLEtBQWEsRUFBUTtBQUM5QyxVQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDaEQ7OztXQUVhLHdCQUFDLEVBQVUsRUFBRSxNQUFjLEVBQUUsS0FBYyxFQUFRO0FBQy9ELFVBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDeEQ7OztXQUVTLG9CQUFDLE1BQWMsRUFBRSxNQUFlLEVBQVE7QUFDaEQsVUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQzdCLElBQUksQ0FBQyxlQUFlLENBQUMsMEJBQTBCLEVBQUUsRUFDakQsTUFBTSxFQUNOLE1BQU0sQ0FDUCxDQUFDO0tBQ0g7OztXQUVjLHlCQUFDLElBQXFCLEVBQUUsT0FBZSxFQUFRO0FBQzVELFVBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNyRDs7O1NBNUNHLE9BQU87OztBQStDYixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyIsImZpbGUiOiJIYW5kbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Q2xpZW50Q2FsbGJhY2t9IGZyb20gJy4vQ2xpZW50Q2FsbGJhY2snO1xuaW1wb3J0IHR5cGUge1VzZXJNZXNzYWdlVHlwZX0gZnJvbSAnLi9DbGllbnRDYWxsYmFjayc7XG5cbmNsYXNzIEhhbmRsZXIge1xuICBfZG9tYWluOiBzdHJpbmc7XG4gIF9jbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2s7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZG9tYWluOiBzdHJpbmcsXG4gICAgY2xpZW50Q2FsbGJhY2s6IENsaWVudENhbGxiYWNrXG4gICkge1xuICAgIHRoaXMuX2RvbWFpbiA9IGRvbWFpbjtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjayA9IGNsaWVudENhbGxiYWNrO1xuICB9XG5cbiAgZ2V0RG9tYWluKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2RvbWFpbjtcbiAgfVxuXG4gIGhhbmRsZU1ldGhvZChpZDogbnVtYmVyLCBtZXRob2Q6IHN0cmluZywgcGFyYW1zOiBPYmplY3QpOiBQcm9taXNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3J0YWN0Jyk7XG4gIH1cblxuICB1bmtub3duTWV0aG9kKGlkOiBudW1iZXIsIG1ldGhvZDogc3RyaW5nLCBwYXJhbXM6ID9PYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBtZXNzYWdlID0gJ1Vua25vd24gY2hyb21lIGRldiB0b29scyBtZXRob2Q6ICcgKyB0aGlzLmdldERvbWFpbigpICsgJy4nICsgbWV0aG9kO1xuICAgIGxvZ2dlci5sb2cobWVzc2FnZSk7XG4gICAgdGhpcy5yZXBseVdpdGhFcnJvcihpZCwgbWVzc2FnZSk7XG4gIH1cblxuICByZXBseVdpdGhFcnJvcihpZDogbnVtYmVyLCBlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2sucmVwbHlXaXRoRXJyb3IoaWQsIGVycm9yKTtcbiAgfVxuXG4gIHJlcGx5VG9Db21tYW5kKGlkOiBudW1iZXIsIHJlc3VsdDogT2JqZWN0LCBlcnJvcjogP3N0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnJlcGx5VG9Db21tYW5kKGlkLCByZXN1bHQsIGVycm9yKTtcbiAgfVxuXG4gIHNlbmRNZXRob2QobWV0aG9kOiBzdHJpbmcsIHBhcmFtczogP09iamVjdCk6IHZvaWQge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRNZXRob2QoXG4gICAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5nZXRTZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSgpLFxuICAgICAgbWV0aG9kLFxuICAgICAgcGFyYW1zLFxuICAgICk7XG4gIH1cblxuICBzZW5kVXNlck1lc3NhZ2UodHlwZTogVXNlck1lc3NhZ2VUeXBlLCBtZXNzYWdlOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck1lc3NhZ2UodHlwZSwgbWVzc2FnZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGVyO1xuIl19