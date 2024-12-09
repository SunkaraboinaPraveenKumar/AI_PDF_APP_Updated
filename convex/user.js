import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser=mutation({
    args:{
        email:v.string(),
        userName:v.string(),
        imageUrl:v.string(),
        upgrade:v.boolean()
    },
    handler:async(ctx,args)=>{
        //if user already exists
        const user=await ctx.db.query('users').filter((q)=>q.eq(q.field('email'),args.email))
        .collect();

        //if not insert user
        if(user?.length==0){
            await ctx.db.insert('users',{
                email:args.email,
                userName:args.userName,
                imageUrl:args.imageUrl,
                upgrade:false
            });

            return 'Inserted New User...'
        }
        return 'User Already Exists'
    }
})

export const UpgradePlan=mutation({
    args:{
        userEmail:v.optional(v.string())
    },
    handler:async(ctx,args)=>{
        if(!args?.userEmail){
            return 'Email not Found!!'
        }
        const result =await ctx.db.query('users')
        .filter(q=>q.eq(q.field('email'),args.userEmail))
        .collect()

        if(result){
            await ctx.db.patch(result[0]._id,{upgrade:true});

            return 'Plan Successfully Upgraded!!';
        }
        return 'Error to Upgrade!'
    }
})

export const GetUserInfo=query({
    args:{
        userEmail:v.optional(v.string())
    },
    handler:async(ctx,args)=>{
        if(!args?.userEmail){
            return 'Email not Found!!'
        }
        const result = await ctx.db.query('users')
        .filter(q=>q.eq(q.field('email'),args?.userEmail))
        .collect();

        return result[0];
    }
})