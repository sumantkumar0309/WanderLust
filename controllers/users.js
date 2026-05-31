const User = require("../models/user")

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs", { title: "Sign Up — WanderLust" });
};

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        console.log("Signup attmept for:", username, email);
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            console.log(registeredUser);
            req.flash("success", "Welcome to WanderLust!");
            res.redirect("/listings");
        });
    } catch (e) {
        console.error("SIGNUP ERROR:", e);
        req.flash("error", e.message);
        res.redirect("/login");
    }

};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs", { title: "Log In — WanderLust" });
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome to WanderLust! You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
}