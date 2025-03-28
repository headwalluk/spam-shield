/**
 * /index.js
 */

console.log('/index.js : load');

(function ($) {
  'use strict';

  $(window).on('ssInit', () => {
    console.log('/index.js : init');
  });
})(jQuery);
