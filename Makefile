name=roguelike-browser-boilerplate

all: $(name).zip private-video-coaching-ticket.pdf

$(name).zip: index.html main.js style.css icon.png colored_tilemap_packed.png 01coin.gif bg.png $(name).pdf $(name)-license-indie-professional.pdf
	mkdir -p $(name)
	cp $? $(name)
	zip -r $@ $(foreach f, $?, "$(name)/$(f)")
	rm -rf $(name)

#$(name)-documents.zip: $(name).pdf $(name)-license-indie-professional.pdf
#	mkdir -p $(name)-documents
#	cp $? $(name)-documents
#	zip -r $@ $(foreach f, $?, "$(name)-documents/$(f)")
#	rm -rf $(name)-documents

$(name)-private-coaching.pdf: $(name)-private-coaching.md print.css Makefile
	pandoc -f markdown --highlight-style=tango --css print.css $< -o "$(@:.pdf=.html)"
	chromium-browser --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf-no-header --print-to-pdf="$@" "$(@:.pdf=.html)" --virtual-time-budget=10000
	rm -f "$(@:.pdf=.html)"

$(name).pdf: README.md print.css Makefile
	pandoc -f markdown --highlight-style=tango --css print.css $< -o "$(@:.pdf=.html)"
	chromium-browser --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf-no-header --print-to-pdf="$@" "$(@:.pdf=.html)" --virtual-time-budget=10000
	rm -f "$(@:.pdf=.html)"

#$(name)-license-student-hobbyist.pdf: license-common.md license-student-hobbyist.md
#	cat $? | pandoc -f markdown -t latex --highlight-style=tango --css print.css -o $@

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
