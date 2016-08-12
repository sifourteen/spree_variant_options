var images;
images = $('#images');
images.on('change', '#master_option', function() {
  $('.option-value, .option-type', images).prop('disabled', function(i, val) {
    return !val;
  });
  return $('#master_option', images).prop('disabled', false);
});
return images.on('submit', 'form', function(e) {
  var error_div, form, master_option, option_type_count, option_types, option_types_with_selected;
  form = $(this);
  option_types = $('.option-type-field', images);
  option_type_count = option_types.size();
  master_option = $('#master_option', images);
  option_types_with_selected = 0;
  option_types.each(function() {
    if ($(this).find('input.option-value:checked').size() > 0) {
      option_types_with_selected += 1;
      return true;
    }
  });
  if (option_type_count !== option_types_with_selected && !master_option.is(':checked')) {
    e.preventDefault();
    error_div = $('#error-message', images);
    return error_div.text(error_div.data('one-option-error'));
  }
});