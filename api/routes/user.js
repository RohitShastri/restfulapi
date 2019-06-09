const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email}).exec()
    .then(doc => {
        if(doc.length >= 1){
            return res.status(409).json({
                message: 'E-mail already exists'
            });
        } else{
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    res.status(404).json(err);
                }
                else {
                    const user = new User({
                        _id: mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                    .then(result => {
                        res.status(201).json({
                            message: "user created"
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    })
                }
            });
        }
    })
});

/* router.post("/signup", (req, res, next) => {
    bcrypt.hash(req.body,password, 10, (err, hash) => {
        if(err)
        {
            res.status(404).json({
                error: err
            });
        } else {
            const user = new User({
                _id: mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
            });
            user.save()
            .then(result => {
                console.log(result);
                res.status(201).json({
                    message: 'user created'
                });
            })
            .catch(err => {
                res.status(500).json({
                    message: 'helo',
                    error: err
                });
            })
        }
    })   
}); */

router.post('/login', (req, res, next) => {
    User.find({email: req.body.email}).exec()
    .then(user => {
        if(user.length < 1) {
            return res.status(404).json({
                message: "Auth Failed"
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                res.status(200).json({
                    message: "Auth failed"
                });
            }
            if(result){
                const token = jwt.sign(
                    {
                        email: user[0].email,
                        userId: user[0]._id
                    },
                    process.env.MONGO_ATLAS_PW,
                    {
                        expiresIn: "1h"
                    }
                );
                return res.status(200).json({
                    message: "Auth Successful",
                    token: token
                });    
            }
            res.status(404).json({
                message: "Auth failed"
            });
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

router.delete('/:userId', (req, res, next) => {
    User.remove({_id: req.params.userId}).exec()
    .then(result => {
        res.status(200).json({
            message: 'User Deleted'
        });
    })
    .catch(err => {
        res.status(500).json({
            message: 'User not found :(',
            error: err
        })
    })
});
module.exports = router;