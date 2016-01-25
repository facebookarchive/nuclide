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

var _constants = require('./constants');

var _require = require('../../atom-helpers');

var extractWordAtPosition = _require.extractWordAtPosition;

var featureConfig = require('../../feature-config');

var _require2 = require('../../client');

var getServiceByNuclideUri = _require2.getServiceByNuclideUri;

var _require3 = require('atom');

var Range = _require3.Range;

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
      var contents = editor.getText();
      var flowService = yield getServiceByNuclideUri('FlowService', filePath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dUeXBlSGludFByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFhc0IsUUFBUTs7Ozt5QkFPTSxhQUFhOztlQUxqQixPQUFPLENBQUMsb0JBQW9CLENBQUM7O0lBQXRELHFCQUFxQixZQUFyQixxQkFBcUI7O0FBQzVCLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOztnQkFDckIsT0FBTyxDQUFDLGNBQWMsQ0FBQzs7SUFBakQsc0JBQXNCLGFBQXRCLHNCQUFzQjs7Z0JBQ2IsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBeEIsS0FBSyxhQUFMLEtBQUs7O0lBSUMsb0JBQW9CO1dBQXBCLG9CQUFvQjswQkFBcEIsb0JBQW9COzs7OztlQUFwQixvQkFBb0I7OzZCQUNqQixXQUFDLE1BQWtCLEVBQUUsUUFBb0IsRUFBc0I7QUFDM0UsVUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ2xFLFVBQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsVUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLFVBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxVQUFNLFdBQVcsR0FBRyxNQUFNLHNCQUFzQixDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMxRSwrQkFBVSxXQUFXLENBQUMsQ0FBQzs7QUFFdkIsVUFBTSx5QkFBeUIsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7QUFDOUYsVUFBTSxhQUFhLEdBQUcsTUFBTSxXQUFXLENBQUMsV0FBVyxDQUNqRCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsQ0FBQyxHQUFHLEVBQ1osUUFBUSxDQUFDLE1BQU0sRUFDZix5QkFBeUIsQ0FDMUIsQ0FB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QUN4QixDQUFDO09BQ0gsQ0FBQyxDQUFDO0FBQ0gsVUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0FBQzdELGFBQU87QUFDTCxhQUFLLEVBQUUsVUFBVTtBQUNqQixnQkFBUSxFQUFFLENBQ1I7QUFDRSxlQUFLLEVBQUUsWUFBWTtBQUNuQixrQkFBUSxFQUFFLFVBQVU7U0FDckIsRUFDRDtBQUNFLGVBQUssb0JBQWtCLFVBQVUsQ0FBQyxLQUFLLEFBQUU7QUFDekMsa0JBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtTQUM5QixDQUNGO09BQ0YsQ0FBQztBQUFBLEFBQ0o7QUFDRSxZQUFNLElBQUksS0FBSyxXQUFTLElBQUksb0JBQWlCLENBQUM7QUFBQSxHQUNqRDtDQUNGIiwiZmlsZSI6IkZsb3dUeXBlSGludFByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1R5cGVIaW50fSBmcm9tICcuLi8uLi90eXBlLWhpbnQtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge2V4dHJhY3RXb3JkQXRQb3NpdGlvbn0gPSByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IGZlYXR1cmVDb25maWcgPSByZXF1aXJlKCcuLi8uLi9mZWF0dXJlLWNvbmZpZycpO1xuY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vY2xpZW50Jyk7XG5jb25zdCB7UmFuZ2V9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5pbXBvcnQge0pBVkFTQ1JJUFRfV09SRF9SRUdFWH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgY2xhc3MgRmxvd1R5cGVIaW50UHJvdmlkZXIge1xuICBhc3luYyB0eXBlSGludChlZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTw/VHlwZUhpbnQ+IHtcbiAgICBjb25zdCBlbmFibGVkID0gZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtZmxvdy5lbmFibGVUeXBlSGludHMnKTtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgY29uc3QgY29udGVudHMgPSBlZGl0b3IuZ2V0VGV4dCgpO1xuICAgIGNvbnN0IGZsb3dTZXJ2aWNlID0gYXdhaXQgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnRmxvd1NlcnZpY2UnLCBmaWxlUGF0aCk7XG4gICAgaW52YXJpYW50KGZsb3dTZXJ2aWNlKTtcblxuICAgIGNvbnN0IGVuYWJsZVN0cnVjdHVyZWRUeXBlSGludHMgPSBmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1mbG93LmVuYWJsZVN0cnVjdHVyZWRUeXBlSGludHMnKTtcbiAgICBjb25zdCBnZXRUeXBlUmVzdWx0ID0gYXdhaXQgZmxvd1NlcnZpY2UuZmxvd0dldFR5cGUoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbnRlbnRzLFxuICAgICAgcG9zaXRpb24ucm93LFxuICAgICAgcG9zaXRpb24uY29sdW1uLFxuICAgICAgZW5hYmxlU3RydWN0dXJlZFR5cGVIaW50cyxcbiAgICApO1xuICAgIGlmIChnZXRUeXBlUmVzdWx0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7dHlwZSwgcmF3VHlwZX0gPSBnZXRUeXBlUmVzdWx0O1xuXG4gICAgLy8gVE9ETyhubW90ZSkgcmVmaW5lIHRoaXMgcmVnZXggdG8gYmV0dGVyIGNhcHR1cmUgSmF2YVNjcmlwdCBleHByZXNzaW9ucy5cbiAgICAvLyBIYXZpbmcgdGhpcyByZWdleCBiZSBub3QgcXVpdGUgcmlnaHQgaXMganVzdCBhIGRpc3BsYXkgaXNzdWUsIHRob3VnaCAtLVxuICAgIC8vIGl0IG9ubHkgYWZmZWN0cyB0aGUgbG9jYXRpb24gb2YgdGhlIHRvb2x0aXAuXG4gICAgY29uc3Qgd29yZCA9IGV4dHJhY3RXb3JkQXRQb3NpdGlvbihlZGl0b3IsIHBvc2l0aW9uLCBKQVZBU0NSSVBUX1dPUkRfUkVHRVgpO1xuICAgIGxldCByYW5nZTtcbiAgICBpZiAod29yZCkge1xuICAgICAgcmFuZ2UgPSB3b3JkLnJhbmdlO1xuICAgIH0gZWxzZSB7XG4gICAgICByYW5nZSA9IG5ldyBSYW5nZShwb3NpdGlvbiwgcG9zaXRpb24pO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICBoaW50OiB0eXBlLFxuICAgICAgcmFuZ2UsXG4gICAgfTtcbiAgICBjb25zdCBoaW50VHJlZSA9IGdldFR5cGVIaW50VHJlZShyYXdUeXBlKTtcbiAgICBpZiAoaGludFRyZWUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgaGludFRyZWUsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxufVxuXG4vLyBUT0RPIEltcG9ydCBmcm9tIHR5cGUtaGludHMgcGFja2FnZSBvbmNlIGl0IGV4cG9zZXMgaXQuXG50eXBlIEhpbnRUcmVlID0ge1xuICB2YWx1ZTogc3RyaW5nO1xuICBjaGlsZHJlbj86IEFycmF5PEhpbnRUcmVlPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVIaW50VHJlZSh0eXBlSGludDogP3N0cmluZyk6ID9IaW50VHJlZSB7XG4gIGlmICghdHlwZUhpbnQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHR5cGVIaW50KTtcbiAgICByZXR1cm4ganNvblRvVHJlZShqc29uKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgICBsb2dnZXIuZXJyb3IoYFByb2JsZW0gcGFyc2luZyB0eXBlIGhpbnQ6ICR7ZS5tZXNzYWdlfWApO1xuICAgIC8vIElmIHRoZXJlIGlzIGFueSBwcm9ibGVtIHBhcnNpbmcganVzdCBmYWxsIGJhY2sgb24gdGhlIG9yaWdpbmFsIHN0cmluZ1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmNvbnN0IE9CSkVDVCA9ICdPYmpUJztcbmNvbnN0IE5VTUJFUiA9ICdOdW1UJztcbmNvbnN0IFNUUklORyA9ICdTdHJUJztcbmNvbnN0IEJPT0xFQU4gPSAnQm9vbFQnO1xuY29uc3QgTUFZQkUgPSAnTWF5YmVUJztcbmNvbnN0IEFOWU9CSkVDVCA9ICdBbnlPYmpUJztcbmNvbnN0IEFSUkFZID0gJ0FyclQnO1xuY29uc3QgRlVOQ1RJT04gPSAnRnVuVCc7XG5cbmZ1bmN0aW9uIGpzb25Ub1RyZWUoanNvbjogT2JqZWN0KTogSGludFRyZWUge1xuICBjb25zdCBraW5kID0ganNvblsna2luZCddO1xuICBzd2l0Y2ggKGtpbmQpIHtcbiAgICBjYXNlIE9CSkVDVDpcbiAgICAgIGNvbnN0IHByb3BUeXBlcyA9IGpzb25bJ3R5cGUnXVsncHJvcFR5cGVzJ107XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFtdO1xuICAgICAgZm9yIChjb25zdCBwcm9wIG9mIHByb3BUeXBlcykge1xuICAgICAgICBjb25zdCBwcm9wTmFtZSA9IHByb3BbJ25hbWUnXTtcbiAgICAgICAgY29uc3QgY2hpbGRUcmVlID0ganNvblRvVHJlZShwcm9wWyd0eXBlJ10pO1xuICAgICAgICAvLyBJbnN0ZWFkIG9mIG1ha2luZyBzaW5nbGUgY2hpbGQgbm9kZSBqdXN0IGZvciB0aGUgdHlwZSBuYW1lLCB3ZSdsbCBncmFmdCB0aGUgdHlwZSBvbnRvIHRoZVxuICAgICAgICAvLyBlbmQgb2YgdGhlIHByb3BlcnR5IG5hbWUuXG4gICAgICAgIGNoaWxkcmVuLnB1c2goe1xuICAgICAgICAgIHZhbHVlOiBgJHtwcm9wTmFtZX06ICR7Y2hpbGRUcmVlLnZhbHVlfWAsXG4gICAgICAgICAgY2hpbGRyZW46IGNoaWxkVHJlZS5jaGlsZHJlbixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogJ09iamVjdCcsXG4gICAgICAgIGNoaWxkcmVuLFxuICAgICAgfTtcbiAgICBjYXNlIE5VTUJFUjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiAnbnVtYmVyJyxcbiAgICAgIH07XG4gICAgY2FzZSBTVFJJTkc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogJ3N0cmluZycsXG4gICAgICB9O1xuICAgIGNhc2UgQk9PTEVBTjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiAnYm9vbGVhbicsXG4gICAgICB9O1xuICAgIGNhc2UgTUFZQkU6XG4gICAgICBjb25zdCBjaGlsZFRyZWUgPSBqc29uVG9UcmVlKGpzb25bJ3R5cGUnXSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogYD8ke2NoaWxkVHJlZS52YWx1ZX1gLFxuICAgICAgICBjaGlsZHJlbjogY2hpbGRUcmVlLmNoaWxkcmVuLFxuICAgICAgfTtcbiAgICBjYXNlIEFOWU9CSkVDVDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiAnT2JqZWN0JyxcbiAgICAgIH07XG4gICAgY2FzZSBBUlJBWTpcbiAgICAgIGNvbnN0IGVsZW1UeXBlID0ganNvblRvVHJlZShqc29uWydlbGVtVHlwZSddKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiBgQXJyYXk8JHtlbGVtVHlwZS52YWx1ZX0+YCxcbiAgICAgICAgY2hpbGRyZW46IGVsZW1UeXBlLmNoaWxkcmVuLFxuICAgICAgfTtcbiAgICBjYXNlIEZVTkNUSU9OOlxuICAgICAgY29uc3QgcGFyYW1OYW1lcyA9IGpzb25bJ2Z1blR5cGUnXVsncGFyYW1OYW1lcyddO1xuICAgICAgY29uc3QgcGFyYW1UeXBlcyA9IGpzb25bJ2Z1blR5cGUnXVsncGFyYW1UeXBlcyddO1xuICAgICAgaW52YXJpYW50KEFycmF5LmlzQXJyYXkocGFyYW1OYW1lcykpO1xuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHBhcmFtTmFtZXMubWFwKChuYW1lLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBqc29uVG9UcmVlKHBhcmFtVHlwZXNbaV0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbHVlOiBgJHtuYW1lfTogJHt0eXBlLnZhbHVlfWAsXG4gICAgICAgICAgY2hpbGRyZW46IHR5cGUuY2hpbGRyZW4sXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHJldHVyblR5cGUgPSBqc29uVG9UcmVlKGpzb25bJ2Z1blR5cGUnXVsncmV0dXJuVHlwZSddKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiAnRnVuY3Rpb24nLFxuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlOiAnUGFyYW1ldGVycycsXG4gICAgICAgICAgICBjaGlsZHJlbjogcGFyYW1ldGVycyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhbHVlOiBgUmV0dXJuIFR5cGU6ICR7cmV0dXJuVHlwZS52YWx1ZX1gLFxuICAgICAgICAgICAgY2hpbGRyZW46IHJldHVyblR5cGUuY2hpbGRyZW4sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH07XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgS2luZCAke2tpbmR9IG5vdCBzdXBwb3J0ZWRgKTtcbiAgfVxufVxuIl19