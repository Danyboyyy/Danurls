const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const next = require('next');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');
var config = require('./config');
const { nanoid } = require('nanoid');

const ShortUrl = require('./models/shortUrls');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {

  const url = config.mongoUrl;
  const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

  connect.then((db) => {
    console.log('Connected correctly to Mongo server!');
  }, (err) => { console.log(err); });

  const server = express();

  server.use(helmet());
  server.use(morgan('tiny'));
  server.use(cors());
  server.use(express.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());

  const notFound = path.join(__dirname, 'pages/NotFound.js');

  server.get('/:slug', async (req, res, next) => {
    const { slug } = req.params;
    try {
      const found = await ShortUrl.findOne({ slug });
      if (found) {
        return res.redirect(found.url);
      }
      return res.status(404).sendFile(notFound);
    }
    catch (error) {
      return res.status(404).sendFile(notFound);
    }
  }); 
  
  server.post('/url', async (req, res, next) => {
    let { slug, url } = req.body;
    
    try {
      const shortUrl = new ShortUrl();
      shortUrl.slug = slug;
      shortUrl.url = url;

      await shortUrl.validate();

      if(!slug) {
        slug = nanoid(5);
      }
      else {
        const exists = await ShortUrl.findOne({ slug: slug });
        if (exists) {
          throw new Error('Slug already exists!');
        }
      }

      slug = slug.toLowerCase();

      const created = await ShortUrl.create({ slug: slug, url: url });

      if (created) {
        res.json(created);
      }
    }
    catch (error) {
      next(error);
    }
  });

  server.use((err, req, res, next) => {
    if (err.status) {
      res.statusCode = err.status;
    }
    else {
      res.statusCode = 500;
    }
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? 'aiuda' : err.stack
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`);
  })
})
