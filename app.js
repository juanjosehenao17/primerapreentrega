const express = require('express');
const fs = require('fs/promises');

const app = express();
const PORT = 8080;

app.use(express.json());


const productsRouter = express.Router();

productsRouter.get('/', async (req, res) => {
  try {
    const limit = req.query.limit;
    const productsData = await fs.readFile('products.json', 'utf8');
    const products = JSON.parse(productsData);

    if (limit) {
      return res.send(products.slice(0, limit));
    }

    res.send(products);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

productsRouter.get('/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    const productsData = await fs.readFile('products.json', 'utf8');
    const products = JSON.parse(productsData);

    const product = products.find(({ id }) => id === pid);
    if (product) {
      res.send(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

productsRouter.post('/', async (req, res) => {
  try {
    const newProduct = req.body;
    const productsData = await fs.readFile('products.json', 'utf8');
    const products = JSON.parse(productsData);

    
    newProduct.id = generateUniqueId();

    products.push(newProduct);
    await fs.writeFile('products.json', JSON.stringify(products, null, 2));

    res.status(201).send('Product added successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

productsRouter.put('/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    const updatedProduct = req.body;
    const productsData = await fs.readFile('products.json', 'utf8');
    let products = JSON.parse(productsData);

    const existingProductIndex = products.findIndex(({ id }) => id === pid);
    if (existingProductIndex !== -1) {
      products[existingProductIndex] = { ...products[existingProductIndex], ...updatedProduct };
      await fs.writeFile('products.json', JSON.stringify(products, null, 2));

      res.send('Product updated successfully');
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

productsRouter.delete('/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    const productsData = await fs.readFile('products.json', 'utf8');
    let products = JSON.parse(productsData);

    products = products.filter(({ id }) => id !== pid);
    await fs.writeFile('products.json', JSON.stringify(products, null, 2));

    res.send('Product deleted successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


const cartsRouter = express.Router();

cartsRouter.post('/', async (req, res) => {
  try {
    const newCart = req.body;
    newCart.id = generateUniqueId(); 

    const cartsData = await fs.readFile('carrito.json', 'utf8');
    const carts = JSON.parse(cartsData);

    carts.push(newCart);
    await fs.writeFile('carrito.json', JSON.stringify(carts, null, 2));

    res.status(201).send('Cart created successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

cartsRouter.get('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cartsData = await fs.readFile('carrito.json', 'utf8');
    const carts = JSON.parse(cartsData);

    const cart = carts.find(({ id }) => id === cid);
    if (cart) {
      res.send(cart);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const { quantity } = req.body;

    const cartsData = await fs.readFile('carrito.json', 'utf8');
    let carts = JSON.parse(cartsData);

    const existingCartIndex = carts.findIndex(({ id }) => id === cid);
    if (existingCartIndex !== -1) {
      const cart = carts[existingCartIndex];
      const existingProductIndex = cart.products.findIndex(({ product }) => product === pid);

      if (existingProductIndex !== -1) {
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        cart.products.push({ product: pid, quantity });
      }

      await fs.writeFile('carrito.json', JSON.stringify(carts, null, 2));

      res.send('Product added to cart successfully');
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

app.listen(PORT, () => {
  console.log(`Server is listening on port ${8080}`);
});
