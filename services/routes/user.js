const express=require('express');
const router=express.Router();
const session=require('express-session');
const userController=require('../controllers/userController');
const userController1=require('../controllers/admincontroller');


router.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:false
}));
//app.use(router);

router.get('/register',userController.view);
router.post('/',userController.form_register);
router.get('/',userController.loginform);
router.post('/login',userController.login_form);

router.get('/homepage',userController.homepage);
router.get('/logout',userController.logout);
router.get('/home',userController.home);

//proflie page
router.get('/profile',userController.profile);
router.get('/user_val',userController.sample);
router.post('/updateprofile',userController.updateprofile);

//conference hall booking
router.get('/conference',userController.conferencehall);
router.post('/hallbook',userController.hallbook);
router.post('/datedisplay',userController.datecall);

//classroom booking
router.get('/classroom',userController.classroom);
router.post('/datedisplay1',userController.datecall1);
router.post('/classroombook',userController.classroombook);

//lab and equipments booking
router.get('/labs',userController.labs);
router.get('/product-lab',userController.product_lab);
router.get('/equipments',userController.equipments);
router.post('/e_datecall',userController.e_datecall);
router.post('/equipments_book',userController.equipments_book);
router.get('/equ-details',userController.equ_details);

router.get('/adminhome',userController1.admin);

//Display Center
router.get('/displaycenter',userController.displayCenter);
router.post('/d_datecall',userController.d_datecall);
router.post('/displaycenter_book',userController.displayCenter_book);

//CEVT lab equipments
router.get('/ev-lab',userController.ev_lab);
router.get('/cevt',userController.cevt);
router.post('/ce_datecall',userController.ce_datecall);
router.post('/cevt_book',userController.cevt_equipments_book);
router.get('/cevt-details',userController.cevt_details);

//CDS 
router.get('/cds',userController.cds);
router.post('/cd_datedisplay',userController.cd_datecall);
router.post('/cds-book',userController.cds_book);
router.get('/cds-details',userController.cds_details);

//forgot password
router.get('/forgotpassword',userController.forgotpassword);
router.post('/forgotsubmit',userController.forgotsubmit);
router.get('/resetpassword/:id/:token',userController.resetpassword);
router.post('/resetsubmit/:id/:token',userController.resetsubmit);

module.exports=router;