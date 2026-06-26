import app from './server/app.js';
import env from './server/config/env.js';

const PORT = env.port;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (${env.nodeEnv})`);
});
