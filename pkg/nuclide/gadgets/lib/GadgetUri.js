Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.format = format;
exports.parse = parse;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var PROTOCOL = 'atom:';
var HOSTNAME = 'nuclide';
var PATH_PREFIX = 'gadgets/';

function format(options) {
  return _url2['default'].format({
    protocol: PROTOCOL,
    hostname: HOSTNAME,
    pathname: PATH_PREFIX + encodeURIComponent(options.gadgetId),
    slashes: true
  });
}

function parse(uri) {
  var _URL$parse = _url2['default'].parse(uri);

  var protocol = _URL$parse.protocol;
  var hostname = _URL$parse.hostname;
  var pathname = _URL$parse.pathname;

  var path = (pathname || '').replace(/^\/+/g, '');

  if (protocol !== PROTOCOL || hostname !== HOSTNAME || path.indexOf(PATH_PREFIX) !== 0) {
    // This isn't a URL we're supposed to handle.
    return null;
  }

  var _path$slice$split$map = path.slice(PATH_PREFIX.length).split('/', 1).map(decodeURIComponent);

  var _path$slice$split$map2 = _slicedToArray(_path$slice$split$map, 1);

  var gadgetId = _path$slice$split$map2[0];

  return gadgetId ? { gadgetId: gadgetId } : null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdhZGdldFVyaS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVdnQixLQUFLOzs7O0FBRXJCLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQztBQUN6QixJQUFNLFFBQVEsR0FBRyxTQUFTLENBQUM7QUFDM0IsSUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDOztBQU14QixTQUFTLE1BQU0sQ0FBQyxPQUFlLEVBQVU7QUFDOUMsU0FBTyxpQkFBSSxNQUFNLENBQUM7QUFDaEIsWUFBUSxFQUFFLFFBQVE7QUFDbEIsWUFBUSxFQUFFLFFBQVE7QUFDbEIsWUFBUSxFQUFFLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzVELFdBQU8sRUFBRSxJQUFJO0dBQ2QsQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxLQUFLLENBQUMsR0FBVyxFQUFXO21CQUNILGlCQUFJLEtBQUssQ0FBQyxHQUFHLENBQUM7O01BQTlDLFFBQVEsY0FBUixRQUFRO01BQUUsUUFBUSxjQUFSLFFBQVE7TUFBRSxRQUFRLGNBQVIsUUFBUTs7QUFDbkMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFBLENBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFbkQsTUFBSSxRQUFRLEtBQUssUUFBUSxJQUFJLFFBQVEsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7O0FBRXJGLFdBQU8sSUFBSSxDQUFDO0dBQ2I7OzhCQUVrQixJQUFJLENBQ3BCLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQ3pCLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQ2IsR0FBRyxDQUFDLGtCQUFrQixDQUFDOzs7O01BSG5CLFFBQVE7O0FBSWYsU0FBTyxRQUFRLEdBQUcsRUFBQyxRQUFRLEVBQVIsUUFBUSxFQUFDLEdBQUcsSUFBSSxDQUFDO0NBQ3JDIiwiZmlsZSI6IkdhZGdldFVyaS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBVUkwgZnJvbSAndXJsJztcblxuY29uc3QgUFJPVE9DT0wgPSAnYXRvbTonO1xuY29uc3QgSE9TVE5BTUUgPSAnbnVjbGlkZSc7XG5jb25zdCBQQVRIX1BSRUZJWCA9ICdnYWRnZXRzLyc7XG5cbnR5cGUgUGFyc2VkID0ge1xuICBnYWRnZXRJZDogc3RyaW5nLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChvcHRpb25zOiBQYXJzZWQpOiBzdHJpbmcge1xuICByZXR1cm4gVVJMLmZvcm1hdCh7XG4gICAgcHJvdG9jb2w6IFBST1RPQ09MLFxuICAgIGhvc3RuYW1lOiBIT1NUTkFNRSxcbiAgICBwYXRobmFtZTogUEFUSF9QUkVGSVggKyBlbmNvZGVVUklDb21wb25lbnQob3B0aW9ucy5nYWRnZXRJZCksXG4gICAgc2xhc2hlczogdHJ1ZSxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZSh1cmk6IHN0cmluZyk6ID9QYXJzZWQge1xuICBjb25zdCB7cHJvdG9jb2wsIGhvc3RuYW1lLCBwYXRobmFtZX0gPSBVUkwucGFyc2UodXJpKTtcbiAgY29uc3QgcGF0aCA9IChwYXRobmFtZSB8fCAnJykucmVwbGFjZSgvXlxcLysvZywgJycpO1xuXG4gIGlmIChwcm90b2NvbCAhPT0gUFJPVE9DT0wgfHwgaG9zdG5hbWUgIT09IEhPU1ROQU1FIHx8IHBhdGguaW5kZXhPZihQQVRIX1BSRUZJWCkgIT09IDApIHtcbiAgICAvLyBUaGlzIGlzbid0IGEgVVJMIHdlJ3JlIHN1cHBvc2VkIHRvIGhhbmRsZS5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IFtnYWRnZXRJZF0gPSBwYXRoXG4gICAgLnNsaWNlKFBBVEhfUFJFRklYLmxlbmd0aClcbiAgICAuc3BsaXQoJy8nLCAxKVxuICAgIC5tYXAoZGVjb2RlVVJJQ29tcG9uZW50KTtcbiAgcmV0dXJuIGdhZGdldElkID8ge2dhZGdldElkfSA6IG51bGw7XG59XG4iXX0=