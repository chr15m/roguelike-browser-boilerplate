name=roguelike-browser-boilerplate

all: $(name)-hobbyist.zip $(name)-indie.zip $(name)-professional.zip

roguelike-browser-boilerplate-hobbyist.zip: index.html main.js style.css icon.png colored_tilemap_packed.png 01coin.gif bg.png
	mkdir -p $(name)-hobbyist
	cp $? $(name)-hobbyist
	zip -r $@ $(foreach f, $?, "roguelike-browser-boilerplate-hobbyist/$(f)")
	rm -rf $(name)-hobbyist

roguelike-browser-boilerplate-indie.zip: index.html main.js style.css icon.png colored_tilemap_packed.png 01coin.gif bg.png roguelike-browser-boilerplate.pdf
	mkdir -p $(name)-indie
	cp $? $(name)-indie
	zip -r $@ $(foreach f, $?, "roguelike-browser-boilerplate-indie/$(f)")
	rm -rf $(name)-indie

roguelike-browser-boilerplate-professional.zip: index.html main.js style.css icon.png colored_tilemap_packed.png 01coin.gif bg.png roguelike-browser-boilerplate.pdf DISCORD-ACCESS.txt
	mkdir -p $(name)-professional
	cp $? $(name)-professional
	zip -r $@ $(foreach f, $?, "roguelike-browser-boilerplate-professional/$(f)")
	rm -rf $(name)-professional

roguelike-browser-boilerplate.pdf: README.md print.css Makefile
	pandoc -f markdown --highlight-style=tango --css print.css $< -o README.html
	# chromium-browser --headless --disable-gpu --run-all-compositor-stages-before-draw --no-margins --print-to-pdf-no-header --print-to-pdf="$@" README.html --virtual-time-budget=10000
	wkhtmltopdf -L 0mm -R 0mm -T 20mm -B 0mm --zoom 2 README.html roguelike-browser-boilerplate.pdf
	#rm README.html

.PHONY: watch serve clean

watch:
	while true; do $(MAKE) -q || $(MAKE); sleep 0.5; done

serve:
	php -S 0.0.0.0:8000

clean:
	rm -rf roguelike-browser-boilerplate.*
