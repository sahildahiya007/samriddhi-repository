const users = [
  {
    id: 1,
    name: "Lukesh",
    username: "lukeshprime",
    // password: set via admin creation, not in code
    password: process.env.PRIME_ADMIN_PASSWORD || undefined, // Set at runtime, not in code
    email: "samriddhiproperties9@gmail.com",
    phone: "+91 9971647910",
    role: "prime-admin", // only id 1 is prime admin
  },
  {
    id: 2,
    name: "Jaide",
    username: "subadmin1",
    // password: "subpass1" (bcrypt hash below for security)
    password: "$2b$10$wQ8Qw8Qw8Qw8Qw8Qw8Qw8eQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Q", // replace with real bcrypt hash
    email: "jaide@example.com",
    phone: "+91 9876543211",
    role: "sub-admin",
  },
];

module.exports = users;
