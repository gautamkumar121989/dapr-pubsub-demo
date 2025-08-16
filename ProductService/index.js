const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_PORT = process.env.DAPR_PORT || '3501';
app.use(express.json());

app.get('/', (req, res) => {
  res.send('ProductService is running!');
});

// Dapr publish endpoint
app.post('/publish', async (req, res) => {
  const { orderId, product } = req.body;
  try {
    
    const publishUrl = `http://${DAPR_HOST}:${DAPR_PORT}/v1.0/publish/pubsub/orders`;
    const response = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, product })
    });
    if (response.ok) {
      console.log('Order published:', orderId, product);
      res.status(200).send('Order published');
    } else {
       console.log('Failed to publish order');
      res.status(500).send('Failed to publish order');
    }
  } catch (err) {
    console.log('Failed to publish order');
    res.status(500).send('Error: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`ProductService listening on port ${PORT}`);
});
