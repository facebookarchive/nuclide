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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.astToOutline = astToOutline;

var _commons = require('../../commons');

function astToOutline(ast) {
  return itemsToTrees(ast.body);
}

function itemsToTrees(items) {
  return _commons.array.compact(items.map(itemToTree));
}

function itemToTree(item) {
  if (item == null) {
    return null;
  }
  var location = {
    // It definitely makes sense that the lines we get are 1-based and the columns are
    // 0-based... convert to 0-based all around.
    startLine: item.loc.start.line - 1,
    startColumn: item.loc.start.column
  };
  switch (item.type) {
    case 'FunctionDeclaration':
      return _extends({
        displayText: 'function ' + item.id.name + '(' + paramsString(item.params) + ')',
        children: []
      }, location);
    case 'ClassDeclaration':
      return _extends({
        displayText: 'class ' + item.id.name,
        children: itemsToTrees(item.body.body)
      }, location);
    case 'MethodDefinition':
      return _extends({
        displayText: item.key.name + '(' + paramsString(item.value.params) + ')',
        children: []
      }, location);
    case 'ExportDeclaration':
      var tree = itemToTree(item.declaration);
      if (tree == null) {
        return null;
      }
      return _extends({
        displayText: 'export ' + tree.displayText,
        children: tree.children
      }, location);
    default:
      return null;
  }
}

function paramsString(params) {
  return params.map(function (param) {
    return param.name;
  }).join(', ');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzdFRvT3V0bGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3VCQVlvQixlQUFlOztBQUU1QixTQUFTLFlBQVksQ0FBQyxHQUFRLEVBQTBCO0FBQzdELFNBQU8sWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMvQjs7QUFFRCxTQUFTLFlBQVksQ0FBQyxLQUFpQixFQUEwQjtBQUMvRCxTQUFPLGVBQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztDQUM3Qzs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxJQUFTLEVBQW9CO0FBQy9DLE1BQUksSUFBSSxJQUFJLElBQUksRUFBRTtBQUNoQixXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsTUFBTSxRQUFRLEdBQUc7OztBQUdmLGFBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUNsQyxlQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTTtHQUNuQyxDQUFDO0FBQ0YsVUFBUSxJQUFJLENBQUMsSUFBSTtBQUNmLFNBQUsscUJBQXFCO0FBQ3hCO0FBQ0UsbUJBQVcsZ0JBQWMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLFNBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBRztBQUNyRSxnQkFBUSxFQUFFLEVBQUU7U0FDVCxRQUFRLEVBQ1g7QUFBQSxBQUNKLFNBQUssa0JBQWtCO0FBQ3JCO0FBQ0UsbUJBQVcsYUFBVyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQUFBRTtBQUNwQyxnQkFBUSxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUNuQyxRQUFRLEVBQ1g7QUFBQSxBQUNKLFNBQUssa0JBQWtCO0FBQ3JCO0FBQ0UsbUJBQVcsRUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksU0FBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBRztBQUNuRSxnQkFBUSxFQUFFLEVBQUU7U0FDVCxRQUFRLEVBQ1g7QUFBQSxBQUNKLFNBQUssbUJBQW1CO0FBQ3RCLFVBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDMUMsVUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRDtBQUNFLG1CQUFXLGNBQVksSUFBSSxDQUFDLFdBQVcsQUFBRTtBQUN6QyxnQkFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3BCLFFBQVEsRUFDWDtBQUFBLEFBQ0o7QUFDRSxhQUFPLElBQUksQ0FBQztBQUFBLEdBQ2Y7Q0FDRjs7QUFFRCxTQUFTLFlBQVksQ0FBQyxNQUFrQixFQUFVO0FBQ2hELFNBQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsSUFBSTtHQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbkQiLCJmaWxlIjoiYXN0VG9PdXRsaW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0Zsb3dPdXRsaW5lVHJlZX0gZnJvbSAnLi9GbG93U2VydmljZSc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFzdFRvT3V0bGluZShhc3Q6IGFueSk6IEFycmF5PEZsb3dPdXRsaW5lVHJlZT4ge1xuICByZXR1cm4gaXRlbXNUb1RyZWVzKGFzdC5ib2R5KTtcbn1cblxuZnVuY3Rpb24gaXRlbXNUb1RyZWVzKGl0ZW1zOiBBcnJheTxhbnk+KTogQXJyYXk8Rmxvd091dGxpbmVUcmVlPiB7XG4gIHJldHVybiBhcnJheS5jb21wYWN0KGl0ZW1zLm1hcChpdGVtVG9UcmVlKSk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Ub1RyZWUoaXRlbTogYW55KTogP0Zsb3dPdXRsaW5lVHJlZSB7XG4gIGlmIChpdGVtID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBsb2NhdGlvbiA9IHtcbiAgICAvLyBJdCBkZWZpbml0ZWx5IG1ha2VzIHNlbnNlIHRoYXQgdGhlIGxpbmVzIHdlIGdldCBhcmUgMS1iYXNlZCBhbmQgdGhlIGNvbHVtbnMgYXJlXG4gICAgLy8gMC1iYXNlZC4uLiBjb252ZXJ0IHRvIDAtYmFzZWQgYWxsIGFyb3VuZC5cbiAgICBzdGFydExpbmU6IGl0ZW0ubG9jLnN0YXJ0LmxpbmUgLSAxLFxuICAgIHN0YXJ0Q29sdW1uOiBpdGVtLmxvYy5zdGFydC5jb2x1bW4sXG4gIH07XG4gIHN3aXRjaCAoaXRlbS50eXBlKSB7XG4gICAgY2FzZSAnRnVuY3Rpb25EZWNsYXJhdGlvbic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5VGV4dDogYGZ1bmN0aW9uICR7aXRlbS5pZC5uYW1lfSgke3BhcmFtc1N0cmluZyhpdGVtLnBhcmFtcyl9KWAsXG4gICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgLi4ubG9jYXRpb24sXG4gICAgICB9O1xuICAgIGNhc2UgJ0NsYXNzRGVjbGFyYXRpb24nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheVRleHQ6IGBjbGFzcyAke2l0ZW0uaWQubmFtZX1gLFxuICAgICAgICBjaGlsZHJlbjogaXRlbXNUb1RyZWVzKGl0ZW0uYm9keS5ib2R5KSxcbiAgICAgICAgLi4ubG9jYXRpb24sXG4gICAgICB9O1xuICAgIGNhc2UgJ01ldGhvZERlZmluaXRpb24nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheVRleHQ6IGAke2l0ZW0ua2V5Lm5hbWV9KCR7cGFyYW1zU3RyaW5nKGl0ZW0udmFsdWUucGFyYW1zKX0pYCxcbiAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAuLi5sb2NhdGlvbixcbiAgICAgIH07XG4gICAgY2FzZSAnRXhwb3J0RGVjbGFyYXRpb24nOlxuICAgICAgY29uc3QgdHJlZSA9IGl0ZW1Ub1RyZWUoaXRlbS5kZWNsYXJhdGlvbik7XG4gICAgICBpZiAodHJlZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheVRleHQ6IGBleHBvcnQgJHt0cmVlLmRpc3BsYXlUZXh0fWAsXG4gICAgICAgIGNoaWxkcmVuOiB0cmVlLmNoaWxkcmVuLFxuICAgICAgICAuLi5sb2NhdGlvbixcbiAgICAgIH07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcmFtc1N0cmluZyhwYXJhbXM6IEFycmF5PGFueT4pOiBzdHJpbmcge1xuICByZXR1cm4gcGFyYW1zLm1hcChwYXJhbSA9PiBwYXJhbS5uYW1lKS5qb2luKCcsICcpO1xufVxuIl19