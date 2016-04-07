Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Calls out to asyncExecute using the 'hg' command.
 * @param options as specified by http://nodejs.org/api/child_process.html. Additional options:
 *   - NO_HGPLAIN set if the $HGPLAIN environment variable should not be used.
 *   - TTY_OUTPUT set if the command should be run as if it were attached to a tty.
 */

var hgAsyncExecute = _asyncToGenerator(function* (args, options) {
  if (!options['NO_HGPLAIN']) {
    // Setting HGPLAIN=1 overrides any custom aliases a user has defined.
    if (options.env) {
      options.env['HGPLAIN'] = 1;
    } else {
      options.env = _extends({}, process.env || {}, { 'HGPLAIN': 1 });
    }
  }

  var cmd = undefined;
  if (options['TTY_OUTPUT']) {
    cmd = 'script';
    args = (0, _nuclideCommons.createArgsForScriptCommand)('hg', args);
  } else {
    cmd = 'hg';
  }
  try {
    return yield (0, _nuclideCommons.asyncExecute)(cmd, args, options);
  } catch (e) {
    (0, _nuclideLogging.getLogger)().error('Error executing hg command: ' + JSON.stringify(args) + ' ' + ('options: ' + JSON.stringify(options) + ' ' + JSON.stringify(e)));
    throw e;
  }
});

exports.hgAsyncExecute = hgAsyncExecute;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideLogging = require('../../nuclide-logging');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhnLXV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFvQnNCLGNBQWMscUJBQTdCLFdBQThCLElBQW1CLEVBQUUsT0FBWSxFQUFnQjtBQUNwRixNQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFOztBQUUxQixRQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUU7QUFDZixhQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM1QixNQUFNO0FBQ0wsYUFBTyxDQUFDLEdBQUcsZ0JBQU8sT0FBTyxDQUFDLEdBQUcsSUFBSSxFQUFFLElBQUUsU0FBUyxFQUFFLENBQUMsR0FBQyxDQUFDO0tBQ3BEO0dBQ0Y7O0FBRUQsTUFBSSxHQUFHLFlBQUEsQ0FBQztBQUNSLE1BQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQ3pCLE9BQUcsR0FBRyxRQUFRLENBQUM7QUFDZixRQUFJLEdBQUcsZ0RBQTJCLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztHQUMvQyxNQUFNO0FBQ0wsT0FBRyxHQUFHLElBQUksQ0FBQztHQUNaO0FBQ0QsTUFBSTtBQUNGLFdBQU8sTUFBTSxrQ0FBYSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQy9DLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixvQ0FBVyxDQUFDLEtBQUssQ0FBQyxpQ0FBK0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsd0JBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLENBQUM7QUFDaEUsVUFBTSxDQUFDLENBQUM7R0FDVDtDQUNGOzs7Ozs7Ozs7Ozs7Ozs4QkFqQ3NELHVCQUF1Qjs7OEJBQ3RELHVCQUF1QiIsImZpbGUiOiJoZy11dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7YXN5bmNFeGVjdXRlLCBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuXG4vKipcbiAqIENhbGxzIG91dCB0byBhc3luY0V4ZWN1dGUgdXNpbmcgdGhlICdoZycgY29tbWFuZC5cbiAqIEBwYXJhbSBvcHRpb25zIGFzIHNwZWNpZmllZCBieSBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sLiBBZGRpdGlvbmFsIG9wdGlvbnM6XG4gKiAgIC0gTk9fSEdQTEFJTiBzZXQgaWYgdGhlICRIR1BMQUlOIGVudmlyb25tZW50IHZhcmlhYmxlIHNob3VsZCBub3QgYmUgdXNlZC5cbiAqICAgLSBUVFlfT1VUUFVUIHNldCBpZiB0aGUgY29tbWFuZCBzaG91bGQgYmUgcnVuIGFzIGlmIGl0IHdlcmUgYXR0YWNoZWQgdG8gYSB0dHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoZ0FzeW5jRXhlY3V0ZShhcmdzOiBBcnJheTxzdHJpbmc+LCBvcHRpb25zOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICBpZiAoIW9wdGlvbnNbJ05PX0hHUExBSU4nXSkge1xuICAgIC8vIFNldHRpbmcgSEdQTEFJTj0xIG92ZXJyaWRlcyBhbnkgY3VzdG9tIGFsaWFzZXMgYSB1c2VyIGhhcyBkZWZpbmVkLlxuICAgIGlmIChvcHRpb25zLmVudikge1xuICAgICAgb3B0aW9ucy5lbnZbJ0hHUExBSU4nXSA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMuZW52ID0gey4uLnByb2Nlc3MuZW52IHx8IHt9LCAnSEdQTEFJTic6IDF9O1xuICAgIH1cbiAgfVxuXG4gIGxldCBjbWQ7XG4gIGlmIChvcHRpb25zWydUVFlfT1VUUFVUJ10pIHtcbiAgICBjbWQgPSAnc2NyaXB0JztcbiAgICBhcmdzID0gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoJ2hnJywgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgY21kID0gJ2hnJztcbiAgfVxuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBhc3luY0V4ZWN1dGUoY21kLCBhcmdzLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGdldExvZ2dlcigpLmVycm9yKGBFcnJvciBleGVjdXRpbmcgaGcgY29tbWFuZDogJHtKU09OLnN0cmluZ2lmeShhcmdzKX0gYCArXG4gICAgICAgIGBvcHRpb25zOiAke0pTT04uc3RyaW5naWZ5KG9wdGlvbnMpfSAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgIHRocm93IGU7XG4gIH1cbn1cbiJdfQ==