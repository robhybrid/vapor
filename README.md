installation:

`npm install`

set up keys:

`cd server/keys`

`openssl genrsa -des3 -out server.key 1024`

`openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt`

see http://www.akadia.com/services/ssh_test_certificate.html for details.



put clips in client/assets/video

run `grunt serve`

mash some keys (starting with 'Q').

<<<<<<< HEAD
=======
Yo!!
>>>>>>> 36669e3a63f508a4b381d1520f0540a778faecc3
