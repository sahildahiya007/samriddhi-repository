const users = [
  {
    id: 1,
    name: "Lukesh",
    username: "lukeshprime",
    // bcrypt hash of the default admin password (K@9971647910)
    // Override by setting ADMIN_PASSWORD env var on the server
    password: "$2a$10$shV6FIgka8iHhRHUqP57P.wonVSk.yi91Hcs4c88Yb1FCMQh2DZZm",
    email: "samriddhiproperties9@gmail.com",
    phone: "+91 9971647910",
    role: "prime-admin", // only id 1 is prime admin
  },
  {
    id: 2,
    name: "Jaide",
    username: "subadmin1",
    // password: "subpass1" (bcrypt hash below for security)
    password: "$2a$10$BN31bQI4qfl/8rS1B.1Sj.97mA.sep/wLM4jhHJfgjX0T6yS1ludK",
    email: "jaide@example.com",
    phone: "+91 9876543211",
    role: "sub-admin",
  },
];

module.exports = users;
