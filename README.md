# Agave Lab After Hours microservices demo

[Docs](/docs/README.md)

## Build docker images

```
make build // build all services
make build service=name // build a single service
```

## Run dev environment

```
make dev // bring dev environment up
make dev service=name // bring up a specific service and dependencies in dev mode
make bash service=name // ssh into a service container
make dev-down // bring down and clean dev environment
```

## Run tests

```
make test service=name // brings service up, runs tests and clean up
make test-down // clean test environment if needed
make e2e // run e2e tests
make e2e-down // clean e2e environment
```
