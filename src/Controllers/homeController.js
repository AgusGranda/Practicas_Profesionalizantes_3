const homeController = {
  index: (req, res) => {
    res.redirect('/auth/login');
  }
};

module.exports = homeController;