# TODO: Replace MySQL with MongoDB in Backend

- [x] Update Backend/package.json: Remove mysql2 and sequelize dependencies, add mongoose
- [x] Update Backend/src/config/db.js: Replace Sequelize connection with Mongoose connection
- [x] Update Backend/src/models/Interview.js: Convert Sequelize model to Mongoose schema
- [x] Update Backend/src/controllers/nterviewController.js: Replace Sequelize methods with Mongoose equivalents (create, find, findById, updateOne, deleteOne)
- [x] Update Backend/server.js: Change database connection to use Mongoose connect instead of Sequelize authenticate/sync
- [x] Install new dependencies in Backend (npm install)
- [ ] Test the backend to ensure MongoDB connection and CRUD operations work
