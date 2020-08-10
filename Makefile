name=roguelike-browser-boilerplate

all: $(name).zip $(name)-documents.zip $(name)-discord-access.pdf

$(name).zip: index.html main.js style.css icon.png colored_tilemap_packed.png 01coin.gif bg.png $(name)-license-student-hobbyist.pdf
	mkdir -p $(name)
	cp $? $(name)
	zip -r $@ $(foreach f, $?, "$(name)/$(f)")
	rm -rf $(name)

$(name)-documents.zip: $(name).pdf $(name)-license-indie-professional.pdf
	mkdir -p $(name)-documents
	cp $? $(name)-documents
	zip -r $@ $(foreach f, $?, "$(name)-documents/$(f)")
	rm -rf $(name)-documents

$(name)-discord-access.pdf: discord.md print.css Makefile
	pandoc -f markdown --highlight-style=tango --css print.css $< -o "$(@:.pdf=.html)"
	chromium-browser --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf-no-header --print-to-pdf="$@" "$(@:.pdf=.html)" --virtual-time-budget=10000
	#wkhtmltopdf -L 0mm -R 0mm -T 20mm -B 0mm --zoom 2 discord.html $@
	rm -f "$(@:.pdf=.html)"

roguelike-browser-boilerplate.pdf: README.md print.css Makefile
	pandoc -f markdown --highlight-style=tango --css print.css $< -o "$(@:.pdf=.html)"
	chromium-browser --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf-no-header --print-to-pdf="$@" "$(@:.pdf=.html)" --virtual-time-budget=10000
	#wkhtmltopdf -L 0mm -R 0mm -T 20mm -B 20mm --zoom 2 README.html $@
	rm -f "$(@:.pdf=.html)"

$(name)-license-student-hobbyist.pdf: license-common.md license-student-hobbyist.md
	cat $? | pandoc -f markdown -t latex --highlight-style=tango --css print.css -o $@

$(name)-license-indie-professional.pdf: license-common.md license-indie-professional.md
	cat $? | pandoc -f markdown -t latex --highlight-style=tango --css print.css -o $@

.PHONY: watch serve browserstack clean

watch:
	while true; do $(MAKE) -q || $(MAKE); sleep 0.5; done

serve:
	php -S 0.0.0.0:8000

browserstack:
	BrowserStackLocal --key 9pLHVRg5npQmv96R5QEx

clean:
	rm -rf roguelike-browser-boilerplate*
