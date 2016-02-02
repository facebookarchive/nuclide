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
        var contents = yield (0, _remoteConnection.getServiceByNuclideUri)('FileSystemService', tag.file).readFile((0, _remoteUri.getPath)(tag.file));
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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQWdEc0IsbUJBQW1CLHFCQUFsQyxXQUFtQyxHQUFnQixFQUFtQjtNQUN0RSxVQUFVLEdBQWEsR0FBRyxDQUExQixVQUFVO01BQUUsT0FBTyxHQUFJLEdBQUcsQ0FBZCxPQUFPOztBQUN4QixNQUFJLFVBQVUsRUFBRTtBQUNkLGNBQVUsRUFBRSxDQUFDO0dBQ2QsTUFBTSxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7OztBQUcxQixVQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDdkIsVUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDcEQsZUFBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEQsWUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDcEQsaUJBQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hELG9CQUFVLEdBQUcsSUFBSSxDQUFDO1NBQ25CO09BQ0Y7QUFDRCxVQUFJOztBQUVGLFlBQU0sUUFBUSxHQUFHLE1BQU0sOENBQXVCLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FDekUsUUFBUSxDQUFDLHdCQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFlBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BELGtCQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsY0FBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ3hFLHNCQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ2Ysa0JBQU07V0FDUDtTQUNGO09BQ0YsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGlDQUFXLENBQUMsSUFBSSx3REFBc0QsR0FBRyxDQUFDLElBQUksRUFBSSxDQUFDLENBQUMsQ0FBQztPQUN0RjtLQUNGOztBQUVELFNBQU8sVUFBVSxDQUFDO0NBQ25COzs7Ozs7dUJBcEV1QixlQUFlOztnQ0FDRix5QkFBeUI7O3lCQUN4QyxrQkFBa0I7OztBQUdqQyxJQUFNLGdCQUFnQixHQUFHO0FBQzlCLEdBQUMsRUFBRSxPQUFPO0FBQ1YsR0FBQyxFQUFFLFFBQVE7QUFDWCxHQUFDLEVBQUUsTUFBTTtBQUNULEdBQUMsRUFBRSxVQUFVO0FBQ2IsR0FBQyxFQUFFLE1BQU07QUFDVCxHQUFDLEVBQUUsTUFBTTtBQUNULEdBQUMsRUFBRSxRQUFRO0FBQ1gsR0FBQyxFQUFFLFVBQVU7QUFDYixHQUFDLEVBQUUsUUFBUTtBQUNYLEdBQUMsRUFBRSxTQUFTO0FBQ1osR0FBQyxFQUFFLE9BQU87QUFDVixHQUFDLEVBQUUsS0FBSztDQUNULENBQUM7OztBQUVLLElBQU0sZ0JBQWdCLEdBQUc7QUFDOUIsR0FBQyxFQUFFLFdBQVc7QUFDZCxHQUFDLEVBQUUsWUFBWTtBQUNmLEdBQUMsRUFBRSxZQUFZO0FBQ2YsR0FBQyxFQUFFLFVBQVU7QUFDYixHQUFDLEVBQUUsa0JBQWtCO0FBQ3JCLEdBQUMsRUFBRSxZQUFZO0FBQ2YsR0FBQyxFQUFFLFVBQVU7QUFDYixHQUFDLEVBQUUsVUFBVTtBQUNiLEdBQUMsRUFBRSxXQUFXO0FBQ2QsR0FBQyxFQUFFLFVBQVU7QUFDYixHQUFDLEVBQUUsV0FBVztBQUNkLEdBQUMsRUFBRSxXQUFXO0NBQ2YsQ0FBQyIsImZpbGUiOiJ1dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDdGFnc1Jlc3VsdH0gZnJvbSAnLi4vLi4vcmVtb3RlLWN0YWdzLWJhc2UnO1xuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcbmltcG9ydCB7Z2V0UGF0aH0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbi8vIFRha2VuIGZyb20gaHR0cDovL2N0YWdzLnNvdXJjZWZvcmdlLm5ldC9GT1JNQVRcbmV4cG9ydCBjb25zdCBDVEFHU19LSU5EX05BTUVTID0ge1xuICBjOiAnY2xhc3MnLFxuICBkOiAnZGVmaW5lJyxcbiAgZTogJ2VudW0nLFxuICBmOiAnZnVuY3Rpb24nLFxuICBGOiAnZmlsZScsXG4gIGc6ICdlbnVtJyxcbiAgbTogJ21lbWJlcicsXG4gIHA6ICdmdW5jdGlvbicsXG4gIHM6ICdzdHJ1Y3QnLFxuICB0OiAndHlwZWRlZicsXG4gIHU6ICd1bmlvbicsXG4gIHY6ICd2YXInLFxufTtcblxuZXhwb3J0IGNvbnN0IENUQUdTX0tJTkRfSUNPTlMgPSB7XG4gIGM6ICdpY29uLWNvZGUnLFxuICBkOiAnaWNvbi1xdW90ZScsXG4gIGU6ICdpY29uLXF1b3RlJyxcbiAgZjogJ2ljb24temFwJyxcbiAgRjogJ2ljb24tZmlsZS1iaW5hcnknLFxuICBnOiAnaWNvbi1xdW90ZScsXG4gIG06ICdpY29uLXphcCcsXG4gIHA6ICdpY29uLXphcCcsXG4gIHM6ICdpY29uLWNvZGUnLFxuICB0OiAnaWNvbi10YWcnLFxuICB1OiAnaWNvbi1jb2RlJyxcbiAgdjogJ2ljb24tY29kZScsXG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TGluZU51bWJlckZvclRhZyh0YWc6IEN0YWdzUmVzdWx0KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgbGV0IHtsaW5lTnVtYmVyLCBwYXR0ZXJufSA9IHRhZztcbiAgaWYgKGxpbmVOdW1iZXIpIHtcbiAgICBsaW5lTnVtYmVyLS07IC8vIGN0YWdzIGxpbmUgbnVtYmVycyBzdGFydCBhdCAxXG4gIH0gZWxzZSBpZiAocGF0dGVybiAhPSBudWxsKSB7XG4gICAgLy8gY3RhZ3MgZG9lcyBub3QgZXNjYXBlIHJlZ2V4cHMgcHJvcGVybHkuXG4gICAgLy8gSG93ZXZlciwgaXQgc2hvdWxkIG5ldmVyIGNyZWF0ZSBhbnl0aGluZyBiZXlvbmQgL3gvIG9yIC9eeCQvLlxuICAgIGxldCBleGFjdE1hdGNoID0gZmFsc2U7XG4gICAgaWYgKHBhdHRlcm4uc3RhcnRzV2l0aCgnLycpICYmIHBhdHRlcm4uZW5kc1dpdGgoJy8nKSkge1xuICAgICAgcGF0dGVybiA9IHBhdHRlcm4uc3Vic3RyKDEsIHBhdHRlcm4ubGVuZ3RoIC0gMik7XG4gICAgICBpZiAocGF0dGVybi5zdGFydHNXaXRoKCdeJykgJiYgcGF0dGVybi5lbmRzV2l0aCgnJCcpKSB7XG4gICAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnN1YnN0cigxLCBwYXR0ZXJuLmxlbmd0aCAtIDIpO1xuICAgICAgICBleGFjdE1hdGNoID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIC8vIFNlYXJjaCBmb3IgdGhlIHBhdHRlcm4gaW4gdGhlIGZpbGUuXG4gICAgICBjb25zdCBjb250ZW50cyA9IGF3YWl0IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0ZpbGVTeXN0ZW1TZXJ2aWNlJywgdGFnLmZpbGUpXG4gICAgICAgIC5yZWFkRmlsZShnZXRQYXRoKHRhZy5maWxlKSk7XG4gICAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnRzLnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJ1xcbicpO1xuICAgICAgbGluZU51bWJlciA9IDA7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChleGFjdE1hdGNoID8gbGluZXNbaV0gPT09IHBhdHRlcm4gOiBsaW5lc1tpXS5pbmRleE9mKHBhdHRlcm4pICE9PSAtMSkge1xuICAgICAgICAgIGxpbmVOdW1iZXIgPSBpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZ2V0TG9nZ2VyKCkud2FybihgbnVjbGlkZS1yZW1vdGUtY3RhZ3M6IENvdWxkIG5vdCBsb2NhdGUgcGF0dGVybiBpbiAke3RhZy5maWxlfWAsIGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsaW5lTnVtYmVyO1xufVxuIl19