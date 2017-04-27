module.exports = function (db) {
    return {
        requireAuthentication: function (req, resp, next) {
            var token = req.get('Auth');

            db.user.findByToken(token).then(function(user) {
                req.user = user;
                next();
            }, function() {
                resp.status(401).send();
            })
        }
    }
};
