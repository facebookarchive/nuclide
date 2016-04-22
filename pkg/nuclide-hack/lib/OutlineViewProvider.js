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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.outlineFromHackOutline = outlineFromHackOutline;

var outlineFromEditor = _asyncToGenerator(function* (editor) {
  var filePath = editor.getPath();
  if (filePath == null) {
    return null;
  }
  var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(filePath);
  if (hackLanguage == null) {
    return null;
  }

  var contents = editor.getText();

  return yield hackLanguage.getOutline(filePath, contents);
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideTokenizedText = require('../../nuclide-tokenized-text');

var _HackLanguage = require('./HackLanguage');

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var OutlineViewProvider = (function () {
  function OutlineViewProvider() {
    _classCallCheck(this, OutlineViewProvider);
  }

  // Exported for testing

  _createClass(OutlineViewProvider, [{
    key: 'getOutline',
    value: _asyncToGenerator(function* (editor) {
      var hackOutline = yield outlineFromEditor(editor);
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

      var classId = _item$name$split2[0];
      var methodName = _item$name$split2[1];

      (0, _assert2['default'])(methodName != null, 'Expected method name to include \'::\', got \'' + item.name + '\'');

      var methodOutline = outlineTreeFromHackOutlineItem(item);

      var classOutline = classes.get(classId);
      (0, _assert2['default'])(classOutline != null, 'Missing class ' + classId);
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
  var text = [];
  switch (item.type) {
    case 'static method':
    case 'method':
      var _item$name$split3 = item.name.split('::'),
          _item$name$split32 = _slicedToArray(_item$name$split3, 2),
          methodName = _item$name$split32[1];

      (0, _assert2['default'])(methodName != null, 'Expected method name to include \'::\', got \'' + item.name + '\'');

      if (item.type === 'static method') {
        text.push((0, _nuclideTokenizedText.keyword)('static'));
        text.push((0, _nuclideTokenizedText.whitespace)(' '));
      }
      text.push((0, _nuclideTokenizedText.keyword)('function'));
      text.push((0, _nuclideTokenizedText.whitespace)(' '));
      text.push((0, _nuclideTokenizedText.method)(methodName));
      break;
    case 'function':
      text.push((0, _nuclideTokenizedText.keyword)('function'));
      text.push((0, _nuclideTokenizedText.whitespace)(' '));
      text.push((0, _nuclideTokenizedText.method)(item.name));
      break;
    case 'class':
      text.push((0, _nuclideTokenizedText.keyword)('class'));
      text.push((0, _nuclideTokenizedText.whitespace)(' '));
      text.push((0, _nuclideTokenizedText.className)(item.name));
      break;
    default:
      throw new Error('Unrecognized item type ' + item.type);
  }

  return {
    tokenizedText: text,
    startPosition: pointFromHackOutlineItem(item),
    children: []
  };
}

function pointFromHackOutlineItem(item) {
  return new _atom.Point(item.line - 1, item.char_start - 1);
}
//# sourceMappingURL=data:application/json;base64,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QyxDQUFDLENBQUM7Q0FDdEQiLCJmaWxlIjoiT3V0bGluZVZpZXdQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPdXRsaW5lLCBPdXRsaW5lVHJlZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1vdXRsaW5lLXZpZXcnO1xuaW1wb3J0IHR5cGUge0hhY2tPdXRsaW5lLCBIYWNrT3V0bGluZUl0ZW19IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1iYXNlL2xpYi9IYWNrU2VydmljZSc7XG5pbXBvcnQge1xuICBjbGFzc05hbWUsXG4gIGtleXdvcmQsXG4gIG1ldGhvZCxcbiAgd2hpdGVzcGFjZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS10b2tlbml6ZWQtdGV4dCc7XG5pbXBvcnQge2dldEhhY2tMYW5ndWFnZUZvclVyaX0gZnJvbSAnLi9IYWNrTGFuZ3VhZ2UnO1xuXG5pbXBvcnQge1BvaW50fSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuZXhwb3J0IGNsYXNzIE91dGxpbmVWaWV3UHJvdmlkZXIge1xuICBhc3luYyBnZXRPdXRsaW5lKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTw/T3V0bGluZT4ge1xuICAgIGNvbnN0IGhhY2tPdXRsaW5lID0gYXdhaXQgb3V0bGluZUZyb21FZGl0b3IoZWRpdG9yKTtcbiAgICBpZiAoaGFja091dGxpbmUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBvdXRsaW5lRnJvbUhhY2tPdXRsaW5lKGhhY2tPdXRsaW5lKTtcbiAgfVxufVxuXG4vLyBFeHBvcnRlZCBmb3IgdGVzdGluZ1xuZXhwb3J0IGZ1bmN0aW9uIG91dGxpbmVGcm9tSGFja091dGxpbmUoaGFja091dGxpbmU6IEhhY2tPdXRsaW5lKTogT3V0bGluZSB7XG4gIGNvbnN0IGNsYXNzZXMgPSBleHRyYWN0Q2xhc3NlcyhoYWNrT3V0bGluZSk7XG4gIGFkZE1ldGhvZHNUb0NsYXNzZXMoaGFja091dGxpbmUsIGNsYXNzZXMpO1xuXG4gIGNvbnN0IGZ1bmN0aW9ucyA9IGV4dHJhY3RGdW5jdGlvbnMoaGFja091dGxpbmUpO1xuXG4gIGNvbnN0IG91dGxpbmVUcmVlcyA9IEFycmF5LmZyb20oY2xhc3Nlcy52YWx1ZXMoKSkuY29uY2F0KGZ1bmN0aW9ucyk7XG4gIHNvcnRPdXRsaW5lKG91dGxpbmVUcmVlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBvdXRsaW5lVHJlZXMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RDbGFzc2VzKGhhY2tPdXRsaW5lOiBIYWNrT3V0bGluZSk6IE1hcDxzdHJpbmcsIE91dGxpbmVUcmVlPiB7XG4gIGNvbnN0IGNsYXNzZXMgPSBuZXcgTWFwKCk7XG4gIGZvciAoY29uc3QgaXRlbSBvZiBoYWNrT3V0bGluZSkge1xuICAgIGlmIChpdGVtLnR5cGUgPT09ICdjbGFzcycpIHtcbiAgICAgIGNsYXNzZXMuc2V0KGl0ZW0ubmFtZSwgb3V0bGluZVRyZWVGcm9tSGFja091dGxpbmVJdGVtKGl0ZW0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNsYXNzZXM7XG59XG5cbmZ1bmN0aW9uIGFkZE1ldGhvZHNUb0NsYXNzZXMoaGFja091dGxpbmU6IEhhY2tPdXRsaW5lLCBjbGFzc2VzOiBNYXA8c3RyaW5nLCBPdXRsaW5lVHJlZT4pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBpdGVtIG9mIGhhY2tPdXRsaW5lKSB7XG4gICAgaWYgKGl0ZW0udHlwZSA9PT0gJ21ldGhvZCcgfHwgaXRlbS50eXBlID09PSAnc3RhdGljIG1ldGhvZCcpIHtcbiAgICAgIC8vIFRPRE8gaGFuZGxlIGJhZCBpbnB1dFxuICAgICAgY29uc3QgW2NsYXNzSWQsIG1ldGhvZE5hbWVdID0gaXRlbS5uYW1lLnNwbGl0KCc6OicpO1xuICAgICAgaW52YXJpYW50KG1ldGhvZE5hbWUgIT0gbnVsbCwgYEV4cGVjdGVkIG1ldGhvZCBuYW1lIHRvIGluY2x1ZGUgJzo6JywgZ290ICcke2l0ZW0ubmFtZX0nYCk7XG5cbiAgICAgIGNvbnN0IG1ldGhvZE91dGxpbmUgPSBvdXRsaW5lVHJlZUZyb21IYWNrT3V0bGluZUl0ZW0oaXRlbSk7XG5cbiAgICAgIGNvbnN0IGNsYXNzT3V0bGluZSA9IGNsYXNzZXMuZ2V0KGNsYXNzSWQpO1xuICAgICAgaW52YXJpYW50KGNsYXNzT3V0bGluZSAhPSBudWxsLCBgTWlzc2luZyBjbGFzcyAke2NsYXNzSWR9YCk7XG4gICAgICBjbGFzc091dGxpbmUuY2hpbGRyZW4ucHVzaChtZXRob2RPdXRsaW5lKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdEZ1bmN0aW9ucyhoYWNrT3V0bGluZTogSGFja091dGxpbmUpOiBBcnJheTxPdXRsaW5lVHJlZT4ge1xuICBjb25zdCBmdW5jdGlvbnMgPSBbXTtcbiAgZm9yIChjb25zdCBpdGVtIG9mIGhhY2tPdXRsaW5lKSB7XG4gICAgaWYgKGl0ZW0udHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZnVuY3Rpb25zLnB1c2gob3V0bGluZVRyZWVGcm9tSGFja091dGxpbmVJdGVtKGl0ZW0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9ucztcbn1cblxuZnVuY3Rpb24gc29ydE91dGxpbmUob3V0bGluZVRyZWVzOiBBcnJheTxPdXRsaW5lVHJlZT4pOiB2b2lkIHtcbiAgZm9yIChjb25zdCB0cmVlIG9mIG91dGxpbmVUcmVlcykge1xuICAgIHNvcnRPdXRsaW5lKHRyZWUuY2hpbGRyZW4pO1xuICB9XG4gIG91dGxpbmVUcmVlcy5zb3J0KChhLCBiKSA9PiBhLnN0YXJ0UG9zaXRpb24uY29tcGFyZShiLnN0YXJ0UG9zaXRpb24pKTtcbn1cblxuZnVuY3Rpb24gb3V0bGluZVRyZWVGcm9tSGFja091dGxpbmVJdGVtKGl0ZW06IEhhY2tPdXRsaW5lSXRlbSk6IE91dGxpbmVUcmVlIHtcbiAgY29uc3QgdGV4dCA9IFtdO1xuICBzd2l0Y2ggKGl0ZW0udHlwZSkge1xuICAgIGNhc2UgJ3N0YXRpYyBtZXRob2QnOlxuICAgIGNhc2UgJ21ldGhvZCc6XG4gICAgICBjb25zdCBbLCBtZXRob2ROYW1lXSA9IGl0ZW0ubmFtZS5zcGxpdCgnOjonKTtcbiAgICAgIGludmFyaWFudChtZXRob2ROYW1lICE9IG51bGwsIGBFeHBlY3RlZCBtZXRob2QgbmFtZSB0byBpbmNsdWRlICc6OicsIGdvdCAnJHtpdGVtLm5hbWV9J2ApO1xuXG4gICAgICBpZiAoaXRlbS50eXBlID09PSAnc3RhdGljIG1ldGhvZCcpIHtcbiAgICAgICAgdGV4dC5wdXNoKGtleXdvcmQoJ3N0YXRpYycpKTtcbiAgICAgICAgdGV4dC5wdXNoKHdoaXRlc3BhY2UoJyAnKSk7XG4gICAgICB9XG4gICAgICB0ZXh0LnB1c2goa2V5d29yZCgnZnVuY3Rpb24nKSk7XG4gICAgICB0ZXh0LnB1c2god2hpdGVzcGFjZSgnICcpKTtcbiAgICAgIHRleHQucHVzaChtZXRob2QobWV0aG9kTmFtZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgdGV4dC5wdXNoKGtleXdvcmQoJ2Z1bmN0aW9uJykpO1xuICAgICAgdGV4dC5wdXNoKHdoaXRlc3BhY2UoJyAnKSk7XG4gICAgICB0ZXh0LnB1c2gobWV0aG9kKGl0ZW0ubmFtZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2xhc3MnOlxuICAgICAgdGV4dC5wdXNoKGtleXdvcmQoJ2NsYXNzJykpO1xuICAgICAgdGV4dC5wdXNoKHdoaXRlc3BhY2UoJyAnKSk7XG4gICAgICB0ZXh0LnB1c2goY2xhc3NOYW1lKGl0ZW0ubmFtZSkpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGl0ZW0gdHlwZSAke2l0ZW0udHlwZX1gKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdG9rZW5pemVkVGV4dDogdGV4dCxcbiAgICBzdGFydFBvc2l0aW9uOiBwb2ludEZyb21IYWNrT3V0bGluZUl0ZW0oaXRlbSksXG4gICAgY2hpbGRyZW46IFtdLFxuICB9O1xufVxuXG5mdW5jdGlvbiBwb2ludEZyb21IYWNrT3V0bGluZUl0ZW0oaXRlbTogSGFja091dGxpbmVJdGVtKTogYXRvbSRQb2ludCB7XG4gIHJldHVybiBuZXcgUG9pbnQoaXRlbS5saW5lIC0gMSwgaXRlbS5jaGFyX3N0YXJ0IC0gMSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG91dGxpbmVGcm9tRWRpdG9yKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTw/SGFja091dGxpbmU+IHtcbiAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICBpZiAoZmlsZVBhdGggPT0gbnVsbCkge1xuICAgIHJldHVybiAgbnVsbDtcbiAgfVxuICBjb25zdCBoYWNrTGFuZ3VhZ2UgPSBhd2FpdCBnZXRIYWNrTGFuZ3VhZ2VGb3JVcmkoZmlsZVBhdGgpO1xuICBpZiAoaGFja0xhbmd1YWdlID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRzID0gZWRpdG9yLmdldFRleHQoKTtcblxuICByZXR1cm4gYXdhaXQgaGFja0xhbmd1YWdlLmdldE91dGxpbmUoZmlsZVBhdGgsIGNvbnRlbnRzKTtcbn1cbiJdfQ==