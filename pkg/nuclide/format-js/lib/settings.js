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
//# sourceMappingURL=data:application/json;base64,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QixDQUFDLENBQUM7R0FDNUM7QUFDRCxNQUFJLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFO0FBQzFDLGFBQVMsQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztHQUNoRDtBQUNELE1BQUksQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUU7QUFDeEMsYUFBUyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0dBQzlDO0FBQ0QsTUFBSSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRTtBQUN2QyxhQUFTLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7R0FDN0M7QUFDRCxNQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFO0FBQ3JDLGFBQVMsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztHQUMzQztBQUNELE1BQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUU7QUFDcEMsYUFBUyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0dBQzFDO0FBQ0QsU0FBTyxTQUFTLENBQUM7Q0FDbEI7Ozs7Ozs7O0FBUUQsU0FBUyxVQUFVLENBQUMsT0FBdUIsRUFBMkI7QUFDcEUsU0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7QUFDeEIsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzlDLFNBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDMUM7QUFDRCxTQUFPLEtBQUssQ0FBQztDQUNkIiwiZmlsZSI6InNldHRpbmdzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTW9kdWxlTWFwIGZyb20gJy4uLy4uL2Zvcm1hdC1qcy1iYXNlL2xpYi9zdGF0ZS9Nb2R1bGVNYXAnO1xuaW1wb3J0IHR5cGUge1NvdXJjZU9wdGlvbnN9IGZyb20gJy4uLy4uL2Zvcm1hdC1qcy1iYXNlL2xpYi9vcHRpb25zL1NvdXJjZU9wdGlvbnMnO1xuaW1wb3J0IHR5cGUge1RyYW5zZm9ybUtleX0gZnJvbSAnLi4vLi4vZm9ybWF0LWpzLWJhc2UvbGliL3R5cGVzL3RyYW5zZm9ybXMnO1xuXG5jb25zdCBOdWNsaWRlQ29tbW9ucyA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcblxuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2ZlYXR1cmUtY29uZmlnJyk7XG5jb25zdCBmb3JtYXRKU0Jhc2UgPSByZXF1aXJlKCcuLi8uLi9mb3JtYXQtanMtYmFzZScpO1xuXG4vLyBOdWNsaWRlIHBhY2thZ2Ugc2V0dGluZ3MgdXNlZCB0byBjYWxjdWxhdGUgdGhlIG1vZHVsZSBtYXAsXG4vLyB0aGUgYmxhY2tsaXN0LCBhbmQgY29udHJvbCB0aGUgcGx1Z2luIGJlaGF2aW9yLlxuZXhwb3J0IHR5cGUgU2V0dGluZ3MgPSB7XG4gIGFsaWFzZXM6IEFycmF5PFtzdHJpbmcsIHN0cmluZ10+LFxuICBidWlsdEluczogQXJyYXk8c3RyaW5nPixcbiAgYnVpbHRJblR5cGVzOiBBcnJheTxzdHJpbmc+LFxuICBudWNsaWRlRml4SGVhZGVyOiBib29sZWFuLFxuICByZXF1aXJlc1RyYW5zZmVyQ29tbWVudHM6IGJvb2xlYW4sXG4gIHJlcXVpcmVzUmVtb3ZlVW51c2VkUmVxdWlyZXM6IGJvb2xlYW4sXG4gIHJlcXVpcmVzQWRkTWlzc2luZ1JlcXVpcmVzOiBib29sZWFuLFxuICByZXF1aXJlc1JlbW92ZVVudXNlZFR5cGVzOiBib29sZWFuLFxuICByZXF1aXJlc0FkZE1pc3NpbmdUeXBlczogYm9vbGVhbixcbiAgcmVxdWlyZXNGb3JtYXRSZXF1aXJlczogYm9vbGVhbixcbiAgcnVuT25TYXZlOiBib29sZWFuLFxufTtcblxuY29uc3QgYXJyYXlGcm9tID0gTnVjbGlkZUNvbW1vbnMuYXJyYXkuZnJvbTtcblxuY29uc3Qge2NyZWF0ZU1vZHVsZU1hcH0gPSBmb3JtYXRKU0Jhc2U7XG4vLyBXZSBuZWVkIHRoaXMgaW4gYXJyYXkgZm9ybWF0cy5cbmNvbnN0IGRlZmF1bHRBbGlhc2VzID0gYXJyYXlGcm9tKGZvcm1hdEpTQmFzZS5kZWZhdWx0QWxpYXNlcyk7XG5jb25zdCBkZWZhdWx0QnVpbHRJbnMgPSBhcnJheUZyb20oZm9ybWF0SlNCYXNlLmRlZmF1bHRCdWlsdElucyk7XG5jb25zdCBkZWZhdWx0QnVpbHRJblR5cGVzID0gYXJyYXlGcm9tKGZvcm1hdEpTQmFzZS5kZWZhdWx0QnVpbHRJblR5cGVzKTtcblxuLyoqXG4gKiBPYnNlcnZlcyB0aGUgcmVsZXZhbnQgTnVjbGlkZSBwYWNrYWdlIHNldHRpbmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JzZXJ2ZVNldHRpbmdzKGNhbGxiYWNrOiAodmFsdWU6IFNldHRpbmdzKSA9PiB2b2lkKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgcmV0dXJuIGZlYXR1cmVDb25maWcub2JzZXJ2ZSgnbnVjbGlkZS1mb3JtYXQtanMnLCAoc2V0dGluZ3MpID0+XG4gICAgY2FsbGJhY2soe1xuICAgICAgLi4uc2V0dGluZ3MsXG4gICAgICBhbGlhc2VzOiBmaXhBbGlhc2VzKHNldHRpbmdzLmFsaWFzZXMpLFxuICAgIH0pXG4gICk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY3VycmVudCBvcHRpb25zIGFjY29yZGluZyB0byB0aGUgTnVjbGlkZSBjb25maWd1cmF0aW9uIG9iamVjdC5cbiAqIFRoaXMgbWF5IGdldCBleHBlbnNpdmUgaW4gdGhlIGZ1dHVyZSBhcyB0aGUgbW9kdWxlIG1hcCBiZWNvbWVzIHNtYXJ0ZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVPcHRpb25zKHNldHRpbmdzOiBTZXR0aW5ncyk6IFNvdXJjZU9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIGJsYWNrbGlzdDogY2FsY3VsYXRlQmxhY2tsaXN0KHNldHRpbmdzKSxcbiAgICBtb2R1bGVNYXA6IGNhbGN1bGF0ZU1vZHVsZU1hcChzZXR0aW5ncyksXG4gIH07XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBhIG1vZHVsZSBtYXAgZnJvbSB0aGUgc2V0dGluZ3MuXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZU1vZHVsZU1hcChzZXR0aW5nczogU2V0dGluZ3MpOiBNb2R1bGVNYXAge1xuICAvLyBDb25zdHJ1Y3QgdGhlIGFsaWFzZXMuXG4gIGNvbnN0IGFsaWFzZXMgPSBuZXcgTWFwKHNldHRpbmdzLmFsaWFzZXMpO1xuICBmb3IgKGNvbnN0IGVudHJ5IG9mIGRlZmF1bHRBbGlhc2VzKSB7XG4gICAgY29uc3QgW2tleSwgdmFsdWVdID0gZW50cnk7XG4gICAgaWYgKCFhbGlhc2VzLmhhcyhrZXkpKSB7XG4gICAgICBhbGlhc2VzLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICAvLyBDb25zdHJ1Y3QgdGhlIGJ1aWx0IGlucy5cbiAgY29uc3QgYnVpbHRJbnMgPSBuZXcgU2V0KGRlZmF1bHRCdWlsdElucyk7XG4gIGZvciAoY29uc3QgYnVpbHRJbiBvZiBzZXR0aW5ncy5idWlsdElucykge1xuICAgIGJ1aWx0SW5zLmFkZChidWlsdEluKTtcbiAgfVxuXG4gIC8vIENvbnN0cnVjdCBidWlsdCBpbiB0eXBlcy5cbiAgY29uc3QgYnVpbHRJblR5cGVzID0gbmV3IFNldChkZWZhdWx0QnVpbHRJblR5cGVzKTtcbiAgZm9yIChjb25zdCBidWlsdEluVHlwZSBvZiBzZXR0aW5ncy5idWlsdEluVHlwZXMpIHtcbiAgICBidWlsdEluVHlwZXMuYWRkKGJ1aWx0SW5UeXBlKTtcbiAgfVxuXG4gIC8vIEFuZCB0aGVuIGNhbGN1bGF0ZSB0aGUgbW9kdWxlIG1hcC5cbiAgcmV0dXJuIGNyZWF0ZU1vZHVsZU1hcCh7XG4gICAgcGF0aHM6IFtdLFxuICAgIHBhdGhzVG9SZWxhdGl2aXplOiBbXSxcbiAgICBhbGlhc2VzLFxuICAgIGFsaWFzZXNUb1JlbGF0aXZpemU6IG5ldyBNYXAoKSxcbiAgICBidWlsdElucyxcbiAgICBidWlsdEluVHlwZXMsXG4gIH0pO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGJsYWNrbGlzdCBmcm9tIHRoZSBzZXR0aW5ncy5cbiAqL1xuZnVuY3Rpb24gY2FsY3VsYXRlQmxhY2tsaXN0KHNldHRpbmdzOiBTZXR0aW5ncyk6IFNldDxUcmFuc2Zvcm1LZXk+IHtcbiAgY29uc3QgYmxhY2tsaXN0ID0gbmV3IFNldCgpO1xuICBpZiAoIXNldHRpbmdzLm51Y2xpZGVGaXhIZWFkZXIpIHtcbiAgICBibGFja2xpc3QuYWRkKCdudWNsaWRlLmZpeEhlYWRlcicpO1xuICB9XG4gIGlmICghc2V0dGluZ3MucmVxdWlyZXNUcmFuc2ZlckNvbW1lbnRzKSB7XG4gICAgYmxhY2tsaXN0LmFkZCgncmVxdWlyZXMudHJhbnNmZXJDb21tZW50cycpO1xuICB9XG4gIGlmICghc2V0dGluZ3MucmVxdWlyZXNSZW1vdmVVbnVzZWRSZXF1aXJlcykge1xuICAgIGJsYWNrbGlzdC5hZGQoJ3JlcXVpcmVzLnJlbW92ZVVudXNlZFJlcXVpcmVzJyk7XG4gIH1cbiAgaWYgKCFzZXR0aW5ncy5yZXF1aXJlc0FkZE1pc3NpbmdSZXF1aXJlcykge1xuICAgIGJsYWNrbGlzdC5hZGQoJ3JlcXVpcmVzLmFkZE1pc3NpbmdSZXF1aXJlcycpO1xuICB9XG4gIGlmICghc2V0dGluZ3MucmVxdWlyZXNSZW1vdmVVbnVzZWRUeXBlcykge1xuICAgIGJsYWNrbGlzdC5hZGQoJ3JlcXVpcmVzLnJlbW92ZVVudXNlZFR5cGVzJyk7XG4gIH1cbiAgaWYgKCFzZXR0aW5ncy5yZXF1aXJlc0FkZE1pc3NpbmdUeXBlcykge1xuICAgIGJsYWNrbGlzdC5hZGQoJ3JlcXVpcmVzLmFkZE1pc3NpbmdUeXBlcycpO1xuICB9XG4gIGlmICghc2V0dGluZ3MucmVxdWlyZXNGb3JtYXRSZXF1aXJlcykge1xuICAgIGJsYWNrbGlzdC5hZGQoJ3JlcXVpcmVzLmZvcm1hdFJlcXVpcmVzJyk7XG4gIH1cbiAgcmV0dXJuIGJsYWNrbGlzdDtcbn1cblxuLy8gU29tZSBzbWFsbCBoZWxwZXIgZnVuY3Rpb25zLlxuXG4vKipcbiAqIE51Y2xpZGUgY2FuJ3QgaGFuZGxlIG5lc3RlZCBhcnJheXMgd2VsbCBpbiBzZXR0aW5ncywgc28gd2Ugc2F2ZSBpdCBpbiBhXG4gKiBmbGF0IGFycmF5IGFuZCBmaXggdXAgZWFjaCBwYWlyIG9yIGVudHJpZXMgYmVmb3JlIHVzaW5nIGl0IGluIHRoZSB0cmFuc2Zvcm1cbiAqL1xuZnVuY3Rpb24gZml4QWxpYXNlcyhhbGlhc2VzOiA/QXJyYXk8c3RyaW5nPik6IEFycmF5PFtzdHJpbmcsIHN0cmluZ10+IHtcbiAgYWxpYXNlcyA9IGFsaWFzZXMgfHwgW107XG4gIGNvbnN0IHBhaXJzID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYWxpYXNlcy5sZW5ndGggLSAxOyBpICs9IDIpIHtcbiAgICBwYWlycy5wdXNoKFthbGlhc2VzW2ldLCBhbGlhc2VzW2kgKyAxXV0pO1xuICB9XG4gIHJldHVybiBwYWlycztcbn1cbiJdfQ==