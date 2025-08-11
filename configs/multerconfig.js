const multer = require('multer');
const path = require('path');
const crypto = require('crypto');


const storagepost = multer.diskStorage({
    destination : function (req, file, cb) {
      cb(null, './public/images/postimages')
    },
    filename : function (req, file, cb) {
        crypto.randomBytes(12,function(err,bytes){
            const fn = bytes.toString('hex')+path.extname(file.originalname)
            cb(null,fn)
        })
    }
  })

  const storageprofile = multer.diskStorage({
    destination : function (req, file, cb) {
      cb(null, './public/images/profileimages')
    },
    filename : function (req, file, cb) {
        crypto.randomBytes(12,function(err,bytes){
            const fn = bytes.toString('hex')+path.extname(file.originalname)
            cb(null,fn)
        })
    }
  })
  
  const uploadpost = multer({ storage: storagepost })
  const uploadprofile = multer({ storage: storageprofile })

  module.exports = {uploadpost, uploadprofile};