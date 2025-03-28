/**
 * /assets/spam-shield-core.js
 */

console.log('spam-shield-core : load');

console.log(ss);

(function ($) {
  'use strict';

  ss.init = () => {
    console.log('spam-shield-core : init');

    $(window).trigger('ssInit');
  };

  $(document).ready(() => {
    ss.init();
  });
})(jQuery);
