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
       connection.query("SELECT * FROM LOG WHERE ADMIN='none'",(err,requests)=>{
           if (err) throw err;
           connection.query("select a.* from log a join(select sdate,stime,Hall from log group by sdate,stime,Hall having count(*)>1) b on a.sdate=b.sdate and a.stime=b.stime and a.Hall=b.Hall and Admin='none' and a.Hall='conferences'",(err,conflicts)=>{
              if (err) throw err;

               connection.query("select * from log where admin='Approved'",(err,approved)=>{
                   if (err) throw err;
                   connection.query("select * from  log where admin='Not Approved'",(err,Notapproved)=>{
                       if (err) throw err;
                       connection.query("select COUNT(*) as total from log",(err,users)=>{
                        
                        var y=new Date().getFullYear();
                        if (err) throw err;
                        connection.query("select month(sdate) as m,count(*) as c from log where year(sdate)=? and HALL=? group by year(sdate),month(sdate) order by year(sdate),month(sdate)",[y,'conference'],(err,conf)=>{
                            if (err) throw err;
                            console.log(conf);
                            for (let i in conf){
                                var j =conf[i].m;
                                confmonth[j-1]=conf[i].c
                            }
                            connection.query("select month(sdate) as m,count(*) as c from log where year(sdate)=? and (HALL=? or HALL=?) group by year(sdate),month(sdate) order by year(sdate),month(sdate)",[y, 'Ground Floor','First Floor'],(err,classroom)=>{
                                if (err) throw err;
                        console.log(classroom);
                        for (let i in classroom){
                            var j =classroom[i].m;
                            classmonth[j-1]=classroom[i].c
                        }
                        connection.release();
                        const chart = new QuickChart();
                        chart.setWidth(480)
                        chart.setHeight(200);

                        chart.setConfig({
                        type: 'bar',
                        data: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July','Aug','Sept','Oct','Nov','Dec'],
                            datasets: [
                            {
                                label: 'Conference Hall',
                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                borderColor: 'rgb(255, 99, 132)',
                                borderWidth: 1,
                                data: confmonth,
                            },
                            {
                                label:'Classroom',
                                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                borderColor: 'rgb(54, 162, 235)',
                                borderWidth: 1,
                                data: classmonth,
                            },
                            ],
                        },
                        options: {
                            title: {
                            display: true,
                            },
                        
                        },
                        });
                        var confchart=chart.getUrl()
                        res.render('adminhome',{confchart,users,requests,conflicts,approved,Notapproved})
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
   connection.query("select id from log where id=? and Name=? and Department=?",[id,Name,Department],(err,result1)=>{
       if (err) throw err;
       connection.query("select email from user_reg where name=? and dept=?",[Name,Department],(err,result2)=>{
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
       from: '"TSS Admin" <tsscarservice@gmail.com>',
       to: returnEmail,
       subject: "Hall Booking reg",
       text: "Approval Denied",
       html: returncontent,
     };

     transporter.sendMail(mailoptions,(err, info)=>{
         if (err){
             console.log(err)
         }
         else{
         console.log('Message Sent');
         res.redirect('adminhome');
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
connection.query("select id from log where id=? and Name=? and Department=?",[id,Name,Department],(err,result1)=>{
   if (err) throw err;
connection.query("select email from user_reg where name=? and dept=?",[Name,Department],(err,result2)=>{
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
  from: '"TSS Admin" <tsscarservice@gmail.com>',
  to: approveEmail,
  subject: "Hall Booking reg",
  text: "Approved",
  html: approvecontent,
};
transporter.sendMail(mailoptions,(err, info)=>{
    if (err){
        console.log(err)
    }
    else{
    console.log('Message Sent');
    res.redirect('adminhome');
    }
                         })
                   })}
               })
       }
    )
   })
}