CURRENT_DIRECTORY=$(shell pwd)
ENV_VARS=NODE_ENV=test
TEST_DIR=test/
MOCHA_BIN=./node_modules/.bin/_mocha
MOCHA_DEFAULT_OPTS=--recursive -t 180000
MOCHA_OPTS=-R spec

# Runs all tests
test:
	@$(eval TARGETS=$(filter-out $@,$(MAKECMDGOALS)))
	@$(eval TARGETS=$(TARGETS:test/%=%))
	@$(eval TARGETS=$(TARGETS:/%=%))
	@$(eval TARGETS=$(addprefix $(TEST_DIR),$(TARGETS)))
	@$(eval TARGET=$(shell [ -z $(firstword ${TARGETS}) ] && echo ${TEST_DIR}))
	@$(ENV_VARS) $(MOCHA_BIN) $(MOCHA_DEFAULT_OPTS) $(MOCHA_OPTS) $(TARGET) $(TARGETS)

.PHONY: test
