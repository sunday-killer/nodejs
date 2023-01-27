const adminData = require("../routes/admin");
const Product = require('../models/product')
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')

exports.getIndex = async (req, res) => {
    Product.find()
        .then(products => {
            res.render('shop/index', { products, title: 'Shop', path: '/' })
        })
        .catch(e => {
            console.error(e)
            const error = new Error(e)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getProducts = async (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/products', { products, title: 'Products', path: '/products' })

        })
        .catch(e => {
            console.error(e)
            const error = new Error(e)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getProductDetail = async (req, res, next) => {
    const { id } = req.params
    Product.findById(id)
        .then(product => {
            res.render('shop/product-detail', { title: `Product Detail | ${ product.title }`, path: '/product-detail', product })
        })
        .catch(e => {
            console.error(e)
            const error = new Error(e)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getCart = async (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        // .execPopulate()
        .then(user => {
            res.render('shop/cart', { title: 'Cart', path: '/cart', products:user.cart.items })
        })
        .catch(e => {
            console.error(e)
            const error = new Error(e)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.postCart = async (req, res, next) => {
    const { id } = req.body
    Product.findById(id)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(result => {
            res.redirect('/cart')
        })
}

exports.getOrders = async (req, res, next) => {
    Order.find({ 'user.id': req.user._id })
        .then(orders => {
            res.render('shop/orders', { title: 'Orders', path: '/orders', orders })
        })
        .catch(e => {
            console.error(e)
            const error = new Error(e)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getCheckout = async (req, res, next) => {
    res.render('shop/checkout', { title: 'Checkout', path: '/checkout' })
}

exports.postCartDelete = async (req, res) => {
    const { id } = req.body
    req.user.removeFromCart(id)
        .then(() => {
            res.redirect('/cart')
        })
        .catch(e => {
            console.error(e)
            res.redirect('/cart')
        })
}

exports.postCreateOrder = async (req, res) => {
    const { id } = req.body
    const products = req.user
        .populate('cart.items.productId')
        // .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => ({
                quantity: i.quantity,
                product: {
                    ...i.productId._doc
                },
            }))

            const order = new Order({
                user: {
                    email: req.user.email,
                    id: req.user._id
                },
                products
            })

            return order.save()
        })
        .then(() => {
            return req.user.clearCart()
        })
        .then(() => {
            res.redirect('/orders')
        })
        .catch(e => {
            console.error(e)
            const error = new Error(e)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getInvoice = (req, res, next) => {
    const { orderId } = req.params
    Order.findById(orderId)
        .then(o => {
            if (!o) return next(new Error('No order found'))
            if (o.user.id.toString() !== req.user._id.toString()) return next(new Error('Unauthorized'))

            const invoiceName = `invoice-${ orderId }.pdf`
            const invoicePath = path.join('data', 'invoices', invoiceName)
            /*
            * Streamin' response data
            * better than reading in to the memory
            * */
            const file = fs.createReadStream(invoicePath)
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `attachment; filename="${ invoiceName }"`)
            /*
            * using that file read stream
            * and forward data that is read in that stream
            * to response (cause res object is a writable stream)
            * can use readable streams to pipe their output in to writable stream
            * */
            file.pipe(res)
        })
        .catch(e => next(e))
}