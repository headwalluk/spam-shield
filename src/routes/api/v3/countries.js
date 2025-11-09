const express = require('express');
const router = express.Router();
const countryModel = require('../../../models/countryModel');
const { requireAuth, requireAdmin } = require('../../../middleware/authz');

/**
 * @swagger
 * /api/v3/countries:
 *   get:
 *     summary: List countries
 *     description: Returns all countries with their scores. Requires authentication.
 *     tags: [Countries]
 *     security:
 *       - ApiKeyAuth: []
 *       - SessionCookie: []
 *     responses:
 *       200:
 *         description: A list of countries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   country_code2: { type: string }
 *                   country_code3: { type: string, nullable: true }
 *                   name: { type: string }
 *                   score: { type: number }
 */
// GET /api/v3/countries - any authenticated user
router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const rows = await countryModel.listAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v3/countries/{code2}:
 *   get:
 *     summary: Get a single country
 *     description: Returns a single country by ISO alpha-2 code, with a flagUrl when available.
 *     tags: [Countries]
 *     security:
 *       - ApiKeyAuth: []
 *       - SessionCookie: []
 *     parameters:
 *       - in: path
 *         name: code2
 *         required: true
 *         schema: { type: string, minLength: 2, maxLength: 2 }
 *         description: ISO alpha-2 country code
 *     responses:
 *       200:
 *         description: Country record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 country_code2: { type: string }
 *                 country_code3: { type: string, nullable: true }
 *                 name: { type: string }
 *                 score: { type: number }
 *                 flagUrl: { type: string, nullable: true, description: "Path to SVG flag under /flags, or null for '??'" }
 *       404:
 *         description: Not found
 */
router.get('/:code2', requireAuth, async (req, res, next) => {
  try {
    const code2 = (req.params.code2 || '').toUpperCase();
    if (!code2 || code2.length !== 2) {
      return res.status(400).json({ error: 'invalid code2' });
    }
    const row = await countryModel.getByCode2(code2);
    if (!row) {
      return res.status(404).json({ error: 'not found' });
    }
    const base = require('../../../config').auth.baseUrl.replace(/\/$/, '');
    const flagUrl = code2 === '??' ? null : `${base}/flags/${code2.toLowerCase()}.svg`;
    res.json({ ...row, flagUrl });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v3/countries/{code2}:
 *   put:
 *     summary: Update a country (partial)
 *     description: Updates name, score, or code3 for a country. Admin only.
 *     tags: [Countries]
 *     security:
 *       - ApiKeyAuth: []
 *       - SessionCookie: []
 *     parameters:
 *       - in: path
 *         name: code2
 *         required: true
 *         schema: { type: string, minLength: 2, maxLength: 2 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               score: { type: number }
 *               country_code3: { type: string }
 *     responses:
 *       200:
 *         description: Updated country
 *       400:
 *         description: Invalid code2
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
// PUT /api/v3/countries/:code2 - admin only (partial updates allowed)
router.put('/:code2', requireAdmin, async (req, res, next) => {
  try {
    const code2 = (req.params.code2 || '').toUpperCase();
    const { name, score, country_code3 } = req.body || {};
    if (!code2 || code2.length !== 2) {
      return res.status(400).json({ error: 'invalid code2' });
    }
    const existing = await countryModel.getByCode2(code2);
    if (!existing) {
      return res.status(404).json({ error: 'not found' });
    }
    const nextRow = {
      country_code2: code2,
      name: typeof name === 'string' && name.trim() ? name.trim() : existing.name,
      score: typeof score === 'number' ? score : existing.score,
      country_code3:
        typeof country_code3 === 'string' && country_code3.trim()
          ? country_code3.trim()
          : existing.country_code3
    };
    await countryModel.upsert(nextRow);
    res.json(nextRow);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
