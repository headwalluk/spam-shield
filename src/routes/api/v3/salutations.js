const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../../middleware/authz');
const salutationsModel = require('../../../models/salutationsModel');

/**
 * @openapi
 * /api/v3/salutations:
 *   get:
 *     summary: List salutations with pagination (administrator only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     summary: Create a salutation (administrator only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phrase: { type: string }
 *               score: { type: number }
 *             required: [phrase]
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid input }
 * /api/v3/salutations/{id}:
 *   put:
 *     summary: Update a salutation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *   delete:
 *     summary: Delete a salutation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/', requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = (req.query.search || '').toString();
  try {
    const data = await salutationsModel.listPaged({ page, limit, search });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'failed to list salutations', detail: e.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { phrase, score } = req.body || {};
  if (!phrase || typeof phrase !== 'string') {
    return res.status(400).json({ error: 'phrase required' });
  }
  try {
    const created = await salutationsModel.create({ phrase: phrase.trim(), score });
    // Reload cache after creation so classification picks up the new phrase
    salutationsModel.loadCache().catch(() => {});
    res.status(201).json(created);
  } catch (e) {
    if (/duplicate|UNIQUE/i.test(e.message)) {
      return res.status(400).json({ error: 'phrase already exists' });
    }
    res.status(500).json({ error: 'failed to create salutation', detail: e.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  // Check if salutation exists in DB
  const existing = await salutationsModel.findById(id);
  if (!existing) {
    return res.status(404).json({ error: 'not found' });
  }
  const { phrase, score } = req.body || {};
  try {
    const updated = await salutationsModel.update(id, { phrase, score });
    if (!updated) {
      return res.status(404).json({ error: 'not found' });
    }
    // Reload cache after update
    salutationsModel.loadCache().catch(() => {});
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'failed to update salutation', detail: e.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  // Check if salutation exists in DB
  const existing = await salutationsModel.findById(id);
  if (!existing) {
    return res.status(404).json({ error: 'not found' });
  }
  try {
    const deleted = await salutationsModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'not found' });
    }
    // Reload cache after deletion
    salutationsModel.loadCache().catch(() => {});
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'failed to delete salutation', detail: e.message });
  }
});

module.exports = router;
