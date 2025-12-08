const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Uploads directory created at:', uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// File filter function
const fileFilter = function (req, file, cb) {
  checkFileType(file, cb);
};

// Error handling for file filter
const handleFileFilterError = function (err, req, res, next) {
  if (err) {
    return res.status(400).json({ msg: err });
  }
  next();
};

// Init upload with error handling
const upload = multer({
  storage: storage,
  limits: { fileSize: 200000000 }, // 200MB limit
  fileFilter: fileFilter,
});

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images or Videos Only!');
  }
}

module.exports = upload;
