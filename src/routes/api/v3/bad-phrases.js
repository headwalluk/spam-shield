const express = require('express');
const router = express.Router();
const badPhrasesModel = require('../../../models/badPhrasesModel');
const { requireAdmin } = require('../../../middleware/authz');

/**
 * @openapi
 * /api/v3/bad-phrases:
 *   get:
 *     summary: List bad phrases with pagination (administrator only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter by phrase substring (case-insensitive)
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     summary: Create a bad phrase (administrator only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phrase:
 *                 type: string
 *               score:
 *                 type: number
 *             required: [phrase]
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid input
 * /api/v3/bad-phrases/{id}:
 *   put:
 *     summary: Update a bad phrase
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phrase:
 *                 type: string
 *               score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a bad phrase
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: No Content
 *       404:
 *         description: Not found
 */

router.get('/', requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = (req.query.search || '').toString();
  try {
    const data = await badPhrasesModel.listPaged({ page, limit, search });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'failed to list phrases', detail: e.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { phrase, score } = req.body || {};
  if (!phrase || typeof phrase !== 'string') {
    return res.status(400).json({ error: 'phrase required' });
  }
  try {
    const created = await badPhrasesModel.create({ phrase: phrase.trim(), score });
    // Reload cache after creation so classification picks up the new phrase
    badPhrasesModel.loadCache().catch(() => {});
    return res.status(201).json(created);
  } catch (e) {
    if (/duplicate/i.test(e.message)) {
      return res.status(400).json({ error: 'phrase already exists' });
    }
    return res.status(500).json({ error: 'failed to create phrase', detail: e.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  // Check if phrase exists in DB
  const existing = await badPhrasesModel.findById(id);
  if (!existing) {
    return res.status(404).json({ error: 'not found' });
  }
  const { phrase, score } = req.body || {};
  try {
    const updated = await badPhrasesModel.update(id, { phrase, score });
    if (!updated) {
      return res.status(404).json({ error: 'not found' });
    }
    // Reload cache after update
    badPhrasesModel.loadCache().catch(() => {});
    return res.status(200).json(updated);
  } catch (e) {
    return res.status(500).json({ error: 'failed to update phrase', detail: e.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  // Check if phrase exists in DB
  const existing = await badPhrasesModel.findById(id);
  if (!existing) {
    return res.status(404).json({ error: 'not found' });
  }
  try {
    const deleted = await badPhrasesModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'not found' });
    }
    // Reload cache after deletion
    badPhrasesModel.loadCache().catch(() => {});
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: 'failed to delete phrase', detail: e.message });
  }
});

module.exports = router;
