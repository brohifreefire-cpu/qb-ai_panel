// write-session-from-env.js
const fs = require('fs');
const session = process.env.SESSION_ID;

if (session) {
  fs.writeFileSync('./session.json', JSON.stringify({ session: session }));
  console.log("Session file created from environment variable.");
}

require('./index.js');
