const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const db = require('./db');

global.__root = __dirname + '/';

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());

app.get('/api', function (req, res) {
  res.status(200).send('API working...');
});

const AuthController = require(__root + 'Auth/AuthController');
app.use('/api/auth', AuthController);

const UserController = require(__root + 'app/User/UserController');
app.use('/api/user', UserController); 

const HistoryController = require(__root + 'app/History/HistoryController');
app.use('/api/history', HistoryController);

const MasterController = require(__root + 'app/Master/MasterController');
app.use('/api/master', MasterController);

const JewellerController = require(__root + 'app/Jeweller/JewellerController');
app.use('/api/jeweller', JewellerController);

const PurcahseController = require(__root + 'app/Purchase/PurchaseController');
app.use('/api/purchase', PurcahseController);

const InwardController = require(__root + 'app/Inward/InwardController');
app.use('/api/inward', InwardController);

const RedemptionController = require(__root + 'app/Redemption/RedemptionController');
app.use('/api/redemption', RedemptionController);

const PaymentController = require(__root + 'app/Payment/PaymentController');
app.use('/api/payment', PaymentController);

const ReclamationController = require(__root + 'app/Reclamation/ReclamationController');
app.use('/api/reclamation', ReclamationController);

const DashboardController = require(__root + 'app/Dashboard/DashboardController');
app.use('/api/dashboard', DashboardController);

const AdminController = require(__root + 'app/Admin/AdminController');
app.use('/api/admin', AdminController);

module.exports = app;
