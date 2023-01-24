const Product = require('../models/product')

exports.getEditProduct = async (req, res) => {
    const id = req.params?.id ? req.params.id : ''
    if (id) {
        Product.findById(id)
            .then(product => {
                console.log(product)
                if (!product) return res.redirect('/admin/product-list')
                res.render('admin/edit-product', { title: 'Add Product', path: '/admin/add-product', product, id })
            })
            .catch(err => console.error(err))
    } else {
        res.render('admin/edit-product', { title: 'Add Product', path: '/admin/add-product', id })
    }
}

exports.postEditProduct = async (req, res) => {
    try {
        const id = req.body?.id ? req.body.id : ''
        const { title, price, description, imageUrl } = req.body

        if (id) {
            // Product.findByPk(id)
            //     .then(product => {
            //         product.title = title
            //         product.price = price
            //         product.description = description
            //         product.imageUrl = imageUrl
            //         return product.save()
            //     })
            //     .then(() => {
            //         console.log(`Product with id ${ id } updated`)
            //         res.redirect(`/admin/product-list`)
            //     })
            //     .catch(e => {
            //         throw e
            //     })
        } else {
            const product = new Product(title, price, description, imageUrl)
            product.save()
                .then(r => {
                    res.redirect(`/admin/add-product`)
                })
                .catch(console.error)
        }

    } catch (e) {
        console.error(e)
        res.redirect(`/admin/product-list`)
    }
}

exports.getProductList = async (req, res) => {
    Product.fetchAll()
        .then(products => {
            res.render('admin/product-list', { products, title: 'Admin Products', path: '/admin/product-list' })
        })
        .catch(console.error)
}
//
// exports.postDeleteProduct = async (req, res) => {
//     try {
//         const id = req.body?.id ? req.body.id : ''
//         Product.destroy({ where: { id } })
//             .then(() => {
//                 res.redirect(`/admin/product-list`)
//             })
//             .catch(e => {
//                 throw e
//             })
//     } catch (e) {
//         console.error(e)
//         res.redirect(`/admin/product-list`)
//     }
// }