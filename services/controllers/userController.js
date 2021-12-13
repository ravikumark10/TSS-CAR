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
            alert("Registered successfully");
            res.redirect('loginform');
        }
        else{
            console.log(err);
        }
        
    });

}

//login validate 
exports.login_form=(req,res)=>{
    let username=req.body.username;
    let password=req.body.password;
    //connect to db
    pool.getConnection((err,connection)=>{
        if(err)throw err;
        console.log("connect to database "+connection.threadId);

        connection.query('SELECT * FROM user_reg WHERE email=? AND password=?',[username,password],(err,rows)=>{
            connection.query('SELECT * FROM admin WHERE email=? AND password=?',[username,password],(err,rows1)=>{
                if(err) throw err;
                if(rows.length>0){
                    alert("login valid");
                    res.redirect('/homepage');
                }
                else if(rows1.length>0){
                    alert("login valid");
                    res.redirect('seminaradmin');
                }
                else{
                    alert("login Invalid");
                    res.redirect('loginform');
                } 
            })
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
    res.render('conference',{date_val,request,approve,result,x});
}

//to display date values for conference hall
exports.datecall=(req,res)=>{
    var value_date=req.body.Date;
    global.date_val=value_date;
    console.log(date_val); 
    //res.render('conference',{formattedDate});
    
    pool.getConnection((err,connection)=>{
        var sql1=`SELECT stime,etime FROM booking WHERE hall='conference' AND admin='none'  AND sdate='${value_date}'`;
        var sql2=`SELECT stime,etime FROM booking WHERE hall='conference' AND admin='Approved' AND sdate='${value_date}'`;
        connection.query(sql1,(err,result1)=>{
            global.x=1
            if (err) throw err;
             request1=[];
             approve1=[];
            connection.query(sql2,(err,result2)=>{
                if(result1.length>0){
                     request1.push(result1[0].stime);
                     request1.push(result1[0].etime);
                     console.log("request:"+request1);
                  }
                else if(result2.length>0){
                   approve1.push(result2[0].stime);
                   approve1.push(result2[0].etime);
                   console.log("approve:"+approve1);
                }
                request=request1;
                approve=approve1;
                res.redirect('/conference');
             })
         });
    })
}


//hall booking register
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
        connection.query('INSERT INTO booking SET id=?,name=?,department=?,hall=?,purpose=?,sdate=?,edate=?,stime=?,etime=?,admin=?',[id,Name,Department,hall,Purpose,sdate,edate,stime,etime,adm]);
        
        //to send mail
        let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: "tsscartesting@gmail.com", // generated ethereal user
          pass: "tsscar12345", // generated ethereal password
        },
        tls:{
            rejectUnauthorized:false
        }
      });
      let mailoptions = {
        from: '"Ravikumar K" <tsscartesting@gmail.com>', // sender address
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
            alert("hall booked successfully");
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
global.c_result=c_timechart;
var c_result=["07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","7:00 PM","8:00 PM","9:00 PM"];
//view classroom
exports.classroom=(req,res)=>{
    res.render('classroom',{c_formattedDate,c_result,c_approve,c_request});
}

//to display date values for classroom
exports.datecall1=(req,res)=>{
    c_date_val=req.body.Date;
    global.c_formattedDate=c_date_val;
    console.log(c_date_val);
    //res.render('conference',{formattedDate});
    c_val=1;
    c=c_val;
    pool.getConnection((err,connection)=>{
        
        var sql1=`SELECT stime,etime FROM classroom WHERE hall='classroom' AND admin='none'  AND sdate='${c_date_val}'`;
        var sql2=`SELECT stime,etime FROM classroom WHERE hall='classroom' AND admin='Approved' AND sdate='${c_date_val}'`;
        connection.query(sql1,(err,result1)=>{
            if (err) throw err;
            c_request1=[];
            c_approve1=[];
            connection.query(sql2,(err,result2)=>{
                if(result1.length>0){
                     c_request1.push(result1[0].stime);
                     c_request1.push(result1[0].etime);
                     console.log("request:"+c_request1);
                  }
                else if(result2.length>0){
                   c_approve1.push(result2[0].stime);
                   c_approve1.push(result2[0].etime);
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
    const hall='classroom';
    const adm='none';
    const {Name,Department,Purpose,floor,sdate,edate,stime,etime}=req.body;
    var msg = `<p>Classroom Booking Reg: Classroom has been requested!!!</p><br>
    Respected Sir/Madam<br>
    This is the notification about the request for the Classroom.<br>
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
        connection.query('INSERT INTO classroom SET id=?,name=?,department=?,hall=?,floor=?,purpose=?,sdate=?,edate=?,stime=?,etime=?,admin=?',[id,Name,Department,hall,floor,Purpose,sdate,edate,stime,etime,adm]);
        
        //to send mail
        let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: "tsscartesting@gmail.com", // generated ethereal user
          pass: "tsscar12345", // generated ethereal password
        },
        tls:{
            rejectUnauthorized:false
        }
      });
      let mailoptions = {
        from: `"Ravikumar K" <tsscartesting@gmail.com>`, // sender address
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
            alert("classroom booked successfully");
            res.redirect('classroom');
        }
        else{
            console.log(err);
        }
        
    });
}

//view home page
exports.homepage=(req,res)=>{
    res.sendFile(path.join(__dirname+'/home.html'));

}
exports.home=(req,res)=>{
    res.render('main');
}

//view lab page
exports.labs=(req,res)=>{
    res.sendFile(path.join(__dirname+'/labs.html'));

}
//view admin home page
exports.seminaradmin=(req,res)=>{
    res.sendFile(path.join(__dirname+'/seminaradmin.html'));
}

//logout
exports.logout=(req,res)=>{
    res.redirect('/loginform');

}
