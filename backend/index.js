const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt =require('bcryptjs')
const SECRET_KEY ='KingOfThePirates'
//models
const userSchema= mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        default: "Student"
    }
},{timestamps: true})

const UserModel=mongoose.model("User", userSchema)

//routes..
app.post('/register',async(req,res)=>{
    try{
        console.log(req.body)
        const {userName, email, password, confirmPassword} = req.body
        const userInfo = await UserModel.findOne({email})
        if(userInfo){
            return res.status(404).json({
                errors:{user: "User already exists"}
            })
        }
        const hash = await bcrypt.hash(password,10)
        const user = new UserModel({
            userName,
            email,
            password:hash
        })
        user.save()
            .then((userData)=>{
                res.status(201).json({
                    userData
                })
            })
            .catch((err)=>{
                res.status(400)
            })
    }catch(error){
        console.log(error)
        return res.status(400).json({
            error:error
        })
    }
})
app.get('/login' ,async(req,res)=>{
    const {email, password}= req.body
    const userInfo = await (await UserModel.findOne({ email }));
    if (!userInfo) {
        return res.status(401).json({
          errors: { userExist: "User not exist " },
        });
      }
      bcrypt
      .compare(password, userInfo.password)
      .then((result) => {
        if (!result) {
          return res.status(401).json({
            errors: { password: "password not matched" },
          });
        }
        userInfo.password=undefined
        
        const token = jwt.sign({ _id: userInfo._id,name: userInfo.userName,email: userInfo.email,role: userInfo.role }, SECRET_KEY);
        return res.status(200).json({
          userInfo,
          token,
        }).catch((err) => {
            controllerError(err, res, "Error occurred");
          });
      })
})

app.get("/test",(req,res)=>{
    console.log(req.body)
    res.status(200).json({
        body:req.body
    })
})


//server and db connection!
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const PORT = 5050
mongoose.connect('mongodb://localhost:27017/testDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.listen(PORT,()=>{
    console.log("started")
})