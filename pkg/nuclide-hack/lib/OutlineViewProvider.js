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

  var outlineTrees = Array.from(classes.values()).concat(functions);
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
//# sourceMappingURL=data:application/json;base64,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QUM7Q0FDbEI7O0FBRUQsU0FBUyxXQUFXLENBQUMsWUFBZ0MsRUFBUTtBQUMzRCxPQUFLLElBQU0sSUFBSSxJQUFJLFlBQVksRUFBRTtBQUMvQixlQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQzVCO0FBQ0QsY0FBWSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO1dBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztHQUFBLENBQUMsQ0FBQztDQUN2RTs7QUFFRCxTQUFTLDhCQUE4QixDQUFDLElBQXFCLEVBQWU7QUFDMUUsU0FBTztBQUNMLGlCQUFhLEVBQUUsQ0FBQyxpQ0FBTSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakMsaUJBQWEsRUFBRSx3QkFBd0IsQ0FBQyxJQUFJLENBQUM7QUFDN0MsWUFBUSxFQUFFLEVBQUU7R0FDYixDQUFDO0NBQ0g7O0FBRUQsU0FBUyx3QkFBd0IsQ0FBQyxJQUFxQixFQUFjO0FBQ25FLFNBQU8sZ0JBQVUsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUN0RCIsImZpbGUiOiJPdXRsaW5lVmlld1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge091dGxpbmUsIE91dGxpbmVUcmVlfSBmcm9tICcuLi8uLi9udWNsaWRlLW91dGxpbmUtdmlldyc7XG5pbXBvcnQgdHlwZSB7SGFja091dGxpbmUsIEhhY2tPdXRsaW5lSXRlbX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oYWNrLWJhc2UvbGliL0hhY2tTZXJ2aWNlJztcbmltcG9ydCB7cGxhaW59IGZyb20gJy4uLy4uL251Y2xpZGUtdG9rZW5pemVkLXRleHQnO1xuXG5pbXBvcnQge1BvaW50fSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7b3V0bGluZUZyb21FZGl0b3J9IGZyb20gJy4vaGFjayc7XG5cbmV4cG9ydCBjbGFzcyBPdXRsaW5lVmlld1Byb3ZpZGVyIHtcbiAgYXN5bmMgZ2V0T3V0bGluZShlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8P091dGxpbmU+IHtcbiAgICBjb25zdCBoYWNrT3V0bGluZSA9IGF3YWl0IG91dGxpbmVGcm9tRWRpdG9yKGVkaXRvcik7XG4gICAgaWYgKGhhY2tPdXRsaW5lID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gb3V0bGluZUZyb21IYWNrT3V0bGluZShoYWNrT3V0bGluZSk7XG4gIH1cbn1cblxuLy8gRXhwb3J0ZWQgZm9yIHRlc3RpbmdcbmV4cG9ydCBmdW5jdGlvbiBvdXRsaW5lRnJvbUhhY2tPdXRsaW5lKGhhY2tPdXRsaW5lOiBIYWNrT3V0bGluZSk6IE91dGxpbmUge1xuICBjb25zdCBjbGFzc2VzID0gZXh0cmFjdENsYXNzZXMoaGFja091dGxpbmUpO1xuICBhZGRNZXRob2RzVG9DbGFzc2VzKGhhY2tPdXRsaW5lLCBjbGFzc2VzKTtcblxuICBjb25zdCBmdW5jdGlvbnMgPSBleHRyYWN0RnVuY3Rpb25zKGhhY2tPdXRsaW5lKTtcblxuICBjb25zdCBvdXRsaW5lVHJlZXMgPSBBcnJheS5mcm9tKGNsYXNzZXMudmFsdWVzKCkpLmNvbmNhdChmdW5jdGlvbnMpO1xuICBzb3J0T3V0bGluZShvdXRsaW5lVHJlZXMpO1xuXG4gIHJldHVybiB7XG4gICAgb3V0bGluZVRyZWVzLFxuICB9O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0Q2xhc3NlcyhoYWNrT3V0bGluZTogSGFja091dGxpbmUpOiBNYXA8c3RyaW5nLCBPdXRsaW5lVHJlZT4ge1xuICBjb25zdCBjbGFzc2VzID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaGFja091dGxpbmUpIHtcbiAgICBpZiAoaXRlbS50eXBlID09PSAnY2xhc3MnKSB7XG4gICAgICBjbGFzc2VzLnNldChpdGVtLm5hbWUsIG91dGxpbmVUcmVlRnJvbUhhY2tPdXRsaW5lSXRlbShpdGVtKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBjbGFzc2VzO1xufVxuXG5mdW5jdGlvbiBhZGRNZXRob2RzVG9DbGFzc2VzKGhhY2tPdXRsaW5lOiBIYWNrT3V0bGluZSwgY2xhc3NlczogTWFwPHN0cmluZywgT3V0bGluZVRyZWU+KTogdm9pZCB7XG4gIGZvciAoY29uc3QgaXRlbSBvZiBoYWNrT3V0bGluZSkge1xuICAgIGlmIChpdGVtLnR5cGUgPT09ICdtZXRob2QnIHx8IGl0ZW0udHlwZSA9PT0gJ3N0YXRpYyBtZXRob2QnKSB7XG4gICAgICAvLyBUT0RPIGhhbmRsZSBiYWQgaW5wdXRcbiAgICAgIGNvbnN0IFtjbGFzc05hbWUsIG1ldGhvZE5hbWVdID0gaXRlbS5uYW1lLnNwbGl0KCc6OicpO1xuICAgICAgaW52YXJpYW50KG1ldGhvZE5hbWUgIT0gbnVsbCwgYEV4cGVjdGVkIG1ldGhvZCBuYW1lIHRvIGluY2x1ZGUgJzo6JywgZ290ICcke2l0ZW0ubmFtZX0nYCk7XG5cbiAgICAgIGNvbnN0IG1ldGhvZE91dGxpbmUgPSB7XG4gICAgICAgIC4uLm91dGxpbmVUcmVlRnJvbUhhY2tPdXRsaW5lSXRlbShpdGVtKSxcbiAgICAgICAgdG9rZW5pemVkVGV4dDogW3BsYWluKG1ldGhvZE5hbWUpXSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGNsYXNzT3V0bGluZSA9IGNsYXNzZXMuZ2V0KGNsYXNzTmFtZSk7XG4gICAgICBpbnZhcmlhbnQoY2xhc3NPdXRsaW5lICE9IG51bGwsIGBNaXNzaW5nIGNsYXNzICR7Y2xhc3NOYW1lfWApO1xuICAgICAgY2xhc3NPdXRsaW5lLmNoaWxkcmVuLnB1c2gobWV0aG9kT3V0bGluZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RGdW5jdGlvbnMoaGFja091dGxpbmU6IEhhY2tPdXRsaW5lKTogQXJyYXk8T3V0bGluZVRyZWU+IHtcbiAgY29uc3QgZnVuY3Rpb25zID0gW107XG4gIGZvciAoY29uc3QgaXRlbSBvZiBoYWNrT3V0bGluZSkge1xuICAgIGlmIChpdGVtLnR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZ1bmN0aW9ucy5wdXNoKG91dGxpbmVUcmVlRnJvbUhhY2tPdXRsaW5lSXRlbShpdGVtKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBmdW5jdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHNvcnRPdXRsaW5lKG91dGxpbmVUcmVlczogQXJyYXk8T3V0bGluZVRyZWU+KTogdm9pZCB7XG4gIGZvciAoY29uc3QgdHJlZSBvZiBvdXRsaW5lVHJlZXMpIHtcbiAgICBzb3J0T3V0bGluZSh0cmVlLmNoaWxkcmVuKTtcbiAgfVxuICBvdXRsaW5lVHJlZXMuc29ydCgoYSwgYikgPT4gYS5zdGFydFBvc2l0aW9uLmNvbXBhcmUoYi5zdGFydFBvc2l0aW9uKSk7XG59XG5cbmZ1bmN0aW9uIG91dGxpbmVUcmVlRnJvbUhhY2tPdXRsaW5lSXRlbShpdGVtOiBIYWNrT3V0bGluZUl0ZW0pOiBPdXRsaW5lVHJlZSB7XG4gIHJldHVybiB7XG4gICAgdG9rZW5pemVkVGV4dDogW3BsYWluKGl0ZW0ubmFtZSldLFxuICAgIHN0YXJ0UG9zaXRpb246IHBvaW50RnJvbUhhY2tPdXRsaW5lSXRlbShpdGVtKSxcbiAgICBjaGlsZHJlbjogW10sXG4gIH07XG59XG5cbmZ1bmN0aW9uIHBvaW50RnJvbUhhY2tPdXRsaW5lSXRlbShpdGVtOiBIYWNrT3V0bGluZUl0ZW0pOiBhdG9tJFBvaW50IHtcbiAgcmV0dXJuIG5ldyBQb2ludChpdGVtLmxpbmUgLSAxLCBpdGVtLmNoYXJfc3RhcnQgLSAxKTtcbn1cbiJdfQ==