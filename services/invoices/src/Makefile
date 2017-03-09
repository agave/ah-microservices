CURRENT_DIRECTORY=$(shell pwd)
ENV_VARS=NODE_ENV=test
TEST_DIR=test/
TEST_CODE_DIR=$(TEST_DIR)/init.test.js $(TEST_DIR)/unit/ $(TEST_DIR)/integration/
TEST_FUNCTIONAL_DIR=$(TEST_DIR)/init.test.js $(TEST_DIR)/functional/

ISTANBUL_BIN=./node_modules/.bin/istanbul cover -x "**/config/**"
ISTANBUL_CODE_OPTS=--dir ./unit_coverage
ISTANBUL_FUNCTIONAL_OPTS=--dir ./functional_coverage -x "**/vendor/**"
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

# Runs unit and integration tests and checks coverage
# Integration tests are run here to have better coverage visibility without complicating
# things with 3 types of reports.
unit-test:
	@$(eval TARGETS=$(filter-out $@,$(MAKECMDGOALS)))
	@$(eval TARGETS=$(TARGETS:test/%=%))
	@$(eval TARGETS=$(TARGETS:/%=%))
	@$(eval TARGETS=$(addprefix $(TEST_CODE_DIR),$(TARGETS)))
	@$(eval TARGET=$(shell [ -z $(firstword ${TARGETS}) ] && echo ${TEST_CODE_DIR}))
	@$(ENV_VARS) $(ISTANBUL_BIN) $(ISTANBUL_CODE_OPTS) $(MOCHA_BIN) -- $(MOCHA_DEFAULT_OPTS) $(MOCHA_OPTS) $(TARGET) $(TARGETS)

# Runs functional tests and checks coverage
functional-test:
	@$(eval TARGETS=$(filter-out $@,$(MAKECMDGOALS)))
	@$(eval TARGETS=$(TARGETS:test/%=%))
	@$(eval TARGETS=$(TARGETS:/%=%))
	@$(eval TARGETS=$(addprefix $(TEST_FUNCTIONAL_DIR),$(TARGETS)))
	@$(eval TARGET=$(shell [ -z $(firstword ${TARGETS}) ] && echo ${TEST_FUNCTIONAL_DIR}))
	@$(ENV_VARS) $(ISTANBUL_BIN) $(ISTANBUL_FUNCTIONAL_OPTS) $(MOCHA_BIN) -- $(MOCHA_DEFAULT_OPTS) $(MOCHA_OPTS) $(TARGET) $(TARGETS)

.PHONY: test unit-test functional-test
