const express=require('express');
const router=express.Router();
const userController=require('../controllers/userController');

router.get('/register',userController.view);
router.post('/',userController.form_register);
router.get('/loginform',userController.loginform);
router.post('/login',userController.login_form);
router.get('/conference',userController.conferencehall);

/*router.get('/homepage',userController.homepage);
router.get('/logout',userController.logout);
router.post('/hallbook',userController.hallbook);
router.get('/seminaradmin',userController.seminaradmin);
router.get('/home',userController.home);
*/
router.post('/datedisplay',userController.datecall);

/*router.get('/classroom',userController.classroom);
router.post('/datedisplay1',userController.datecall1);
router.post('/classroombook',userController.classroombook);
*/
module.exports=router;