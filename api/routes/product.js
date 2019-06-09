const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const Product = require("../models/product");
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
        cb(null, true);
    else 
        cb(null, false);  
}
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString() + file.originalname);
    }
})

const upload = multer({storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get("/", (req, res, next) => {
   Product.find()
   .select('price name _id productImage')
   .exec()
   .then(docs => {
       const response = {
        length: docs.length,
        product: docs.map(doc => {
            return {
                name: doc.name,
                price: doc.price,
                productImage: doc.productImage,
                _id: doc._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + doc._id
                }
            }
        })      
       } 
       console.log(docs);
       if(docs.length > 0)
        res.status(200).json(response);
       else
        res.status(404).json({
            message: "No Entries Found"
        })
   })
   .catch(err => {
       console.log(err);
       res.status(500).json({
           error: err
       });
   }); 
});

router.post("/", checkAuth, upload.single('productImage'), (req, res, next) => {
    var product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: "Created Product Successfully",
            productName: {
                name: result.name,
                price: result.price,
                productImage: result.productImage,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        });
    });
});

router.get("/:productId", checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
        console.log(doc);
        if(doc)
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'GET_ALL_PRODUCTS',
                    url: 'http://localhost:3000/products/'
                }
            });
        else
            res.status(404).json({
                message: "No Data Entry Found Provided by this User"
            })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    
});

router.patch("/:productId", checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body)
    {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "updated successfully",
            request: {
                type: "GET",
                url: 'http://localhost:3000/products/' + id
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
    
    
});

router.delete("/:productId", checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});

module.exports = router;