const db = require('../db/knex');

class MessageModel {
  async createMessage({ content }) {
    const [id] = await db('messages').insert({ content, created_at: db.fn.now() });
    return id;
  }

  async getMessageById(id) {
    return db('messages').where({ id }).first();
  }

  async updateMessage(id, { content }) {
    await db('messages').where({ id }).update({ content, updated_at: db.fn.now() });
  }

  async deleteMessage(id) {
    await db('messages').where({ id }).del();
  }

  async getAllMessages() {
    return db('messages').select('*').orderBy('created_at', 'desc');
  }
}

module.exports = new MessageModel();
