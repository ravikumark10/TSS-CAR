const express=require('express');
const router=express.Router();
const userController=require('../controllers/userController');

router.get('/register',userController.view);
router.post('/',userController.form_register);
router.get('/loginform',userController.loginform);
router.post('/login',userController.login_form);

router.get('/homepage',userController.homepage);
router.get('/logout',userController.logout);
router.get('/home',userController.home);

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
router.get('/adminhome',userController.adminhome);
module.exports=router;