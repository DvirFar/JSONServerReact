// JSON Server with custom configuration
import { create, router as _router, defaults, bodyParser } from 'json-server';
const server = create();
const router = _router('db.json');
const middlewares = defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
// For example: Authentication fake endpoints
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
  const lastUserId = db.get('users').maxBy('id').value().id;
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
server.use(bodyParser);

// Add custom middleware for authentication check
server.use((req, res, next) => {
  // You can implement authentication middleware here
  // For example, check for a token or user session
  next();
});

// Use default router
server.use(router);

// Start server
const port = 3001;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});