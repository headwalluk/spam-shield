const db = require('../db/knex');

/**
 * Unified Message model backed by message_log.
 * Provides simple CRUD used by the scaffolded /messages endpoints and
 * a logMessage method used by the classification pipeline.
 */
class MessageModel {
  constructor() {
    this._useMemory = process.env.NODE_ENV === 'test';
    if (this._useMemory) {
      this._memory = []; // array of rows
      this._idCounter = 1;
    }
  }
  // Scaffolded API: create a message entry (stores in message_log.message_body)
  async createMessage({ content }) {
    if (this._useMemory) {
      const row = {
        id: this._idCounter++,
        sender_ip: '0.0.0.0',
        event_time: new Date().toISOString(),
        is_ham: false,
        is_spam: false,
        message_body: content || '',
        message_fields: null,
        classifiers: null,
        result: null,
        time_to_result: null,
        sender_country: null,
        user_id: null
      };
      this._memory.push(row);
      return Number(row.id);
    }
    const insert = {
      sender_ip: '0.0.0.0',
      // event_time defaults to now
      is_ham: false,
      is_spam: false,
      message_body: content || '',
      message_fields: null,
      classifiers: null,
      result: null,
      time_to_result: null,
      sender_country: null
    };
    const [id] = await db('message_log').insert(insert);
    return Number(id);
  }

  async getMessageById(id) {
    if (this._useMemory) {
      return this._memory.find((r) => r.id === Number(id)) || null;
    }
    return db('message_log').where({ id }).first();
  }

  async updateMessage(id, { content }) {
    if (this._useMemory) {
      const row = this._memory.find((r) => r.id === Number(id));
      if (row) {
        row.message_body = content || '';
        row.event_time = new Date().toISOString();
      }
      return;
    }
    await db('message_log')
      .where({ id })
      .update({ message_body: content || '', event_time: db.fn.now() });
  }

  async deleteMessage(id) {
    if (this._useMemory) {
      const idx = this._memory.findIndex((r) => r.id === Number(id));
      if (idx >= 0) {
        this._memory.splice(idx, 1);
      }
      return;
    }
    await db('message_log').where({ id }).del();
  }

  async getAllMessages() {
    if (this._useMemory) {
      return [...this._memory].sort((a, b) => new Date(b.event_time) - new Date(a.event_time));
    }
    return db('message_log').select('*').orderBy('event_time', 'desc');
  }

  /**
   * List messages for a specific user (dashboard usage).
   * Ordered by event_time DESC.
   * Pagination is 1-based.
   */
  async listByUser(userId, { page = 1, pageSize = 25, q } = {}) {
    const uid = Number(userId);
    if (!uid || Number.isNaN(uid)) {
      return { items: [], pagination: { currentPage: 1, pageSize, total: 0, totalPages: 0 } };
    }
    if (this._useMemory) {
      const qstr = (q || '').toLowerCase();
      const all = this._memory.filter((r) => {
        if (r.user_id !== uid) {
          return false;
        }
        if (!qstr) {
          return true;
        }
        const body = (r.message_body || '').toLowerCase();
        return body.includes(qstr);
      });
      const sorted = all.sort((a, b) => new Date(b.event_time) - new Date(a.event_time));
      const p = Math.max(1, Number(page) || 1);
      const size = Math.min(100, Math.max(1, Number(pageSize) || 25));
      const start = (p - 1) * size;
      const items = sorted.slice(start, start + size);
      return {
        items,
        pagination: {
          currentPage: p,
          pageSize: size,
          total: sorted.length,
          totalPages: Math.max(1, Math.ceil(sorted.length / size))
        }
      };
    }
    const p = Math.max(1, Number(page) || 1);
    const size = Math.min(100, Math.max(1, Number(pageSize) || 25));
    const offset = (p - 1) * size;
    const base = db('message_log').where({ user_id: uid });
    if (q && typeof q === 'string' && q.trim()) {
      base.andWhere('message_body', 'like', `%${q}%`);
    }
    const [{ count }] = await base.clone().count('* as count');
    const total = Number(count) || 0;
    const rows = await base
      .clone()
      .select('*')
      .orderBy('event_time', 'desc')
      .limit(size)
      .offset(offset);
    return {
      items: rows,
      pagination: {
        currentPage: p,
        pageSize: size,
        total,
        totalPages: Math.max(1, Math.ceil(total / size))
      }
    };
  }

  // Classification pipeline: log a fully-specified message classification event
  async logMessage({
    user_id,
    sender_ip,
    is_spam,
    is_ham,
    message_body,
    message_fields,
    classifiers,
    result,
    time_to_result,
    sender_country
  }) {
    if (this._useMemory) {
      const row = {
        id: this._idCounter++,
        user_id: user_id || null,
        sender_ip,
        is_spam: !!is_spam,
        is_ham: !!is_ham,
        message_body,
        message_fields: message_fields || null,
        classifiers: classifiers || null,
        result,
        time_to_result,
        sender_country,
        event_time: new Date().toISOString()
      };
      this._memory.push(row);
      return Number(row.id);
    }
    const [id] = await db('message_log').insert({
      user_id: user_id || null,
      sender_ip,
      is_spam: !!is_spam,
      is_ham: !!is_ham,
      message_body,
      message_fields: message_fields ? JSON.stringify(message_fields) : null,
      classifiers: classifiers ? JSON.stringify(classifiers) : null,
      result,
      time_to_result,
      sender_country
    });
    return Number(id);
  }
}

module.exports = new MessageModel();
