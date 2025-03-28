/**
 * /login/index.js
 */

(function ($) {
  'use strict';

  $(window).on('ssInit', () => {
    console.log('login : init');

    // $('#login-form button[role="submit"]').on('click', ss.loginClickHandler);
  });

  ss.loginClickHandler = (event) => {
    event.preventDefault();
    console.log('LOGIN');

    const container = $(event.target).closest('form');
    const spinner = $(container).find('.spinner');
    const request = {
      email: $(container).find('#username').val(),
      pass: $(container).find('#password').val(),
    };

    $(spinner).show();
    $(container).find('input, button').prop('disabled', true);

    $.post('/api/v1/session/authenticate', request)
      .done((response) => {
        // console.log(`response`);
        // console.log(response);
        window.location.href = '/';
      })
      .fail((fullResponse) => {
        $(container).find('input, button').prop('disabled', false);
        // console.error(fullResponse.responseJSON.error);
        alert(fullResponse.responseJSON.error);
      })
      .always(() => {
        $(spinner).fadeOut();
        console.log('always');
      });

    // ...
  };

  // ...
})(jQuery);
