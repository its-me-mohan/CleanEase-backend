const mongoose = require('mongoose');
const dbURI = process.env.MONGO_URI;;

mongoose.connect(dbURI, {
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  console.log('Database connection successful');
}).catch((err) => {
  console.error('Database connection error:', err);
});