const bcrypt = require('bcryptjs');

const hash = '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS';

bcrypt.compare('password123', hash).then(result => {
  console.log("Does password match?", result);
});