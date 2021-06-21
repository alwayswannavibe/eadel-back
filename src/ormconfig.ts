import {ConnectionOptions} from 'typeorm';

// TODO: use env file for it
const config: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'nestmed',
  password: 'asdas124TDysu',
  database: 'eadel'
};

export default config;
