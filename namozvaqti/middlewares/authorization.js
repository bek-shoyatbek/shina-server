
export default function authorizeUser(req, res, next) {
    if (req.session.admin) {
        next();
    }
    else {
        res.redirect(400, "/login");
    }
}