/**
 * Generate username with 6 random numbers
 * @returns {String} Generated 6-digit username
 */
const generateUsername = () => {
  // Generate a random 6-digit number (100000 to 999999)
  const username = Math.floor(100000 + Math.random() * 900000).toString();
  return username;
};

/**
 * Generate password with 6 random numbers
 * @returns {String} Generated 6-digit password
 */
const generatePassword = () => {
  // Generate a random 6-digit number (100000 to 999999)
  const password = Math.floor(100000 + Math.random() * 900000).toString();
  return password;
};

/**
 * Generate both username and password as 6-digit numbers
 * @returns {Object} Object containing username and password
 */
const generateCredentials = async () => {
  let username = generateUsername();
  let password = generatePassword();
  
  // Ensure username and password are different
  while (username === password) {
    password = generatePassword();
  }
  
  return {
    username,
    password
  };
};

module.exports = {
  generateUsername,
  generatePassword,
  generateCredentials
};
