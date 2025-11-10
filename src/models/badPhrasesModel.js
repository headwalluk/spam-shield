const db = require('../db/knex');

/**
 * Bad Phrases model.
 * - CRUD operations interact directly with the database for REST API endpoints.
 * - In-memory cache is maintained separately for fast classification lookups.
 */
class BadPhrasesModel {
  constructor() {
    // In-memory cache for classification (loaded via loadCache)
    this._cache = []; // array of { id, phrase, score }
    this._cacheByPhrase = new Map();
    this._lastCacheLoad = 0;
  }

  // ============================================
  // Database CRUD operations (for REST API)
  // ============================================

  /**
   * List bad phrases with pagination and optional search filter.
   * Queries the database directly.
   */
  async listPaged({ page = 1, limit = 10, search = '' }) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const q = (search || '').trim();
    const base = db('bad_phrases');
    if (q) {
      base.whereILike('phrase', `%${q}%`);
    }
    const [{ count }] = await base.clone().count('* as count');
    const total = Number(count) || 0;
    const items = await base
      .clone()
      .select('*')
      .orderBy('phrase')
      .limit(l)
      .offset((p - 1) * l);
    return {
      items: items.map((r) => ({ id: Number(r.id), phrase: r.phrase, score: Number(r.score) })),
      pagination: {
        currentPage: p,
        pageSize: l,
        total,
        totalPages: Math.max(1, Math.ceil(total / l))
      }
    };
  }

  /**
   * Fetch a single phrase by ID from the database.
   */
  async findById(id) {
    const row = await db('bad_phrases').where({ id }).first();
    if (!row) {
      return null;
    }
    return { id: Number(row.id), phrase: row.phrase, score: Number(row.score) };
  }

  /**
   * Create a new bad phrase in the database.
   * Does NOT automatically reload the cache; call loadCache() separately if needed.
   */
  async create({ phrase, score = 0.5 }) {
    const [id] = await db('bad_phrases').insert({ phrase, score });
    return this.findById(id);
  }

  /**
   * Update an existing bad phrase in the database.
   * Does NOT automatically reload the cache; call loadCache() separately if needed.
   */
  async update(id, { phrase, score }) {
    const updates = {};
    if (phrase !== undefined) {
      updates.phrase = phrase;
    }
    if (score !== undefined) {
      updates.score = score;
    }
    const count = await db('bad_phrases').where({ id }).update(updates);
    if (count === 0) {
      return null;
    }
    return this.findById(id);
  }

  /**
   * Delete a bad phrase from the database.
   * Does NOT automatically reload the cache; call loadCache() separately if needed.
   */
  async delete(id) {
    const count = await db('bad_phrases').where({ id }).del();
    return count > 0;
  }

  // ============================================
  // Cache management (for classification)
  // ============================================

  /**
   * Load all bad phrases into memory for fast classification lookups.
   * Call this at startup and after CRUD operations if you want immediate consistency.
   */
  async loadCache() {
    const rows = await db('bad_phrases').select('*').orderBy('phrase');
    this._cache = rows.map((r) => ({ id: Number(r.id), phrase: r.phrase, score: Number(r.score) }));
    this._cacheByPhrase.clear();
    for (const r of this._cache) {
      this._cacheByPhrase.set(r.phrase.toLowerCase(), r);
    }
    this._lastCacheLoad = Date.now();
    return this._cache.length;
  }

  /**
   * Get all cached phrases for classification.
   * Returns an empty array if cache not loaded yet.
   */
  getPhrasesForClassification() {
    return this._cache.slice();
  }

  /**
   * Check if a phrase exists in the cache (for classification).
   */
  findInCache(phrase) {
    if (!phrase) {
      return null;
    }
    return this._cacheByPhrase.get(phrase.toLowerCase()) || null;
  }
}

module.exports = new BadPhrasesModel();
