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

var _require = require('../../nuclide-atom-helpers');

var extractWordAtPosition = _require.extractWordAtPosition;

var featureConfig = require('../../nuclide-feature-config');

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
    var logger = require('../../nuclide-logging').getLogger();
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
//# sourceMappingURL=data:application/json;base64,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QUFDLFFBQVE7U0FDeEIsQ0FBQztPQUNILENBQUMsQ0FBQztBQUNILFVBQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUM3RCxhQUFPO0FBQ0wsYUFBSyxFQUFFLFVBQVU7QUFDakIsZ0JBQVEsRUFBRSxDQUNSO0FBQ0UsZUFBSyxFQUFFLFlBQVk7QUFDbkIsa0JBQVEsRUFBRSxVQUFVO1NBQ3JCLEVBQ0Q7QUFDRSxlQUFLLG9CQUFrQixVQUFVLENBQUMsS0FBSyxBQUFFO0FBQ3pDLGtCQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7U0FDOUIsQ0FDRjtPQUNGLENBQUM7QUFBQSxBQUNKO0FBQ0UsWUFBTSxJQUFJLEtBQUssV0FBUyxJQUFJLG9CQUFpQixDQUFDO0FBQUEsR0FDakQ7Q0FDRiIsImZpbGUiOiJGbG93VHlwZUhpbnRQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtUeXBlSGludH0gZnJvbSAnLi4vLi4vbnVjbGlkZS10eXBlLWhpbnQtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge2V4dHJhY3RXb3JkQXRQb3NpdGlvbn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycycpO1xuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnKTtcbmltcG9ydCB7Z2V0Rmxvd1NlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4vRmxvd1NlcnZpY2VGYWN0b3J5JztcbmNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmltcG9ydCB7SkFWQVNDUklQVF9XT1JEX1JFR0VYfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBjbGFzcyBGbG93VHlwZUhpbnRQcm92aWRlciB7XG4gIGFzeW5jIHR5cGVIaW50KGVkaXRvcjogVGV4dEVkaXRvciwgcG9zaXRpb246IGF0b20kUG9pbnQpOiBQcm9taXNlPD9UeXBlSGludD4ge1xuICAgIGNvbnN0IGVuYWJsZWQgPSBmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1mbG93LmVuYWJsZVR5cGVIaW50cycpO1xuICAgIGlmICghZW5hYmxlZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoZmlsZVBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnRzID0gZWRpdG9yLmdldFRleHQoKTtcbiAgICBjb25zdCBmbG93U2VydmljZSA9IGF3YWl0IGdldEZsb3dTZXJ2aWNlQnlOdWNsaWRlVXJpKGZpbGVQYXRoKTtcbiAgICBpbnZhcmlhbnQoZmxvd1NlcnZpY2UpO1xuXG4gICAgY29uc3QgZW5hYmxlU3RydWN0dXJlZFR5cGVIaW50czogYm9vbGVhbiA9XG4gICAgICAoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtZmxvdy5lbmFibGVTdHJ1Y3R1cmVkVHlwZUhpbnRzJyk6IGFueSk7XG4gICAgY29uc3QgZ2V0VHlwZVJlc3VsdCA9IGF3YWl0IGZsb3dTZXJ2aWNlLmZsb3dHZXRUeXBlKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb250ZW50cyxcbiAgICAgIHBvc2l0aW9uLnJvdyxcbiAgICAgIHBvc2l0aW9uLmNvbHVtbixcbiAgICAgIGVuYWJsZVN0cnVjdHVyZWRUeXBlSGludHMsXG4gICAgKTtcbiAgICBpZiAoZ2V0VHlwZVJlc3VsdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qge3R5cGUsIHJhd1R5cGV9ID0gZ2V0VHlwZVJlc3VsdDtcblxuICAgIC8vIFRPRE8obm1vdGUpIHJlZmluZSB0aGlzIHJlZ2V4IHRvIGJldHRlciBjYXB0dXJlIEphdmFTY3JpcHQgZXhwcmVzc2lvbnMuXG4gICAgLy8gSGF2aW5nIHRoaXMgcmVnZXggYmUgbm90IHF1aXRlIHJpZ2h0IGlzIGp1c3QgYSBkaXNwbGF5IGlzc3VlLCB0aG91Z2ggLS1cbiAgICAvLyBpdCBvbmx5IGFmZmVjdHMgdGhlIGxvY2F0aW9uIG9mIHRoZSB0b29sdGlwLlxuICAgIGNvbnN0IHdvcmQgPSBleHRyYWN0V29yZEF0UG9zaXRpb24oZWRpdG9yLCBwb3NpdGlvbiwgSkFWQVNDUklQVF9XT1JEX1JFR0VYKTtcbiAgICBsZXQgcmFuZ2U7XG4gICAgaWYgKHdvcmQpIHtcbiAgICAgIHJhbmdlID0gd29yZC5yYW5nZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UocG9zaXRpb24sIHBvc2l0aW9uKTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgaGludDogdHlwZSxcbiAgICAgIHJhbmdlLFxuICAgIH07XG4gICAgY29uc3QgaGludFRyZWUgPSBnZXRUeXBlSGludFRyZWUocmF3VHlwZSk7XG4gICAgaWYgKGhpbnRUcmVlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgIGhpbnRUcmVlLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cbn1cblxuLy8gVE9ETyBJbXBvcnQgZnJvbSB0eXBlLWhpbnRzIHBhY2thZ2Ugb25jZSBpdCBleHBvc2VzIGl0LlxudHlwZSBIaW50VHJlZSA9IHtcbiAgdmFsdWU6IHN0cmluZztcbiAgY2hpbGRyZW4/OiBBcnJheTxIaW50VHJlZT47XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZUhpbnRUcmVlKHR5cGVIaW50OiA/c3RyaW5nKTogP0hpbnRUcmVlIHtcbiAgaWYgKCF0eXBlSGludCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UodHlwZUhpbnQpO1xuICAgIHJldHVybiBqc29uVG9UcmVlKGpzb24pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gICAgbG9nZ2VyLmVycm9yKGBQcm9ibGVtIHBhcnNpbmcgdHlwZSBoaW50OiAke2UubWVzc2FnZX1gKTtcbiAgICAvLyBJZiB0aGVyZSBpcyBhbnkgcHJvYmxlbSBwYXJzaW5nIGp1c3QgZmFsbCBiYWNrIG9uIHRoZSBvcmlnaW5hbCBzdHJpbmdcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5jb25zdCBPQkpFQ1QgPSAnT2JqVCc7XG5jb25zdCBOVU1CRVIgPSAnTnVtVCc7XG5jb25zdCBTVFJJTkcgPSAnU3RyVCc7XG5jb25zdCBCT09MRUFOID0gJ0Jvb2xUJztcbmNvbnN0IE1BWUJFID0gJ01heWJlVCc7XG5jb25zdCBBTllPQkpFQ1QgPSAnQW55T2JqVCc7XG5jb25zdCBBUlJBWSA9ICdBcnJUJztcbmNvbnN0IEZVTkNUSU9OID0gJ0Z1blQnO1xuXG5mdW5jdGlvbiBqc29uVG9UcmVlKGpzb246IE9iamVjdCk6IEhpbnRUcmVlIHtcbiAgY29uc3Qga2luZCA9IGpzb25bJ2tpbmQnXTtcbiAgc3dpdGNoIChraW5kKSB7XG4gICAgY2FzZSBPQkpFQ1Q6XG4gICAgICBjb25zdCBwcm9wVHlwZXMgPSBqc29uWyd0eXBlJ11bJ3Byb3BUeXBlcyddO1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBwcm9wVHlwZXMpIHtcbiAgICAgICAgY29uc3QgcHJvcE5hbWUgPSBwcm9wWyduYW1lJ107XG4gICAgICAgIGNvbnN0IGNoaWxkVHJlZSA9IGpzb25Ub1RyZWUocHJvcFsndHlwZSddKTtcbiAgICAgICAgLy8gSW5zdGVhZCBvZiBtYWtpbmcgc2luZ2xlIGNoaWxkIG5vZGUganVzdCBmb3IgdGhlIHR5cGUgbmFtZSwgd2UnbGwgZ3JhZnQgdGhlIHR5cGUgb250byB0aGVcbiAgICAgICAgLy8gZW5kIG9mIHRoZSBwcm9wZXJ0eSBuYW1lLlxuICAgICAgICBjaGlsZHJlbi5wdXNoKHtcbiAgICAgICAgICB2YWx1ZTogYCR7cHJvcE5hbWV9OiAke2NoaWxkVHJlZS52YWx1ZX1gLFxuICAgICAgICAgIGNoaWxkcmVuOiBjaGlsZFRyZWUuY2hpbGRyZW4sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6ICdPYmplY3QnLFxuICAgICAgICBjaGlsZHJlbixcbiAgICAgIH07XG4gICAgY2FzZSBOVU1CRVI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogJ251bWJlcicsXG4gICAgICB9O1xuICAgIGNhc2UgU1RSSU5HOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6ICdzdHJpbmcnLFxuICAgICAgfTtcbiAgICBjYXNlIEJPT0xFQU46XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogJ2Jvb2xlYW4nLFxuICAgICAgfTtcbiAgICBjYXNlIE1BWUJFOlxuICAgICAgY29uc3QgY2hpbGRUcmVlID0ganNvblRvVHJlZShqc29uWyd0eXBlJ10pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IGA/JHtjaGlsZFRyZWUudmFsdWV9YCxcbiAgICAgICAgY2hpbGRyZW46IGNoaWxkVHJlZS5jaGlsZHJlbixcbiAgICAgIH07XG4gICAgY2FzZSBBTllPQkpFQ1Q6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogJ09iamVjdCcsXG4gICAgICB9O1xuICAgIGNhc2UgQVJSQVk6XG4gICAgICBjb25zdCBlbGVtVHlwZSA9IGpzb25Ub1RyZWUoanNvblsnZWxlbVR5cGUnXSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogYEFycmF5PCR7ZWxlbVR5cGUudmFsdWV9PmAsXG4gICAgICAgIGNoaWxkcmVuOiBlbGVtVHlwZS5jaGlsZHJlbixcbiAgICAgIH07XG4gICAgY2FzZSBGVU5DVElPTjpcbiAgICAgIGNvbnN0IHBhcmFtTmFtZXMgPSBqc29uWydmdW5UeXBlJ11bJ3BhcmFtTmFtZXMnXTtcbiAgICAgIGNvbnN0IHBhcmFtVHlwZXMgPSBqc29uWydmdW5UeXBlJ11bJ3BhcmFtVHlwZXMnXTtcbiAgICAgIGludmFyaWFudChBcnJheS5pc0FycmF5KHBhcmFtTmFtZXMpKTtcbiAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBwYXJhbU5hbWVzLm1hcCgobmFtZSwgaSkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlID0ganNvblRvVHJlZShwYXJhbVR5cGVzW2ldKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWx1ZTogYCR7bmFtZX06ICR7dHlwZS52YWx1ZX1gLFxuICAgICAgICAgIGNoaWxkcmVuOiB0eXBlLmNoaWxkcmVuLFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBjb25zdCByZXR1cm5UeXBlID0ganNvblRvVHJlZShqc29uWydmdW5UeXBlJ11bJ3JldHVyblR5cGUnXSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogJ0Z1bmN0aW9uJyxcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YWx1ZTogJ1BhcmFtZXRlcnMnLFxuICAgICAgICAgICAgY2hpbGRyZW46IHBhcmFtZXRlcnMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YWx1ZTogYFJldHVybiBUeXBlOiAke3JldHVyblR5cGUudmFsdWV9YCxcbiAgICAgICAgICAgIGNoaWxkcmVuOiByZXR1cm5UeXBlLmNoaWxkcmVuLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEtpbmQgJHtraW5kfSBub3Qgc3VwcG9ydGVkYCk7XG4gIH1cbn1cbiJdfQ==