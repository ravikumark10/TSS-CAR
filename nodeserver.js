
const Service = require('node-windows').Service
const svc =new Service({
    name:'tsscar',
    description: 'Student project management portal admin',
    script:"E:\\TSS\\admin_app.js"
});

svc.on('install',function(){
    svc.start()
})

svc.install()