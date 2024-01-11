import userModel from "../models/userModel.js";
import { securityQuestionsEnum } from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

//post-register
export const  registerController = async(req,res) => {
   try {
        const {name,email,password,phone,address,securityQuestions} = req.body;
        //validations
        if(!name){
            return res.status(400).send({message: 'Name is Required'});
        }
        if(!email){
            return res.status(400).send({message: 'Email is Required'});
        }
        if(!password){
            return res.status(400).send({message: 'Password is Required'});
        }
        if(!phone){
            return res.status(400).send({message: 'Phone is Required'});
        }
        if(!address){
            return res.status(400).send({message: 'Address is Required'});
        }
        if(!securityQuestions){
            return res.status(400).send({message: 'Answer is Required'});
        }

        //check user
        const existingUser = await userModel.findOne({email});
        //existing user
        if(existingUser){
            return res.status(200).send({
                success:false,
                message: 'User already registered. Please login.',
            });
        }
           // Validate that security questions are from the predefined list
            const invalidQuestions = securityQuestions.some(
              (q) => !securityQuestionsEnum.includes(q.question)
            );

            if (invalidQuestions) {
              return res.status(400).send({
                success: false,
                message: 'Invalid security question(s).',
              });
}
       //register user
       const hashedPassword = await hashPassword(password);
       //save
       const newUser = new userModel({
        name,
        email,
        address,
        phone,
        password: hashedPassword,
        securityQuestions,
    });
    const savedUser = await newUser.save();

       res.status(201).send({
        success:true,
        message:'User Registration Successfully',
        user:savedUser, 
       });

   } catch (error){
    console.log(error)
    res.status(500).send({
        success:false,
        message: 'Error in Registration',
        error
    });
   };

};

//post-login
export const loginController = async (req,res) => {
    try {
        const {email,password} = req.body;
        //validation
        if(!email || !password){
            return res.status(404).send({
                success: false,
                message: 'Invalid Username and Password'
            });
        }
        //check user
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success: false,
                message: 'Email is not Registered!'
            });
        }
        const match = await comparePassword(password,user.password);
        if(!match){
            return res.status(400).send({
                success: false,
                message: 'Invaliad password'
            });
        }
        //token
        const token = await JWT.sign({_id: user._id}, process.env.JWT_SECRET,{
            expiresIn:'7d'
        });
        res.status(200).send({
            success: true,
            message: 'login successfully',
            user:{
                name:user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token
        });
    } catch (error){
        console.log(error)
        res.status(500).send({
            success:false,
            message: 'Login Error',
            error
        });
       };
};

//forgot password controller

export const forgotPasswordController = async (req, res) => {
  try {
      const { email, newPassword, securityQuestions } = req.body;
      if (!email) {
          return res.status(400).send({ message: "Email is required" });
      }
      if (!securityQuestions) {
          return res.status(400).send({ message: "Security questions are required" });
      }
      if (!newPassword) {
          return res.status(400).send({ message: "New Password is required" });
      }

      // Check if email and security questions are correct
      const user = await userModel.findOne({
          email,
          securityQuestions: {
              $elemMatch: { question: securityQuestions[0].question, answer: securityQuestions[0].answer }
          }
      });
      
      // Validation
      if (!user) {
          return res.status(404).send({
              success: false,
              message: 'Wrong Email or Security Questions',
          });
      }

      const hashedPassword = await hashPassword(newPassword);
      await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });

      return res.status(200).send({
          success: true,
          message: "Password Reset Successfully",
      });
  } catch (error) {
      console.log(error);
      return res.status(500).send({
          success: false,
          message: 'Something went wrong',
          error,
      });
  }
};



//test controller
export const testController = (req, res) => {
    try {
      res.send("Protected Routes");
    } catch (error) {
      console.log(error);
      res.send({error});
    }
  };
  
  //update prfole
  export const updateProfileController = async (req, res) => {
    try {
      const { name, email,password, address, phone } = req.body;
      const user = await userModel.findById(req.user._id);
      //password
      if (password && password.length < 8) {
        return res.json({ error: "Passsword is required and 8 character long" });
      }
      const hashedPassword = password ? await hashPassword(password) : undefined;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        {
          name: name || user.name,
          password: hashedPassword || user.password,
          phone: phone || user.phone,
          address: address || user.address,
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Profile Updated SUccessfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error While Updating profile",
        error,
      });
    }
  };

  //orders
export const getOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({ buyer: req.user._id })
        .populate("products", "-photo")
        .populate("buyer", "name");
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Geting Orders",
        error,
      });
    }
  };
  //all orders
  export const getAllOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .populate("buyer", "name")
        .sort({ createdAt: "-1" });
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Geting Orders",
        error,
      });
    }
  };
  
  //order status
  export const orderStatusController = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const orders = await orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Updating Order",
        error,
      });
    }
  };
  