update:
	cd ./lib/SHIP-Probe; \
		git pull
	cd ./lib/rserve-js; \
		git pull
install:
	mkdir lib
	cd ./lib; \
		git clone https://github.com/cscheid/rserve-js.git
	cd ./lib/rserve-js; \
		npm install
	cd ./lib/rserve-js/tests; \
		npm install
	#cd ./lib; \
	#	git clone https://github.com/Powernap/SHIP-Probe.git
	npm install
	bower install
clean:
	rm -r ./lib
	rm -r ./node_modules
	# rm -r ./bower_components
	# cd ./three.js; \
	# 	git checkout .
test:
	cd ./lib/rserve-js/tests; \
		./run_all_tests.sh