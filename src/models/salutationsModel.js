const db = require('../db/knex');

class SalutationsModel {
  constructor() {
    this._items = [];
    this._byId = new Map();
    this._byPhrase = new Map();
    this._lastReload = 0;
  }

  async reload() {
    const rows = await db('salutations').select('*').orderBy('phrase');
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

  async listPaged({ page = 1, limit = 10, search = '' }) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const q = (search || '').trim();
    const base = db('salutations');
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

  findById(id) {
    return this._byId.get(Number(id)) || null;
  }
  findByPhrase(phrase) {
    if (!phrase) {
      return null;
    }
    return this._byPhrase.get(phrase.toLowerCase()) || null;
  }
  getAll() {
    return this._items.slice();
  }

  async create({ phrase, score = 0 }) {
    const [id] = await db('salutations').insert({ phrase, score });
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
    await db('salutations').where({ id }).update(updates);
    await this.reload();
    return this.findById(id);
  }

  async remove(id) {
    await db('salutations').where({ id }).del();
    await this.reload();
  }
}

module.exports = new SalutationsModel();
