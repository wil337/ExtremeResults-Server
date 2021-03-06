var express = require('express');
var moment = require('moment');

var routes = function (Outcome, Reflection, passport) {
    var relatedRouter = express.Router();

    var relatedForOutcomesController = require('../controllers/relatedForOutcomesController')(Outcome, Reflection, moment);
    var relatedForReflectionsController = require('../controllers/relatedForReflectionsController')(Outcome, Reflection, moment);

    relatedRouter.use(passport.authenticate('bearer', { session: false }));

    relatedRouter.route('/outcomes')
        .get(relatedForOutcomesController.get);

    relatedRouter.route('/reflections')
        .get(relatedForReflectionsController.get);

    return relatedRouter;
};

module.exports = routes;