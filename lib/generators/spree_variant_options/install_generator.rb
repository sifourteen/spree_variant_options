module SpreeVariantOptions
  module Generators
    class InstallGenerator < Rails::Generators::Base

      desc "Installs required migrations for spree_essentials"

      def copy_migrations
        rake "spree_variant_options:install:migrations"
      end

      def add_javascripts
        append_file "app/assets/javascripts/spree/frontend/all.js", "\n//= require spree/frontend/spree_variant_options\n"
      end

      def add_stylesheets
        inject_into_file "app/assets/stylesheets/spree/frontend/all.css", "\n*= require spree/frontend/spree_variant_options\n", :before => /\*\//, :verbose => true
        inject_into_file "app/assets/stylesheets/spree/backend/all.css", "\n*= require spree/backend/spree_variant_options\n", :before => /\*\//, :verbose => true
      end

    end
  end
end
