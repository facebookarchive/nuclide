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

/*
 * This is a simple way to see nuclide-atom-scripting in action:
 *
 *   $HOME/.atom/packages/nuclide/pkg/nuclide/atom/scripting/bin/bootstrap \
 *       nuclide/pkg/nuclide/atom/scripting/sample/hello.js 'I overrode the default message!'
 *
 * Unfortunately, Atom seems to write some extra information to stderr that we would generally
 * prefer not to see. We can easily hide this using `2>/dev/null`:
 *
 *   $HOME/.atom/packages/nuclide/pkg/nuclide/atom/scripting/bin/bootstrap \
 *       nuclide/pkg/nuclide/atom/scripting/sample/hello.js 'I overrode the default message!' \
 *       2>/dev/null
 *
 * Note that if you want to load hello.js from ~/.atom/packages/dev instead of ~/.atom/packages,
 * you must set the USE_DEV environment variable when running bootstrap.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

exports['default'] = _asyncToGenerator(function* (args) {
  var message = args.length === 0 ? 'Please pass me an arg!' : args.join(' ');
  console.log(message); // eslint-disable-line no-console
  return 0;
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVjaG8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1Q0E4QmUsV0FBMEIsSUFBbUIsRUFBcUI7QUFDL0UsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5RSxTQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JCLFNBQU8sQ0FBQyxDQUFDO0NBQ1YiLCJmaWxlIjoiZWNoby5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qXG4gKiBUaGlzIGlzIGEgc2ltcGxlIHdheSB0byBzZWUgbnVjbGlkZS1hdG9tLXNjcmlwdGluZyBpbiBhY3Rpb246XG4gKlxuICogICAkSE9NRS8uYXRvbS9wYWNrYWdlcy9udWNsaWRlL3BrZy9udWNsaWRlL2F0b20vc2NyaXB0aW5nL2Jpbi9ib290c3RyYXAgXFxcbiAqICAgICAgIG51Y2xpZGUvcGtnL251Y2xpZGUvYXRvbS9zY3JpcHRpbmcvc2FtcGxlL2hlbGxvLmpzICdJIG92ZXJyb2RlIHRoZSBkZWZhdWx0IG1lc3NhZ2UhJ1xuICpcbiAqIFVuZm9ydHVuYXRlbHksIEF0b20gc2VlbXMgdG8gd3JpdGUgc29tZSBleHRyYSBpbmZvcm1hdGlvbiB0byBzdGRlcnIgdGhhdCB3ZSB3b3VsZCBnZW5lcmFsbHlcbiAqIHByZWZlciBub3QgdG8gc2VlLiBXZSBjYW4gZWFzaWx5IGhpZGUgdGhpcyB1c2luZyBgMj4vZGV2L251bGxgOlxuICpcbiAqICAgJEhPTUUvLmF0b20vcGFja2FnZXMvbnVjbGlkZS9wa2cvbnVjbGlkZS9hdG9tL3NjcmlwdGluZy9iaW4vYm9vdHN0cmFwIFxcXG4gKiAgICAgICBudWNsaWRlL3BrZy9udWNsaWRlL2F0b20vc2NyaXB0aW5nL3NhbXBsZS9oZWxsby5qcyAnSSBvdmVycm9kZSB0aGUgZGVmYXVsdCBtZXNzYWdlIScgXFxcbiAqICAgICAgIDI+L2Rldi9udWxsXG4gKlxuICogTm90ZSB0aGF0IGlmIHlvdSB3YW50IHRvIGxvYWQgaGVsbG8uanMgZnJvbSB+Ly5hdG9tL3BhY2thZ2VzL2RldiBpbnN0ZWFkIG9mIH4vLmF0b20vcGFja2FnZXMsXG4gKiB5b3UgbXVzdCBzZXQgdGhlIFVTRV9ERVYgZW52aXJvbm1lbnQgdmFyaWFibGUgd2hlbiBydW5uaW5nIGJvb3RzdHJhcC5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RXhpdENvZGV9IGZyb20gJy4uL2xpYi90ZXN0LXJ1bm5lcic7XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHJ1bkNvbW1hbmQoYXJnczogQXJyYXk8c3RyaW5nPik6IFByb21pc2U8RXhpdENvZGU+IHtcbiAgY29uc3QgbWVzc2FnZSA9IGFyZ3MubGVuZ3RoID09PSAwID8gJ1BsZWFzZSBwYXNzIG1lIGFuIGFyZyEnIDogYXJncy5qb2luKCcgJyk7XG4gIGNvbnNvbGUubG9nKG1lc3NhZ2UpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgcmV0dXJuIDA7XG59XG4iXX0=