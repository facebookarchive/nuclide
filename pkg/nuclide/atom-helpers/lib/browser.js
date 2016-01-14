

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This function is abstracted in case the (undocumented) Atom API beneath ever changes.
function getBrowserWindow() {
  return atom.getCurrentWindow();
}

module.exports = {

  getCookies: function getCookies(domain) {
    return new Promise(function (resolve, reject) {
      getBrowserWindow().webContents.session.cookies.get({
        domain: domain
      }, function (error, cookies) {
        if (error) {
          reject(error);
        } else {
          (function () {
            var cookieMap = {};
            cookies.forEach(function (cookie) {
              cookieMap[cookie.name] = cookie.value;
            });
            resolve(cookieMap);
          })();
        }
      });
    });
  },

  setCookie: function setCookie(url, domain, name, value) {
    return new Promise(function (resolve, reject) {
      getBrowserWindow().webContents.session.cookies.set({
        url: url,
        domain: domain,
        name: name,
        value: value
      }, function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFZQSxTQUFTLGdCQUFnQixHQUFHO0FBQzFCLFNBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Q0FDaEM7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRzs7QUFFZixZQUFVLEVBQUEsb0JBQUMsTUFBYyxFQUFvQztBQUMzRCxXQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxzQkFBZ0IsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUNqRCxjQUFNLEVBQUUsTUFBTTtPQUNmLEVBQUUsVUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFLO0FBQ3JCLFlBQUksS0FBSyxFQUFFO0FBQ1QsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNmLE1BQU07O0FBQ0wsZ0JBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixtQkFBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUN4Qix1QkFBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO2FBQ3ZDLENBQUMsQ0FBQztBQUNILG1CQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O1NBQ3BCO09BQ0YsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsV0FBUyxFQUFBLG1CQUFDLEdBQVcsRUFBRSxNQUFjLEVBQUUsSUFBWSxFQUFFLEtBQWEsRUFBaUI7QUFDakYsV0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsc0JBQWdCLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFDakQsV0FBRyxFQUFFLEdBQUc7QUFDUixjQUFNLEVBQUUsTUFBTTtBQUNkLFlBQUksRUFBRSxJQUFJO0FBQ1YsYUFBSyxFQUFFLEtBQUs7T0FDYixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ1osWUFBSSxLQUFLLEVBQUU7QUFDVCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2YsTUFBTTtBQUNMLGlCQUFPLEVBQUUsQ0FBQztTQUNYO09BQ0YsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0dBQ0o7O0NBRUYsQ0FBQyIsImZpbGUiOiJicm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gVGhpcyBmdW5jdGlvbiBpcyBhYnN0cmFjdGVkIGluIGNhc2UgdGhlICh1bmRvY3VtZW50ZWQpIEF0b20gQVBJIGJlbmVhdGggZXZlciBjaGFuZ2VzLlxuZnVuY3Rpb24gZ2V0QnJvd3NlcldpbmRvdygpIHtcbiAgcmV0dXJuIGF0b20uZ2V0Q3VycmVudFdpbmRvdygpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnZXRDb29raWVzKGRvbWFpbjogc3RyaW5nKTogUHJvbWlzZTx7W2tleTogc3RyaW5nXTogc3RyaW5nfT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBnZXRCcm93c2VyV2luZG93KCkud2ViQ29udGVudHMuc2Vzc2lvbi5jb29raWVzLmdldCh7XG4gICAgICAgIGRvbWFpbjogZG9tYWluLFxuICAgICAgfSwgKGVycm9yLCBjb29raWVzKSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgY29va2llTWFwID0ge307XG4gICAgICAgICAgY29va2llcy5mb3JFYWNoKGNvb2tpZSA9PiB7XG4gICAgICAgICAgICBjb29raWVNYXBbY29va2llLm5hbWVdID0gY29va2llLnZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJlc29sdmUoY29va2llTWFwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgc2V0Q29va2llKHVybDogc3RyaW5nLCBkb21haW46IHN0cmluZywgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGdldEJyb3dzZXJXaW5kb3coKS53ZWJDb250ZW50cy5zZXNzaW9uLmNvb2tpZXMuc2V0KHtcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIGRvbWFpbjogZG9tYWluLFxuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG59O1xuIl19