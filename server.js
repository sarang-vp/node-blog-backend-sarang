const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');


// Middleware for parsing JSON requests
app.use(bodyParser.json());
// Set storage engine for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
// Enable all CORS requests
app.use(cors());
// Initialize multer upload middleware
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/productsDB", { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Create a product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: [String]
});

// Create a product model
const Product = mongoose.model('Product', productSchema);

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Set up static file serving
app.use(express.static('public'));

// Body-parser middleware
app.use(express.urlencoded({ extended: false }));

// Method-override middleware
app.use(methodOverride('_method')); // Add this line

app.use(express.json());
// Routes
app.get('/', (req, res) => {
  res.redirect('/products');
});

// Add product route
app.get('/products/add', (req, res) => {
  res.render('addProduct');
});

app.post('/products', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const images = req.files.map(file => file.filename);

    // Calculate MRP, discount, and shipping charge
    const MRP = parseFloat(price) * 1.18; // Assuming tax is 18%
    const discount = 0; // Replace 0 with your discount logic
    const shippingCharge = 0; // Replace 0 with your shipping charge logic
    const finalPrice = MRP - discount + shippingCharge;

    // Create a new product
    const product = new Product({
      name,
      description,
      price: finalPrice,
      images
    });

    // Save the product to the database
    await product.save();

    res.redirect('/products');
  } catch (err) {
    console.error('Error adding product:', err);
    res.redirect('/products');
  }
});

// Get all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('products', { products });
    // res.json()
  } catch (err) {
    console.error('Error retrieving products:', err);
    res.redirect('/');
  }
});

// Delete product
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error deleting product:', err);
    res.sendStatus(500);
  }
});
// ...

// Update product route
app.get('/products/:id/edit', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      res.render('editProduct', { product });
    } catch (err) {
      console.error('Error retrieving product:', err);
      res.redirect('/products');
    }
  });
  
  app.put('/products/:id', upload.array('images', 5), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price } = req.body;
      const images = req.files.map(file => file.filename);
  
      // Calculate MRP, discount, and shipping charge
      const MRP = parseFloat(price) * 1.18; // Assuming tax is 18%
      const discount = 0; // Replace 0 with your discount logic
      const shippingCharge = 0; // Replace 0 with your shipping charge logic
      const finalPrice = MRP - discount + shippingCharge;
  
      // Find the product by ID and update its information
      await Product.findByIdAndUpdate(id, {
        name,
        description,
        price: finalPrice,
        images
      });
  
      res.redirect('/products');
    } catch (err) {
      console.error('Error updating product:', err);
      res.redirect('/products');
    }
  });
  
  // ...
  
  const purchaseSchema = new mongoose.Schema({
    purchaseId: Number,
    cusId: String,
    package:[],
    amount: Number, 
    /* fromDate: Number,
    toDate: Number, */
    purchaseDate:Number,//added on 11-07-22
    status: String,//added on 11-07-2022
  });
  const Purchase = mongoose.model('Purchase', purchaseSchema);

  const packageSchema = new mongoose.Schema({
    packageId: Number,
    packageName: String,
    country: String,
    packageDuration: [
      {
        distributionPrice: Number,
        sellingPrice: Number,
        locPrice: Number,
        backupPrice: Number,
        duration:Number,
      },
    ],
    trialPeriod: Number,
    module: [{
      name:String,
      price:Number
    }],
    dataStatus: Boolean,
  });
  const Package = mongoose.model('Package', packageSchema);

  const customerSchema = new mongoose.Schema({
    customerId: Number, //added on 06-07-22
    companyCode: Number,
    name: String,
    mobile: String,
    companyName: String,
    username: String,
    password: String,
    salt: String,
    email: String,
    info: {
      firstName: String,
      lastName: String,
      companyType: String,
      buissinessEmailAddress: String,
      country: String,
      mobile: String,
      website: String,
    },
    countryCode: String, //added on 22-06-22 -> phone number code for every country
    db: [], //added on 1-07-2022 //edited on 05-07-22 to change type to array from string
    status: Boolean, //added on 06-07-22
    dataStatus: Boolean, //added on 06-07-22
  });

  const Customer = mongoose.model('Customer', customerSchema);

  const userSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    message:String,
    email: String
  });
  const users = mongoose.model('user', userSchema);
//api 

app.post('/addusers', async (req, res) => {
  console.log("first");
  try {
    const newUsers = req.body;
    console.log(req.body);
    const user = new users(newUsers);
  
    let data = await user.save();
    if (data){
      setTimeout(function() {
        return res.status(200).json(data);
        console.log('This printed after about 1 second');
      }, 5000);
   
    } else {
     return res.status(404).json();
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

app.post('/customers', async (req, res) => {
  try {
    const newCustomer = req.body;
    const customer = new Customer(newCustomer);
    const validationResult = customer.validateSync();
    if (validationResult) {
      return res.status(400).json({ error: validationResult.errors });
    }
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer.' });
  }
});

// GET endpoint to retrieve all customers
app.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve customers.' });
  }
});

// GET endpoint to retrieve a single customer by ID
app.get('/customers/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const customer = await Customer.findOne({ customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve customer.' });
  }
});

// POST endpoint for creating a new package
app.post('/packages', async (req, res) => {
  try {
    const newPackage = req.body;
    const package = await Package.create(newPackage);
    res.status(201).json(package);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create package.' });
  }
});

// GET endpoint to retrieve all packages
app.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve packages.' });
  }
});


// POST endpoint for creating a new purchase
app.post('/purchases', async (req, res) => {
  try {
    const newPurchase = req.body;
    const purchase = await Purchase.create(newPurchase);
    res.status(201).json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create purchase.' });
  }
});


// // GET endpoint to retrieve purchase, customer, and package details by cusId
// app.get('/purchases', async (req, res) => {
//   try {
//     console.log(req.body.cusId);
//     if(req.body.cusId ){
//        let arr = [];
//       let plans = await Purchase.find({ cusId: req.body.cusId });
//       console.log(plans);
//       if (plans.length > 0) {
//         let customer = await Customer.findOne({ _id: req.body.cusId });
//         // let country = customer.info ? customer.info.country : null;
//         for (let i = 0; i < plans.length; i++) {
//           for (let j = 0; j < plans[i].package.length; j++) {
//             let diff = plans[i].package[j].toDate - plans[i].package[j].fromDate;
//             let days = Math.ceil(diff / (1000 * 3600 * 24));
//             let package = await Package.findOne({
//               _id: plans[i].package[j].packageId,
//             });
//             // let packDur = package.packageDuration.find(
//             //   (x) => x._id == plans[i].package[j].packageDuration[0]
//             // );
//             let data = {
//               _id: plans[i]._id,
//               packageId: plans[i].package[j].packageId,
//               transId: "PUR" + plans[i].purchaseId,
//               // country,
//               packageType: package?.packageName,
//               // sellingPrice: packDur.sellingPrice,
//               validity: days,
//               purchaseDate:plans[i].purchaseDate,
//               status: days >= 0 ? "Active" : "Inactive",
//             };
//             arr.push(data);
//           }
//         }
//         if (arr.length > 0)
//         res.status(201).json(arr);
          
//         else return (res = { data: [], status: "STATUSCODES.NOTFOUND" });
//       } else {
//         return (res = { data: [], status: "STATUSCODES.NOTFOUND" });
//       }
//     }else{
//       return res={data:{msg:"Not acceptable"},status:"STATUSCODES.NOTACCEPTABLE"}
//     }
//     } catch (error) {
//       console.error(error);
//       return (res = {
//         data: { msg: "Internel server error" },
//         status: "STATUSCODES.ERROR",
//       });
//     }
// });

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


// module.exports.getMyplans = async (req) => {
//   try {
//   if(req.body.cusId ){
//      let arr = [];
//     let plans = await purchaseModel.find({ cusId: req.body.cusId });
//     if (plans.length > 0) {
//       let customer = await customerModel.findOne({ _id: req.body.cusId });
//       let country = customer.info ? customer.info.country : null;
//       for (let i = 0; i < plans.length; i++) {
//         for (let j = 0; j < plans[i].package.length; j++) {
//           let diff = plans[i].package[j].toDate - plans[i].package[j].fromDate;
//           let days = Math.ceil(diff / (1000 * 3600 * 24));
//           let package = await packageModel.findOne({
//             _id: plans[i].package[j].packageId,
//           });
//           let packDur = package.packageDuration.find(
//             (x) => x._id == plans[i].package[j].packageDuration[0]
//           );
//           let data = {
//             _id: plans[i]._id,
//             packageId: plans[i].package[j].packageId,
//             transId: "PUR" + plans[i].purchaseId,
//             country,
//             packageType: package?.packageName,
//             sellingPrice: packDur.sellingPrice,
//             validity: days,
//             purchaseDate: common_service
//               .prescisedateconvert(plans[i].purchaseDate)
//               .split(" ")[0],
//             status: days >= 0 ? "Active" : "Inactive",
//           };
//           arr.push(data);
//         }
//       }
//       if (arr.length > 0)
//         return (res = { data: arr, status: STATUSCODES.SUCCESS });
//       else return (res = { data: [], status: STATUSCODES.NOTFOUND });
//     } else {
//       return (res = { data: [], status: STATUSCODES.NOTFOUND });
//     }
//   }else{
//     return res={data:{msg:"Not acceptable"},status:STATUSCODES.NOTACCEPTABLE}
//   }
//   } catch (error) {
//     console.error(error);
//     return (res = {
//       data: { msg: "Internel server error" },
//       status: STATUSCODES.ERROR,
//     });
//   }
// };



// //-----------------------------------------

// //added on 05-06-2023
// module.exports.getMysinglePlans = async (req) => {
//   try {
//     let purchaseData = {};
//     let arr = [];
//     let ref = await purchaseModel.findOne({ _id: req.body._id });
//     console.log(ref.package.length);
//     if (ref) {
//       if(ref.package.length > 0) {
//         for (let i = 0; i < ref.package.length; i++) {
//           let packageId = ref.package[i].packageId;
//           let modules = [];
//           for (let j = 0; j < ref.package.modules.length; j++) {
//              let moduleId = ref.package.modules[j];
//              let packagemdl = await packageModel.findOne({ _id: packageId });
//              let moduledata = await packagemdl.module.findOne({_id: moduleId});
//              modules.push(moduledata);
//           }
//             purchaseData = {
//             typeOfErp: packagemdl.packageName,
//             packagePrice: ref.amount,
//             expirationDate: ref.package[i].toDate,
//             puchaseDate: ref.package[i].fromDate,
//             module: modules,
//           };
//           arr.push(purchaseData);
//         }
//         return (res = { data: arr, status: STATUSCODES.SUCCESS });
//       }
     
//     } else {
//       return (res = { data: {}, status: STATUSCODES.NOTFOUND });
//     }
//   } catch (error) {
//     console.error(error);
//     return (res = { status: STATUSCODES.ERROR, data: { error } });
//   }
// };







// module.exports.addCategory = async (req) => {
//   const { categoryModel } = conn.category(process.env.db);
//   let db = process.env.db;
//   try {
//     let res = {};
//     let IMAGEURL = "";
//     if (req.files) {
//       req.files.file.mv(
//         `./public/Images/Category/${req.body.categoryName}-` +
//           req.files.file.name
//       );
//       IMAGEURL =
//         `Images/Category/${req.body.categoryName}-` + req.files.file.name; //manipulated on 01-06-22 -> removed field FILEURL GLOBAL VARIABLE from this section
//     }
//     const categoryExist = await categoryModel.findOne({
//       categoryName: req.body.categoryName,
//       branchId: process.env.branchId, //added on 18-04-22->branchid initialisation
//     });
//     if (!categoryExist) {
//       let category = new categoryModel({
//         categoryName: req.body.categoryName,
//         type: req.body.type, //re assigned on 01-06-22 -> status field re assigned to type
//         imageUrl: IMAGEURL,
//         branchId:
//           req.decode.role == ROLES.USER
//             ? process.env.branchId
//             : req.body.branchId, //added on 04-03-22//edited on
//         status: true, //re assigned on 01-06-22 -> status field  re assigned as always true
//       });
//       let data = await category.save();
//       if (data) {
//         let lg = {
//           type: LOG.PROD_ADDCATEGORY,
//           emp_id: req.decode._id,
//           description: "add category",
//           link: {
//             url: URL.null,
//             api: API.null,
//           },
//         };
//         await settings_service.addLog(lg, db);
//         res = { data: data, status: STATUSCODES.SUCCESS };
//       } else {
//         res = { data: {}, status: STATUSCODES.UNPROCESSED };
//       }
//     } else {
//       /*edited on 21-04-22-> else case modified to avoid redundency and to bring back deleted categories */
//       if (categoryExist.status == false) {
//         if (req.files) {
//           if (categoryExist.imageUrl != null && categoryExist.imageUrl != "") {
//             // let remvArr = categoryExist.imageUrl.split(process.env.SPLITURL);
//             fs.unlink(`public/` + categoryExist.imageUrl, (err) => {
//               if (err) console.log(err);
//             });
//           }
//           req.files.file.mv(
//             `./public/Images/Category/${categoryExist.categoryName}-` +
//               req.files.file.name
//           );
//           categoryExist.imageUrl =
//             `Images/Category/${categoryExist.categoryName}-` +
//             req.files.file.name; //manipulated on 01-06-22 -> removed field FILEURL GLOBAL VARIABLE from this section
//         }
//         categoryExist.status = true;
//         let data = await categoryExist.save();
//         if (data) {
//           res = { data: data, status: STATUSCODES.SUCCESS };
//         } else {
//           res = { data: {}, status: STATUSCODES.UNPROCESSED };
//         }
//       } else {
//         res = { data: {}, status: STATUSCODES.EXIST };
//       }
//     }
//     return res;
//   } catch (e) {
//     console.error(e);
//     res = { data: e, status: STATUSCODES.ERROR };
//     return res;
//   }
// };


