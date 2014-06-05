Spree::Admin::OptionTypesController.class_eval do

  create.before :set_viewable
  update.before :set_viewable

  private

    def set_viewable
      params[:option_type][:option_values_attributes].each do |key, value|
        if value[:image].present?
          value[:image] = Spree::Image.new(attachment: value[:image], viewable_type: "Spree::OptionValue", viewable_id: value[:id])
        end
      end
    end
end

