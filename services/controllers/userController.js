const express=require('express');
const app=express();
const bodyParser=require('body-parser');
require('dotenv').config();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.json());
const path=require('path');
const mysql=require('mysql');
const nodemailer=require('nodemailer');
const alert=require('alert');

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

//view register page
exports.view=(req,res)=>{
    res.sendFile(path.join(__dirname+'/register.html'));

}

//view login page
exports.loginform=(req,res)=>{
    res.sendFile(path.join(__dirname+'/login.html'));

}

//register form data submission
exports.form_register=(req,res)=>{
    const {Name,Department,Email,Password,c_password}=req.body;

    //connect to db
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        console.log("connect to database "+connection.threadId);

        connection.query('INSERT INTO user_reg SET name=?,dept=?,email=?,password=?,c_password=?',[Name,Department,Email,Password,c_password]);
        connection.release();

        if(!err){
            console.log("Data inserted");
            res.redirect('loginform');
        }
        else{
            console.log(err);
        }
        
    });

}

//login validate 
global.user="";
global.user_id="";
global.user_d="";
exports.login_form=(req,res)=>{
    var username=req.body.username;
    var password=req.body.password;
    user=username;
    //connect to db
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        console.log("connect to database "+connection.threadId);
        connection.query('SELECT * FROM user_reg WHERE email=? AND password=?',[username,password],(err,rows)=>{
            connection.query('SELECT * FROM admin WHERE email=? AND password=?',[username,password],(err,rows1)=>{
                if(rows.length>0){
                    user=rows[0].name;
                    user_id=rows[0].id;
                    user_d=rows[0].dept;
                    res.redirect('/homepage');
                }
                else if(rows1.length>0){
                    res.redirect('/adminhome');
                }
                else{
                    res.redirect('loginform');
                } 
            })
        })

            connection.release();
        })     
}

//view home page
exports.homepage=(req,res)=>{
    res.sendFile(path.join(__dirname+'/home.html'));
}
exports.sample=(req,res)=>{
    res.send(user);
}

//view profile page
exports.profile=(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        console.log("connect to database "+connection.threadId);
        connection.query('SELECT * FROM user_reg WHERE id=?',[user_id],(err,rows)=>{
            if(!err){
                var user_name=rows[0].name;
                var user_dept=rows[0].dept;
                var user_email=rows[0].email;
                var user_pass=rows[0].password;
                res.render('profile',{user_name,user_dept,user_email,user_pass});
            }
        })

            connection.release();
        }) 
}

//update profile page
exports.updateprofile=(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        var Name1=req.body.name1;
        var Department1=req.body.department1;
        var Email1=req.body.email1;
        var Password1=req.body.password1;
        console.log("connect to database "+connection.threadId);
        connection.query("UPDATE user_reg SET name=?,dept=?,email=?,password=? WHERE id=?",[Name1,Department1,Email1,Password1,user_id],(err,rows)=>{
            if(err) throw err;
            else{
                res.redirect('/homepage');
            }
            
        })

            connection.release();
        })
}

//declaration global variable for conference hall
var timechart=[];
var request1=[];
var approve1=[];
//var x_val=0;
global.request=request1;
global.approve=approve1;
global.result=timechart;
//global.x=x_val;
global.x=0;
global.date_val="";
var result=["07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM","09:00 PM"];
//view conference hall
exports.conferencehall=(req,res)=>{
    console.log(date_val);
    res.render('conference',{date_val,request,approve,result,user,user_d});
}

//to display date values for conference hall
exports.datecall=(req,res)=>{
    var value_date=req.body.Date;
    global.date_val=value_date;
    console.log(date_val); 
    //res.render('conference',{formattedDate});
    
    pool.getConnection((err,connection)=>{
        var sql1=`SELECT stime,etime FROM log WHERE Hall='conference' AND Admin='none'  AND sdate='${value_date}'`;
        var sql2=`SELECT stime,etime FROM log WHERE Hall='conference' AND Admin='Approved' AND sdate='${value_date}'`;
        connection.query(sql1,(err,result1)=>{
            global.x=1
            if (err) throw err;
            connection.query(sql2,(err,result2)=>{
                if(result1.length>0){
                    var n1=result.indexOf(result1[0].stime);
                     var n2=result.indexOf(result1[0].etime);
                     request1=result.slice(n1,n2+1);
                     console.log("request:"+request1);
                  }
                if(result2.length>0){
                    var n1=result.indexOf(result2[0].stime);
                    var n2=result.indexOf(result2[0].etime);
                    approve1=result.slice(n1,n2+1);
                   console.log("approve:"+approve1);
                }
                request=request1;
                approve=approve1;
                res.redirect('/conference');
             })
         });
    })
}


// conference hall booking register
exports.hallbook=(req,res)=>{
    const id=Math.round(Math.random() * (100-10)+10);
    const hall='conference';
    const adm='none';
    const {Name,Department,Purpose,sdate,edate,stime,etime}=req.body;
    var msg = `<p>Conference Hall Booking Reg: Conference Hall has been requested!!!</p><br>
    Respected Sir/Madam<br>
    This is the notification about the request for the Conference.<br>
    Name: ${Name}<br>
    Department: ${Department}<br>
    Requesting Hall: Conference Hall<br>
    Date From: ${sdate}  To: ${edate}<br>
    Timing From:${stime} To:${etime}<br>
    Purpose: ${Purpose}<br>
    So kindly refer your TSS CAR Services Account to check Availability of the Requested Hall and to accept/reject the request.<br>
    Regards<br>
    TSS CAR Services<br>`;
    //connect to db
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        console.log("connect to database "+connection.threadId);
        //const result=connection.query('INSERT INTO booking (id,name,department,hall,purpose,stime,etime,admin) VALUES('+id+','+Name+','+Department+','+"conference"+','+Purpose+','+stime+','+etime+','+"none"+')');
        connection.query('INSERT INTO log SET id=?,Name=?,Department=?,Hall=?,Purpose=?,sdate=?,edate=?,stime=?,etime=?,Admin=?',[id,Name,Department,hall,Purpose,sdate,edate,stime,etime,adm]);
        
        //to send mail
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
        from: '"Ravikumar K" <tsscarservice@gmail.com>', // sender address
        to: "ravi@student.tce.edu", // list of receivers
        subject: "Hall Booking reg", // Subject line
        html:msg, // html body
      };

      transporter.sendMail(mailoptions,(err, info)=>{
          if (err){
              return console.log(err)
          }
          console.log('Message Sent');
          //window.alert('Returned Sucessfully');
          res.redirect('conference');
      });

        connection.release();
        if(!err){
            console.log("Data inserted");
            res.redirect('conference');
        }
        else{
            console.log(err);
        }
        
    });
}

//declaration global variable for classroom
var c_timechart=[];
var c_request1=[];
var c_approve1=[];
global.c_request=c_request1;
global.c_approve=c_approve1;
global.c_formattedDate="";
global.floor_val="";
global.c_result=c_timechart;
var c_result=["07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","7:00 PM","8:00 PM","9:00 PM"];
//view classroom
exports.classroom=(req,res)=>{
    res.render('classroom',{c_formattedDate,c_result,c_approve,c_request,user,user_d,floor_val});
}

//to display date values for classroom
exports.datecall1=(req,res)=>{
    c_date_val=req.body.Date;
    global.c_formattedDate=c_date_val;
    console.log(c_date_val);
    var floor=req.body.floor;
    floor_val=floor;
    //res.render('conference',{formattedDate});
    c_val=1;
    c=c_val;
    pool.getConnection((err,connection)=>{
        
        var sql1=`SELECT stime,etime FROM log WHERE Hall='${floor}' AND Admin='none'  AND sdate='${c_date_val}'`;
        var sql2=`SELECT stime,etime FROM log WHERE Hall='${floor}' AND Admin='Approved' AND sdate='${c_date_val}'`;
        connection.query(sql1,(err,result1)=>{
            if (err) throw err;
            connection.query(sql2,(err,result2)=>{
                if(result1.length>0){
                     var n1=c_result.indexOf(result1[0].stime);
                     var n2=c_result.indexOf(result1[0].etime);
                     c_request1=c_result.slice(n1,n2+1);
                     console.log("request:"+c_request1);
                  }
                 if(result2.length>0){
                     var n1=c_result.indexOf(result2[0].stime);
                     var n2=c_result.indexOf(result2[0].etime);
                     c_approve1=c_result.slice(n1,n2+1);
                   console.log("approve:"+c_approve1);
                }
                c_request=c_request1;
                c_approve=c_approve1;
                res.redirect('/classroom');
             })
         });
    })
}

//classroom booking register
exports.classroombook=(req,res)=>{
    const id=Math.round(Math.random() * (100-10)+10);
    const adm='none';
    const {Name,Department,Purpose,floor,sdate,edate,stime,etime}=req.body;
    var msg = `<p>Classroom Booking Reg: Classroom has been requested!!!</p><br>
    Respected Sir/Madam<br>
    This is the notification about the request for the Classroom.<br>
    Name: ${Name}<br>
    Department: ${Department}<br>
    Requesting Hall: Classroom<br>
    Date From: ${sdate}  To: ${edate}<br>
    Timing From:${stime} To:${etime}<br>
    Purpose: ${Purpose}<br>
    So kindly refer your TSS CAR Services Account to check Availability of the Requested Hall and to accept/reject the request.<br>
    Regards<br>
    TSS CAR Services<br>`;
    //connect to db
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        console.log("connect to database "+connection.threadId);
        //const result=connection.query('INSERT INTO booking (id,name,department,hall,purpose,stime,etime,admin) VALUES('+id+','+Name+','+Department+','+"conference"+','+Purpose+','+stime+','+etime+','+"none"+')');
        connection.query('INSERT INTO log SET id=?,Name=?,Department=?,Hall=?,Purpose=?,sdate=?,edate=?,stime=?,etime=?,Admin=?',[id,Name,Department,floor,Purpose,sdate,edate,stime,etime,adm]);
        
        //to send mail
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
        from: `"TSS Facility" <tsscarservice@gmail.com>`, // sender address
        to: "ravi@student.tce.edu", // list of receivers
        subject: "Classroom booking reg", // Subject line
        html:msg, // html body
      };

      transporter.sendMail(mailoptions,(err, info)=>{
          if (err){
              return console.log(err)
          }
          console.log('Message Sent');
          //window.alert('Returned Sucessfully');
          res.redirect('classroom');
      });

        connection.release();
        if(!err){
            console.log("Data inserted");
            res.redirect('classroom');
        }
        else{
            console.log(err);
        }
        
    });
}

//declaration global variable for booking equipments
var e_timechart=[];
var e_request1=[];
var e_approve1=[];
global.e_request=e_request1;
global.e_approve=e_approve1;
global.e_formattedDate="";
global.e_result=e_timechart;
global.e_machine="";
var e_result=["07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","7:00 PM","8:00 PM","9:00 PM"];
//view equipments page
exports.equipments=(req,res)=>{
    res.render('equipments',{e_formattedDate,e_result,e_approve,e_request,user,user_d,e_machine});
};

//to display date values for equipments
exports.e_datecall=(req,res)=>{
    e_date_val=req.body.Date;
    global.e_formattedDate=e_date_val;
    console.log(e_date_val);
    var machine=req.body.machine;
    e_machine=machine;
    //res.render('conference',{formattedDate});
    pool.getConnection((err,connection)=>{
        
        var sql1=`SELECT stime,etime FROM log WHERE Hall='${machine}' AND Admin='none'  AND sdate='${e_date_val}'`;
        var sql2=`SELECT stime,etime FROM log WHERE Hall='${machine}' AND Admin='Approved' AND sdate='${e_date_val}'`;
        connection.query(sql1,(err,result1)=>{
            if (err) throw err;
            e_request1=[];
            e_approve1=[];
            connection.query(sql2,(err,result2)=>{
                if(result1.length>0){
                     var n1=e_result.indexOf(result1[0].stime);
                     var n2=e_result.indexOf(result1[0].etime);
                     e_request1=e_result.slice(n1,n2+1);
                     console.log("request:"+e_request1);
                  }
                if(result2.length>0){
                     var n1=e_result.indexOf(result2[0].stime);
                     var n2=e_result.indexOf(result2[0].etime);
                     e_approve1=e_result.slice(n1,n2+1);
                   console.log("approve:"+e_approve1);
                }
                e_request=e_request1;
                e_approve=e_approve1;
                res.redirect('/equipments');
             })
         });
    })
}


//Equipments booking register
exports.equipments_book=(req,res)=>{
    const id=Math.round(Math.random() * (100-10)+10);
    const adm='none';
    const {Name,Department,Purpose,machine,sdate,edate,stime,etime}=req.body;
    var msg = `<p>Equipments Booking Reg:${machine} has been requested!!!</p><br>
    Respected Sir/Madam<br>
    This is the notification about the request for the Equipments.<br>
    Name: ${Name}<br>
    Department: ${Department}<br>
    Requesting machine: ${machine}<br>
    Date From: ${sdate}  To: ${edate}<br>
    Timing From:${stime} To:${etime}<br>
    Purpose: ${Purpose}<br>
    So kindly refer your TSS CAR Services Account to check Availability of the Requested machine and to accept/reject the request.<br>
    Regards<br>
    TSS CAR Services<br>`;
    //connect to db
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        console.log("connect to database "+connection.threadId);
        //const result=connection.query('INSERT INTO booking (id,name,department,hall,purpose,stime,etime,admin) VALUES('+id+','+Name+','+Department+','+"conference"+','+Purpose+','+stime+','+etime+','+"none"+')');
        connection.query('INSERT INTO log SET id=?,Name=?,Department=?,Hall=?,Purpose=?,sdate=?,edate=?,stime=?,etime=?,Admin=?',[id,Name,Department,machine,Purpose,sdate,edate,stime,etime,adm]);
        
        //to send mail
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
        from: `"Ravikumar K" <tsscarservice@gmail.com>`, // sender address
        to: "ravi@student.tce.edu", // list of receivers
        subject: "Equipments booking reg", // Subject line
        html:msg, // html body
      };

      transporter.sendMail(mailoptions,(err, info)=>{
          if (err){
              return console.log(err)
          }
          console.log('Message Sent');
          //window.alert('Returned Sucessfully');
          res.redirect('equipments');
      });

        connection.release();
        if(!err){
            console.log("Data inserted");
            res.redirect('equipments');
        }
        else{
            console.log(err);
        }
        
    });
}

//declaration global variable for Display Center
var d_timechart=[];
var d_request1=[];
var d_approve1=[];
global.d_request=d_request1;
global.d_approve=d_approve1;
global.d_result=d_timechart;
global.d_date_val="";
var d_result=["07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM","09:00 PM"];
//view Display Center
exports.displayCenter=(req,res)=>{
    console.log(date_val);
    res.render('display_center',{d_date_val,d_request,d_approve,d_result,user,user_d});
}

//to display date values for display center
exports.d_datecall=(req,res)=>{
    var value_date=req.body.Date;
    d_date_val=value_date;
    console.log(d_date_val); 
    
    pool.getConnection((err,connection)=>{
        var sql1=`SELECT stime,etime FROM log WHERE Hall='Display Center' AND Admin='none'  AND sdate='${d_value_date}'`;
        var sql2=`SELECT stime,etime FROM log WHERE Hall='Display Center' AND Admin='Approved' AND sdate='${d_value_date}'`;
        connection.query(sql1,(err,result1)=>{
            if (err) throw err;
             d_request1=[];
             d_approve1=[];
            connection.query(sql2,(err,result2)=>{
                if(result1.length>0){
                    var n1=d_result.indexOf(result1[0].stime);
                     var n2=d_result.indexOf(result1[0].etime);
                     d_request1=result.slice(n1,n2+1);
                     console.log("request:"+d_request1);
                  }
                else if(result2.length>0){
                    var n1=d_result.indexOf(result2[0].stime);
                    var n2=d_result.indexOf(result2[0].etime);
                    d_approve1=result.slice(n1,n2+1);
                   console.log("approve:"+d_approve1);
                }
                d_request=d_request1;
                d_approve=d_approve1;
                res.redirect('/displaycenter');
             })
         });
    })
}

// Display center booking register
exports.displayCenter_book=(req,res)=>{
    const id=Math.round(Math.random() * (100-10)+10);
    const hall='Display Center';
    const adm='none';
    const {Name,Department,Purpose,sdate,edate,stime,etime}=req.body;
    var msg = `<p>Conference Hall Booking Reg: Conference Hall has been requested!!!</p><br>
    Respected Sir/Madam<br>
    This is the notification about the request for the Conference.<br>
    Name: ${Name}<br>
    Department: ${Department}<br>
    Requesting Hall: Conference Hall<br>
    Date From: ${sdate}  To: ${edate}<br>
    Timing From:${stime} To:${etime}<br>
    Purpose: ${Purpose}<br>
    So kindly refer your TSS CAR Services Account to check Availability of the Requested Hall and to accept/reject the request.<br>
    Regards<br>
    TSS CAR Services<br>`;
    //connect to db
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        console.log("connect to database "+connection.threadId);
        //const result=connection.query('INSERT INTO booking (id,name,department,hall,purpose,stime,etime,admin) VALUES('+id+','+Name+','+Department+','+"conference"+','+Purpose+','+stime+','+etime+','+"none"+')');
        connection.query('INSERT INTO log SET id=?,Name=?,Department=?,Hall=?,Purpose=?,sdate=?,edate=?,stime=?,etime=?,Admin=?',[id,Name,Department,hall,Purpose,sdate,edate,stime,etime,adm]);
        
        //to send mail
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
        from: '"Ravikumar K" <tsscarservice@gmail.com>', // sender address
        to: "ravi@student.tce.edu", // list of receivers
        subject: "Hall Booking reg", // Subject line
        html:msg, // html body
      };

      transporter.sendMail(mailoptions,(err, info)=>{
          if (err){
              return console.log(err)
          }
          console.log('Message Sent');
          //window.alert('Returned Sucessfully');
          res.redirect('/displaycenter');
      });

        connection.release();
        if(!err){
            console.log("Data inserted");
            res.redirect('/displaycenter');
        }
        else{
            console.log(err);
        }
        
    });
}


//declaration global variable for booking CEVT equipments
var ce_timechart=[];
var ce_request1=[];
var ce_approve1=[];
global.ce_request=ce_request1;
global.ce_approve=ce_approve1;
global.ce_formattedDate="";
global.ce_result=ce_timechart;
global.ce_machine="";
var ce_result=["07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM","09:00 PM"];
//view equipments page
exports.cevt=(req,res)=>{
    res.render('ev-lab-book',{ce_formattedDate,ce_result,ce_approve,ce_request,user,user_d,ce_machine});
};

//to display date values for equipments
exports.ce_datecall=(req,res)=>{
    ce_date_val=req.body.Date;
    global.ce_formattedDate=ce_date_val;
    console.log(ce_date_val);
    var machine=req.body.machine;
    ce_machine=machine;
    //res.render('conference',{formattedDate});
    pool.getConnection((err,connection)=>{
        
        var sql1=`SELECT stime,etime FROM log WHERE Hall='${ce_machine}' AND Admin='none'  AND sdate='${ce_date_val}'`;
        var sql2=`SELECT stime,etime FROM log WHERE Hall='${ce_machine}' AND Admin='Approved' AND sdate='${ce_date_val}'`;
        connection.query(sql1,(err,result1)=>{
            if (err) throw err;
            ce_request1=[];
            ce_approve1=[];
            connection.query(sql2,(err,result2)=>{
                if(result1.length>0){
                     var n1=ce_result.indexOf(result1[0].stime);
                     var n2=ce_result.indexOf(result1[0].etime);
                     ce_request1=ce_result.slice(n1,n2+1);
                     console.log("request:"+ce_request1);
                  }
                if(result2.length>0){
                     var n1=ce_result.indexOf(result2[0].stime);
                     var n2=ce_result.indexOf(result2[0].etime);
                     ce_approve1=ce_result.slice(n1,n2+1);
                   console.log("approve:"+ce_approve1);
                }
                ce_request=ce_request1;
                ce_approve=ce_approve1;
                res.redirect('/cevt');
             })
         });
    })
}

//CEVT Equipments booking register
exports.cevt_equipments_book=(req,res)=>{
    const id=Math.round(Math.random() * (100-10)+10);
    const adm='none';
    const {Name,Department,Purpose,machine,sdate,edate,stime,etime}=req.body;
    var msg = `<p>Equipments Booking Reg:${machine} has been requested!!!</p><br>
    Respected Sir/Madam<br>
    This is the notification about the request for the Equipments.<br>
    Name: ${Name}<br>
    Department: ${Department}<br>
    Requesting machine: ${machine}<br>
    Date From: ${sdate}  To: ${edate}<br>
    Timing From:${stime} To:${etime}<br>
    Purpose: ${Purpose}<br>
    So kindly refer your TSS CAR Services Account to check Availability of the Requested machine and to accept/reject the request.<br>
    Regards<br>
    TSS CAR Services<br>`;
    //connect to db
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        console.log("connect to database "+connection.threadId);
        //const result=connection.query('INSERT INTO booking (id,name,department,hall,purpose,stime,etime,admin) VALUES('+id+','+Name+','+Department+','+"conference"+','+Purpose+','+stime+','+etime+','+"none"+')');
        connection.query('INSERT INTO log SET id=?,Name=?,Department=?,Hall=?,Purpose=?,sdate=?,edate=?,stime=?,etime=?,Admin=?',[id,Name,Department,machine,Purpose,sdate,edate,stime,etime,adm]);
        
        //to send mail
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
        from: `"Ravikumar K" <tsscarservice@gmail.com>`, // sender address
        to: "ravi@student.tce.edu", // list of receivers
        subject: "Equipments booking reg", // Subject line
        html:msg, // html body
      };

      transporter.sendMail(mailoptions,(err, info)=>{
          if (err){
              return console.log(err)
          }
          console.log('Message Sent');
          //window.alert('Returned Sucessfully');
          res.redirect('/cevt');
      });

        connection.release();
        if(!err){
            console.log("Data inserted");
            res.redirect('/cevt');
        }
        else{
            console.log(err);
        }
        
    });
}



//declaration global variable for cds 
var cd_timechart=[];
var cd_request1=[];
var cd_approve1=[];
//var x_val=0;
global.cd_request=cd_request1;
global.cd_approve=cd_approve1;
global.cd_result=cd_timechart;

global.cd_date_val="";
var cd_result=["07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM","09:00 PM"];
//view conference hall
exports.cds=(req,res)=>{
    console.log(cd_date_val);
    res.render('cds',{cd_date_val,cd_request,cd_approve,cd_result,user,user_d});
}

//to display date values for conference hall
exports.cd_datecall=(req,res)=>{
    var value_date=req.body.Date;
    global.cd_date_val=value_date;
    console.log(cd_date_val); 
    
    pool.getConnection((err,connection)=>{
        var sql1=`SELECT stime,etime FROM log WHERE Hall='cds' AND Admin='none'  AND sdate='${value_date}'`;
        var sql2=`SELECT stime,etime FROM log WHERE Hall='cds' AND Admin='Approved' AND sdate='${value_date}'`;
        connection.query(sql1,(err,result1)=>{
            if (err) throw err;
            connection.query(sql2,(err,result2)=>{
                if(result1.length>0){
                    var n1=cd_result.indexOf(result1[0].stime);
                     var n2=cd_result.indexOf(result1[0].etime);
                     cd_request1=cd_result.slice(n1,n2+1);
                     console.log("request:"+cd_request1);
                  }
                if(result2.length>0){
                    var n1=cd_result.indexOf(result2[0].stime);
                    var n2=cd_result.indexOf(result2[0].etime);
                    cd_approve1=cd_result.slice(n1,n2+1);
                   console.log("approve:"+cd_approve1);
                }
                cd_request=cd_request1;
                cd_approve=cd_approve1;
                res.redirect('/cds');
             })
         });
    })
}

// conference hall booking register
exports.cds_book=(req,res)=>{
    const id=Math.round(Math.random() * (100-10)+10);
    const hall='cds';
    const adm='none';
    const {Name,Department,Purpose,sdate,edate,stime,etime}=req.body;
    var msg = `<p>Conference Hall Booking Reg: Conference Hall has been requested!!!</p><br>
    Respected Sir/Madam<br>
    This is the notification about the request for the Conference.<br>
    Name: ${Name}<br>
    Department: ${Department}<br>
    Requesting Hall: Conference Hall<br>
    Date From: ${sdate}  To: ${edate}<br>
    Timing From:${stime} To:${etime}<br>
    Purpose: ${Purpose}<br>
    So kindly refer your TSS CAR Services Account to check Availability of the Requested Hall and to accept/reject the request.<br>
    Regards<br>
    TSS CAR Services<br>`;
    //connect to db
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        console.log("connect to database "+connection.threadId);
        //const result=connection.query('INSERT INTO booking (id,name,department,hall,purpose,stime,etime,admin) VALUES('+id+','+Name+','+Department+','+"conference"+','+Purpose+','+stime+','+etime+','+"none"+')');
        connection.query('INSERT INTO log SET id=?,Name=?,Department=?,Hall=?,Purpose=?,sdate=?,edate=?,stime=?,etime=?,Admin=?',[id,Name,Department,hall,Purpose,sdate,edate,stime,etime,adm]);
        
        //to send mail
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
        from: '"Ravikumar K" <tsscarservice@gmail.com>', // sender address
        to: "ravi@student.tce.edu", // list of receivers
        subject: "Hall Booking reg", // Subject line
        html:msg, // html body
      };

      transporter.sendMail(mailoptions,(err, info)=>{
          if (err){
              return console.log(err)
          }
          console.log('Message Sent');
          //window.alert('Returned Sucessfully');
          res.redirect('/cds');
      });

        connection.release();
        if(!err){
            console.log("Data inserted");
            res.redirect('/cds');
        }
        else{
            console.log(err);
        }
        
    });
}



exports.home=(req,res)=>{
    res.render('main');
}

//view lab page
exports.labs=(req,res)=>{
    res.sendFile(path.join(__dirname+'/labs.html'));

}


//view product lab page
exports.product_lab=(req,res)=>{
    res.sendFile(path.join(__dirname+'/product-lab.html'));

}

//view product lab page
exports.ev_lab=(req,res)=>{
    res.sendFile(path.join(__dirname+'/ev-lab.html'));

}

//view equipmnent details lab page
exports.equ_details=(req,res)=>{
    res.sendFile(path.join(__dirname+'/equ_details.html'));

}


//logout
exports.logout=(req,res)=>{
    res.redirect('/loginform');

}
