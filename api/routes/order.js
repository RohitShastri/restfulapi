const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const checkAuth = require("../middleware/check-auth");

router.get("/", checkAuth, (req, res, next) => {
    Order.find()
    .select('_id product quantity')
    .populate('product', 'name price')
    .exec()
    .then(docs => {
        res.status(200).json({
            totalOrders: docs.length,
            order: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + doc.product
                    }
                }
            })
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});

router.post("/", checkAuth, (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if(!product)
        {
            return res.status(404).json({
                message: "Product not found :("
            })
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            product: req.body.productId,
            quantity: req.body.quantity
        });
        order.save()    
        return order;
    })
    .then(result => {
        res.status(200).json({
            message: "order created",
            order: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity,
                request: {
                    type: 'GET',
                    description: 'show all orders',
                    url: 'http://localhost:3000/orders'
                }
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            message: "Product not found :(",
            error: err
        });
    })
});

router.get("/:orderId", checkAuth, (req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product', 'name price')
    .exec()
    .then(result => {
        if(!result)
        {
            res.status(404).json({
                message: 'order not found :('
            });
        }
        res.status(200).json({
            _id: result._id,
            product: result.product,
            quantity: result.quantity,
            request: {
                type: 'GET',
                description: 'See all orders',
                url: 'http://localhost:3000/orders'
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            message: "order not found :(",
            error: err
        })
    })
});

router.delete("/:orderId", checkAuth, (req, res, next) => {
    Order.findByIdAndDelete(req.params.orderId)
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'order deleted',
            request: {
                type: 'POST',
                body: {productId: 'ID', quantity: 'Number'},
                url: 'http://localhost:3000/orders'
                
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Order Deleted',
            error: err
        });
    })
});


module.exports = router;