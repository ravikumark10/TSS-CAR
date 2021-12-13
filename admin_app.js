const express=require('express');
const app=express();
var fs=require('fs');
const port =process.env.PORT || 5050;
const exphb=require('express-handlebars');

var hbs=require('handlebars');
const bodyParser=require('body-parser');
const mysql=require('mysql');
require('dotenv').config();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
const path= require('path');
const engine=require('express-handlebars');
var hbs=require('handlebars');
const routes=require('./services/routes/admin');
app.use('/',routes);
app.use(express.static('services'));
app.use(express.static('style'))
// Templating Engine
app.engine('hbs', engine({extname:'.hbs'}));
app.set('view engine','hbs');
app.set('views','./views');
app.use(express.static('views'));
hbs.registerHelper('date',require('helper-date'));
 hbs.registerHelper('ifIn',function(elem,list,options){
     if(list.indexOf(elem)>-1){
         return options.fn(this);
     }
    else{
     return options.inverse(this);
    }
 });

 
hbs.registerHelper('ifcheck', (x,op,y,options)=> {
    switch(op){
        case '>':
            return (x.length>y) ? options.fn(this) : options.inverse(this);
        case '<':
            return (x.length<y) ? options.fn(this) : options.inverse(this);
        case '==':
            return (x.length==y) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (x.length!=y) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
})

app.use('/',routes);
app.use(express.static('services'));
app.listen(port,()=>console.log(`Listening to ${port} port`));
