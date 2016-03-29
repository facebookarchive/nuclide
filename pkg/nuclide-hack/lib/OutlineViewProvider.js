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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.outlineFromHackOutline = outlineFromHackOutline;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideTokenizedText = require('../../nuclide-tokenized-text');

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideCommons = require('../../nuclide-commons');

var _hack = require('./hack');

var OutlineViewProvider = (function () {
  function OutlineViewProvider() {
    _classCallCheck(this, OutlineViewProvider);
  }

  // Exported for testing

  _createClass(OutlineViewProvider, [{
    key: 'getOutline',
    value: _asyncToGenerator(function* (editor) {
      var hackOutline = yield (0, _hack.outlineFromEditor)(editor);
      if (hackOutline == null) {
        return null;
      }
      return outlineFromHackOutline(hackOutline);
    })
  }]);

  return OutlineViewProvider;
})();

exports.OutlineViewProvider = OutlineViewProvider;

function outlineFromHackOutline(hackOutline) {
  var classes = extractClasses(hackOutline);
  addMethodsToClasses(hackOutline, classes);

  var functions = extractFunctions(hackOutline);

  var outlineTrees = _nuclideCommons.array.from(classes.values()).concat(functions);
  sortOutline(outlineTrees);

  return {
    outlineTrees: outlineTrees
  };
}

function extractClasses(hackOutline) {
  var classes = new Map();
  for (var item of hackOutline) {
    if (item.type === 'class') {
      classes.set(item.name, outlineTreeFromHackOutlineItem(item));
    }
  }
  return classes;
}

function addMethodsToClasses(hackOutline, classes) {
  for (var item of hackOutline) {
    if (item.type === 'method' || item.type === 'static method') {
      // TODO handle bad input

      var _item$name$split = item.name.split('::');

      var _item$name$split2 = _slicedToArray(_item$name$split, 2);

      var className = _item$name$split2[0];
      var methodName = _item$name$split2[1];

      (0, _assert2['default'])(methodName != null, 'Expected method name to include \'::\', got \'' + item.name + '\'');

      var methodOutline = _extends({}, outlineTreeFromHackOutlineItem(item), {
        tokenizedText: [(0, _nuclideTokenizedText.plain)(methodName)]
      });

      var classOutline = classes.get(className);
      (0, _assert2['default'])(classOutline != null, 'Missing class ' + className);
      classOutline.children.push(methodOutline);
    }
  }
}

function extractFunctions(hackOutline) {
  var functions = [];
  for (var item of hackOutline) {
    if (item.type === 'function') {
      functions.push(outlineTreeFromHackOutlineItem(item));
    }
  }
  return functions;
}

function sortOutline(outlineTrees) {
  for (var tree of outlineTrees) {
    sortOutline(tree.children);
  }
  outlineTrees.sort(function (a, b) {
    return a.startPosition.compare(b.startPosition);
  });
}

function outlineTreeFromHackOutlineItem(item) {
  return {
    tokenizedText: [(0, _nuclideTokenizedText.plain)(item.name)],
    startPosition: pointFromHackOutlineItem(item),
    children: []
  };
}

function pointFromHackOutlineItem(item) {
  return new _atom.Point(item.line - 1, item.char_start - 1);
}
//# sourceMappingURL=data:application/json;base64,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QU8sU0FBUyxDQUFDO0NBQ2xCOztBQUVELFNBQVMsV0FBVyxDQUFDLFlBQWdDLEVBQVE7QUFDM0QsT0FBSyxJQUFNLElBQUksSUFBSSxZQUFZLEVBQUU7QUFDL0IsZUFBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUM1QjtBQUNELGNBQVksQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztXQUFLLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7R0FBQSxDQUFDLENBQUM7Q0FDdkU7O0FBRUQsU0FBUyw4QkFBOEIsQ0FBQyxJQUFxQixFQUFlO0FBQzFFLFNBQU87QUFDTCxpQkFBYSxFQUFFLENBQUMsaUNBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLGlCQUFhLEVBQUUsd0JBQXdCLENBQUMsSUFBSSxDQUFDO0FBQzdDLFlBQVEsRUFBRSxFQUFFO0dBQ2IsQ0FBQztDQUNIOztBQUVELFNBQVMsd0JBQXdCLENBQUMsSUFBcUIsRUFBYztBQUNuRSxTQUFPLGdCQUFVLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDdEQiLCJmaWxlIjoiT3V0bGluZVZpZXdQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPdXRsaW5lLCBPdXRsaW5lVHJlZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1vdXRsaW5lLXZpZXcnO1xuaW1wb3J0IHR5cGUge0hhY2tPdXRsaW5lLCBIYWNrT3V0bGluZUl0ZW19IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1iYXNlL2xpYi9IYWNrU2VydmljZSc7XG5pbXBvcnQge3BsYWlufSBmcm9tICcuLi8uLi9udWNsaWRlLXRva2VuaXplZC10ZXh0JztcblxuaW1wb3J0IHtQb2ludH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtvdXRsaW5lRnJvbUVkaXRvcn0gZnJvbSAnLi9oYWNrJztcblxuZXhwb3J0IGNsYXNzIE91dGxpbmVWaWV3UHJvdmlkZXIge1xuICBhc3luYyBnZXRPdXRsaW5lKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTw/T3V0bGluZT4ge1xuICAgIGNvbnN0IGhhY2tPdXRsaW5lID0gYXdhaXQgb3V0bGluZUZyb21FZGl0b3IoZWRpdG9yKTtcbiAgICBpZiAoaGFja091dGxpbmUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBvdXRsaW5lRnJvbUhhY2tPdXRsaW5lKGhhY2tPdXRsaW5lKTtcbiAgfVxufVxuXG4vLyBFeHBvcnRlZCBmb3IgdGVzdGluZ1xuZXhwb3J0IGZ1bmN0aW9uIG91dGxpbmVGcm9tSGFja091dGxpbmUoaGFja091dGxpbmU6IEhhY2tPdXRsaW5lKTogT3V0bGluZSB7XG4gIGNvbnN0IGNsYXNzZXMgPSBleHRyYWN0Q2xhc3NlcyhoYWNrT3V0bGluZSk7XG4gIGFkZE1ldGhvZHNUb0NsYXNzZXMoaGFja091dGxpbmUsIGNsYXNzZXMpO1xuXG4gIGNvbnN0IGZ1bmN0aW9ucyA9IGV4dHJhY3RGdW5jdGlvbnMoaGFja091dGxpbmUpO1xuXG4gIGNvbnN0IG91dGxpbmVUcmVlcyA9IGFycmF5LmZyb20oY2xhc3Nlcy52YWx1ZXMoKSkuY29uY2F0KGZ1bmN0aW9ucyk7XG4gIHNvcnRPdXRsaW5lKG91dGxpbmVUcmVlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBvdXRsaW5lVHJlZXMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RDbGFzc2VzKGhhY2tPdXRsaW5lOiBIYWNrT3V0bGluZSk6IE1hcDxzdHJpbmcsIE91dGxpbmVUcmVlPiB7XG4gIGNvbnN0IGNsYXNzZXMgPSBuZXcgTWFwKCk7XG4gIGZvciAoY29uc3QgaXRlbSBvZiBoYWNrT3V0bGluZSkge1xuICAgIGlmIChpdGVtLnR5cGUgPT09ICdjbGFzcycpIHtcbiAgICAgIGNsYXNzZXMuc2V0KGl0ZW0ubmFtZSwgb3V0bGluZVRyZWVGcm9tSGFja091dGxpbmVJdGVtKGl0ZW0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNsYXNzZXM7XG59XG5cbmZ1bmN0aW9uIGFkZE1ldGhvZHNUb0NsYXNzZXMoaGFja091dGxpbmU6IEhhY2tPdXRsaW5lLCBjbGFzc2VzOiBNYXA8c3RyaW5nLCBPdXRsaW5lVHJlZT4pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBpdGVtIG9mIGhhY2tPdXRsaW5lKSB7XG4gICAgaWYgKGl0ZW0udHlwZSA9PT0gJ21ldGhvZCcgfHwgaXRlbS50eXBlID09PSAnc3RhdGljIG1ldGhvZCcpIHtcbiAgICAgIC8vIFRPRE8gaGFuZGxlIGJhZCBpbnB1dFxuICAgICAgY29uc3QgW2NsYXNzTmFtZSwgbWV0aG9kTmFtZV0gPSBpdGVtLm5hbWUuc3BsaXQoJzo6Jyk7XG4gICAgICBpbnZhcmlhbnQobWV0aG9kTmFtZSAhPSBudWxsLCBgRXhwZWN0ZWQgbWV0aG9kIG5hbWUgdG8gaW5jbHVkZSAnOjonLCBnb3QgJyR7aXRlbS5uYW1lfSdgKTtcblxuICAgICAgY29uc3QgbWV0aG9kT3V0bGluZSA9IHtcbiAgICAgICAgLi4ub3V0bGluZVRyZWVGcm9tSGFja091dGxpbmVJdGVtKGl0ZW0pLFxuICAgICAgICB0b2tlbml6ZWRUZXh0OiBbcGxhaW4obWV0aG9kTmFtZSldLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgY2xhc3NPdXRsaW5lID0gY2xhc3Nlcy5nZXQoY2xhc3NOYW1lKTtcbiAgICAgIGludmFyaWFudChjbGFzc091dGxpbmUgIT0gbnVsbCwgYE1pc3NpbmcgY2xhc3MgJHtjbGFzc05hbWV9YCk7XG4gICAgICBjbGFzc091dGxpbmUuY2hpbGRyZW4ucHVzaChtZXRob2RPdXRsaW5lKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdEZ1bmN0aW9ucyhoYWNrT3V0bGluZTogSGFja091dGxpbmUpOiBBcnJheTxPdXRsaW5lVHJlZT4ge1xuICBjb25zdCBmdW5jdGlvbnMgPSBbXTtcbiAgZm9yIChjb25zdCBpdGVtIG9mIGhhY2tPdXRsaW5lKSB7XG4gICAgaWYgKGl0ZW0udHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZnVuY3Rpb25zLnB1c2gob3V0bGluZVRyZWVGcm9tSGFja091dGxpbmVJdGVtKGl0ZW0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9ucztcbn1cblxuZnVuY3Rpb24gc29ydE91dGxpbmUob3V0bGluZVRyZWVzOiBBcnJheTxPdXRsaW5lVHJlZT4pOiB2b2lkIHtcbiAgZm9yIChjb25zdCB0cmVlIG9mIG91dGxpbmVUcmVlcykge1xuICAgIHNvcnRPdXRsaW5lKHRyZWUuY2hpbGRyZW4pO1xuICB9XG4gIG91dGxpbmVUcmVlcy5zb3J0KChhLCBiKSA9PiBhLnN0YXJ0UG9zaXRpb24uY29tcGFyZShiLnN0YXJ0UG9zaXRpb24pKTtcbn1cblxuZnVuY3Rpb24gb3V0bGluZVRyZWVGcm9tSGFja091dGxpbmVJdGVtKGl0ZW06IEhhY2tPdXRsaW5lSXRlbSk6IE91dGxpbmVUcmVlIHtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbml6ZWRUZXh0OiBbcGxhaW4oaXRlbS5uYW1lKV0sXG4gICAgc3RhcnRQb3NpdGlvbjogcG9pbnRGcm9tSGFja091dGxpbmVJdGVtKGl0ZW0pLFxuICAgIGNoaWxkcmVuOiBbXSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gcG9pbnRGcm9tSGFja091dGxpbmVJdGVtKGl0ZW06IEhhY2tPdXRsaW5lSXRlbSk6IGF0b20kUG9pbnQge1xuICByZXR1cm4gbmV3IFBvaW50KGl0ZW0ubGluZSAtIDEsIGl0ZW0uY2hhcl9zdGFydCAtIDEpO1xufVxuIl19