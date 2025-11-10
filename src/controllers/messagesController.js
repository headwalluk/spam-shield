const messageModel = require('../models/messageModel');
const classificationService = require('../services/classificationService');

class MessagesController {
  constructor() {
    this._useMemory = process.env.NODE_ENV === 'test';
    if (this._useMemory) {
      this._store = new Map();
      this._idCounter = 1;
    } else {
      this._model = messageModel;
    }

    // Bind methods for Express route handlers
    this.createMessage = this.createMessage.bind(this);
    this.getMessages = this.getMessages.bind(this);
    this.getMessageById = this.getMessageById.bind(this);
    this.updateMessage = this.updateMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
  }

  // no async init required for knex-backed model

  async createMessage(req, res) {
    try {
      // Support optional X-Caller header
      const caller = req.header('X-Caller') || null;
      const userId = req.user && req.user.id ? Number(req.user.id) : null;
      const body = req.body || {};
      // Sanitize inputs with defaults as requested
      const ip = typeof body.ip === 'string' ? body.ip : '';
      const message = typeof body.message === 'string' ? body.message : '';
      const fields =
        body && typeof body.fields === 'object' && body.fields !== null ? body.fields : {};
      const hints = body && typeof body.hints === 'object' && body.hints !== null ? body.hints : {};

      // Always use the classification pipeline; bypass in-memory scaffold for consistency
      const data = await classificationService.classifyAndLog({
        ip,
        fields,
        message,
        hints,
        caller,
        userId
      });
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to classify message', detail: err.message });
    }
  }

  async getMessages(req, res) {
    try {
      if (this._useMemory) {
        const rows = Array.from(this._store.values());
        return res.status(200).json(rows);
      } else {
        const rows = await this._model.getAllMessages();
        return res.status(200).json(rows);
      }
    } catch {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  async getMessageById(req, res) {
    try {
      const { id } = req.params;
      if (this._useMemory) {
        const row = this._store.get(Number(id));
        if (!row) {
          return res.status(404).json({ error: 'Message not found' });
        }
        return res.status(200).json({ id: Number(id), text: row.content });
      } else {
        const row = await this._model.getMessageById(id);
        if (!row) {
          return res.status(404).json({ error: 'Message not found' });
        }
        return res.status(200).json(row);
      }
    } catch {
      res.status(500).json({ error: 'Failed to fetch message' });
    }
  }

  async updateMessage(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      if (this._useMemory) {
        const existing = this._store.get(Number(id));
        if (!existing) {
          return res.status(404).json({ error: 'Message not found' });
        }
        existing.content = text;
        existing.updated_at = new Date();
        return res.status(200).json({ id: Number(id), text });
      } else {
        const existing = await this._model.getMessageById(id);
        if (!existing) {
          return res.status(404).json({ error: 'Message not found' });
        }
        await this._model.updateMessage(id, { content: text });
        return res.status(200).json({ id: Number(id), text });
      }
    } catch {
      res.status(500).json({ error: 'Failed to update message' });
    }
  }

  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      if (this._useMemory) {
        const existed = this._store.delete(Number(id));
        if (!existed) {
          return res.status(404).json({ error: 'Message not found' });
        }
        return res.status(204).send();
      } else {
        const existing = await this._model.getMessageById(id);
        if (!existing) {
          return res.status(404).json({ error: 'Message not found' });
        }
        await this._model.deleteMessage(id);
        return res.status(204).send();
      }
    } catch {
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }
}

module.exports = new MessagesController();
