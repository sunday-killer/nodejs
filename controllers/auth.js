

exports.getAuth = (req, res, next) => {
    res.render('auth/login', {
        path: '/auth/login',
        title: 'Login'
    })
}