.PHONY: build

ifeq ($(CORE_VERSION),)
CORE_VERSION := $(shell jq --raw-output .version ../package.json )
endif
build:
	docker build --build-arg REGISTRY_URL=https://npm.lisk.io --build-arg NODEJS_VERSION=$(shell cat ../.nvmrc ) --build-arg CORE_VERSION=$(CORE_VERSION) -t=lisk/core:$(CORE_VERSION) .
