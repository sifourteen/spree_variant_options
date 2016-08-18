$.intersect = function(a, b) {
  if(a instanceof Array) {
    return a.filter(function(n) {
      return b.indexOf(n) !== -1;
    });
  }

  var ck = $.intersect(Object.keys(a), Object.keys(b)),
      ret = {};

  for(var i = 0; i < ck.length; i++) {
    ret[ck[i]] = a[ck[i]];
  }

  return ret;
}

$.filterByKeys = function(k, o) {
  var ret = {};

  for(var i = 0; i < k.length; i++) {
    ret[k[i]] = o[k[i]];
  }

  return ret;
}

$.uniqueArray = function(a) {
  return a.reduce(function(p, c) {
    if (p.indexOf(c) < 0) p.push(c);
    return p;
  }, []);
};

function VariantOptions(options) {
  $.extend(this, options);

  this.$variants = null;
  this.$options = null;
  this.$clearOptions = null;

  this.$productPrice = null;
  this.$submitButtons = null;

  this.$dataStore = null;

  this.selection = [];
  this.lastRowSelected = 0;

  $(document).ready(this.init.bind(this));
}

VariantOptions.prototype.init = function() {
  var self = this;

  this.$variants = $('.variant-options');
  this.$options = this.$variants.find('.option-value');
  this.$clearOptions = this.$variants.find('.clear-option');

  this.$productPrice = $('#product-price .price');
  this.$submitButtons = $('#cart-form button[type=submit], form[data-form-type="variant"] button[type=submit]');

  this.$dataStore = $('#variant_id, form[data-form-type="variant"] input[name$="[variant_id]"]');

  this.$options.on('click', this.onClickOption.bind(this));
  this.$clearOptions.on('click', this.onClickClear.bind(this));

  this.$thumbList = $('#product-thumbnails');
  this.$thumbs = this.$thumbList.find('.vtmb, .tmb-all');

  this.reset();

  if(this.defaultInStock) {
    this.$variants
      .find('.option-value.in-stock:first')
      .trigger('click');
  }
}

VariantOptions.prototype.reset = function() {
  this.selection = [];
  this
    .processRow(0)
    .updatePrice()
    .showVariantImages();

}

VariantOptions.prototype.lockRow = function(index) {
  var $variant = this.getVariantAt(index),
      $options = $variant.find('.option-value'),
      $clearOptions = $variant.find('.clear-option');

  $options
    .removeClass('in-stock out-of-stock selected')
    .addClass('locked');

  $clearOptions.addClass('hidden');
}

VariantOptions.prototype.processRow = function(index) {
  var self = this,
      $variant = this.$variants.filter('.index-' + index),
      $options = $variant.find('.option-value'),
      noSelection = !this.selection.length;

  this.lockRow(index);

  $options.each(function(i) {
    var $this = $(this),
        variantGroup = self.getVariantGroup(this.rel);

    if(noSelection) {
      if(self.variantGroupHasStock(variantGroup)) {
        $this
          .removeClass('locked')
          .addClass('in-stock');
      }
    }
    else {
      var commonVariants = self.getCommonVariants(variantGroup),
          hasStock = self.variantGroupHasStock(commonVariants),
          hasCommonVariant = Object.keys(commonVariants).length,
          addClass = hasStock ? 'in-stock' : hasCommonVariant ? 'out-of-stock' : '';

      $this.addClass(addClass); 

      if(hasStock || hasCommonVariant) {
        $this.removeClass('locked');
      }
    }
  });

  var isLastRow = index === this.$variants.length || $options.filter('.locked').length === $options.length

  if(isLastRow) {
    this.$dataStore.val(this.selection[0]);
    this.$submitButtons.attr('disabled', false);
  }
  else {
    this.$dataStore.val('');
    this.$submitButtons.attr('disabled', true);
  }
  
  var i = index + 1;

  while(i < this.$variants.length) {
    this.lockRow(i++);
  }

  return this;
}

VariantOptions.prototype.updateSelection = function($option) {
  var $parent = $option.parents('.variant-options'),
      index = this.getVariantIndex($parent),
      variantGroup = this.getVariantGroup($option[0].rel),
      commonVariants = $.intersect(this.selection, Object.keys(variantGroup));

  if(index) {
    var i = 0;

    this.selection = [];

    while(i <= index) {
      var $variant = this.getVariantAt(i),
          $selectedOption = $variant.find('.option-value.selected');
      
      variantGroup = this.getVariantGroup($selectedOption[0].rel);
      commonVariants = $.intersect(this.selection, Object.keys(variantGroup));

      this.selection = commonVariants.length ? commonVariants : Object.keys(variantGroup);

      i++;
    }
  }
  else {
    this.selection = Object.keys(variantGroup);
  }

  this
    .updatePrice($.filterByKeys(this.selection, variantGroup))
    .showVariantImages(this.selection)
    .processRow(index + 1);

  return this;
}

VariantOptions.prototype.updatePrice = function(variantGroup) {
  var prices = [],
      html;

  if(!this.$variants.find('.option-value.selected').length) {
    this.$productPrice
      .addClass('no-variant-selected')
      .html(this.i18n.variant_options_select);
  }
  else {
    this.$productPrice.removeClass('no-variant-selected');

    for(var i in variantGroup) {
      prices.push(variantGroup[i].price);
    }

    prices = $.uniqueArray(prices);
    prices = prices.sort(function(a, b) { 
      a = parseFloat(a.substring(1));
      b = parseFloat(b.substring(1));

      if(a < b) {
        return -1;
      } 

      if(a > b) {
        return 1;
      }

      return 0;
    });

    html = prices.length > 1 ? '<span class="price-from">' + prices.shift() + '</span> - <span class="price-to>' + prices.pop() + '</span>' : prices[0];

    this.$productPrice.html(html);
  }

  return this;
}

VariantOptions.prototype.variantInStock = function(variant) {
  return variant.in_stock || variant.backorderable || !variant.track_inventory;
}

VariantOptions.prototype.variantGroupHasStock = function(group) {
  for(var i in group) {
    if(this.variantInStock(group[i])) {
      return true;
    }
  }

  return false;
}

VariantOptions.prototype.optionIsDisabled = function($option) {
  return $option.hasClass('locked') || $option.hasClass('out-of-stock');
}

VariantOptions.prototype.optionsIsSelectable = function($option) {
  return !$option.hasClass('selected') && !this.optionIsDisabled($option);
}

VariantOptions.prototype.getVariantGroup = function(rels) {
  var i, ids, obj, otid, ovid, opt, opv, variants = {};

  if (typeof rels === 'string') { 
    rels = [rels]; 
  }
  
  i = rels.length;
  
  try {
    while (i--) {
      ids = rels[i].split('-');
      otid = ids[0];
      ovid = ids[1];
      opt = this.options[otid];

      if (opt) {
        opv = opt[ovid];
        ids = Object.keys(opv);

        if (opv && ids.length) {
          var j = ids.length;

          while (j--) {
            obj = opv[ids[j]];

            if (obj && Object.keys(obj).length) {
              variants[obj.id] = obj;
            }
          }
        }
      }
    }
  } 
  catch(error) {}

  return variants;
}

VariantOptions.prototype.getVariantIndex = function($variant) {
  var className = $variant[0].className.match(/index-[0-9]/);

  return parseInt(className[0].split('-')[1]);
}

VariantOptions.prototype.getVariantAt = function(i) {
  return this.$variants.filter('.index-' + i);
}

VariantOptions.prototype.getCommonVariants = function(variantGroup) {
  var keys = $.intersect(this.selection, Object.keys(variantGroup));
  
  return $.filterByKeys(keys, variantGroup);
}

VariantOptions.prototype.showVariantImages = function(variantIds) {
  var $thumb;

  if(typeof variantIds === 'number') {
    variantIds = [variantIds];
  }

  this.$thumbList
    .children()
    .removeClass('selected');

  if(!variantIds) {
    $thumb = this.$thumbs.first(),
    $mainImage = $('#main-image');

    this.$thumbs.removeClass('hidden');
  }
  else {
    this.$thumbs.addClass('hidden');

    for(var i = 0; i < variantIds.length; i++) {
      var id = variantIds[i],
          $currentThumb = this.$thumbs.filter('.selected');

      this.$thumbs
        .filter('.tmb-all, .tmb-' + id)
        .removeClass('hidden');

      // if currently selected thumb does not belong to current variant, nor to common images,
      // hide it and select the first available thumb instead.
      if(!$currentThumb.hasClass('tmb-' + id)) {
        var $thumb = this.$thumbs.filter('.vtmb-' + id + ':first');
        
        if(!$thumb.length) {
          if(this.$thumbList.children().not('.hidden').length > 1) {
            $thumb = this.$thumbs.filter('.vtmb:visible:first');
          }
          else {
            $thumb = this.$thumbs.first();
          }
        }
      }
      else {
        $currentThumb.addClass('selected');
      }
    }
  }

  var newImg = $thumb.find('a').attr('href');
        
  $thumb.addClass('selected');
  
  $mainImage
    .find('img')
    .attr('src', newImg);

  $mainImage.data('selectedThumb', newImg);
  $mainImage.data('selectedThumbId', $thumb.attr('id'));

  return this;
}

VariantOptions.prototype.onClickOption = function(evt) {
  var $this = $(evt.currentTarget),
      $parent = $this.parents('.variant-options'),
      $siblings = $parent.find('.option-value'),
      $clear = $parent.find('.clear-option');

  evt.preventDefault();

  if(this.optionsIsSelectable($this)) {
    $siblings.removeClass('selected');
    
    $this.addClass('selected');

    $clear.removeClass('hidden');

    this.updateSelection($this);
  }
}

VariantOptions.prototype.onClickClear = function(evt) {
  var $this = $(evt.currentTarget),
      $prevParent = $this.parents('.variant-options').prev('.variant-options');

  evt.preventDefault();

  if(!$prevParent.length) {
    this.reset();
  }
  else {
    this.updateSelection($prevParent.find('.option-value.selected'));
  }
}