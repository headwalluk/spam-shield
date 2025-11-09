const db = require('../db/knex');

/**
 * Bad Phrases lookup list.
 * Fully loaded into memory; supports reload and CRUD operations.
 */
class BadPhrasesModel {
  constructor() {
    this._items = []; // array of { id, phrase, score }
    this._byId = new Map();
    this._byPhrase = new Map();
    this._lastReload = 0;
  }

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

  async reload() {
    const rows = await db('bad_phrases').select('*').orderBy('phrase');
    this._items = rows.map((r) => ({ id: Number(r.id), phrase: r.phrase, score: Number(r.score) }));
    this._byId.clear();
    this._byPhrase.clear();
    for (const r of this._items) {
      this._byId.set(r.id, r);
      this._byPhrase.set(r.phrase.toLowerCase(), r);
    }
    this._lastReload = Date.now();
    return this._items;
  }

  getAll() {
    return this._items.slice();
  }

  findById(id) {
    return this._byId.get(Number(id)) || null;
  }

  findByPhrase(phrase) {
    if (!phrase) {
      return null;
    }
    return this._byPhrase.get(phrase.toLowerCase()) || null;
  }

  async create({ phrase, score = 0.5 }) {
    const [id] = await db('bad_phrases').insert({ phrase, score });
    await this.reload();
    return this.findById(id);
  }

  async update(id, { phrase, score }) {
    const updates = {};
    if (phrase !== undefined) {
      updates.phrase = phrase;
    }
    if (score !== undefined) {
      updates.score = score;
    }
    await db('bad_phrases').where({ id }).update(updates);
    await this.reload();
    return this.findById(id);
  }

  async remove(id) {
    await db('bad_phrases').where({ id }).del();
    await this.reload();
  }
}

module.exports = new BadPhrasesModel();
