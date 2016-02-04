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

var NuclideCommons = require('../../commons');

var featureConfig = require('../../feature-config');
var formatJSBase = require('../../format-js-base');

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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsQ0FBQztHQUM1QztBQUNELE1BQUksQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUU7QUFDMUMsYUFBUyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0dBQ2hEO0FBQ0QsTUFBSSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRTtBQUN4QyxhQUFTLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7R0FDOUM7QUFDRCxNQUFJLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFO0FBQ3ZDLGFBQVMsQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztHQUM3QztBQUNELE1BQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUU7QUFDckMsYUFBUyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0dBQzNDO0FBQ0QsTUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRTtBQUNwQyxhQUFTLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7R0FDMUM7QUFDRCxTQUFPLFNBQVMsQ0FBQztDQUNsQjs7Ozs7Ozs7QUFRRCxTQUFTLFVBQVUsQ0FBQyxPQUF1QixFQUEyQjtBQUNwRSxTQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztBQUN4QixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDakIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDOUMsU0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUMxQztBQUNELFNBQU8sS0FBSyxDQUFDO0NBQ2QiLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBNb2R1bGVNYXAgZnJvbSAnLi4vLi4vZm9ybWF0LWpzLWJhc2UvbGliL3N0YXRlL01vZHVsZU1hcCc7XG5pbXBvcnQgdHlwZSB7U291cmNlT3B0aW9uc30gZnJvbSAnLi4vLi4vZm9ybWF0LWpzLWJhc2UvbGliL29wdGlvbnMvU291cmNlT3B0aW9ucyc7XG5pbXBvcnQgdHlwZSB7VHJhbnNmb3JtS2V5fSBmcm9tICcuLi8uLi9mb3JtYXQtanMtYmFzZS9saWIvdHlwZXMvdHJhbnNmb3Jtcyc7XG5cbmNvbnN0IE51Y2xpZGVDb21tb25zID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuXG5jb25zdCBmZWF0dXJlQ29uZmlnID0gcmVxdWlyZSgnLi4vLi4vZmVhdHVyZS1jb25maWcnKTtcbmNvbnN0IGZvcm1hdEpTQmFzZSA9IHJlcXVpcmUoJy4uLy4uL2Zvcm1hdC1qcy1iYXNlJyk7XG5cbi8vIE51Y2xpZGUgcGFja2FnZSBzZXR0aW5ncyB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgbW9kdWxlIG1hcCxcbi8vIHRoZSBibGFja2xpc3QsIGFuZCBjb250cm9sIHRoZSBwbHVnaW4gYmVoYXZpb3IuXG5leHBvcnQgdHlwZSBTZXR0aW5ncyA9IHtcbiAgYWxpYXNlczogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4sXG4gIGJ1aWx0SW5zOiBBcnJheTxzdHJpbmc+LFxuICBidWlsdEluVHlwZXM6IEFycmF5PHN0cmluZz4sXG4gIG51Y2xpZGVGaXhIZWFkZXI6IGJvb2xlYW4sXG4gIHJlcXVpcmVzVHJhbnNmZXJDb21tZW50czogYm9vbGVhbixcbiAgcmVxdWlyZXNSZW1vdmVVbnVzZWRSZXF1aXJlczogYm9vbGVhbixcbiAgcmVxdWlyZXNBZGRNaXNzaW5nUmVxdWlyZXM6IGJvb2xlYW4sXG4gIHJlcXVpcmVzUmVtb3ZlVW51c2VkVHlwZXM6IGJvb2xlYW4sXG4gIHJlcXVpcmVzQWRkTWlzc2luZ1R5cGVzOiBib29sZWFuLFxuICByZXF1aXJlc0Zvcm1hdFJlcXVpcmVzOiBib29sZWFuLFxuICBydW5PblNhdmU6IGJvb2xlYW4sXG59O1xuXG5jb25zdCBhcnJheUZyb20gPSBOdWNsaWRlQ29tbW9ucy5hcnJheS5mcm9tO1xuXG5jb25zdCB7Y3JlYXRlTW9kdWxlTWFwfSA9IGZvcm1hdEpTQmFzZTtcbi8vIFdlIG5lZWQgdGhpcyBpbiBhcnJheSBmb3JtYXRzLlxuY29uc3QgZGVmYXVsdEFsaWFzZXMgPSBhcnJheUZyb20oZm9ybWF0SlNCYXNlLmRlZmF1bHRBbGlhc2VzKTtcbmNvbnN0IGRlZmF1bHRCdWlsdElucyA9IGFycmF5RnJvbShmb3JtYXRKU0Jhc2UuZGVmYXVsdEJ1aWx0SW5zKTtcbmNvbnN0IGRlZmF1bHRCdWlsdEluVHlwZXMgPSBhcnJheUZyb20oZm9ybWF0SlNCYXNlLmRlZmF1bHRCdWlsdEluVHlwZXMpO1xuXG4vKipcbiAqIE9ic2VydmVzIHRoZSByZWxldmFudCBOdWNsaWRlIHBhY2thZ2Ugc2V0dGluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlU2V0dGluZ3MoY2FsbGJhY2s6ICh2YWx1ZTogU2V0dGluZ3MpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gIHJldHVybiBmZWF0dXJlQ29uZmlnLm9ic2VydmUoJ251Y2xpZGUtZm9ybWF0LWpzJywgKHNldHRpbmdzKSA9PlxuICAgIGNhbGxiYWNrKHtcbiAgICAgIC4uLnNldHRpbmdzLFxuICAgICAgYWxpYXNlczogZml4QWxpYXNlcyhzZXR0aW5ncy5hbGlhc2VzKSxcbiAgICB9KVxuICApO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGN1cnJlbnQgb3B0aW9ucyBhY2NvcmRpbmcgdG8gdGhlIE51Y2xpZGUgY29uZmlndXJhdGlvbiBvYmplY3QuXG4gKiBUaGlzIG1heSBnZXQgZXhwZW5zaXZlIGluIHRoZSBmdXR1cmUgYXMgdGhlIG1vZHVsZSBtYXAgYmVjb21lcyBzbWFydGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlT3B0aW9ucyhzZXR0aW5nczogU2V0dGluZ3MpOiBTb3VyY2VPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICBibGFja2xpc3Q6IGNhbGN1bGF0ZUJsYWNrbGlzdChzZXR0aW5ncyksXG4gICAgbW9kdWxlTWFwOiBjYWxjdWxhdGVNb2R1bGVNYXAoc2V0dGluZ3MpLFxuICB9O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSBtb2R1bGUgbWFwIGZyb20gdGhlIHNldHRpbmdzLlxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVNb2R1bGVNYXAoc2V0dGluZ3M6IFNldHRpbmdzKTogTW9kdWxlTWFwIHtcbiAgLy8gQ29uc3RydWN0IHRoZSBhbGlhc2VzLlxuICBjb25zdCBhbGlhc2VzID0gbmV3IE1hcChzZXR0aW5ncy5hbGlhc2VzKTtcbiAgZm9yIChjb25zdCBlbnRyeSBvZiBkZWZhdWx0QWxpYXNlcykge1xuICAgIGNvbnN0IFtrZXksIHZhbHVlXSA9IGVudHJ5O1xuICAgIGlmICghYWxpYXNlcy5oYXMoa2V5KSkge1xuICAgICAgYWxpYXNlcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29uc3RydWN0IHRoZSBidWlsdCBpbnMuXG4gIGNvbnN0IGJ1aWx0SW5zID0gbmV3IFNldChkZWZhdWx0QnVpbHRJbnMpO1xuICBmb3IgKGNvbnN0IGJ1aWx0SW4gb2Ygc2V0dGluZ3MuYnVpbHRJbnMpIHtcbiAgICBidWlsdElucy5hZGQoYnVpbHRJbik7XG4gIH1cblxuICAvLyBDb25zdHJ1Y3QgYnVpbHQgaW4gdHlwZXMuXG4gIGNvbnN0IGJ1aWx0SW5UeXBlcyA9IG5ldyBTZXQoZGVmYXVsdEJ1aWx0SW5UeXBlcyk7XG4gIGZvciAoY29uc3QgYnVpbHRJblR5cGUgb2Ygc2V0dGluZ3MuYnVpbHRJblR5cGVzKSB7XG4gICAgYnVpbHRJblR5cGVzLmFkZChidWlsdEluVHlwZSk7XG4gIH1cblxuICAvLyBBbmQgdGhlbiBjYWxjdWxhdGUgdGhlIG1vZHVsZSBtYXAuXG4gIHJldHVybiBjcmVhdGVNb2R1bGVNYXAoe1xuICAgIHBhdGhzOiBbXSxcbiAgICBwYXRoc1RvUmVsYXRpdml6ZTogW10sXG4gICAgYWxpYXNlcyxcbiAgICBhbGlhc2VzVG9SZWxhdGl2aXplOiBuZXcgTWFwKCksXG4gICAgYnVpbHRJbnMsXG4gICAgYnVpbHRJblR5cGVzLFxuICB9KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBibGFja2xpc3QgZnJvbSB0aGUgc2V0dGluZ3MuXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZUJsYWNrbGlzdChzZXR0aW5nczogU2V0dGluZ3MpOiBTZXQ8VHJhbnNmb3JtS2V5PiB7XG4gIGNvbnN0IGJsYWNrbGlzdCA9IG5ldyBTZXQoKTtcbiAgaWYgKCFzZXR0aW5ncy5udWNsaWRlRml4SGVhZGVyKSB7XG4gICAgYmxhY2tsaXN0LmFkZCgnbnVjbGlkZS5maXhIZWFkZXInKTtcbiAgfVxuICBpZiAoIXNldHRpbmdzLnJlcXVpcmVzVHJhbnNmZXJDb21tZW50cykge1xuICAgIGJsYWNrbGlzdC5hZGQoJ3JlcXVpcmVzLnRyYW5zZmVyQ29tbWVudHMnKTtcbiAgfVxuICBpZiAoIXNldHRpbmdzLnJlcXVpcmVzUmVtb3ZlVW51c2VkUmVxdWlyZXMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy5yZW1vdmVVbnVzZWRSZXF1aXJlcycpO1xuICB9XG4gIGlmICghc2V0dGluZ3MucmVxdWlyZXNBZGRNaXNzaW5nUmVxdWlyZXMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy5hZGRNaXNzaW5nUmVxdWlyZXMnKTtcbiAgfVxuICBpZiAoIXNldHRpbmdzLnJlcXVpcmVzUmVtb3ZlVW51c2VkVHlwZXMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy5yZW1vdmVVbnVzZWRUeXBlcycpO1xuICB9XG4gIGlmICghc2V0dGluZ3MucmVxdWlyZXNBZGRNaXNzaW5nVHlwZXMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy5hZGRNaXNzaW5nVHlwZXMnKTtcbiAgfVxuICBpZiAoIXNldHRpbmdzLnJlcXVpcmVzRm9ybWF0UmVxdWlyZXMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy5mb3JtYXRSZXF1aXJlcycpO1xuICB9XG4gIHJldHVybiBibGFja2xpc3Q7XG59XG5cbi8vIFNvbWUgc21hbGwgaGVscGVyIGZ1bmN0aW9ucy5cblxuLyoqXG4gKiBOdWNsaWRlIGNhbid0IGhhbmRsZSBuZXN0ZWQgYXJyYXlzIHdlbGwgaW4gc2V0dGluZ3MsIHNvIHdlIHNhdmUgaXQgaW4gYVxuICogZmxhdCBhcnJheSBhbmQgZml4IHVwIGVhY2ggcGFpciBvciBlbnRyaWVzIGJlZm9yZSB1c2luZyBpdCBpbiB0aGUgdHJhbnNmb3JtXG4gKi9cbmZ1bmN0aW9uIGZpeEFsaWFzZXMoYWxpYXNlczogP0FycmF5PHN0cmluZz4pOiBBcnJheTxbc3RyaW5nLCBzdHJpbmddPiB7XG4gIGFsaWFzZXMgPSBhbGlhc2VzIHx8IFtdO1xuICBjb25zdCBwYWlycyA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFsaWFzZXMubGVuZ3RoIC0gMTsgaSArPSAyKSB7XG4gICAgcGFpcnMucHVzaChbYWxpYXNlc1tpXSwgYWxpYXNlc1tpICsgMV1dKTtcbiAgfVxuICByZXR1cm4gcGFpcnM7XG59XG4iXX0=