Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.dispatchKeyboardEvent = dispatchKeyboardEvent;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Use this function to simulate keyboard shortcuts or special keys, e.g. cmd-v, escape, or tab.
 * For regular text input the TextEditor.insertText method should be used.
 *
 * @param key A single character key to be sent or a special token such as 'escape' or 'tab'.
 * @param target The DOM element to which this event will be sent.
 * @param metaKeys An object denoting which meta keys are pressed for this keyboard event.
 */

function dispatchKeyboardEvent(key, target) {
  var metaKeys = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var alt = metaKeys.alt;
  var cmd = metaKeys.cmd;
  var ctrl = metaKeys.ctrl;
  var shift = metaKeys.shift;

  var event = atom.keymaps.constructor.buildKeydownEvent(key, {
    target: target,
    alt: !!alt,
    cmd: !!cmd,
    ctrl: !!ctrl,
    shift: !!shift
  });
  atom.keymaps.handleKeyboardEvent(event);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQk8sU0FBUyxxQkFBcUIsQ0FDbkMsR0FBVyxFQUNYLE1BQW1CLEVBT2I7TUFOTixRQUtDLHlEQUFHLEVBQUU7TUFFQyxHQUFHLEdBQXNCLFFBQVEsQ0FBakMsR0FBRztNQUFFLEdBQUcsR0FBaUIsUUFBUSxDQUE1QixHQUFHO01BQUUsSUFBSSxHQUFXLFFBQVEsQ0FBdkIsSUFBSTtNQUFFLEtBQUssR0FBSSxRQUFRLENBQWpCLEtBQUs7O0FBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtBQUM1RCxVQUFNLEVBQUUsTUFBTTtBQUNkLE9BQUcsRUFBRSxDQUFDLENBQUMsR0FBRztBQUNWLE9BQUcsRUFBRSxDQUFDLENBQUMsR0FBRztBQUNWLFFBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtBQUNaLFNBQUssRUFBRSxDQUFDLENBQUMsS0FBSztHQUNmLENBQUMsQ0FBQztBQUNILE1BQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDekMiLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIHNpbXVsYXRlIGtleWJvYXJkIHNob3J0Y3V0cyBvciBzcGVjaWFsIGtleXMsIGUuZy4gY21kLXYsIGVzY2FwZSwgb3IgdGFiLlxuICogRm9yIHJlZ3VsYXIgdGV4dCBpbnB1dCB0aGUgVGV4dEVkaXRvci5pbnNlcnRUZXh0IG1ldGhvZCBzaG91bGQgYmUgdXNlZC5cbiAqXG4gKiBAcGFyYW0ga2V5IEEgc2luZ2xlIGNoYXJhY3RlciBrZXkgdG8gYmUgc2VudCBvciBhIHNwZWNpYWwgdG9rZW4gc3VjaCBhcyAnZXNjYXBlJyBvciAndGFiJy5cbiAqIEBwYXJhbSB0YXJnZXQgVGhlIERPTSBlbGVtZW50IHRvIHdoaWNoIHRoaXMgZXZlbnQgd2lsbCBiZSBzZW50LlxuICogQHBhcmFtIG1ldGFLZXlzIEFuIG9iamVjdCBkZW5vdGluZyB3aGljaCBtZXRhIGtleXMgYXJlIHByZXNzZWQgZm9yIHRoaXMga2V5Ym9hcmQgZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEtleWJvYXJkRXZlbnQoXG4gIGtleTogc3RyaW5nLFxuICB0YXJnZXQ6IEhUTUxFbGVtZW50LFxuICBtZXRhS2V5czoge1xuICAgIGFsdD86IGJvb2xlYW4sXG4gICAgY21kPzogYm9vbGVhbixcbiAgICBjdHJsPzogYm9vbGVhbixcbiAgICBzaGlmdD86IGJvb2xlYW4sXG4gIH0gPSB7fSxcbik6IHZvaWQge1xuICBjb25zdCB7YWx0LCBjbWQsIGN0cmwsIHNoaWZ0fSA9IG1ldGFLZXlzO1xuICBjb25zdCBldmVudCA9IGF0b20ua2V5bWFwcy5jb25zdHJ1Y3Rvci5idWlsZEtleWRvd25FdmVudChrZXksIHtcbiAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICBhbHQ6ICEhYWx0LFxuICAgIGNtZDogISFjbWQsXG4gICAgY3RybDogISFjdHJsLFxuICAgIHNoaWZ0OiAhIXNoaWZ0LFxuICB9KTtcbiAgYXRvbS5rZXltYXBzLmhhbmRsZUtleWJvYXJkRXZlbnQoZXZlbnQpO1xufVxuIl19