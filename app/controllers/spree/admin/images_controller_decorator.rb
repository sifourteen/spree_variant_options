Spree::Admin::ImagesController.class_eval do

  # Called in a before_filter
  def load_data
    # Replace the call to super with a direct implementation of spree_backend's load_data method.
    @product = Spree::Product.find_by_permalink(params[:product_id])
    @variants = @product.variants.collect do |variant|
      [variant.sku_and_options_text, variant.id]
    end
    @variants.insert(0, [Spree.t(:all), @product.master.id])

    @grouped_option_values ||= @product.option_values.group_by(&:option_type)
    @grouped_option_values.sort_by { |option_type, option_values| option_type.position }
  end

  # Called in a create.before
  def set_viewable
    viewable_id = params[:image][:viewable_id]

    if viewable_id.is_a?(Hash)
      @product.errors.add(:attachment, 'Erro')
      if viewable_id.keys.length > 1
        # For multiple options, take all the products then flatten them out.
        option_values_array = viewable_id.map {|option_type, option_values| option_values.map(&:to_i) }
        option_values_combinations = option_values_array.shift
        option_values_array.each do |option_value|
          option_values_combinations = option_values_combinations.product(option_value)
        end
        option_values_combinations = option_values_combinations.map(&:flatten) if option_values_combinations.count > 1
      else
        # If there's only one option, just make an array where each option is the only element of the array.
        option_values_combinations = Array.new
        viewable_id.values[0].each do |option_value|
          option_values_combinations << Array.new(1, option_value.to_i)
        end
      end

      @product.variants.each do |variant|
        option_values_combinations.each do |ov_combination|
          variant_option_ids = variant.option_values.pluck(:id)

          if ([ov_combination].flatten - variant_option_ids).empty?
            create_image(variant, permitted_resource_params)
          end
        end
      end
    else
      viewable_id = params[:master_option] if params[:master_option]
      @image.viewable_type = 'Spree::Variant'
      @image.viewable_id = viewable_id
    end
  end

  private

  def create_image(variant, image_attributes)
    image = Spree::Image.new(permitted_resource_params)
    image.viewable_type = 'Spree::Variant'
    image.viewable_id = variant.id
    variant.images << image
    variant.save
  end
end