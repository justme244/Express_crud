const path =require('path')
const express = require('express');
const methodOverride = require('method-override')
const mongoose =require('mongoose')
const ErrorHandler = require('./ErrorHandler')
const app = express()


// Models
const Product = require('./models/product')
//connect to mongodb
mongoose.connect('mongodb://127.0.0.1/shop_db').then((res)=>{
    console.log('Terhubung')
}).catch((err)=>{
    console.log(err)
})
app.set('views',path.join(__dirname,'views'))
app.set('view_engine','ejs')
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))

function wrapAsync(fn){
    return async(req,res,next)=>{
        fn(req,res,next).catch(err => next(err))
    }
}
app.get('/',(req,res)=>{
    res.send('helloq world')
})

app.get('/products',async (req,res)=>{
    const {category} = req.query
    if(category){
        const products = await Product.find({category})
        res.render('index.ejs',{
            products,
            category
        })}else{
    const products = await Product.find()
    res.render('index.ejs',{
        products,
        category:'ALL'
    })

}
})

app.get('/products/create',(req,res)=>{
    res.render('create.ejs')
})
app.get('/products/:id',wrapAsync(async(req,res,next)=>{
    
    const {id} =req.params
    const products = await Product.findById(id)
    res.render('show.ejs',{
        products
    })
    
}))

app.get('/products/:id/edit',wrapAsync(async(req,res,next)=>{
    const {id} =req.params
    const products = await Product.findById(id)
    res.render('edit.ejs',{
        products
    })

}))
app.post('/products',async(req,res)=>{
    const product = new Product(req.body)
    await product.save()
    res.redirect(`/products/${product._id}`)
})

app.put('/products/:id',wrapAsync(async(req,res,next)=>{
    const {id} = req.params
    const products= await Product.findByIdAndUpdate(id,req.body,{
        runValidators:true,
    })
    res.redirect(`/products/${products._id}`)
}))
app.delete('/products/:id',wrapAsync(async(req,res)=>{
    const {id}=req.params
    await Product.findByIdAndDelete(id)
    res.redirect('/products')
}))

app.use((err,req,res,next)=>{
    const {status = 500,message='Something went wrong'} = err
    res.status(status).send(message);
})
app.use((req,res)=>{
    res.status(404).send('path not found')
  })

app.listen(3000,()=>{
    console.log('Shop app Listening on http://127.0.0.1:3000')
})
