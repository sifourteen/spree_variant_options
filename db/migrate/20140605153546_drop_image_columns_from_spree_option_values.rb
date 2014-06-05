class DropImageColumnsFromSpreeOptionValues < ActiveRecord::Migration
  def self.up
    drop_attached_file :spree_option_values, :image
  end

  def self.down
    add_add_attached_file :spree_option_values, :image
  end
end
