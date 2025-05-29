// JSON Server with custom configuration
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add CORS headers
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Add custom routes before JSON Server router
server.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = router.db;
  
  // Find user by username and verify password (website field)
  const user = db.get('users').find({ username }).value();
  
  if (user && user.website === password) {
    res.jsonp({
      success: true,
      user: { 
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  } else {
    res.status(401).jsonp({ success: false, message: 'Invalid username or password' });
  }
});

server.post('/auth/register', (req, res) => {
  const { username, password, name, email } = req.body;
  const db = router.db;
  
  // Check if username already exists
  const existingUser = db.get('users').find({ username }).value();
  
  if (existingUser) {
    return res.status(400).jsonp({ success: false, message: 'Username already exists' });
  }
  
  // Create new user
  const users = db.get('users').value();
  const lastUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
  const newUser = {
    id: lastUserId + 1,
    name,
    username,
    email,
    website: password, // Using website field for password
    address: {
      street: "",
      suite: "",
      city: "",
      zipcode: "",
      geo: { lat: "", lng: "" }
    },
    phone: "",
    company: {
      name: "",
      catchPhrase: "",
      bs: ""
    }
  };
  
  // Add to db
  db.get('users').push(newUser).write();
  
  res.jsonp({
    success: true,
    user: { 
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email
    }
  });
});

// To handle POST, PUT and PATCH you need to use a body-parser
server.use(jsonServer.bodyParser);

// Add custom middleware for authentication check
server.use((req, res, next) => {
  // Skip authentication for specific routes
  if (req.path.startsWith('/auth/') || req.method === 'GET') {
    return next();
  }
  
  // For other routes, you could implement token-based authentication here
  // For now, we'll just pass through
  next();
});

// Use default router
server.use(router);

// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
  console.log(`API endpoints available at http://localhost:${port}`);
  console.log('Custom endpoints:');
  console.log('  POST /auth/login');
  console.log('  POST /auth/register');
  console.log('Standard JSON Server endpoints:');
  console.log('  GET /users');
  console.log('  GET /todos');
  console.log('  GET /posts');
  console.log('  GET /albums');
  console.log('  GET /photos');
  console.log('  GET /comments');
});