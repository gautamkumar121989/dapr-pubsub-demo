# Dapr pub/sub setup for ProductService and OrderService

## Prerequisites
- Dapr CLI installed
- Redis running

## How it works
- ProductService publishes messages to the 'orders' topic using Dapr pub/sub.
- OrderService subscribes to the 'orders' topic and processes messages.
- Dapr delivers messages to OrderService in a `{ data: ... }` envelope.

## Running locally

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

## Docker build

docker build -t productservice:latest .
docker build -t orderservice:latest .

## Run a container for ProductService from the built Docker image, mapping port 3001.

docker run -d -p 3001:3001 --name productservice productservice:latest

## Run a container for OrderService from the built Docker image, mapping port 3002.

docker run -d -p 3002:3002 --name orderservice orderservice:latest

## Running on Azure

1. Create Azure Resources

# Login to Azure
az login

# Create Resource Group
az group create --name dapr-demo-rg --location eastus

# Create Azure Container Registry
az acr create --name mydaprregistrycna --resource-group dapr-demo-rg --sku Basic
az acr login --name mydaprregistrycna

2. Build and Push Docker Images

cd ProductService
docker build -t mydaprregistrycna.azurecr.io/productservice:v1 .

# Build OrderService
cd ../OrderService
docker build -t mydaprregistrycna.azurecr.io/orderservice:v1 .

# Push ProductService to container registry
docker push mydaprregistrycna.azurecr.io/productservice:v1

# Push OrderService to container registry
docker push mydaprregistrycna.azurecr.io/orderservice:v1

3. create Azure cache for redis on portal or using provided bicep file
- Portal: Create "Azure Cache for Redis" and note hostname + primary key (password).
4. Create productservice ACA with dapr enabled on portal or using provided bicep file
5. Create orderservice ACA with dapr enabled on portal or using provided bicep file
6. Create secrets in the Container Apps environment (Portal)
- In the Container Apps Environment -> Settings -> Secrets -> Add secrets:
- redis-host = <redisHost>:6380 
- redis-password = <primaryKey>
7. Add Dapr component (pubsub) to the Container Apps environment
- Portal:
- In Container Apps Environment -> Dapr Components -> Add -> upload YAML.
- Use the workspace component file as a template: [`components/pubsub.yaml`](components/pubsub.yaml)
- Ensure metadata uses secretRef keys (`redis-host`, `redis-password`) — do not embed values.
8.  Deploy ProductService and OrderService to Azure Container Apps with Dapr enabled
- Portal:
- Create a Container App -> choose the environment created above -> specify image `<acrName>.azurecr.io/productservice:v1` -> set port (3001) -> enable Dapr -> set Dapr app id `productservice` and Dapr app port `3001` -> configure ingress.
- Repeat for `orderservice` with Dapr app id `orderservice` and port `3002`.
8. Publish the event using postman for productservice url. Refer screenshot doc file for more details.
9. Check the log of both ACA apps productservice and orderservice. Refer screenshot doc file for more details.

## Important configuration notes
- Dapr sidecar ports:
- Local: you used 3501/3502 for each app.
- ACA: Dapr HTTP API is on port 3500 for all apps; ensure `DAPR_PORT` usage in code or the app configuration matches ACA.

