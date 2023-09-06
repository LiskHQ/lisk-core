.PHONY: all clean release logs mrproper

EXPECTED_NODEJS_VERSION := $(shell cat .nvmrc)
RUNNING_NODEJS_VERSION := $(shell node --version)
ifneq ($(RUNNING_NODEJS_VERSION),v$(EXPECTED_NODEJS_VERSION))
$(error Wrong Node.js version: $(RUNNING_NODEJS_VERSION) (expected: v$(EXPECTED_NODEJS_VERSION)))
endif

CORE_VERSION := $(shell jq --raw-output .version package.json)
ifneq ($(findstring alpha,$(CORE_VERSION)),)
CORE_CHANNEL := alpha
else ifneq ($(findstring beta,$(CORE_VERSION)),)
CORE_CHANNEL := beta
else ifneq ($(findstring rc,$(CORE_VERSION)),)
CORE_CHANNEL := rc
else ifneq ($(findstring canary,$(CORE_VERSION)),)
CORE_CHANNEL := canary
endif

all: node_modules dist/index.js release

package-lock.json:
	git checkout package-lock.json
	touch -r npm-shrinkwrap.json package-lock.json

npm-shrinkwrap.json: package-lock.json
	cp -f package-lock.json npm-shrinkwrap.json

node_modules: npm-shrinkwrap.json
	yarn install --frozen-lockfile

dist/index.js: node_modules
	npm run build

ifndef $(CORE_VERSION)
release: dist/channels/$(CORE_CHANNEL)/lisk-core-v$(CORE_VERSION)

dist/channels/$(CORE_CHANNEL)/lisk-core-v$(CORE_VERSION):
	npx oclif-dev pack --targets=linux-x64,darwin-x64
else
release: dist/lisk-core-v$(CORE_VERSION)

dist/lisk-core-v$(CORE_VERSION):
	npx oclif-dev pack --targets=linux-x64,darwin-x64
endif

build: build-image build-local

build-image:
	docker buildx build -f ./docker/Dockerfile --build-arg NODEJS_VERSION=$(shell cat .nvmrc) --tag=lisk/core .

build-local:
	yarn install --frozen-lockfile
	npm run build

clean: clean-image clean-local

clean-image:
	docker rmi lisk/core; :

clean-local:
	rm -rf dist/ node_modules/

# Usage: make start ARGS="-n mainnet -l debug"
start: check-args
	docker run -d -p 7887:7887 -p 7667:7667 --name lisk-core --rm lisk/core start $(ARGS)

stop:
	docker stop lisk-core; :

logs:
	docker logs lisk-core

logs-live:
	docker logs lisk-core --follow

# Usage: make run ARGS="start --help"
run: check-args
	docker run --name lisk-core-temp --rm lisk/core $(ARGS)

check-args:
ifndef ARGS
	$(error ARGS is undefined)
endif

mrproper: stop clean
