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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlQSxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRWhELElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3RELElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOzs7OztBQWtCckQsSUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7O0lBRXJDLGVBQWUsR0FBSSxZQUFZLENBQS9CLGVBQWU7OztBQUV0QixJQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzlELElBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDaEUsSUFBTSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7Ozs7OztBQUtqRSxTQUFTLGVBQWUsQ0FBQyxRQUFtQyxFQUFlO0FBQ2hGLFNBQU8sYUFBYSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxVQUFBLFFBQVE7V0FDeEQsUUFBUSxjQUNILFFBQVE7QUFDWCxhQUFPLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7T0FDckM7R0FBQSxDQUNILENBQUM7Q0FDSDs7Ozs7OztBQU1NLFNBQVMsZ0JBQWdCLENBQUMsUUFBa0IsRUFBaUI7QUFDbEUsU0FBTztBQUNMLGFBQVMsRUFBRSxrQkFBa0IsQ0FBQyxRQUFRLENBQUM7QUFDdkMsYUFBUyxFQUFFLGtCQUFrQixDQUFDLFFBQVEsQ0FBQztHQUN4QyxDQUFDO0NBQ0g7Ozs7O0FBS0QsU0FBUyxrQkFBa0IsQ0FBQyxRQUFrQixFQUFhOztBQUV6RCxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUMsT0FBSyxJQUFNLEtBQUssSUFBSSxjQUFjLEVBQUU7Z0NBQ2IsS0FBSzs7UUFBbkIsR0FBRztRQUFFLE1BQUs7O0FBQ2pCLFFBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3JCLGFBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQUssQ0FBQyxDQUFDO0tBQ3pCO0dBQ0Y7OztBQUdELE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzFDLE9BQUssSUFBTSxPQUFPLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRTtBQUN2QyxZQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3ZCOzs7QUFHRCxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2xELE9BQUssSUFBTSxXQUFXLElBQUksUUFBUSxDQUFDLFlBQVksRUFBRTtBQUMvQyxnQkFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUMvQjs7O0FBR0QsU0FBTyxlQUFlLENBQUM7QUFDckIsU0FBSyxFQUFFLEVBQUU7QUFDVCxxQkFBaUIsRUFBRSxFQUFFO0FBQ3JCLFdBQU8sRUFBUCxPQUFPO0FBQ1AsdUJBQW1CLEVBQUUsSUFBSSxHQUFHLEVBQUU7QUFDOUIsWUFBUSxFQUFSLFFBQVE7QUFDUixnQkFBWSxFQUFaLFlBQVk7R0FDYixDQUFDLENBQUM7Q0FDSjs7Ozs7QUFLRCxTQUFTLGtCQUFrQixDQUFDLFFBQWtCLEVBQXFCO0FBQ2pFLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDNUIsTUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtBQUM5QixhQUFTLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7R0FDcEM7QUFDRCxNQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFO0FBQ3RDLGFBQVMsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztHQUM1QztBQUNELE1BQUksQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUU7QUFDMUMsYUFBUyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0dBQ2hEO0FBQ0QsTUFBSSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRTtBQUN4QyxhQUFTLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7R0FDOUM7QUFDRCxNQUFJLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFO0FBQ3ZDLGFBQVMsQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztHQUM3QztBQUNELE1BQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUU7QUFDckMsYUFBUyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0dBQzNDO0FBQ0QsTUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRTtBQUNwQyxhQUFTLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7R0FDMUM7QUFDRCxTQUFPLFNBQVMsQ0FBQztDQUNsQjs7Ozs7Ozs7QUFRRCxTQUFTLFVBQVUsQ0FBQyxPQUF1QixFQUEyQjtBQUNwRSxTQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztBQUN4QixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDakIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDOUMsU0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUMxQztBQUNELFNBQU8sS0FBSyxDQUFDO0NBQ2QiLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBNb2R1bGVNYXAgZnJvbSAnLi4vLi4vZm9ybWF0LWpzLWJhc2UvbGliL3N0YXRlL01vZHVsZU1hcCc7XG5pbXBvcnQgdHlwZSB7U291cmNlT3B0aW9uc30gZnJvbSAnLi4vLi4vZm9ybWF0LWpzLWJhc2UvbGliL29wdGlvbnMvU291cmNlT3B0aW9ucyc7XG5pbXBvcnQgdHlwZSB7VHJhbnNmb3JtS2V5fSBmcm9tICcuLi8uLi9mb3JtYXQtanMtYmFzZS9saWIvdHlwZXMvdHJhbnNmb3Jtcyc7XG5cbmNvbnN0IE51Y2xpZGVDb21tb25zID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuXG5jb25zdCBmZWF0dXJlQ29uZmlnID0gcmVxdWlyZSgnLi4vLi4vZmVhdHVyZS1jb25maWcnKTtcbmNvbnN0IGZvcm1hdEpTQmFzZSA9IHJlcXVpcmUoJy4uLy4uL2Zvcm1hdC1qcy1iYXNlJyk7XG5cbi8vIE51Y2xpZGUgcGFja2FnZSBzZXR0aW5ncyB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgbW9kdWxlIG1hcCxcbi8vIHRoZSBibGFja2xpc3QsIGFuZCBjb250cm9sIHRoZSBwbHVnaW4gYmVoYXZpb3IuXG5leHBvcnQgdHlwZSBTZXR0aW5ncyA9IHtcbiAgYWxpYXNlczogQXJyYXk8W3N0cmluZywgc3RyaW5nXT47XG4gIGJ1aWx0SW5zOiBBcnJheTxzdHJpbmc+O1xuICBidWlsdEluVHlwZXM6IEFycmF5PHN0cmluZz47XG4gIG51Y2xpZGVGaXhIZWFkZXI6IGJvb2xlYW47XG4gIHJlcXVpcmVzVHJhbnNmZXJDb21tZW50czogYm9vbGVhbjtcbiAgcmVxdWlyZXNSZW1vdmVVbnVzZWRSZXF1aXJlczogYm9vbGVhbjtcbiAgcmVxdWlyZXNBZGRNaXNzaW5nUmVxdWlyZXM6IGJvb2xlYW47XG4gIHJlcXVpcmVzUmVtb3ZlVW51c2VkVHlwZXM6IGJvb2xlYW47XG4gIHJlcXVpcmVzQWRkTWlzc2luZ1R5cGVzOiBib29sZWFuO1xuICByZXF1aXJlc0Zvcm1hdFJlcXVpcmVzOiBib29sZWFuO1xuICBydW5PblNhdmU6IGJvb2xlYW47XG59O1xuXG5jb25zdCBhcnJheUZyb20gPSBOdWNsaWRlQ29tbW9ucy5hcnJheS5mcm9tO1xuXG5jb25zdCB7Y3JlYXRlTW9kdWxlTWFwfSA9IGZvcm1hdEpTQmFzZTtcbi8vIFdlIG5lZWQgdGhpcyBpbiBhcnJheSBmb3JtYXRzLlxuY29uc3QgZGVmYXVsdEFsaWFzZXMgPSBhcnJheUZyb20oZm9ybWF0SlNCYXNlLmRlZmF1bHRBbGlhc2VzKTtcbmNvbnN0IGRlZmF1bHRCdWlsdElucyA9IGFycmF5RnJvbShmb3JtYXRKU0Jhc2UuZGVmYXVsdEJ1aWx0SW5zKTtcbmNvbnN0IGRlZmF1bHRCdWlsdEluVHlwZXMgPSBhcnJheUZyb20oZm9ybWF0SlNCYXNlLmRlZmF1bHRCdWlsdEluVHlwZXMpO1xuXG4vKipcbiAqIE9ic2VydmVzIHRoZSByZWxldmFudCBOdWNsaWRlIHBhY2thZ2Ugc2V0dGluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlU2V0dGluZ3MoY2FsbGJhY2s6ICh2YWx1ZTogU2V0dGluZ3MpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gIHJldHVybiBmZWF0dXJlQ29uZmlnLm9ic2VydmUoJ251Y2xpZGUtZm9ybWF0LWpzJywgc2V0dGluZ3MgPT5cbiAgICBjYWxsYmFjayh7XG4gICAgICAuLi5zZXR0aW5ncyxcbiAgICAgIGFsaWFzZXM6IGZpeEFsaWFzZXMoc2V0dGluZ3MuYWxpYXNlcyksXG4gICAgfSlcbiAgKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBjdXJyZW50IG9wdGlvbnMgYWNjb3JkaW5nIHRvIHRoZSBOdWNsaWRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICogVGhpcyBtYXkgZ2V0IGV4cGVuc2l2ZSBpbiB0aGUgZnV0dXJlIGFzIHRoZSBtb2R1bGUgbWFwIGJlY29tZXMgc21hcnRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZU9wdGlvbnMoc2V0dGluZ3M6IFNldHRpbmdzKTogU291cmNlT3B0aW9ucyB7XG4gIHJldHVybiB7XG4gICAgYmxhY2tsaXN0OiBjYWxjdWxhdGVCbGFja2xpc3Qoc2V0dGluZ3MpLFxuICAgIG1vZHVsZU1hcDogY2FsY3VsYXRlTW9kdWxlTWFwKHNldHRpbmdzKSxcbiAgfTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIGEgbW9kdWxlIG1hcCBmcm9tIHRoZSBzZXR0aW5ncy5cbiAqL1xuZnVuY3Rpb24gY2FsY3VsYXRlTW9kdWxlTWFwKHNldHRpbmdzOiBTZXR0aW5ncyk6IE1vZHVsZU1hcCB7XG4gIC8vIENvbnN0cnVjdCB0aGUgYWxpYXNlcy5cbiAgY29uc3QgYWxpYXNlcyA9IG5ldyBNYXAoc2V0dGluZ3MuYWxpYXNlcyk7XG4gIGZvciAoY29uc3QgZW50cnkgb2YgZGVmYXVsdEFsaWFzZXMpIHtcbiAgICBjb25zdCBba2V5LCB2YWx1ZV0gPSBlbnRyeTtcbiAgICBpZiAoIWFsaWFzZXMuaGFzKGtleSkpIHtcbiAgICAgIGFsaWFzZXMuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIENvbnN0cnVjdCB0aGUgYnVpbHQgaW5zLlxuICBjb25zdCBidWlsdElucyA9IG5ldyBTZXQoZGVmYXVsdEJ1aWx0SW5zKTtcbiAgZm9yIChjb25zdCBidWlsdEluIG9mIHNldHRpbmdzLmJ1aWx0SW5zKSB7XG4gICAgYnVpbHRJbnMuYWRkKGJ1aWx0SW4pO1xuICB9XG5cbiAgLy8gQ29uc3RydWN0IGJ1aWx0IGluIHR5cGVzLlxuICBjb25zdCBidWlsdEluVHlwZXMgPSBuZXcgU2V0KGRlZmF1bHRCdWlsdEluVHlwZXMpO1xuICBmb3IgKGNvbnN0IGJ1aWx0SW5UeXBlIG9mIHNldHRpbmdzLmJ1aWx0SW5UeXBlcykge1xuICAgIGJ1aWx0SW5UeXBlcy5hZGQoYnVpbHRJblR5cGUpO1xuICB9XG5cbiAgLy8gQW5kIHRoZW4gY2FsY3VsYXRlIHRoZSBtb2R1bGUgbWFwLlxuICByZXR1cm4gY3JlYXRlTW9kdWxlTWFwKHtcbiAgICBwYXRoczogW10sXG4gICAgcGF0aHNUb1JlbGF0aXZpemU6IFtdLFxuICAgIGFsaWFzZXMsXG4gICAgYWxpYXNlc1RvUmVsYXRpdml6ZTogbmV3IE1hcCgpLFxuICAgIGJ1aWx0SW5zLFxuICAgIGJ1aWx0SW5UeXBlcyxcbiAgfSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYmxhY2tsaXN0IGZyb20gdGhlIHNldHRpbmdzLlxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVCbGFja2xpc3Qoc2V0dGluZ3M6IFNldHRpbmdzKTogU2V0PFRyYW5zZm9ybUtleT4ge1xuICBjb25zdCBibGFja2xpc3QgPSBuZXcgU2V0KCk7XG4gIGlmICghc2V0dGluZ3MubnVjbGlkZUZpeEhlYWRlcikge1xuICAgIGJsYWNrbGlzdC5hZGQoJ251Y2xpZGUuZml4SGVhZGVyJyk7XG4gIH1cbiAgaWYgKCFzZXR0aW5ncy5yZXF1aXJlc1RyYW5zZmVyQ29tbWVudHMpIHtcbiAgICBibGFja2xpc3QuYWRkKCdyZXF1aXJlcy50cmFuc2ZlckNvbW1lbnRzJyk7XG4gIH1cbiAgaWYgKCFzZXR0aW5ncy5yZXF1aXJlc1JlbW92ZVVudXNlZFJlcXVpcmVzKSB7XG4gICAgYmxhY2tsaXN0LmFkZCgncmVxdWlyZXMucmVtb3ZlVW51c2VkUmVxdWlyZXMnKTtcbiAgfVxuICBpZiAoIXNldHRpbmdzLnJlcXVpcmVzQWRkTWlzc2luZ1JlcXVpcmVzKSB7XG4gICAgYmxhY2tsaXN0LmFkZCgncmVxdWlyZXMuYWRkTWlzc2luZ1JlcXVpcmVzJyk7XG4gIH1cbiAgaWYgKCFzZXR0aW5ncy5yZXF1aXJlc1JlbW92ZVVudXNlZFR5cGVzKSB7XG4gICAgYmxhY2tsaXN0LmFkZCgncmVxdWlyZXMucmVtb3ZlVW51c2VkVHlwZXMnKTtcbiAgfVxuICBpZiAoIXNldHRpbmdzLnJlcXVpcmVzQWRkTWlzc2luZ1R5cGVzKSB7XG4gICAgYmxhY2tsaXN0LmFkZCgncmVxdWlyZXMuYWRkTWlzc2luZ1R5cGVzJyk7XG4gIH1cbiAgaWYgKCFzZXR0aW5ncy5yZXF1aXJlc0Zvcm1hdFJlcXVpcmVzKSB7XG4gICAgYmxhY2tsaXN0LmFkZCgncmVxdWlyZXMuZm9ybWF0UmVxdWlyZXMnKTtcbiAgfVxuICByZXR1cm4gYmxhY2tsaXN0O1xufVxuXG4vLyBTb21lIHNtYWxsIGhlbHBlciBmdW5jdGlvbnMuXG5cbi8qKlxuICogTnVjbGlkZSBjYW4ndCBoYW5kbGUgbmVzdGVkIGFycmF5cyB3ZWxsIGluIHNldHRpbmdzLCBzbyB3ZSBzYXZlIGl0IGluIGFcbiAqIGZsYXQgYXJyYXkgYW5kIGZpeCB1cCBlYWNoIHBhaXIgb3IgZW50cmllcyBiZWZvcmUgdXNpbmcgaXQgaW4gdGhlIHRyYW5zZm9ybVxuICovXG5mdW5jdGlvbiBmaXhBbGlhc2VzKGFsaWFzZXM6ID9BcnJheTxzdHJpbmc+KTogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4ge1xuICBhbGlhc2VzID0gYWxpYXNlcyB8fCBbXTtcbiAgY29uc3QgcGFpcnMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGlhc2VzLmxlbmd0aCAtIDE7IGkgKz0gMikge1xuICAgIHBhaXJzLnB1c2goW2FsaWFzZXNbaV0sIGFsaWFzZXNbaSArIDFdXSk7XG4gIH1cbiAgcmV0dXJuIHBhaXJzO1xufVxuIl19