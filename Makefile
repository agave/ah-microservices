CURRENT_DIRECTORY=$(shell pwd)

BASE_COMPOSE=-f $(CURRENT_DIRECTORY)/docker-compose.yml
DEV_COMPOSE=$(BASE_COMPOSE) -f $(CURRENT_DIRECTORY)/docker-compose.dev.yml
TEST_COMPOSE=$(BASE_COMPOSE) -f $(CURRENT_DIRECTORY)/docker-compose.test.yml
E2E_COMPOSE=$(BASE_COMPOSE) -f $(CURRENT_DIRECTORY)/e2e-tests/docker-compose.yml
DEV_E2E_COMPOSE=$(E2E_COMPOSE) -f $(CURRENT_DIRECTORY)/e2e-tests/docker-compose.dev.yml

# Build services or build single service with service=name
build:
	@docker-compose $(BASE_COMPOSE) build $(service)

# Ssh into service container
bash:
	@docker-compose $(BASE_COMPOSE) exec $(service) /bin/bash

# Test current build of a service
test:
	@docker-compose $(TEST_COMPOSE) -f $(CURRENT_DIRECTORY)/services/$(service)/docker-compose.test.yml build $(service) > /dev/null
	@docker-compose $(TEST_COMPOSE) -f $(CURRENT_DIRECTORY)/services/$(service)/docker-compose.test.yml run $(service)
	@docker-compose $(TEST_COMPOSE) down

# Destroy test environment
test-down:
	@docker-compose $(BASE_COMPOSE) down

# Run e2e tests
e2e:
	@docker-compose $(E2E_COMPOSE) build e2e-tests > /dev/null
	@docker-compose $(E2E_COMPOSE) run e2e-tests
	@docker-compose $(E2E_COMPOSE) down

# Lift dev environment
e2e-dev:
	@docker-compose $(DEV_E2E_COMPOSE) up

# Destroy e2e environment
e2e-down:
	@docker-compose $(E2E_COMPOSE) down

# Ssh into dev environment
e2e-bash:
	@docker-compose $(DEV_E2E_COMPOSE) exec e2e-tests /bin/bash

# Lift dev environment or single service with service=name
dev:
	@docker-compose $(DEV_COMPOSE) -f $(CURRENT_DIRECTORY)/services/$(service)/docker-compose.dev.yml up $(service)

# Destroy dev environment
dev-down:
	@docker-compose $(DEV_COMPOSE) down

# Logs
logs:
	@docker-compose $(BASE_COMPOSE) logs $(service)
