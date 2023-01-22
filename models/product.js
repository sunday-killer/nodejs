const fs = require('fs')
const path = require('path')
const rootDir = require('../helpers/path')

const filePath = path.join(rootDir, 'data', 'products.json')

const getProductsPromise = () => {
    return new Promise(resolve => {
        fs.readFile(filePath, (err, fileContent) => {
            if (err) return resolve([])
            resolve(JSON.parse(fileContent))
        })
    })
}

module.exports = class Product {
    constructor(title, imageUrl, description, price) {
        this.title = title
        this.imageUrl = imageUrl
        this.description = description
        this.price = price
    }

    save() {
        getProductsPromise().then(products => {
            products.push(this)
            fs.writeFile(filePath, JSON.stringify(products), err => {
                console.error(err)
            })
        })
    }

    static fetchAll() {
        return getProductsPromise()
    }

    static findByProductId(productId) {
        const index = productId - 1
        return getProductsPromise()
            .then(products => {
                try {
                    if (products[index] === undefined) {
                        throw Error(`Can't find product with id ${ products }`)
                    }
                    return products[index]
                } catch (e) {
                    alert(e.message)
                }
            })
            .catch(err => console.error(err))
    }
}