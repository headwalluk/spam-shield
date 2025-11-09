const db = require('../db/knex');

/**
 * Unified Message model backed by message_log.
 * Provides simple CRUD used by the scaffolded /messages endpoints and
 * a logMessage method used by the classification pipeline.
 */
class MessageModel {
  // Scaffolded API: create a message entry (stores in message_log.message_body)
  async createMessage({ content }) {
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
    return db('message_log').where({ id }).first();
  }

  async updateMessage(id, { content }) {
    await db('message_log')
      .where({ id })
      .update({ message_body: content || '', event_time: db.fn.now() });
  }

  async deleteMessage(id) {
    await db('message_log').where({ id }).del();
  }

  async getAllMessages() {
    return db('message_log').select('*').orderBy('event_time', 'desc');
  }

  // Classification pipeline: log a fully-specified message classification event
  async logMessage({
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
    const [id] = await db('message_log').insert({
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
