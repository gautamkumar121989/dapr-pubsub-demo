# Dapr pub/sub setup for ProductService and OrderService

## Prerequisites
- Dapr CLI installed
- Redis (or another supported pub/sub component) running

## How it works
- ProductService publishes messages to the 'orders' topic using Dapr pub/sub.
- OrderService subscribes to the 'orders' topic and processes messages.
- Dapr delivers messages to OrderService in a `{ data: ... }` envelope.

## Running with Dapr
Example (from workspace root):

```
dapr run --app-id productservice --app-port 3001 --dapr-http-port 3501 --resources-path ./components -- npm start --prefix ./ProductService

dapr run --app-id orderservice --app-port 3002 --dapr-http-port 3502 --resources-path ./components -- npm start --prefix ./OrderService

```

## Testing the Integration
- Use the provided `local-async-test.http` file to:
  - Check health of both services
  - Publish an order from ProductService
  - Verify OrderService receives and logs the order
- If you see repeated errors about "No data in pubsub event", clear the Redis stream with:
  - `redis-cli DEL orders` (from the Redis CLI)
  - Or use RedisInsight GUI to delete the `orders` stream


```

## Note
- A sample Dapr pubsub component file (`components/pubsub.yaml`) is included for Redis. Adjust `redisHost` and `redisPassword` as needed for your environment.
- See https://docs.dapr.io/developing-applications/building-blocks/pubsub/ for more details.

## Docker build

docker build -t productservice:latest .
docker build -t orderservice:latest .

## Run a container for ProductService from the built Docker image, mapping port 3001.

docker run -d -p 3001:3001 --name productservice productservice:latest

## Run a container for OrderService from the built Docker image, mapping port 3002.

docker run -d -p 3002:3002 --name orderservice orderservice:latest