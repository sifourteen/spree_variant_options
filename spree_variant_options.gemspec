# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "spree_variant_options/version"

Gem::Specification.new do |s|
  s.name        = "spree_variant_options"
  s.version     = 0.7
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Spencer Steffen", "Stephane Bounmy"]
  s.email       = ["spencer@citrusme.com", 'stephanebounmy@gmail.com']
  s.homepage    = "https://github.com/citrus/spree_variant_options"
  s.summary     = %q{Spree Variant Options is a simple spree extension that replaces the radio-button variant selection with groups of option types and values.}
  s.description = %q{Spree Variant Options is a simple spree extension that replaces the radio-button variant selection with groups of option types and values. Please see the documentation for more details.}

  s.rubyforge_project = "spree_variant_options"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  # Runtime
  s.add_dependency('spree_core', '~> 2.1.5')
  s.add_dependency('spree_api', '~> 2.1.5')
  s.add_dependency('spree_frontend', '~> 2.1.5')
  s.add_dependency('spree_backend',  '~> 2.1.5')

  # Development
  s.add_development_dependency('spree_sample',     '~> 2.1.5')
  s.add_development_dependency('dummier',          '~> 0.3')
  s.add_development_dependency('shoulda',          '~> 3.5')
  s.add_development_dependency('shoulda-context',  '~> 1.1.5')
  s.add_development_dependency('shoulda-matchers', '~> 2.0')
  s.add_development_dependency('rspec-rails', '~> 2.0')
  s.add_development_dependency('poltergeist', '~> 1.4.1')
  s.add_development_dependency('pry', '~> 0.9.12.2')
  s.add_development_dependency('m')
  s.add_development_dependency('factory_girl_rails', '~> 4.2.1')
  s.add_development_dependency('cucumber-rails',   '~> 1.4')
  s.add_development_dependency('database_cleaner', '~> 1.2.0')
  s.add_development_dependency('sqlite3',          '~> 1.3')
  s.add_development_dependency('coffee-rails',     '~> 4.0')
  s.add_development_dependency('capybara')
  s.add_development_dependency('launchy')
  s.add_development_dependency('debugger')
  s.add_development_dependency("selenium-webdriver", '2.35.1')
end
