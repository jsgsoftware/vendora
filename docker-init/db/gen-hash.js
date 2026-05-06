const bcrypt = require('bcrypt');
bcrypt.hash('user123', 12).then(h => {
  console.log('HASH:', h);
});
