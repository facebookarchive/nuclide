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

var getLineNumberForTag = _asyncToGenerator(function* (tag) {
  var lineNumber = tag.lineNumber;
  var pattern = tag.pattern;

  if (lineNumber) {
    lineNumber--; // ctags line numbers start at 1
  } else if (pattern != null) {
      // ctags does not escape regexps properly.
      // However, it should never create anything beyond /x/ or /^x$/.
      var exactMatch = false;
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        pattern = pattern.substr(1, pattern.length - 2);
        if (pattern.startsWith('^') && pattern.endsWith('$')) {
          pattern = pattern.substr(1, pattern.length - 2);
          exactMatch = true;
        }
      }
      try {
        // Search for the pattern in the file.
        var service = (0, _remoteConnection.getServiceByNuclideUri)('FileSystemService', tag.file);
        (0, _assert2['default'])(service);
        var contents = yield service.readFile((0, _remoteUri.getPath)(tag.file));
        var lines = contents.toString('utf8').split('\n');
        lineNumber = 0;
        for (var i = 0; i < lines.length; i++) {
          if (exactMatch ? lines[i] === pattern : lines[i].indexOf(pattern) !== -1) {
            lineNumber = i;
            break;
          }
        }
      } catch (e) {
        (0, _logging.getLogger)().warn('nuclide-remote-ctags: Could not locate pattern in ' + tag.file, e);
      }
    }

  return lineNumber;
});

exports.getLineNumberForTag = getLineNumberForTag;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _logging = require('../../logging');

var _remoteConnection = require('../../remote-connection');

var _remoteUri = require('../../remote-uri');

// Taken from http://ctags.sourceforge.net/FORMAT
var CTAGS_KIND_NAMES = {
  c: 'class',
  d: 'define',
  e: 'enum',
  f: 'function',
  F: 'file',
  g: 'enum',
  m: 'member',
  p: 'function',
  s: 'struct',
  t: 'typedef',
  u: 'union',
  v: 'var'
};

exports.CTAGS_KIND_NAMES = CTAGS_KIND_NAMES;
var CTAGS_KIND_ICONS = {
  c: 'icon-code',
  d: 'icon-quote',
  e: 'icon-quote',
  f: 'icon-zap',
  F: 'icon-file-binary',
  g: 'icon-quote',
  m: 'icon-zap',
  p: 'icon-zap',
  s: 'icon-code',
  t: 'icon-tag',
  u: 'icon-code',
  v: 'icon-code'
};

exports.CTAGS_KIND_ICONS = CTAGS_KIND_ICONS;
//# sourceMappingURL=data:application/json;base64,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QUNmLEdBQUMsRUFBRSxVQUFVO0FBQ2IsR0FBQyxFQUFFLFVBQVU7QUFDYixHQUFDLEVBQUUsV0FBVztBQUNkLEdBQUMsRUFBRSxVQUFVO0FBQ2IsR0FBQyxFQUFFLFdBQVc7QUFDZCxHQUFDLEVBQUUsV0FBVztDQUNmLENBQUMiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q3RhZ3NSZXN1bHR9IGZyb20gJy4uLy4uL3JlbW90ZS1jdGFncy1iYXNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge2dldFBhdGh9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG4vLyBUYWtlbiBmcm9tIGh0dHA6Ly9jdGFncy5zb3VyY2Vmb3JnZS5uZXQvRk9STUFUXG5leHBvcnQgY29uc3QgQ1RBR1NfS0lORF9OQU1FUyA9IHtcbiAgYzogJ2NsYXNzJyxcbiAgZDogJ2RlZmluZScsXG4gIGU6ICdlbnVtJyxcbiAgZjogJ2Z1bmN0aW9uJyxcbiAgRjogJ2ZpbGUnLFxuICBnOiAnZW51bScsXG4gIG06ICdtZW1iZXInLFxuICBwOiAnZnVuY3Rpb24nLFxuICBzOiAnc3RydWN0JyxcbiAgdDogJ3R5cGVkZWYnLFxuICB1OiAndW5pb24nLFxuICB2OiAndmFyJyxcbn07XG5cbmV4cG9ydCBjb25zdCBDVEFHU19LSU5EX0lDT05TID0ge1xuICBjOiAnaWNvbi1jb2RlJyxcbiAgZDogJ2ljb24tcXVvdGUnLFxuICBlOiAnaWNvbi1xdW90ZScsXG4gIGY6ICdpY29uLXphcCcsXG4gIEY6ICdpY29uLWZpbGUtYmluYXJ5JyxcbiAgZzogJ2ljb24tcXVvdGUnLFxuICBtOiAnaWNvbi16YXAnLFxuICBwOiAnaWNvbi16YXAnLFxuICBzOiAnaWNvbi1jb2RlJyxcbiAgdDogJ2ljb24tdGFnJyxcbiAgdTogJ2ljb24tY29kZScsXG4gIHY6ICdpY29uLWNvZGUnLFxufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldExpbmVOdW1iZXJGb3JUYWcodGFnOiBDdGFnc1Jlc3VsdCk6IFByb21pc2U8bnVtYmVyPiB7XG4gIGxldCB7bGluZU51bWJlciwgcGF0dGVybn0gPSB0YWc7XG4gIGlmIChsaW5lTnVtYmVyKSB7XG4gICAgbGluZU51bWJlci0tOyAvLyBjdGFncyBsaW5lIG51bWJlcnMgc3RhcnQgYXQgMVxuICB9IGVsc2UgaWYgKHBhdHRlcm4gIT0gbnVsbCkge1xuICAgIC8vIGN0YWdzIGRvZXMgbm90IGVzY2FwZSByZWdleHBzIHByb3Blcmx5LlxuICAgIC8vIEhvd2V2ZXIsIGl0IHNob3VsZCBuZXZlciBjcmVhdGUgYW55dGhpbmcgYmV5b25kIC94LyBvciAvXngkLy5cbiAgICBsZXQgZXhhY3RNYXRjaCA9IGZhbHNlO1xuICAgIGlmIChwYXR0ZXJuLnN0YXJ0c1dpdGgoJy8nKSAmJiBwYXR0ZXJuLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnN1YnN0cigxLCBwYXR0ZXJuLmxlbmd0aCAtIDIpO1xuICAgICAgaWYgKHBhdHRlcm4uc3RhcnRzV2l0aCgnXicpICYmIHBhdHRlcm4uZW5kc1dpdGgoJyQnKSkge1xuICAgICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHIoMSwgcGF0dGVybi5sZW5ndGggLSAyKTtcbiAgICAgICAgZXhhY3RNYXRjaCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAvLyBTZWFyY2ggZm9yIHRoZSBwYXR0ZXJuIGluIHRoZSBmaWxlLlxuICAgICAgY29uc3Qgc2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0ZpbGVTeXN0ZW1TZXJ2aWNlJywgdGFnLmZpbGUpO1xuICAgICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgICAgY29uc3QgY29udGVudHMgPSBhd2FpdCBzZXJ2aWNlLnJlYWRGaWxlKGdldFBhdGgodGFnLmZpbGUpKTtcbiAgICAgIGNvbnN0IGxpbmVzID0gY29udGVudHMudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnXFxuJyk7XG4gICAgICBsaW5lTnVtYmVyID0gMDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGV4YWN0TWF0Y2ggPyBsaW5lc1tpXSA9PT0gcGF0dGVybiA6IGxpbmVzW2ldLmluZGV4T2YocGF0dGVybikgIT09IC0xKSB7XG4gICAgICAgICAgbGluZU51bWJlciA9IGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS53YXJuKGBudWNsaWRlLXJlbW90ZS1jdGFnczogQ291bGQgbm90IGxvY2F0ZSBwYXR0ZXJuIGluICR7dGFnLmZpbGV9YCwgZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGxpbmVOdW1iZXI7XG59XG4iXX0=