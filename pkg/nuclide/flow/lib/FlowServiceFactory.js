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

exports.getFlowServiceByNuclideUri = getFlowServiceByNuclideUri;
exports.getLocalFlowService = getLocalFlowService;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _client = require('../../client');

function getFlowServiceByNuclideUri(file) {
  var service = (0, _client.getServiceByNuclideUri)('FlowService', file);
  (0, _assert2['default'])(service);
  return service;
}

function getLocalFlowService() {
  var service = (0, _client.getServiceByNuclideUri)('FlowService', null);
  (0, _assert2['default'])(service);
  return service;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dTZXJ2aWNlRmFjdG9yeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztzQkFjc0IsUUFBUTs7OztzQkFDTyxjQUFjOztBQUU1QyxTQUFTLDBCQUEwQixDQUFDLElBQWdCLEVBQWU7QUFDeEUsTUFBTSxPQUFPLEdBQUcsb0NBQXVCLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1RCwyQkFBVSxPQUFPLENBQUMsQ0FBQztBQUNuQixTQUFPLE9BQU8sQ0FBQztDQUNoQjs7QUFFTSxTQUFTLG1CQUFtQixHQUFnQjtBQUNqRCxNQUFNLE9BQU8sR0FBRyxvQ0FBdUIsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVELDJCQUFVLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLFNBQU8sT0FBTyxDQUFDO0NBQ2hCIiwiZmlsZSI6IkZsb3dTZXJ2aWNlRmFjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlb2YgKiBhcyBGbG93U2VydmljZSBmcm9tICcuLi8uLi9mbG93LWJhc2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL2NsaWVudCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaShmaWxlOiBOdWNsaWRlVXJpKTogRmxvd1NlcnZpY2Uge1xuICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnRmxvd1NlcnZpY2UnLCBmaWxlKTtcbiAgaW52YXJpYW50KHNlcnZpY2UpO1xuICByZXR1cm4gc2VydmljZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsRmxvd1NlcnZpY2UoKTogRmxvd1NlcnZpY2Uge1xuICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnRmxvd1NlcnZpY2UnLCBudWxsKTtcbiAgaW52YXJpYW50KHNlcnZpY2UpO1xuICByZXR1cm4gc2VydmljZTtcbn1cbiJdfQ==