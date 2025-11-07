class HomeController {
  renderHomePage(req, res) {
    res.render('pages/index', { title: 'Home' });
  }

  renderStatsPage(req, res) {
    res.render('pages/stats', { title: 'Statistics' });
  }
}

module.exports = HomeController;
