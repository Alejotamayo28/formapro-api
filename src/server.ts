import 'dotenv/config';
import { createApp } from './app';

const port = Number(process.env.PORT || 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`Payments dashboard API listening on http://localhost:${port}`);
  console.log(`OpenAPI docs available at http://localhost:${port}/docs after running npm run generate`);
});
