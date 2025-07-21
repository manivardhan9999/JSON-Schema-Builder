const mongoose = require('mongoose');

const SchemaData = new mongoose.Schema({
  title: String,
  description: String,
  schemaJson: Object,
}, { timestamps: true });

module.exports = mongoose.model('Schema', SchemaData);
