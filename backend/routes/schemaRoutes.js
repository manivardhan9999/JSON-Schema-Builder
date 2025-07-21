const express = require('express');
const router = express.Router();
const Schema = require('../models/SchemaModel');


router.post('/add', async (req, res) => {
  try {
    const schema = new Schema(req.body);
    await schema.save();
    res.status(201).json(schema);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const schemas = await Schema.find();
    res.json(schemas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
