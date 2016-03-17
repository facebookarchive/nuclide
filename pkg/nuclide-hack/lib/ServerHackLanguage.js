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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _TypedRegions = require('./TypedRegions');

var _utils = require('./utils');

var _nuclideLogging = require('../../nuclide-logging');

var _LocalHackLanguage = require('./LocalHackLanguage');

/**
 * Serves language requests from HackService.
 */

var ServerHackLanguage = (function () {

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   */

  function ServerHackLanguage(hhAvailable, basePath) {
    _classCallCheck(this, ServerHackLanguage);

    this._hhAvailable = hhAvailable;
    this._basePath = basePath;
  }

  _createClass(ServerHackLanguage, [{
    key: 'dispose',
    value: function dispose() {}
  }, {
    key: 'getCompletions',
    value: _asyncToGenerator(function* (filePath, contents, offset) {
      var markedContents = (0, _LocalHackLanguage.markFileForCompletion)(contents, offset);
      var completions = [];

      var _getHackService = (0, _utils.getHackService)(filePath);

      var getCompletions = _getHackService.getCompletions;

      var completionsResult = yield getCompletions(filePath, markedContents);
      if (completionsResult) {
        completions = completionsResult.completions;
      }
      return (0, _LocalHackLanguage.processCompletions)(completions);
    })
  }, {
    key: 'formatSource',
    value: _asyncToGenerator(function* (contents, startPosition, endPosition) {
      // TBD
      return contents;
    })
  }, {
    key: 'highlightSource',
    value: _asyncToGenerator(function* (filePath, contents, line, col) {
      // TBD
      return [];
    })
  }, {
    key: 'getDiagnostics',
    value: _asyncToGenerator(function* (filePath, contents) {
      var _getHackService2 = (0, _utils.getHackService)(filePath);

      var getDiagnostics = _getHackService2.getDiagnostics;

      var diagnosticResult = null;
      try {
        diagnosticResult = yield getDiagnostics(filePath, contents);
      } catch (err) {
        (0, _nuclideLogging.getLogger)().error(err);
        return [];
      }
      if (!diagnosticResult) {
        (0, _nuclideLogging.getLogger)().error('hh_client could not be reached');
        return [];
      }
      var hackDiagnostics = diagnosticResult;
      return hackDiagnostics.messages;
    })
  }, {
    key: 'getTypeCoverage',
    value: _asyncToGenerator(function* (filePath) {
      var _getHackService3 = (0, _utils.getHackService)(filePath);

      var getTypedRegions = _getHackService3.getTypedRegions;

      var regions = yield getTypedRegions(filePath);
      return (0, _TypedRegions.convertTypedRegionsToCoverageRegions)(regions);
    })
  }, {
    key: 'getOutline',
    value: _asyncToGenerator(function* (filePath, contents) {
      // TBD
      return null;
    })
  }, {
    key: 'getDefinition',
    value: _asyncToGenerator(function* (filePath, contents, lineNumber, column, lineText) {
      var _getHackService4 = (0, _utils.getHackService)(filePath);

      var getIdentifierDefinition = _getHackService4.getIdentifierDefinition;

      var definitionResult = yield getIdentifierDefinition(filePath, contents, lineNumber, column);
      var identifierResult = (0, _LocalHackLanguage.processDefinitionsForXhp)(definitionResult, column, lineText);
      return identifierResult.length === 1 ? identifierResult : [];
    })
  }, {
    key: 'getType',
    value: _asyncToGenerator(function* (filePath, contents, expression, lineNumber, column) {
      // TODO
      return null;
    })
  }, {
    key: 'findReferences',
    value: _asyncToGenerator(function* (filePath, contents, line, column) {
      return null;
    })
  }, {
    key: 'getBasePath',
    value: function getBasePath() {
      return this._basePath;
    }
  }, {
    key: 'isHackAvailable',
    value: function isHackAvailable() {
      return this._hhAvailable;
    }
  }]);

  return ServerHackLanguage;
})();

exports.ServerHackLanguage = ServerHackLanguage;
//# sourceMappingURL=data:application/json;base64,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QUM7QUFDdEYsYUFBTyxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztLQUM5RDs7OzZCQUVZLFdBQ1gsUUFBZ0IsRUFDaEIsUUFBZ0IsRUFDaEIsVUFBa0IsRUFDbEIsVUFBa0IsRUFDbEIsTUFBYyxFQUNJOztBQUVsQixhQUFPLElBQUksQ0FBQztLQUNiOzs7NkJBRW1CLFdBQ2xCLFFBQW9CLEVBQ3BCLFFBQWdCLEVBQ2hCLElBQVksRUFDWixNQUFjLEVBQ3FFO0FBQ25GLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVVLHVCQUFZO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUN2Qjs7O1dBRWMsMkJBQVk7QUFDekIsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCOzs7U0EvSFUsa0JBQWtCIiwiZmlsZSI6IlNlcnZlckhhY2tMYW5ndWFnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0NvbXBsZXRpb25SZXN1bHR9IGZyb20gJy4vSGFja0xhbmd1YWdlJztcbmltcG9ydCB0eXBlIHtcbiAgSGFja0RpYWdub3N0aWMsXG4gIEhhY2tTZWFyY2hQb3NpdGlvbixcbiAgSGFja1JlZmVyZW5jZSxcbiAgSGFja091dGxpbmUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1iYXNlL2xpYi9IYWNrU2VydmljZSc7XG5pbXBvcnQge1R5cGVDb3ZlcmFnZVJlZ2lvbn0gZnJvbSAnLi9UeXBlZFJlZ2lvbnMnO1xuXG5pbXBvcnQge2dldEhhY2tTZXJ2aWNlfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtjb252ZXJ0VHlwZWRSZWdpb25zVG9Db3ZlcmFnZVJlZ2lvbnN9IGZyb20gJy4vVHlwZWRSZWdpb25zJztcbmltcG9ydCB7XG4gIG1hcmtGaWxlRm9yQ29tcGxldGlvbixcbiAgcHJvY2Vzc0NvbXBsZXRpb25zLFxuICBwcm9jZXNzRGVmaW5pdGlvbnNGb3JYaHAsXG59IGZyb20gJy4vTG9jYWxIYWNrTGFuZ3VhZ2UnO1xuXG4vKipcbiAqIFNlcnZlcyBsYW5ndWFnZSByZXF1ZXN0cyBmcm9tIEhhY2tTZXJ2aWNlLlxuICovXG5leHBvcnQgY2xhc3MgU2VydmVySGFja0xhbmd1YWdlIHtcblxuICBfaGhBdmFpbGFibGU6IGJvb2xlYW47XG4gIF9iYXNlUGF0aDogP3N0cmluZztcblxuICAvKipcbiAgICogYGJhc2VQYXRoYCBzaG91bGQgYmUgdGhlIGRpcmVjdG9yeSB3aGVyZSB0aGUgLmhoY29uZmlnIGZpbGUgaXMgbG9jYXRlZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGhoQXZhaWxhYmxlOiBib29sZWFuLCBiYXNlUGF0aDogP3N0cmluZykge1xuICAgIHRoaXMuX2hoQXZhaWxhYmxlID0gaGhBdmFpbGFibGU7XG4gICAgdGhpcy5fYmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gIH1cblxuICBhc3luYyBnZXRDb21wbGV0aW9ucyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIG9mZnNldDogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8Q29tcGxldGlvblJlc3VsdD4+IHtcbiAgICBjb25zdCBtYXJrZWRDb250ZW50cyA9IG1hcmtGaWxlRm9yQ29tcGxldGlvbihjb250ZW50cywgb2Zmc2V0KTtcbiAgICBsZXQgY29tcGxldGlvbnMgPSBbXTtcbiAgICBjb25zdCB7Z2V0Q29tcGxldGlvbnN9ID0gZ2V0SGFja1NlcnZpY2UoZmlsZVBhdGgpO1xuICAgIGNvbnN0IGNvbXBsZXRpb25zUmVzdWx0ID0gYXdhaXQgZ2V0Q29tcGxldGlvbnMoZmlsZVBhdGgsIG1hcmtlZENvbnRlbnRzKTtcbiAgICBpZiAoY29tcGxldGlvbnNSZXN1bHQpIHtcbiAgICAgIGNvbXBsZXRpb25zID0gY29tcGxldGlvbnNSZXN1bHQuY29tcGxldGlvbnM7XG4gICAgfVxuICAgIHJldHVybiBwcm9jZXNzQ29tcGxldGlvbnMoY29tcGxldGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgZm9ybWF0U291cmNlKFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgc3RhcnRQb3NpdGlvbjogbnVtYmVyLFxuICAgIGVuZFBvc2l0aW9uOiBudW1iZXIsXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgLy8gVEJEXG4gICAgcmV0dXJuIGNvbnRlbnRzO1xuICB9XG5cbiAgYXN5bmMgaGlnaGxpZ2h0U291cmNlKFxuICAgIGZpbGVQYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sOiBudW1iZXIsXG4gICk6IFByb21pc2U8QXJyYXk8YXRvbSRSYW5nZT4+IHtcbiAgICAvLyBUQkRcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBhc3luYyBnZXREaWFnbm9zdGljcyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICApOiBQcm9taXNlPEFycmF5PHttZXNzYWdlOiBIYWNrRGlhZ25vc3RpYzt9Pj4ge1xuICAgIGNvbnN0IHtnZXREaWFnbm9zdGljc30gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgbGV0IGRpYWdub3N0aWNSZXN1bHQgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBkaWFnbm9zdGljUmVzdWx0ID0gYXdhaXQgZ2V0RGlhZ25vc3RpY3MoZmlsZVBhdGgsIGNvbnRlbnRzKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGVycik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmICghZGlhZ25vc3RpY1Jlc3VsdCkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoJ2hoX2NsaWVudCBjb3VsZCBub3QgYmUgcmVhY2hlZCcpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBoYWNrRGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljUmVzdWx0O1xuICAgIHJldHVybiBoYWNrRGlhZ25vc3RpY3MubWVzc2FnZXM7XG4gIH1cblxuICBhc3luYyBnZXRUeXBlQ292ZXJhZ2UoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICk6IFByb21pc2U8QXJyYXk8VHlwZUNvdmVyYWdlUmVnaW9uPj4ge1xuICAgIGNvbnN0IHtnZXRUeXBlZFJlZ2lvbnN9ID0gZ2V0SGFja1NlcnZpY2UoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHJlZ2lvbnMgPSBhd2FpdCBnZXRUeXBlZFJlZ2lvbnMoZmlsZVBhdGgpO1xuICAgIHJldHVybiBjb252ZXJ0VHlwZWRSZWdpb25zVG9Db3ZlcmFnZVJlZ2lvbnMocmVnaW9ucyk7XG4gIH1cblxuICBhc3luYyBnZXRPdXRsaW5lKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8P0hhY2tPdXRsaW5lPiB7XG4gICAgLy8gVEJEXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhc3luYyBnZXREZWZpbml0aW9uKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICAgIGxpbmVUZXh0OiBzdHJpbmdcbiAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgY29uc3Qge2dldElkZW50aWZpZXJEZWZpbml0aW9ufSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0ID0gYXdhaXQgZ2V0SWRlbnRpZmllckRlZmluaXRpb24oXG4gICAgICBmaWxlUGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtblxuICAgICk7XG4gICAgY29uc3QgaWRlbnRpZmllclJlc3VsdCA9IHByb2Nlc3NEZWZpbml0aW9uc0ZvclhocChkZWZpbml0aW9uUmVzdWx0LCBjb2x1bW4sIGxpbmVUZXh0KTtcbiAgICByZXR1cm4gaWRlbnRpZmllclJlc3VsdC5sZW5ndGggPT09IDEgPyBpZGVudGlmaWVyUmVzdWx0IDogW107XG4gIH1cblxuICBhc3luYyBnZXRUeXBlKFxuICAgIGZpbGVQYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBleHByZXNzaW9uOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICApOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICAvLyBUT0RPXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhc3luYyBmaW5kUmVmZXJlbmNlcyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlclxuICApOiBQcm9taXNlPD97YmFzZVVyaTogc3RyaW5nOyBzeW1ib2xOYW1lOiBzdHJpbmc7IHJlZmVyZW5jZXM6IEFycmF5PEhhY2tSZWZlcmVuY2U+fT4ge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0QmFzZVBhdGgoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Jhc2VQYXRoO1xuICB9XG5cbiAgaXNIYWNrQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oaEF2YWlsYWJsZTtcbiAgfVxuXG59XG4iXX0=