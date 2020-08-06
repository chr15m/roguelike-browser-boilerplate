name=roguelike-browser-boilerplate

all: $(name).zip $(name).pdf


roguelike-browser-boilerplate.zip: index.html main.js style.css icon.png colored_tilemap_packed.png 01coin.gif bg.png roguelike-browser-boilerplate.pdf
	mkdir -p $(name)
	cp $? $(name)
	zip -r $@ $(foreach f, $?, "roguelike-browser-boilerplate/$(f)")
	rm -rf $(name)

roguelike-browser-boilerplate.pdf: README.md print.css
	pandoc -f markdown --css print.css $< -o README.html
	# chromium-browser --headless --disable-gpu --run-all-compositor-stages-before-draw --no-margins --print-to-pdf-no-header --print-to-pdf="$@" README.html --virtual-time-budget=10000
	wkhtmltopdf -L 0mm -R 0mm -T 20mm -B 0mm --zoom 2 README.html roguelike-browser-boilerplate.pdf
	rm README.html

.PHONY: watch clean

watch:
	while true; do $(MAKE) -q || $(MAKE); sleep 0.5; done

clean:
	rm -rf roguelike-browser-boilerplate.*
