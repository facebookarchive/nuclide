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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.getTypeHintTree = getTypeHintTree;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _FlowServiceFactory = require('./FlowServiceFactory');

var _constants = require('./constants');

var _require = require('../../atom-helpers');

var extractWordAtPosition = _require.extractWordAtPosition;

var featureConfig = require('../../feature-config');

var _require2 = require('atom');

var Range = _require2.Range;

var FlowTypeHintProvider = (function () {
  function FlowTypeHintProvider() {
    _classCallCheck(this, FlowTypeHintProvider);
  }

  // TODO Import from type-hints package once it exposes it.

  _createClass(FlowTypeHintProvider, [{
    key: 'typeHint',
    value: _asyncToGenerator(function* (editor, position) {
      var enabled = featureConfig.get('nuclide-flow.enableTypeHints');
      if (!enabled) {
        return null;
      }
      var filePath = editor.getPath();
      if (filePath == null) {
        return null;
      }
      var contents = editor.getText();
      var flowService = yield (0, _FlowServiceFactory.getFlowServiceByNuclideUri)(filePath);
      (0, _assert2['default'])(flowService);

      var enableStructuredTypeHints = featureConfig.get('nuclide-flow.enableStructuredTypeHints');
      var getTypeResult = yield flowService.flowGetType(filePath, contents, position.row, position.column, enableStructuredTypeHints);
      if (getTypeResult == null) {
        return null;
      }
      var type = getTypeResult.type;
      var rawType = getTypeResult.rawType;

      // TODO(nmote) refine this regex to better capture JavaScript expressions.
      // Having this regex be not quite right is just a display issue, though --
      // it only affects the location of the tooltip.
      var word = extractWordAtPosition(editor, position, _constants.JAVASCRIPT_WORD_REGEX);
      var range = undefined;
      if (word) {
        range = word.range;
      } else {
        range = new Range(position, position);
      }
      var result = {
        hint: type,
        range: range
      };
      var hintTree = getTypeHintTree(rawType);
      if (hintTree) {
        return _extends({}, result, {
          hintTree: hintTree
        });
      } else {
        return result;
      }
    })
  }]);

  return FlowTypeHintProvider;
})();

exports.FlowTypeHintProvider = FlowTypeHintProvider;

function getTypeHintTree(typeHint) {
  if (!typeHint) {
    return null;
  }
  try {
    var json = JSON.parse(typeHint);
    return jsonToTree(json);
  } catch (e) {
    var logger = require('../../logging').getLogger();
    logger.error('Problem parsing type hint: ' + e.message);
    // If there is any problem parsing just fall back on the original string
    return null;
  }
}

var OBJECT = 'ObjT';
var NUMBER = 'NumT';
var STRING = 'StrT';
var BOOLEAN = 'BoolT';
var MAYBE = 'MaybeT';
var ANYOBJECT = 'AnyObjT';
var ARRAY = 'ArrT';
var FUNCTION = 'FunT';

function jsonToTree(json) {
  var kind = json['kind'];
  switch (kind) {
    case OBJECT:
      var propTypes = json['type']['propTypes'];
      var children = [];
      for (var prop of propTypes) {
        var propName = prop['name'];
        var _childTree = jsonToTree(prop['type']);
        // Instead of making single child node just for the type name, we'll graft the type onto the
        // end of the property name.
        children.push({
          value: propName + ': ' + _childTree.value,
          children: _childTree.children
        });
      }
      return {
        value: 'Object',
        children: children
      };
    case NUMBER:
      return {
        value: 'number'
      };
    case STRING:
      return {
        value: 'string'
      };
    case BOOLEAN:
      return {
        value: 'boolean'
      };
    case MAYBE:
      var childTree = jsonToTree(json['type']);
      return {
        value: '?' + childTree.value,
        children: childTree.children
      };
    case ANYOBJECT:
      return {
        value: 'Object'
      };
    case ARRAY:
      var elemType = jsonToTree(json['elemType']);
      return {
        value: 'Array<' + elemType.value + '>',
        children: elemType.children
      };
    case FUNCTION:
      var paramNames = json['funType']['paramNames'];
      var paramTypes = json['funType']['paramTypes'];
      (0, _assert2['default'])(Array.isArray(paramNames));
      var parameters = paramNames.map(function (name, i) {
        var type = jsonToTree(paramTypes[i]);
        return {
          value: name + ': ' + type.value,
          children: type.children
        };
      });
      var returnType = jsonToTree(json['funType']['returnType']);
      return {
        value: 'Function',
        children: [{
          value: 'Parameters',
          children: parameters
        }, {
          value: 'Return Type: ' + returnType.value,
          children: returnType.children
        }]
      };
    default:
      throw new Error('Kind ' + kind + ' not supported');
  }
}
//# sourceMappingURL=data:application/json;base64,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QyxRQUFRO1NBQ3hCLENBQUM7T0FDSCxDQUFDLENBQUM7QUFDSCxVQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFDN0QsYUFBTztBQUNMLGFBQUssRUFBRSxVQUFVO0FBQ2pCLGdCQUFRLEVBQUUsQ0FDUjtBQUNFLGVBQUssRUFBRSxZQUFZO0FBQ25CLGtCQUFRLEVBQUUsVUFBVTtTQUNyQixFQUNEO0FBQ0UsZUFBSyxvQkFBa0IsVUFBVSxDQUFDLEtBQUssQUFBRTtBQUN6QyxrQkFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1NBQzlCLENBQ0Y7T0FDRixDQUFDO0FBQUEsQUFDSjtBQUNFLFlBQU0sSUFBSSxLQUFLLFdBQVMsSUFBSSxvQkFBaUIsQ0FBQztBQUFBLEdBQ2pEO0NBQ0YiLCJmaWxlIjoiRmxvd1R5cGVIaW50UHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VHlwZUhpbnR9IGZyb20gJy4uLy4uL3R5cGUtaGludC1pbnRlcmZhY2VzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCB7ZXh0cmFjdFdvcmRBdFBvc2l0aW9ufSA9IHJlcXVpcmUoJy4uLy4uL2F0b20taGVscGVycycpO1xuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2ZlYXR1cmUtY29uZmlnJyk7XG5pbXBvcnQge2dldEZsb3dTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuL0Zsb3dTZXJ2aWNlRmFjdG9yeSc7XG5jb25zdCB7UmFuZ2V9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5pbXBvcnQge0pBVkFTQ1JJUFRfV09SRF9SRUdFWH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgY2xhc3MgRmxvd1R5cGVIaW50UHJvdmlkZXIge1xuICBhc3luYyB0eXBlSGludChlZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTw/VHlwZUhpbnQ+IHtcbiAgICBjb25zdCBlbmFibGVkID0gZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtZmxvdy5lbmFibGVUeXBlSGludHMnKTtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKGZpbGVQYXRoID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50cyA9IGVkaXRvci5nZXRUZXh0KCk7XG4gICAgY29uc3QgZmxvd1NlcnZpY2UgPSBhd2FpdCBnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaShmaWxlUGF0aCk7XG4gICAgaW52YXJpYW50KGZsb3dTZXJ2aWNlKTtcblxuICAgIGNvbnN0IGVuYWJsZVN0cnVjdHVyZWRUeXBlSGludHM6IGJvb2xlYW4gPVxuICAgICAgKGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLWZsb3cuZW5hYmxlU3RydWN0dXJlZFR5cGVIaW50cycpOiBhbnkpO1xuICAgIGNvbnN0IGdldFR5cGVSZXN1bHQgPSBhd2FpdCBmbG93U2VydmljZS5mbG93R2V0VHlwZShcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgY29udGVudHMsXG4gICAgICBwb3NpdGlvbi5yb3csXG4gICAgICBwb3NpdGlvbi5jb2x1bW4sXG4gICAgICBlbmFibGVTdHJ1Y3R1cmVkVHlwZUhpbnRzLFxuICAgICk7XG4gICAgaWYgKGdldFR5cGVSZXN1bHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHt0eXBlLCByYXdUeXBlfSA9IGdldFR5cGVSZXN1bHQ7XG5cbiAgICAvLyBUT0RPKG5tb3RlKSByZWZpbmUgdGhpcyByZWdleCB0byBiZXR0ZXIgY2FwdHVyZSBKYXZhU2NyaXB0IGV4cHJlc3Npb25zLlxuICAgIC8vIEhhdmluZyB0aGlzIHJlZ2V4IGJlIG5vdCBxdWl0ZSByaWdodCBpcyBqdXN0IGEgZGlzcGxheSBpc3N1ZSwgdGhvdWdoIC0tXG4gICAgLy8gaXQgb25seSBhZmZlY3RzIHRoZSBsb2NhdGlvbiBvZiB0aGUgdG9vbHRpcC5cbiAgICBjb25zdCB3b3JkID0gZXh0cmFjdFdvcmRBdFBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24sIEpBVkFTQ1JJUFRfV09SRF9SRUdFWCk7XG4gICAgbGV0IHJhbmdlO1xuICAgIGlmICh3b3JkKSB7XG4gICAgICByYW5nZSA9IHdvcmQucmFuZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhbmdlID0gbmV3IFJhbmdlKHBvc2l0aW9uLCBwb3NpdGlvbik7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgIGhpbnQ6IHR5cGUsXG4gICAgICByYW5nZSxcbiAgICB9O1xuICAgIGNvbnN0IGhpbnRUcmVlID0gZ2V0VHlwZUhpbnRUcmVlKHJhd1R5cGUpO1xuICAgIGlmIChoaW50VHJlZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICBoaW50VHJlZSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG59XG5cbi8vIFRPRE8gSW1wb3J0IGZyb20gdHlwZS1oaW50cyBwYWNrYWdlIG9uY2UgaXQgZXhwb3NlcyBpdC5cbnR5cGUgSGludFRyZWUgPSB7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGNoaWxkcmVuPzogQXJyYXk8SGludFRyZWU+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZUhpbnRUcmVlKHR5cGVIaW50OiA/c3RyaW5nKTogP0hpbnRUcmVlIHtcbiAgaWYgKCF0eXBlSGludCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UodHlwZUhpbnQpO1xuICAgIHJldHVybiBqc29uVG9UcmVlKGpzb24pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICAgIGxvZ2dlci5lcnJvcihgUHJvYmxlbSBwYXJzaW5nIHR5cGUgaGludDogJHtlLm1lc3NhZ2V9YCk7XG4gICAgLy8gSWYgdGhlcmUgaXMgYW55IHByb2JsZW0gcGFyc2luZyBqdXN0IGZhbGwgYmFjayBvbiB0aGUgb3JpZ2luYWwgc3RyaW5nXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuY29uc3QgT0JKRUNUID0gJ09ialQnO1xuY29uc3QgTlVNQkVSID0gJ051bVQnO1xuY29uc3QgU1RSSU5HID0gJ1N0clQnO1xuY29uc3QgQk9PTEVBTiA9ICdCb29sVCc7XG5jb25zdCBNQVlCRSA9ICdNYXliZVQnO1xuY29uc3QgQU5ZT0JKRUNUID0gJ0FueU9ialQnO1xuY29uc3QgQVJSQVkgPSAnQXJyVCc7XG5jb25zdCBGVU5DVElPTiA9ICdGdW5UJztcblxuZnVuY3Rpb24ganNvblRvVHJlZShqc29uOiBPYmplY3QpOiBIaW50VHJlZSB7XG4gIGNvbnN0IGtpbmQgPSBqc29uWydraW5kJ107XG4gIHN3aXRjaCAoa2luZCkge1xuICAgIGNhc2UgT0JKRUNUOlxuICAgICAgY29uc3QgcHJvcFR5cGVzID0ganNvblsndHlwZSddWydwcm9wVHlwZXMnXTtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gW107XG4gICAgICBmb3IgKGNvbnN0IHByb3Agb2YgcHJvcFR5cGVzKSB7XG4gICAgICAgIGNvbnN0IHByb3BOYW1lID0gcHJvcFsnbmFtZSddO1xuICAgICAgICBjb25zdCBjaGlsZFRyZWUgPSBqc29uVG9UcmVlKHByb3BbJ3R5cGUnXSk7XG4gICAgICAgIC8vIEluc3RlYWQgb2YgbWFraW5nIHNpbmdsZSBjaGlsZCBub2RlIGp1c3QgZm9yIHRoZSB0eXBlIG5hbWUsIHdlJ2xsIGdyYWZ0IHRoZSB0eXBlIG9udG8gdGhlXG4gICAgICAgIC8vIGVuZCBvZiB0aGUgcHJvcGVydHkgbmFtZS5cbiAgICAgICAgY2hpbGRyZW4ucHVzaCh7XG4gICAgICAgICAgdmFsdWU6IGAke3Byb3BOYW1lfTogJHtjaGlsZFRyZWUudmFsdWV9YCxcbiAgICAgICAgICBjaGlsZHJlbjogY2hpbGRUcmVlLmNoaWxkcmVuLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiAnT2JqZWN0JyxcbiAgICAgICAgY2hpbGRyZW4sXG4gICAgICB9O1xuICAgIGNhc2UgTlVNQkVSOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6ICdudW1iZXInLFxuICAgICAgfTtcbiAgICBjYXNlIFNUUklORzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiAnc3RyaW5nJyxcbiAgICAgIH07XG4gICAgY2FzZSBCT09MRUFOOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6ICdib29sZWFuJyxcbiAgICAgIH07XG4gICAgY2FzZSBNQVlCRTpcbiAgICAgIGNvbnN0IGNoaWxkVHJlZSA9IGpzb25Ub1RyZWUoanNvblsndHlwZSddKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiBgPyR7Y2hpbGRUcmVlLnZhbHVlfWAsXG4gICAgICAgIGNoaWxkcmVuOiBjaGlsZFRyZWUuY2hpbGRyZW4sXG4gICAgICB9O1xuICAgIGNhc2UgQU5ZT0JKRUNUOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6ICdPYmplY3QnLFxuICAgICAgfTtcbiAgICBjYXNlIEFSUkFZOlxuICAgICAgY29uc3QgZWxlbVR5cGUgPSBqc29uVG9UcmVlKGpzb25bJ2VsZW1UeXBlJ10pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IGBBcnJheTwke2VsZW1UeXBlLnZhbHVlfT5gLFxuICAgICAgICBjaGlsZHJlbjogZWxlbVR5cGUuY2hpbGRyZW4sXG4gICAgICB9O1xuICAgIGNhc2UgRlVOQ1RJT046XG4gICAgICBjb25zdCBwYXJhbU5hbWVzID0ganNvblsnZnVuVHlwZSddWydwYXJhbU5hbWVzJ107XG4gICAgICBjb25zdCBwYXJhbVR5cGVzID0ganNvblsnZnVuVHlwZSddWydwYXJhbVR5cGVzJ107XG4gICAgICBpbnZhcmlhbnQoQXJyYXkuaXNBcnJheShwYXJhbU5hbWVzKSk7XG4gICAgICBjb25zdCBwYXJhbWV0ZXJzID0gcGFyYW1OYW1lcy5tYXAoKG5hbWUsIGkpID0+IHtcbiAgICAgICAgY29uc3QgdHlwZSA9IGpzb25Ub1RyZWUocGFyYW1UeXBlc1tpXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IGAke25hbWV9OiAke3R5cGUudmFsdWV9YCxcbiAgICAgICAgICBjaGlsZHJlbjogdHlwZS5jaGlsZHJlbixcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcmV0dXJuVHlwZSA9IGpzb25Ub1RyZWUoanNvblsnZnVuVHlwZSddWydyZXR1cm5UeXBlJ10pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6ICdGdW5jdGlvbicsXG4gICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6ICdQYXJhbWV0ZXJzJyxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBwYXJhbWV0ZXJzLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6IGBSZXR1cm4gVHlwZTogJHtyZXR1cm5UeXBlLnZhbHVlfWAsXG4gICAgICAgICAgICBjaGlsZHJlbjogcmV0dXJuVHlwZS5jaGlsZHJlbixcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBLaW5kICR7a2luZH0gbm90IHN1cHBvcnRlZGApO1xuICB9XG59XG4iXX0=