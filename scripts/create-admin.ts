import { auth } from "../src/lib/auth.ts";

const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD,name=process.env.ADMIN_NAME?.trim();
if(!email||!password||!name)throw new Error("Define ADMIN_EMAIL, ADMIN_PASSWORD y ADMIN_NAME.");
const context=await auth.$context;
const existing=await context.internalAdapter.findUserByEmail(email);
if(existing){await context.internalAdapter.updateUser(existing.user.id,{role:"admin",name});if(password){const hashed=await context.password.hash(password);await context.internalAdapter.linkAccount({providerId:"credential",accountId:existing.user.id,password:hashed,userId:existing.user.id});}console.log(`Administrador actualizado: ${email}`);}else{const user=await context.internalAdapter.createUser({email,name,emailVerified:true,role:"admin"},{method:"admin-script"});if(!user)throw new Error("No se pudo crear el usuario.");const hashed=await context.password.hash(password);await context.internalAdapter.linkAccount({providerId:"credential",accountId:user.id,password:hashed,userId:user.id});console.log(`Administrador creado: ${email}`);}
await (await import("../src/lib/prisma.ts")).prisma.$disconnect();
