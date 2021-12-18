const express=require('express');
const app=express();
const bodyParser=require('body-parser');
require('dotenv').config();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
const path=require('path');
const mysql=require('mysql');
const nodemailer=require('nodemailer');
const alert=require('alert');
const { request } = require('express');
const { YEAR } = require('mysql/lib/protocol/constants/types');
const QuickChart = require('quickchart-js');
//Templating Engine for html
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//connection pool
const pool=mysql.createPool({
    connectionLimit:100,
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME

});


exports.admin= (req,res)=>{
    //connect to db
    pool.getConnection((err,connection)=>{
       if(err)throw err;
        var confmonth=[0,0,0,0,0,0,0,0,0,0,0,0];
        var classmonth=[0,0,0,0,0,0,0,0,0,0,0,0];
       console.log("connect to database "+connection.threadId);
       var row1=[];
       connection.query("SELECT * FROM log WHERE Admin='none'",(err,requests)=>{
           if (err) throw err;
           connection.query("select a.* from log a join(select sdate,stime,Hall from log group by sdate,stime,Hall having count(*)>1) b on a.sdate=b.sdate and a.stime=b.stime and a.Hall=b.Hall and Admin='none' ",(err,conflicts)=>{
              if (err) throw err;

               connection.query("select * from log where admin='Approved'",(err,approved)=>{
                   if (err) throw err;
                   connection.query("select * from  log where admin='Not Approved'",(err,Notapproved)=>{
                       if (err) throw err;
                       connection.query("select COUNT(*) as total from log",(err,users)=>{
                        
                        var date=new Date().getFullYear();
                        if (err) throw err;
                        connection.query("select month(sdate) as m,count(*) as c from log where year(sdate)=? and HALL=? group by year(sdate),month(sdate) order by year(sdate),month(sdate)",[date,'conference'],(err,conf)=>{
                            if (err) throw err;
                            console.log(conf);
                            for (let i in conf){
                                var j =conf[i].m;
                                confmonth[j-1]=conf[i].c
                            }
                            var conference="";
                            for (let i in confmonth){
                                var y=confmonth[i]
                                conference=conference+""+(y.toString());
                            }
                            connection.query("select month(sdate) as m,count(*) as c from log where year(sdate)=? and (HALL=? or HALL=?) group by year(sdate),month(sdate) order by year(sdate),month(sdate)",[date, 'Ground Floor','First Floor'],(err,classroom)=>{
                                if (err) throw err;
                        console.log(classroom);
                        for (let i in classroom){
                            var j =classroom[i].m;
                            classmonth[j-1]=classroom[i].c
                        }
                        var classrooms="";
                            for (let i in classmonth){
                                var y=classmonth[i]
                                classrooms=classrooms+""+(y.toString());
                            }
                        connection.release();
                        res.render('adminhome',{conference,classrooms,users,requests,conflicts,approved,Notapproved});
                       });
                    });
                   });
           });
        });
       });
   });
});
};

exports.recommendform = (req,res,ans)=>{
   pool.getConnection((err,connection)=>{
       if(err)throw err;
       var id= req.body.id;
       console.log("connect to database "+connection.threadId);
       connection.query("select * from log where id=? and Admin='none'",[id],(err,result)=>{
           if (err) throw err;
           connection.release();
           global.waiting=result;
           res.redirect('/recommend');
       });
   });
}

exports.recommend=(req,res)=>{
   res.render('recommend',{waiting});
};

exports.Notrecommendform = (req,res)=>{
   var id= req.body.id;
   var Name= req.body.Name;
   var Department= req.body.Department;
   var Hall =req.body.Hall;
   var arr=[];
   console.log(id);
   console.log(Name);
   console.log(Department);
   console.log(Hall);
   arr.push(id,Name,Department,Hall);
   global.ans=req.body;
   res.redirect('/NotRecommend');
}

exports.NotRecommend =(req,res)=>{
   res.render('NotRecommend',{ans});
}
exports.Returnmail =(req,res)=>{

   pool.getConnection((err,connection)=>{
       if(err)throw err;
   
   var result=req.body;
   var id=result.id;
   var Name=result.Name;
   var Department=result.Department;
   var Hall=result.Hall;
   
   var Reason="";
   if ('Reason1' in result){
       Reason=Reason+" "+result.Reason1;
   }
   if ('Reason2' in result){
       Reason=Reason+" "+result.Reason2;
   }
   if ('Reason3' in result){
       Reason=Reason+" "+result.Reason3;
   }
   if ('Reason4' in result){
       Reason=Reason+" "+result.Reason4;
   }

   var returncontent=`<p>Not Approval Mail: <br>Hello ${Name}, your ${Hall} request has not been approved by the Admin<br>
   due to the following reasons,<br>
   ${Reason}.<br>
   So kindly bare with the inconvenience..!<br>
   Thanks for Using...!<br><br>
   Regards,<br>
   TCE Facility Services.</p>`
   connection.query("select Name,Department from log where id=?",[id],(err,result1)=>{
       if (err) throw err;
       connection.query("select email from user_reg where name=? and dept=?",[result1[0].Name,result1[0].Department],(err,result2)=>{
           if (err) throw err;
           if (result2.length>0){
               global.returnEmail=result2[0].email;
           }
           if (result1.length>0){
               connection.query("UPDATE log SET Admin = 'Not Approved' where id=? ",[id],(err,result3)=>{
                   if (err) throw err;
                   connection.release();

   let transporter = nodemailer.createTransport({
       host: "smtp.gmail.com",
       port: 465,
       secure: true, // true for 465, false for other ports
       auth: {
         user: "tsscarservice@gmail.com", // generated ethereal user
         pass: "aj1ma2ra3ha4", // generated ethereal password
       },
       tls:{
           rejectUnauthorized:false
       }
     });
     let mailoptions = {
       from: '"TSS CAR SERVICES" <tsscarservice@gmail.com>',
       to: returnEmail,
       subject: "Request rejected",
       html: returncontent,
     };

     transporter.sendMail(mailoptions,(err, info)=>{
         if (err){
             console.log(err)
         }
         else{
         console.log('Message Sent');
         res.write("<script> window.alert('Message Sent...');window.location.href='/adminhome';</script>");
         }
         
     })
   })
}
})
})
})
}

exports.approvemail=(req,res)=>{
   pool.getConnection((err,connection)=>{
       if(err)throw err;
var id = req.body.id;
var Name=req.body.Name;
var Department=req.body.Department;
var Hall=req.body.Hall;
var approvecontent=`<p>Approval Mail: <br>Hello ${Name}, your ${Hall} hall request has been approved by the Admin<br>
   You can login into your account and check the status of the request.<br>
   So you are kindly asked to utilize the ${Hall} hall properly and Happy beginning!<br>
   Thanks for Using...!<br><br>
   Regards,<br>
   TCE Facility Services.</p>`
connection.query("select Name,Department from log where id=?",[id],(err,result1)=>{
   if (err) throw err;
connection.query("select email from user_reg where name=? and dept=?",[result1[0].Name,result1[0].Department],(err,result2)=>{
       if (err) throw err;
       if (result2.length>0){
           global.approveEmail=result2[0].email;
           }
       if (result1.length>0){
connection.query("UPDATE log SET Admin = 'Approved' where id=?",[id],(err,result3)=>{
if (err) throw err;
connection.release();
console.log(approveEmail);

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "tsscarservice@gmail.com", // generated ethereal user
    pass: "aj1ma2ra3ha4", // generated ethereal password
  },
  tls:{
      rejectUnauthorized:false
  }
});
let mailoptions = {
  from: '"TSS CAR SERVICES" <tsscarservice@gmail.com>',
  to: approveEmail,
  subject: "Booked succcessfully",
  html: approvecontent,
};
transporter.sendMail(mailoptions,(err, info)=>{
    if (err){
        console.log(err)
    }
    else{
    console.log('Message Sent');
    res.write(`<script> window.alert('Message Sent...');window.location.href='/adminhome';</script>`);
    }
                         })
                   })}
               })
       }
    )
   })
}