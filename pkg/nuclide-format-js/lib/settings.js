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

exports.observeSettings = observeSettings;
exports.calculateOptions = calculateOptions;

var NuclideCommons = require('../../nuclide-commons');

var featureConfig = require('../../nuclide-feature-config');
var formatJSBase = require('../../nuclide-format-js-base');

// Nuclide package settings used to calculate the module map,
// the blacklist, and control the plugin behavior.

var arrayFrom = NuclideCommons.array.from;

var createModuleMap = formatJSBase.createModuleMap;

// We need this in array formats.
var defaultAliases = arrayFrom(formatJSBase.defaultAliases);
var defaultBuiltIns = arrayFrom(formatJSBase.defaultBuiltIns);
var defaultBuiltInTypes = arrayFrom(formatJSBase.defaultBuiltInTypes);

/**
 * Observes the relevant Nuclide package settings.
 */

function observeSettings(callback) {
  return featureConfig.observe('nuclide-format-js', function (settings) {
    return callback(_extends({}, settings, {
      aliases: fixAliases(settings.aliases)
    }));
  });
}

/**
 * Calculates the current options according to the Nuclide configuration object.
 * This may get expensive in the future as the module map becomes smarter.
 */

function calculateOptions(settings) {
  return {
    blacklist: calculateBlacklist(settings),
    moduleMap: calculateModuleMap(settings)
  };
}

/**
 * Calculates a module map from the settings.
 */
function calculateModuleMap(settings) {
  // Construct the aliases.
  var aliases = new Map(settings.aliases);
  for (var entry of defaultAliases) {
    var _entry = _slicedToArray(entry, 2);

    var key = _entry[0];
    var _value = _entry[1];

    if (!aliases.has(key)) {
      aliases.set(key, _value);
    }
  }

  // Construct the built ins.
  var builtIns = new Set(defaultBuiltIns);
  for (var builtIn of settings.builtIns) {
    builtIns.add(builtIn);
  }

  // Construct built in types.
  var builtInTypes = new Set(defaultBuiltInTypes);
  for (var builtInType of settings.builtInTypes) {
    builtInTypes.add(builtInType);
  }

  // And then calculate the module map.
  return createModuleMap({
    paths: [],
    pathsToRelativize: [],
    aliases: aliases,
    aliasesToRelativize: new Map(),
    builtIns: builtIns,
    builtInTypes: builtInTypes
  });
}

/**
 * Calculates the blacklist from the settings.
 */
function calculateBlacklist(settings) {
  var blacklist = new Set();
  if (!settings.nuclideFixHeader) {
    blacklist.add('nuclide.fixHeader');
  }
  if (!settings.requiresTransferComments) {
    blacklist.add('requires.transferComments');
  }
  if (!settings.requiresRemoveUnusedRequires) {
    blacklist.add('requires.removeUnusedRequires');
  }
  if (!settings.requiresAddMissingRequires) {
    blacklist.add('requires.addMissingRequires');
  }
  if (!settings.requiresRemoveUnusedTypes) {
    blacklist.add('requires.removeUnusedTypes');
  }
  if (!settings.requiresAddMissingTypes) {
    blacklist.add('requires.addMissingTypes');
  }
  if (!settings.requiresFormatRequires) {
    blacklist.add('requires.formatRequires');
  }
  return blacklist;
}

// Some small helper functions.

/**
 * Nuclide can't handle nested arrays well in settings, so we save it in a
 * flat array and fix up each pair or entries before using it in the transform
 */
function fixAliases(aliases) {
  aliases = aliases || [];
  var pairs = [];
  for (var i = 0; i < aliases.length - 1; i += 2) {
    pairs.push([aliases[i], aliases[i + 1]]);
  }
  return pairs;
}
//# sourceMappingURL=data:application/json;base64,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MkIsQ0FBQyxDQUFDO0dBQzVDO0FBQ0QsTUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTtBQUMxQyxhQUFTLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7R0FDaEQ7QUFDRCxNQUFJLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFO0FBQ3hDLGFBQVMsQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztHQUM5QztBQUNELE1BQUksQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUU7QUFDdkMsYUFBUyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0dBQzdDO0FBQ0QsTUFBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRTtBQUNyQyxhQUFTLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7R0FDM0M7QUFDRCxNQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFO0FBQ3BDLGFBQVMsQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztHQUMxQztBQUNELFNBQU8sU0FBUyxDQUFDO0NBQ2xCOzs7Ozs7OztBQVFELFNBQVMsVUFBVSxDQUFDLE9BQXVCLEVBQTJCO0FBQ3BFLFNBQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO0FBQ3hCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNqQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM5QyxTQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQzFDO0FBQ0QsU0FBTyxLQUFLLENBQUM7Q0FDZCIsImZpbGUiOiJzZXR0aW5ncy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIE1vZHVsZU1hcCBmcm9tICcuLi8uLi9udWNsaWRlLWZvcm1hdC1qcy1iYXNlL2xpYi9zdGF0ZS9Nb2R1bGVNYXAnO1xuaW1wb3J0IHR5cGUge1NvdXJjZU9wdGlvbnN9IGZyb20gJy4uLy4uL251Y2xpZGUtZm9ybWF0LWpzLWJhc2UvbGliL29wdGlvbnMvU291cmNlT3B0aW9ucyc7XG5pbXBvcnQgdHlwZSB7VHJhbnNmb3JtS2V5fSBmcm9tICcuLi8uLi9udWNsaWRlLWZvcm1hdC1qcy1iYXNlL2xpYi90eXBlcy90cmFuc2Zvcm1zJztcblxuY29uc3QgTnVjbGlkZUNvbW1vbnMgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcblxuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnKTtcbmNvbnN0IGZvcm1hdEpTQmFzZSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtZm9ybWF0LWpzLWJhc2UnKTtcblxuLy8gTnVjbGlkZSBwYWNrYWdlIHNldHRpbmdzIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSBtb2R1bGUgbWFwLFxuLy8gdGhlIGJsYWNrbGlzdCwgYW5kIGNvbnRyb2wgdGhlIHBsdWdpbiBiZWhhdmlvci5cbmV4cG9ydCB0eXBlIFNldHRpbmdzID0ge1xuICBhbGlhc2VzOiBBcnJheTxbc3RyaW5nLCBzdHJpbmddPjtcbiAgYnVpbHRJbnM6IEFycmF5PHN0cmluZz47XG4gIGJ1aWx0SW5UeXBlczogQXJyYXk8c3RyaW5nPjtcbiAgbnVjbGlkZUZpeEhlYWRlcjogYm9vbGVhbjtcbiAgcmVxdWlyZXNUcmFuc2ZlckNvbW1lbnRzOiBib29sZWFuO1xuICByZXF1aXJlc1JlbW92ZVVudXNlZFJlcXVpcmVzOiBib29sZWFuO1xuICByZXF1aXJlc0FkZE1pc3NpbmdSZXF1aXJlczogYm9vbGVhbjtcbiAgcmVxdWlyZXNSZW1vdmVVbnVzZWRUeXBlczogYm9vbGVhbjtcbiAgcmVxdWlyZXNBZGRNaXNzaW5nVHlwZXM6IGJvb2xlYW47XG4gIHJlcXVpcmVzRm9ybWF0UmVxdWlyZXM6IGJvb2xlYW47XG4gIHJ1bk9uU2F2ZTogYm9vbGVhbjtcbn07XG5cbmNvbnN0IGFycmF5RnJvbSA9IE51Y2xpZGVDb21tb25zLmFycmF5LmZyb207XG5cbmNvbnN0IHtjcmVhdGVNb2R1bGVNYXB9ID0gZm9ybWF0SlNCYXNlO1xuLy8gV2UgbmVlZCB0aGlzIGluIGFycmF5IGZvcm1hdHMuXG5jb25zdCBkZWZhdWx0QWxpYXNlcyA9IGFycmF5RnJvbShmb3JtYXRKU0Jhc2UuZGVmYXVsdEFsaWFzZXMpO1xuY29uc3QgZGVmYXVsdEJ1aWx0SW5zID0gYXJyYXlGcm9tKGZvcm1hdEpTQmFzZS5kZWZhdWx0QnVpbHRJbnMpO1xuY29uc3QgZGVmYXVsdEJ1aWx0SW5UeXBlcyA9IGFycmF5RnJvbShmb3JtYXRKU0Jhc2UuZGVmYXVsdEJ1aWx0SW5UeXBlcyk7XG5cbi8qKlxuICogT2JzZXJ2ZXMgdGhlIHJlbGV2YW50IE51Y2xpZGUgcGFja2FnZSBzZXR0aW5ncy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9ic2VydmVTZXR0aW5ncyhjYWxsYmFjazogKHZhbHVlOiBTZXR0aW5ncykgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgcmV0dXJuIGZlYXR1cmVDb25maWcub2JzZXJ2ZSgnbnVjbGlkZS1mb3JtYXQtanMnLCBzZXR0aW5ncyA9PlxuICAgIGNhbGxiYWNrKHtcbiAgICAgIC4uLnNldHRpbmdzLFxuICAgICAgYWxpYXNlczogZml4QWxpYXNlcyhzZXR0aW5ncy5hbGlhc2VzKSxcbiAgICB9KVxuICApO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGN1cnJlbnQgb3B0aW9ucyBhY2NvcmRpbmcgdG8gdGhlIE51Y2xpZGUgY29uZmlndXJhdGlvbiBvYmplY3QuXG4gKiBUaGlzIG1heSBnZXQgZXhwZW5zaXZlIGluIHRoZSBmdXR1cmUgYXMgdGhlIG1vZHVsZSBtYXAgYmVjb21lcyBzbWFydGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlT3B0aW9ucyhzZXR0aW5nczogU2V0dGluZ3MpOiBTb3VyY2VPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICBibGFja2xpc3Q6IGNhbGN1bGF0ZUJsYWNrbGlzdChzZXR0aW5ncyksXG4gICAgbW9kdWxlTWFwOiBjYWxjdWxhdGVNb2R1bGVNYXAoc2V0dGluZ3MpLFxuICB9O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSBtb2R1bGUgbWFwIGZyb20gdGhlIHNldHRpbmdzLlxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVNb2R1bGVNYXAoc2V0dGluZ3M6IFNldHRpbmdzKTogTW9kdWxlTWFwIHtcbiAgLy8gQ29uc3RydWN0IHRoZSBhbGlhc2VzLlxuICBjb25zdCBhbGlhc2VzID0gbmV3IE1hcChzZXR0aW5ncy5hbGlhc2VzKTtcbiAgZm9yIChjb25zdCBlbnRyeSBvZiBkZWZhdWx0QWxpYXNlcykge1xuICAgIGNvbnN0IFtrZXksIHZhbHVlXSA9IGVudHJ5O1xuICAgIGlmICghYWxpYXNlcy5oYXMoa2V5KSkge1xuICAgICAgYWxpYXNlcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29uc3RydWN0IHRoZSBidWlsdCBpbnMuXG4gIGNvbnN0IGJ1aWx0SW5zID0gbmV3IFNldChkZWZhdWx0QnVpbHRJbnMpO1xuICBmb3IgKGNvbnN0IGJ1aWx0SW4gb2Ygc2V0dGluZ3MuYnVpbHRJbnMpIHtcbiAgICBidWlsdElucy5hZGQoYnVpbHRJbik7XG4gIH1cblxuICAvLyBDb25zdHJ1Y3QgYnVpbHQgaW4gdHlwZXMuXG4gIGNvbnN0IGJ1aWx0SW5UeXBlcyA9IG5ldyBTZXQoZGVmYXVsdEJ1aWx0SW5UeXBlcyk7XG4gIGZvciAoY29uc3QgYnVpbHRJblR5cGUgb2Ygc2V0dGluZ3MuYnVpbHRJblR5cGVzKSB7XG4gICAgYnVpbHRJblR5cGVzLmFkZChidWlsdEluVHlwZSk7XG4gIH1cblxuICAvLyBBbmQgdGhlbiBjYWxjdWxhdGUgdGhlIG1vZHVsZSBtYXAuXG4gIHJldHVybiBjcmVhdGVNb2R1bGVNYXAoe1xuICAgIHBhdGhzOiBbXSxcbiAgICBwYXRoc1RvUmVsYXRpdml6ZTogW10sXG4gICAgYWxpYXNlcyxcbiAgICBhbGlhc2VzVG9SZWxhdGl2aXplOiBuZXcgTWFwKCksXG4gICAgYnVpbHRJbnMsXG4gICAgYnVpbHRJblR5cGVzLFxuICB9KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBibGFja2xpc3QgZnJvbSB0aGUgc2V0dGluZ3MuXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZUJsYWNrbGlzdChzZXR0aW5nczogU2V0dGluZ3MpOiBTZXQ8VHJhbnNmb3JtS2V5PiB7XG4gIGNvbnN0IGJsYWNrbGlzdCA9IG5ldyBTZXQoKTtcbiAgaWYgKCFzZXR0aW5ncy5udWNsaWRlRml4SGVhZGVyKSB7XG4gICAgYmxhY2tsaXN0LmFkZCgnbnVjbGlkZS5maXhIZWFkZXInKTtcbiAgfVxuICBpZiAoIXNldHRpbmdzLnJlcXVpcmVzVHJhbnNmZXJDb21tZW50cykge1xuICAgIGJsYWNrbGlzdC5hZGQoJ3JlcXVpcmVzLnRyYW5zZmVyQ29tbWVudHMnKTtcbiAgfVxuICBpZiAoIXNldHRpbmdzLnJlcXVpcmVzUmVtb3ZlVW51c2VkUmVxdWlyZXMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy5yZW1vdmVVbnVzZWRSZXF1aXJlcycpO1xuICB9XG4gIGlmICghc2V0dGluZ3MucmVxdWlyZXNBZGRNaXNzaW5nUmVxdWlyZXMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy5hZGRNaXNzaW5nUmVxdWlyZXMnKTtcbiAgfVxuICBpZiAoIXNldHRpbmdzLnJlcXVpcmVzUmVtb3ZlVW51c2VkVHlwZXMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy5yZW1vdmVVbnVzZWRUeXBlcycpO1xuICB9XG4gIGlmICghc2V0dGluZ3MucmVxdWlyZXNBZGRNaXNzaW5nVHlwZXMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy5hZGRNaXNzaW5nVHlwZXMnKTtcbiAgfVxuICBpZiAoIXNldHRpbmdzLnJlcXVpcmVzRm9ybWF0UmVxdWlyZXMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy5mb3JtYXRSZXF1aXJlcycpO1xuICB9XG4gIHJldHVybiBibGFja2xpc3Q7XG59XG5cbi8vIFNvbWUgc21hbGwgaGVscGVyIGZ1bmN0aW9ucy5cblxuLyoqXG4gKiBOdWNsaWRlIGNhbid0IGhhbmRsZSBuZXN0ZWQgYXJyYXlzIHdlbGwgaW4gc2V0dGluZ3MsIHNvIHdlIHNhdmUgaXQgaW4gYVxuICogZmxhdCBhcnJheSBhbmQgZml4IHVwIGVhY2ggcGFpciBvciBlbnRyaWVzIGJlZm9yZSB1c2luZyBpdCBpbiB0aGUgdHJhbnNmb3JtXG4gKi9cbmZ1bmN0aW9uIGZpeEFsaWFzZXMoYWxpYXNlczogP0FycmF5PHN0cmluZz4pOiBBcnJheTxbc3RyaW5nLCBzdHJpbmddPiB7XG4gIGFsaWFzZXMgPSBhbGlhc2VzIHx8IFtdO1xuICBjb25zdCBwYWlycyA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFsaWFzZXMubGVuZ3RoIC0gMTsgaSArPSAyKSB7XG4gICAgcGFpcnMucHVzaChbYWxpYXNlc1tpXSwgYWxpYXNlc1tpICsgMV1dKTtcbiAgfVxuICByZXR1cm4gcGFpcnM7XG59XG4iXX0=