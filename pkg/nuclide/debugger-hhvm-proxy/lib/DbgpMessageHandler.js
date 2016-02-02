Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.getDbgpMessageHandlerInstance = getDbgpMessageHandlerInstance;

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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var GLOBAL_HHVM_DEBUGGER_KEY = '_global_hhvm_debugger_key';

var DbgpMessageHandler = (function () {
  function DbgpMessageHandler() {
    _classCallCheck(this, DbgpMessageHandler);
  }

  /**
   * A single dbgp message is of the format below:
   * Completed message:   length <NULL> xml-blob <NULL>
   * Incompleted message: length <NULL> xml-blob-part1
   * Once an incompleted message is received the next server message
   * will be in following format:
   * xml-blob-part2
   *
   * A single response from the server may contain
   * multiple DbgpMessages.
   *
   * Throws if the message is malformatted.
   */

  _createClass(DbgpMessageHandler, [{
    key: 'parseMessages',
    value: function parseMessages(data) {
      var components = data.split('\x00');
      /**
       * components.length can be 1, 2 or more than 3:
       * 1: The whole data block is part of a full message(xml-partX).
       * 2: length<NULL>xml-part1.
       * >=3: Other scenarios.
       */
      _utils2['default'].log('Total components: ' + components.length);

      // Merge head component with prevIncompletedMessage if needed.
      var results = [];
      var prevIncompletedMessage = this._prevIncompletedMessage;
      if (prevIncompletedMessage) {
        var firstMessageContent = components.shift();
        prevIncompletedMessage.content += firstMessageContent;

        if (this._isCompletedMessage(prevIncompletedMessage)) {
          results.push(this._parseXml(prevIncompletedMessage));
          prevIncompletedMessage = null;
        }
      }

      // Verify that we can't get another message without completing previous one.
      if (prevIncompletedMessage && components.length !== 0) {
        _utils2['default'].logErrorAndThrow('Error: got extra messages without completing previous message.');
      }

      var isIncompleteResponse = components.length % 2 === 0;

      // Verify empty tail component for completed response.
      if (!isIncompleteResponse) {
        var lastComponent = components.pop();
        if (lastComponent.length !== 0) {
          _utils2['default'].logErrorAndThrow('The complete response should terminate with' + (' zero character while got: ' + lastComponent + ' '));
        }
      }

      // Process two tail components into prevIncompletedMessage for incompleted response.
      if (isIncompleteResponse && components.length > 0) {
        (0, _assert2['default'])(components.length >= 2);
        // content comes after length.
        var _content = components.pop();
        var _length = Number(components.pop());
        var lastMessage = { length: _length, content: _content };
        if (!this._isIncompletedMessage(lastMessage)) {
          _utils2['default'].logErrorAndThrow('The last message should be a fragment of a full message: ' + JSON.stringify(lastMessage));
        }
        prevIncompletedMessage = lastMessage;
      }

      // The remaining middle components should all be completed messages.
      (0, _assert2['default'])(components.length % 2 === 0);
      while (components.length >= 2) {
        var message = {
          length: Number(components.shift()),
          content: components.shift()
        };
        if (!this._isCompletedMessage(message)) {
          _utils2['default'].logErrorAndThrow('Got message length(' + message.content.length + ')' + (' not equal to expected(' + message.length + ').'));
        }
        results.push(this._parseXml(message));
      }
      this._prevIncompletedMessage = prevIncompletedMessage;
      return results;
    }
  }, {
    key: '_isCompletedMessage',
    value: function _isCompletedMessage(message) {
      return message.length === message.content.length;
    }
  }, {
    key: '_isIncompletedMessage',
    value: function _isIncompletedMessage(message) {
      return message.length > message.content.length;
    }

    /**
     * Convert xml to JS. Uses the xml2js package.
     * xml2js has a rather ... unique ... callback based API for a
     * synchronous operation. This functions purpose is to give a reasonable API.
     *
     * Format of the result:
     * Children become fields.
     * Multiple children of the same name become arrays.
     * Attributes become children of the '$' member
     * Body becomes either a string (if no attributes or children)
     * or the '_' member.
     * CDATA becomes an array containing a string, or just a string.
     *
     * Throws if the input is not valid xml.
     */
  }, {
    key: '_parseXml',
    value: function _parseXml(message) {
      var xml = message.content;
      var errorValue = undefined;
      var resultValue = undefined;
      require('xml2js').parseString(xml, function (error, result) {
        errorValue = error;
        resultValue = result;
      });
      if (errorValue !== null) {
        throw new Error('Error ' + JSON.stringify(errorValue) + ' parsing xml: ' + xml);
      }
      _utils2['default'].log('Translating server message result json: ' + JSON.stringify(resultValue));
      (0, _assert2['default'])(resultValue != null);
      return resultValue;
    }

    // For testing purpose.
  }, {
    key: 'clearIncompletedMessage',
    value: function clearIncompletedMessage() {
      this._prevIncompletedMessage = null;
    }
  }]);

  return DbgpMessageHandler;
})();

exports.DbgpMessageHandler = DbgpMessageHandler;

function getDbgpMessageHandlerInstance() {
  return require('../../commons').singleton.get(GLOBAL_HHVM_DEBUGGER_KEY, function () {
    return new DbgpMessageHandler();
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRiZ3BNZXNzYWdlSGFuZGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXbUIsU0FBUzs7OztzQkFDTixRQUFROzs7O0FBRTlCLElBQU0sd0JBQXdCLEdBQUcsMkJBQTJCLENBQUM7O0lBT2hELGtCQUFrQjtBQUdsQixXQUhBLGtCQUFrQixHQUdmOzBCQUhILGtCQUFrQjtHQUdiOzs7Ozs7Ozs7Ozs7Ozs7O2VBSEwsa0JBQWtCOztXQWtCaEIsdUJBQUMsSUFBWSxFQUFpQjtBQUN6QyxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzs7Ozs7O0FBT3RDLHlCQUFPLEdBQUcsd0JBQXNCLFVBQVUsQ0FBQyxNQUFNLENBQUcsQ0FBQzs7O0FBR3JELFVBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNuQixVQUFJLHNCQUFzQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztBQUMxRCxVQUFJLHNCQUFzQixFQUFFO0FBQzFCLFlBQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9DLDhCQUFzQixDQUFDLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQzs7QUFFdEQsWUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsc0JBQXNCLENBQUMsRUFBRTtBQUNwRCxpQkFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztBQUNyRCxnQ0FBc0IsR0FBRyxJQUFJLENBQUM7U0FDL0I7T0FDRjs7O0FBR0QsVUFBSSxzQkFBc0IsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNyRCwyQkFBTyxnQkFBZ0Isa0VBQWtFLENBQUM7T0FDM0Y7O0FBRUQsVUFBTSxvQkFBb0IsR0FBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLEFBQUMsQ0FBQzs7O0FBRzNELFVBQUksQ0FBQyxv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LElBQUksQ0FBQyxDQUFDO0FBQy9CLGFBQU8sV0FBVyxDQUFDO0tBQ3BCOzs7OztXQUdzQixtQ0FBUztBQUM5QixVQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO0tBQ3JDOzs7U0FsSVUsa0JBQWtCOzs7OztBQXFJeEIsU0FBUyw2QkFBNkIsR0FBdUI7QUFDbEUsU0FBTyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FDM0Msd0JBQXdCLEVBQUUsWUFBTTtBQUM5QixXQUFPLElBQUksa0JBQWtCLEVBQUUsQ0FBQztHQUNqQyxDQUFDLENBQUM7Q0FDTiIsImZpbGUiOiJEYmdwTWVzc2FnZUhhbmRsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBHTE9CQUxfSEhWTV9ERUJVR0dFUl9LRVkgPSAnX2dsb2JhbF9oaHZtX2RlYnVnZ2VyX2tleSc7XG5cbnR5cGUgRGJncE1lc3NhZ2UgPSB7XG4gIGxlbmd0aDogbnVtYmVyLFxuICBjb250ZW50OiBzdHJpbmcsXG59O1xuXG5leHBvcnQgY2xhc3MgRGJncE1lc3NhZ2VIYW5kbGVyIHtcbiAgX3ByZXZJbmNvbXBsZXRlZE1lc3NhZ2U6ID9EYmdwTWVzc2FnZTtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgLyoqXG4gICAqIEEgc2luZ2xlIGRiZ3AgbWVzc2FnZSBpcyBvZiB0aGUgZm9ybWF0IGJlbG93OlxuICAgKiBDb21wbGV0ZWQgbWVzc2FnZTogICBsZW5ndGggPE5VTEw+IHhtbC1ibG9iIDxOVUxMPlxuICAgKiBJbmNvbXBsZXRlZCBtZXNzYWdlOiBsZW5ndGggPE5VTEw+IHhtbC1ibG9iLXBhcnQxXG4gICAqIE9uY2UgYW4gaW5jb21wbGV0ZWQgbWVzc2FnZSBpcyByZWNlaXZlZCB0aGUgbmV4dCBzZXJ2ZXIgbWVzc2FnZVxuICAgKiB3aWxsIGJlIGluIGZvbGxvd2luZyBmb3JtYXQ6XG4gICAqIHhtbC1ibG9iLXBhcnQyXG4gICAqXG4gICAqIEEgc2luZ2xlIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlciBtYXkgY29udGFpblxuICAgKiBtdWx0aXBsZSBEYmdwTWVzc2FnZXMuXG4gICAqXG4gICAqIFRocm93cyBpZiB0aGUgbWVzc2FnZSBpcyBtYWxmb3JtYXR0ZWQuXG4gICAqL1xuICBwYXJzZU1lc3NhZ2VzKGRhdGE6IHN0cmluZyk6IEFycmF5PE9iamVjdD4ge1xuICAgIGNvbnN0IGNvbXBvbmVudHMgPSBkYXRhLnNwbGl0KCdcXHgwMCcpO1xuICAgIC8qKlxuICAgICAqIGNvbXBvbmVudHMubGVuZ3RoIGNhbiBiZSAxLCAyIG9yIG1vcmUgdGhhbiAzOlxuICAgICAqIDE6IFRoZSB3aG9sZSBkYXRhIGJsb2NrIGlzIHBhcnQgb2YgYSBmdWxsIG1lc3NhZ2UoeG1sLXBhcnRYKS5cbiAgICAgKiAyOiBsZW5ndGg8TlVMTD54bWwtcGFydDEuXG4gICAgICogPj0zOiBPdGhlciBzY2VuYXJpb3MuXG4gICAgICovXG4gICAgbG9nZ2VyLmxvZyhgVG90YWwgY29tcG9uZW50czogJHtjb21wb25lbnRzLmxlbmd0aH1gKTtcblxuICAgIC8vIE1lcmdlIGhlYWQgY29tcG9uZW50IHdpdGggcHJldkluY29tcGxldGVkTWVzc2FnZSBpZiBuZWVkZWQuXG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgIGxldCBwcmV2SW5jb21wbGV0ZWRNZXNzYWdlID0gdGhpcy5fcHJldkluY29tcGxldGVkTWVzc2FnZTtcbiAgICBpZiAocHJldkluY29tcGxldGVkTWVzc2FnZSkge1xuICAgICAgY29uc3QgZmlyc3RNZXNzYWdlQ29udGVudCA9IGNvbXBvbmVudHMuc2hpZnQoKTtcbiAgICAgIHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UuY29udGVudCArPSBmaXJzdE1lc3NhZ2VDb250ZW50O1xuXG4gICAgICBpZiAodGhpcy5faXNDb21wbGV0ZWRNZXNzYWdlKHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9wYXJzZVhtbChwcmV2SW5jb21wbGV0ZWRNZXNzYWdlKSk7XG4gICAgICAgIHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZlcmlmeSB0aGF0IHdlIGNhbid0IGdldCBhbm90aGVyIG1lc3NhZ2Ugd2l0aG91dCBjb21wbGV0aW5nIHByZXZpb3VzIG9uZS5cbiAgICBpZiAocHJldkluY29tcGxldGVkTWVzc2FnZSAmJiBjb21wb25lbnRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgbG9nZ2VyLmxvZ0Vycm9yQW5kVGhyb3coYEVycm9yOiBnb3QgZXh0cmEgbWVzc2FnZXMgd2l0aG91dCBjb21wbGV0aW5nIHByZXZpb3VzIG1lc3NhZ2UuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgaXNJbmNvbXBsZXRlUmVzcG9uc2UgPSAoY29tcG9uZW50cy5sZW5ndGggJSAyID09PSAwKTtcblxuICAgIC8vIFZlcmlmeSBlbXB0eSB0YWlsIGNvbXBvbmVudCBmb3IgY29tcGxldGVkIHJlc3BvbnNlLlxuICAgIGlmICghaXNJbmNvbXBsZXRlUmVzcG9uc2UpIHtcbiAgICAgIGNvbnN0IGxhc3RDb21wb25lbnQgPSBjb21wb25lbnRzLnBvcCgpO1xuICAgICAgaWYgKGxhc3RDb21wb25lbnQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIGxvZ2dlci5sb2dFcnJvckFuZFRocm93KGBUaGUgY29tcGxldGUgcmVzcG9uc2Ugc2hvdWxkIHRlcm1pbmF0ZSB3aXRoYCArXG4gICAgICAgICAgYCB6ZXJvIGNoYXJhY3RlciB3aGlsZSBnb3Q6ICR7bGFzdENvbXBvbmVudH0gYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyB0d28gdGFpbCBjb21wb25lbnRzIGludG8gcHJldkluY29tcGxldGVkTWVzc2FnZSBmb3IgaW5jb21wbGV0ZWQgcmVzcG9uc2UuXG4gICAgaWYgKGlzSW5jb21wbGV0ZVJlc3BvbnNlICYmIGNvbXBvbmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgaW52YXJpYW50KGNvbXBvbmVudHMubGVuZ3RoID49IDIpO1xuICAgICAgLy8gY29udGVudCBjb21lcyBhZnRlciBsZW5ndGguXG4gICAgICBjb25zdCBjb250ZW50ID0gY29tcG9uZW50cy5wb3AoKTtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IE51bWJlcihjb21wb25lbnRzLnBvcCgpKTtcbiAgICAgIGNvbnN0IGxhc3RNZXNzYWdlID0ge2xlbmd0aCwgY29udGVudH07XG4gICAgICBpZiAoIXRoaXMuX2lzSW5jb21wbGV0ZWRNZXNzYWdlKGxhc3RNZXNzYWdlKSkge1xuICAgICAgICBsb2dnZXIubG9nRXJyb3JBbmRUaHJvdyhgVGhlIGxhc3QgbWVzc2FnZSBzaG91bGQgYmUgYSBmcmFnbWVudCBvZiBhIGZ1bGwgbWVzc2FnZTogYCArXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkobGFzdE1lc3NhZ2UpKTtcbiAgICAgIH1cbiAgICAgIHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UgPSBsYXN0TWVzc2FnZTtcbiAgICB9XG5cbiAgICAvLyBUaGUgcmVtYWluaW5nIG1pZGRsZSBjb21wb25lbnRzIHNob3VsZCBhbGwgYmUgY29tcGxldGVkIG1lc3NhZ2VzLlxuICAgIGludmFyaWFudChjb21wb25lbnRzLmxlbmd0aCAlIDIgPT09IDApO1xuICAgIHdoaWxlIChjb21wb25lbnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0ge1xuICAgICAgICBsZW5ndGg6IE51bWJlcihjb21wb25lbnRzLnNoaWZ0KCkpLFxuICAgICAgICBjb250ZW50OiBjb21wb25lbnRzLnNoaWZ0KCksXG4gICAgICB9O1xuICAgICAgaWYgKCF0aGlzLl9pc0NvbXBsZXRlZE1lc3NhZ2UobWVzc2FnZSkpIHtcbiAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yQW5kVGhyb3coYEdvdCBtZXNzYWdlIGxlbmd0aCgke21lc3NhZ2UuY29udGVudC5sZW5ndGh9KWAgK1xuICAgICAgICAgIGAgbm90IGVxdWFsIHRvIGV4cGVjdGVkKCR7bWVzc2FnZS5sZW5ndGh9KS5gKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9wYXJzZVhtbChtZXNzYWdlKSk7XG4gICAgfVxuICAgIHRoaXMuX3ByZXZJbmNvbXBsZXRlZE1lc3NhZ2UgPSBwcmV2SW5jb21wbGV0ZWRNZXNzYWdlO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgX2lzQ29tcGxldGVkTWVzc2FnZShtZXNzYWdlOiBEYmdwTWVzc2FnZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBtZXNzYWdlLmxlbmd0aCA9PT0gbWVzc2FnZS5jb250ZW50Lmxlbmd0aDtcbiAgfVxuXG4gIF9pc0luY29tcGxldGVkTWVzc2FnZShtZXNzYWdlOiBEYmdwTWVzc2FnZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBtZXNzYWdlLmxlbmd0aCA+IG1lc3NhZ2UuY29udGVudC5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB4bWwgdG8gSlMuIFVzZXMgdGhlIHhtbDJqcyBwYWNrYWdlLlxuICAgKiB4bWwyanMgaGFzIGEgcmF0aGVyIC4uLiB1bmlxdWUgLi4uIGNhbGxiYWNrIGJhc2VkIEFQSSBmb3IgYVxuICAgKiBzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoaXMgZnVuY3Rpb25zIHB1cnBvc2UgaXMgdG8gZ2l2ZSBhIHJlYXNvbmFibGUgQVBJLlxuICAgKlxuICAgKiBGb3JtYXQgb2YgdGhlIHJlc3VsdDpcbiAgICogQ2hpbGRyZW4gYmVjb21lIGZpZWxkcy5cbiAgICogTXVsdGlwbGUgY2hpbGRyZW4gb2YgdGhlIHNhbWUgbmFtZSBiZWNvbWUgYXJyYXlzLlxuICAgKiBBdHRyaWJ1dGVzIGJlY29tZSBjaGlsZHJlbiBvZiB0aGUgJyQnIG1lbWJlclxuICAgKiBCb2R5IGJlY29tZXMgZWl0aGVyIGEgc3RyaW5nIChpZiBubyBhdHRyaWJ1dGVzIG9yIGNoaWxkcmVuKVxuICAgKiBvciB0aGUgJ18nIG1lbWJlci5cbiAgICogQ0RBVEEgYmVjb21lcyBhbiBhcnJheSBjb250YWluaW5nIGEgc3RyaW5nLCBvciBqdXN0IGEgc3RyaW5nLlxuICAgKlxuICAgKiBUaHJvd3MgaWYgdGhlIGlucHV0IGlzIG5vdCB2YWxpZCB4bWwuXG4gICAqL1xuICBfcGFyc2VYbWwobWVzc2FnZTogRGJncE1lc3NhZ2UpOiBPYmplY3Qge1xuICAgIGNvbnN0IHhtbCA9IG1lc3NhZ2UuY29udGVudDtcbiAgICBsZXQgZXJyb3JWYWx1ZTtcbiAgICBsZXQgcmVzdWx0VmFsdWU7XG4gICAgcmVxdWlyZSgneG1sMmpzJykucGFyc2VTdHJpbmcoeG1sLCAoZXJyb3IsIHJlc3VsdCkgPT4ge1xuICAgICAgZXJyb3JWYWx1ZSA9IGVycm9yO1xuICAgICAgcmVzdWx0VmFsdWUgPSByZXN1bHQ7XG4gICAgfSk7XG4gICAgaWYgKGVycm9yVmFsdWUgIT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgJyArIEpTT04uc3RyaW5naWZ5KGVycm9yVmFsdWUpICsgJyBwYXJzaW5nIHhtbDogJyArIHhtbCk7XG4gICAgfVxuICAgIGxvZ2dlci5sb2coJ1RyYW5zbGF0aW5nIHNlcnZlciBtZXNzYWdlIHJlc3VsdCBqc29uOiAnICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0VmFsdWUpKTtcbiAgICBpbnZhcmlhbnQocmVzdWx0VmFsdWUgIT0gbnVsbCk7XG4gICAgcmV0dXJuIHJlc3VsdFZhbHVlO1xuICB9XG5cbiAgLy8gRm9yIHRlc3RpbmcgcHVycG9zZS5cbiAgY2xlYXJJbmNvbXBsZXRlZE1lc3NhZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5fcHJldkluY29tcGxldGVkTWVzc2FnZSA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERiZ3BNZXNzYWdlSGFuZGxlckluc3RhbmNlKCk6IERiZ3BNZXNzYWdlSGFuZGxlciB7XG4gIHJldHVybiByZXF1aXJlKCcuLi8uLi9jb21tb25zJykuc2luZ2xldG9uLmdldChcbiAgICBHTE9CQUxfSEhWTV9ERUJVR0dFUl9LRVksICgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGJncE1lc3NhZ2VIYW5kbGVyKCk7XG4gICAgfSk7XG59XG4iXX0=