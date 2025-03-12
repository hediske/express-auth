// src/server.j
import { listen } from './app';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;

listen(PORT, () => {
    console.log(process.env)
  console.log(`Server is running on port ${PORT}`);
});
