const express = require('express');
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

  server.get('/:slug', (req, res, next) => {
    const { slug } = req.params;
    
    ShortUrl.findOne({ slug })
    .then((su) => {
      res.redirect(su.url)
    }, (err) => next(err))
    .catch((err) => {
      next(err);
    })
  }); 
  
  server.post('/url', (req, res, next) => {
    let { slug, url } = req.body;
  
    const shortUrl = new ShortUrl();
    shortUrl.slug = slug;
    shortUrl.url = url;
  
    shortUrl.validate()
    .catch((err) => {
      next(err);
    });
  
    if(!slug) {
      slug = nanoid(5);
    }
    else {
      ShortUrl.findOne({ slug: slug })
      .catch((err) => {
        next(err);
      });
    }
  
    slug = slug.toLowerCase();
    
    ShortUrl.create({ slug: slug, url: url })
    .then((su) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(su);
    }, (err) => next(err))
    .catch((err) => {
      next(err);
    })
  });
  
  server.use((err, req, res, next) => {
    if (err.status) {
      res.status(err.status);
    }
    else {
      res.status(500);
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
