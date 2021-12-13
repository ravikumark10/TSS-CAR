const express=require('express');
const router=express.Router();
const userController=require('../controllers/adminController');

router.get('/adminhome',userController.admin);
router.post('/recommendform',userController.recommendform);
router.get('/recommend',userController.recommend);
router.post('/notrecommendform',userController.Notrecommendform);
router.get('/NotRecommend',userController.NotRecommend);
router.post('/Returnmail',userController.Returnmail);
router.post('/Approvemail',userController.approvemail);
module.exports=router;