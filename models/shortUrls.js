const mongoose = require('mongoose');

const shortUrlSchema = new mongoose.Schema({
  slug: {
    type: String,
    validate: {
      validator: (v) => {
        return /^[\w\-]+$/i.test(v);
      },
      message: props => `${props.value} is not a valid slug`
    },
    required: false
  },
  url: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('ShortUrl', shortUrlSchema);