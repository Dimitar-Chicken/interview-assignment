# Solution
Node.JS script, accepts user input SQL query or uses a default query. The script creates a MySQL database named `tempdb` running on `localhost` with username `user` and password `password`

## Usage
```
node index.js
```
or
```
node index.js [user query]
```
### Notes
The script does not check user input and does not use transactions/prepared statements, so SQL injections are a possible vulnerability.
MySQL was chosen as the database solution which requires the installation of the `mysql` npm package.
