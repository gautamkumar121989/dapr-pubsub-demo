const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ type: 'application/*+json' }));

const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => {
  res.send('OrderService is running!');
});

// Dapr pub/sub subscription endpoint
app.post('/orders', (req, res) => {
  // Dapr delivers the event in { data: ... } envelope
  const payload = req.body.data;
  if (payload.orderId === "") {
      console.log('Error: Received empty orderId');
      res.sendStatus(400);
  }
  else {
    console.log('Received order:', payload.orderId, payload.product);
    res.sendStatus(204);
  }
  
});

// Dapr subscription declaration
app.get('/dapr/subscribe', (req, res) => {
  res.json([
    {
      pubsubname: 'pubsub',
      topic: 'orders',
      route: 'orders'
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`OrderService listening on port ${PORT}`);
});
