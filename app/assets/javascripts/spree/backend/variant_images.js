(function() {
  function init() {
    var $container = $('#admin-image-form-fields'),
        $form = $container.parents('form'),
        $radios = $container.find('input[type="radio"]');

    function onChange() {
      $radios.not($(this)).prop('checked', false);
    }

    $radios.on('change', onChange);

    $form.on('submit', function(e) {
      var $error = $('#admin-image-form-fields-error'),
          $master = $('#master-option'),
          $checked = $container.find('#master-option, .option-type, .option-value').filter(':checked');

      $error.addClass('hidden');

      if($master.length && !$checked.length) {
        e.preventDefault();

        $error.removeClass('hidden');
        $(window).scrollTop(0);
      }
    });
  }

  $(init);
}());
