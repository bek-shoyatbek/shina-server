import config from "../config/index.js";


export function getLogin(req, res, next) {
    res.render("login");
    return;
}


export function login(req, res, next) {
    try {
        if (req.body.username === config.adminLogin && req.body.password === config.adminPassword) {
            req.session.admin = true;
            res.status(200).send("Admin logged in");
            return;
        } else {
            res.status(401).send("Login or password is incorrect");
            return;
        }
    } catch (err) {
        next(err);
    }
}