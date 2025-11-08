class HomeController {
  renderHomePage(req, res) {
    res.render('pages/index', { title: 'Home' });
  }

  renderStatsPage(req, res) {
    res.render('pages/stats', { title: 'Statistics' });
  }

  async renderApiKeysPage(req, res) {
    const apiKeys = await require('../models/apiKeyModel').listByUser(req.user.id);
    res.render('pages/api-keys', { title: 'API Keys', user: req.user, apiKeys });
  }
}

module.exports = HomeController;
