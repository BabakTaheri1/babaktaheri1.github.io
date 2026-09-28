require 'json'
require 'nokogiri'

pages = {
  '' => [false, true],
  'publications' => [false, true],
  'projects' => [true, false],
  'cv' => [false, false],
  'news' => [false, false]
}

pages.each do |path, (math, zoom)|
  file = File.join('_site', path, 'index.html')
  doc = Nokogiri::HTML(File.read(file))
  scripts = doc.css('script[src]').map { |s| s['src'] }
  raise "#{path}: incorrect MathJax loading" unless scripts.any? { |s| s.include?('tex-mml-chtml') } == math
  raise "#{path}: incorrect zoom loading" unless scripts.any? { |s| s.include?('medium-zoom') } == zoom
  schema = doc.at_css('script[type="application/ld+json"]')
  raise "#{path}: missing schema" unless schema
  JSON.parse(schema.text)
  image = doc.at_css('meta[property="og:image"]')
  raise "#{path}: missing absolute sharing image" unless image && image['content'] == 'https://babaktaheri1.github.io/assets/img/social-preview.png'
  raise "#{path}: missing image alt text" unless doc.css('img:not([alt])').empty?
  doc.css('img.preview').each { |img| raise 'Publication image must be lazy' unless img['loading'] == 'lazy' }
  doc.css('[aria-controls]').each do |control|
    # Navbar uses Bootstrap's identifier too; every control needs a real target.
    raise "Missing control target #{control['aria-controls']}" unless doc.at_css("[id='#{control['aria-controls']}']")
  end
end

home = Nokogiri::HTML(File.read('_site/index.html'))
publications = Nokogiri::HTML(File.read('_site/publications/index.html'))
raise 'Publication search input missing' unless publications.at_css('input#bibsearch[aria-label]')
raise 'Profile must remain eager' unless home.at_css('.profile img')['loading'] == 'eager'
%w[blog books people repositories teaching].each do |path|
  raise "Template page still published: #{path}" if File.exist?("_site/#{path}/index.html")
end
raise 'Sharing card missing' unless File.exist?('_site/assets/img/social-preview.png')
puts 'Five main pages passed metadata, script loading, image, and control checks.'
