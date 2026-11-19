import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
registerHooks({resolve(specifier,context,nextResolve){if(specifier.startsWith("@/")){const target=path.join(root,"src",specifier.slice(2));for(const candidate of [target,`${target}.ts`,`${target}.tsx`,path.join(target,"index.ts")]){try{return nextResolve(pathToFileURL(candidate).href,context)}catch{}}}try{return nextResolve(specifier,context)}catch(error){if(specifier.startsWith(".")&&!path.extname(specifier)){for(const extension of [".ts",".tsx"]){try{return nextResolve(`${specifier}${extension}`,context)}catch{}}}throw error}}});
