Spree::Variant.class_eval do

  include ActionView::Helpers::NumberHelper

  def to_hash
    {
      :id    => self.id,
      :in_stock => self.in_stock?,
      :track_inventory => self.track_inventory,
      :backorderable => self.backorderable?,
      :price => self.display_price
    }
  end

end
