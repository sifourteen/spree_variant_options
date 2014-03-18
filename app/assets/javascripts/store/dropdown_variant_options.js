$.extend({
    keys: function (obj) {
        var a = [];
        $.each(obj, function (k) {
            a.push(k)
        });
        return a;
    }
});

if (!Array.indexOf) Array.prototype.indexOf = function (obj) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == obj) {
            return i;
        }
    }
    return -1;
}

if (!Array.find_matches) Array.find_matches = function (a) {
    var i, m = [];
    a = a.sort();
    i = a.length
    while (i--) {
        if (a[i - 1] == a[i]) {
            m.push(a[i]);
        }
    }
    if (m.length == 0) {
        return false;
    }
    return m;
}

function intersect(first_list, second_list) {
    var new_list = [];
    $.each(first_list, function (idx, item) {
        if (second_list.indexOf(item) >= 0) {
            new_list.push(item);
        }
    });
    return new_list;
}

function DropdownVariantOptions(params) {

    var options = params['options'];
    var i18n = params['i18n'];
    var allow_backorders = !params['track_inventory_levels'] || params['allow_backorders'];
    var allow_select_outofstock = params['allow_select_outofstock'];
    var default_instock = params['default_instock'];

    var selects = [];
    var available_products = [];
    var products_by_id = [];

    function all_products() {
        // Creates a list of all available products.
        var product_ids = [];
        $.each($.keys(options), function (i, option_type) {
            $.each($.keys(options[option_type]), function (i, option_value) {
                $.each($.keys(options[option_type][option_value]), function (i, product_id) {
                    if (options[option_type][option_value][product_id].in_stock) {
                        if (product_ids.indexOf(product_id) == -1) {
                            product_ids.push(product_id);
                        }
                    }
                });
            });
        });
        return product_ids;
    }

    function build_products_by_id() {
        var products = {};
        $.each($.keys(options), function (i, option_type) {
            $.each($.keys(options[option_type]), function (i, option_value) {
                $.each($.keys(options[option_type][option_value]), function (i, product_id) {
                    products[product_id] = options[option_type][option_value][product_id];
                });
            });
        });
        return products;
    }

    function init() {
        selects = $('#product-variants .variant-option-values');
        products_by_id = build_products_by_id();

        // First, set up state of first selection box as if nothing has been selected.
        available_products = create_available_products(0);
        update_options_by_selections(selects[0], available_products);

        // Then, assume the first selection has been made and iterate through the rest.
        update_options(1);

        // Initialize chosen.
        $(".chosen-select").chosen({disable_search_threshold: 20, width: "60%"});
    }

    function disable(option) {
        $(option).addClass('out-of-stock');
        option.disabled = true;
    }

    function enable(option) {
        $(option).removeClass('out-of-stock');
        option.disabled = false;
    }

    function to_f(string) {
        return parseFloat(string.replace(/[^\d\.]/g, ''));
    }

    function find_selected_option_value(select) {
        return $(select).val();
    }

    function update_options_by_selections(select, available_products) {
        var option_values = $('.option-value', select);
        $.each(option_values, function (idx, option) {
            var ov = find_selected_option_value(option);
            var type = ov.split('-')[0];
            var value = ov.split('-')[1];

            // Iterate through the option's products and see if this option has anything available.
            var should_show_option = false;
            $.each($.keys(options[type][value]), function (idx, product_id) {
                if (available_products.indexOf(product_id) >= 0) {
                    should_show_option = true;
                }
            });

            if (should_show_option) {
                enable(option);
            } else {
                disable(option);
            }
        });

        // Select first item that is not disabled.
        var remaining_items = option_values.not('[disabled]');
        if (remaining_items.length > 0) {
            remaining_items[0].selected = true;
        } else {
            console.log('error: no available items in stock for this option!');
        }

        // Update chosen to reflect new enabled/disabled states.
        $(select).trigger("chosen:updated");
    }

    function product_ids_by_selection_value(selection_value) {
        var type = selection_value.split('-')[0];
        var value = selection_value.split('-')[1];
        var product_ids = [];
        $.each($.keys(options[type][value]), function (idx, product_id) {
            var product = options[type][value][product_id];
            if (product.in_stock) {
                product_ids.push(product_id);
            }
        });
        return product_ids;
    }

    function create_available_products(selection_made_count) {
        var available_products = all_products();
        for (var i = 0; i < selection_made_count; i++) {
            var selection = find_selected_option_value(selects[i]);
            var product_ids = product_ids_by_selection_value(selection);
            available_products = intersect(available_products, product_ids);
        }
        return available_products;
    }

    function get_index(option) {
        return parseInt($(option).parents().first().attr('index'));
    }

    function set_prices_from_available_products(available_product_ids) {
        var prices = [];
        $.each(available_product_ids, function (idx, product_id) {
            prices.push(products_by_id[product_id].price);
        })
        prices = $.unique(prices).sort(function(a, b) {
            return to_f(a) < to_f(b) ? -1 : 1;
        });
        if (prices.length == 1) {
            $('#product-price .price .selling').html('<span class="price assumed">' + prices[0] + '</span>');
        } else {
            $('#product-price .price .selling').html('<span class="price from">' + prices[0] + '</span> - <span class="price to">' + prices[prices.length - 1] + '</span>');
        }
    }

    function update_options(selections_made) {
        // Go through everything up through the selected index and create set of available product ids.
        available_products = create_available_products(selections_made);

        // Iterate through the rest of the options and show/hide as necessary.
        for (var i = selections_made; i < selects.length; i++) {
            update_options_by_selections(selects[i], available_products);
        }

        // Now pretend like all selections have been made.
        available_products = create_available_products(selects.length);

        // Update variant images.
        try {
            show_variant_images(available_products);
        } catch (error) {
            console.log('ERROR: unable to switch to proper variant images');
        }

        // Update price.
        set_prices_from_available_products(available_products);

        // Update form elements for cart.
        if (available_products.length == 1) {
            var product = products_by_id[available_products[0]];
            $('#variant_id, form[data-form-type="variant"] input[name$="[variant_id]"]').val(product.id);
        } else {
            $('#variant_id, form[data-form-type="variant"] input[name$="[variant_id]"]').val('');
        }
    }

    function handle_selection(evt) {
        var selections_made = get_index(evt.target) + 1;
        update_options(selections_made);
    }

    $(document).ready(init);
    $('#product-variants').change(handle_selection);
};
