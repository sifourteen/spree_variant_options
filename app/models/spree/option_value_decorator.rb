Spree::OptionValue.class_eval do

  has_one :image, as: :viewable, dependent: :destroy, class_name: "Spree::Image"

  def has_image?
    image.present?
  end

  default_scope { order("#{quoted_table_name}.position") }
  scope :for_product, lambda { |product| select("DISTINCT #{table_name}.*").where("spree_option_values_variants.variant_id IN (?)", product.variant_ids).joins(:variants) }
end
