module.exports =  {
  jwtSecret: 'jaxonJwtSecret',
  db: {
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: '12345',
      database: '',
      connectTimeout: 60000,
    },
    listPerPage: 10,
  },
  factory: {
    url: 'https://pizza-factory.cs329.click',
    apiKey: '5b13490f56de42bfa1dff88f926c8e07',
  },
 };