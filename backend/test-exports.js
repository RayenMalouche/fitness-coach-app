// Test what's being exported from controllers
console.log('Testing controller exports...\n');

try {
  const authController = require('./src/controllers/authController');
  console.log('authController exports:', Object.keys(authController));
  console.log('register:', typeof authController.register);
  console.log('login:', typeof authController.login);
  console.log('getProfile:', typeof authController.getProfile);
} catch (error) {
  console.error('Error loading authController:', error.message);
}

console.log('\n---\n');

try {
  const clientController = require('./src/controllers/clientController');
  console.log('clientController exports:', Object.keys(clientController));
} catch (error) {
  console.error('Error loading clientController:', error.message);
}