import { createConnections } from 'typeorm';

createConnections().then(async connections => {
  await Promise.all(
    connections.map(async connection => {
      if (connection.name === 'default') {
        await connection.runMigrations();
      }
    }),
  );
});
