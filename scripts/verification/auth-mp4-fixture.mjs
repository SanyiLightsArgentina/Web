// Requires an authenticated Supabase CLI. Creates test accounts; always run cleanup after the browser test.
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const require=createRequire(import.meta.url);
const {createClient}=require('@supabase/supabase-js');
const keys=JSON.parse(execFileSync('supabase',['projects','api-keys','--project-ref','yxldaywdnpzpfeftctpr','--output','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
const serviceKey=keys.find(k=>k.name==='service_role')?.api_key;
const anonKey=keys.find(k=>k.name==='anon')?.api_key;
if(!serviceKey || !anonKey) throw new Error('Missing configured API keys');
const url='https://yxldaywdnpzpfeftctpr.supabase.co';
const options={auth:{persistSession:false,autoRefreshToken:false}};
const service=createClient(url,serviceKey,options);
const fixturePath='/tmp/sanyi-auth-live-fixture.json';
if(process.argv[2]==='cleanup') {
 const f=JSON.parse(await readFile(fixturePath,'utf8'));
 const {data:objects}=await service.storage.from('product-videos').list(`products/${f.model}/videos`);
 if(objects?.length) {
  const result=await service.storage.from('product-videos').remove(objects.map(o=>`products/${f.model}/videos/${o.name}`));
  if(result.error) throw result.error;
 }
 const product=await service.from('products').delete().eq('model',f.model);if(product.error) throw product.error;
 for(const id of f.userIds) {const result=await service.auth.admin.deleteUser(id);if(result.error) throw result.error;}
 await unlink(fixturePath);
 console.log('PASS: temporary accounts, product and MP4 removed');
} else {
 const suffix=randomUUID().slice(0,8);
 const f={username:`verify_${suffix}`,password:randomUUID()+'Aa1!',model:`CODEX-MP4-VERIFY-${suffix}`,userIds:[]};
 await writeFile(fixturePath,JSON.stringify(f),{mode:0o600});
 for(const role of ['admin','user']) {
  const username=role==='admin'?f.username:`viewer_${suffix}`;
  const result=await service.auth.admin.createUser({email:`${username}@panel.sanyilights.invalid`,password:f.password,email_confirm:true,app_metadata:{role,username}});
  if(result.error) throw result.error;
  f.userIds.push(result.data.user.id);
  await writeFile(fixturePath,JSON.stringify(f),{mode:0o600});
 }
 const viewer=createClient(url,anonKey,options);
 const signed=await viewer.auth.signInWithPassword({email:`viewer_${suffix}@panel.sanyilights.invalid`,password:f.password});
 if(signed.error) throw signed.error;
 const denied=await viewer.rpc('save_site_section',{p_key:'category_order',p_value:[]});
 if(!denied.error) throw new Error('Non-admin setting write accepted');
 const deniedProduct=await viewer.from('products').insert({model:'UNAUTHORIZED-TEST',description:'test',category_id:1,new:false});
 if(!deniedProduct.error) throw new Error('Non-admin catalog write accepted');
 const deniedStorage=await viewer.storage.from('product-videos').upload(`products/${f.model}/videos/denied.mp4`,new Uint8Array([1,2]),{contentType:'video/mp4'});
 if(!deniedStorage.error) throw new Error('Non-admin file write accepted');
 const publicClient=createClient(url,anonKey,options);
 const read=await publicClient.from('products').select('id').limit(1);
 const privateUsers=await publicClient.from('users').select('id');
 if(read.error || !privateUsers.error) throw new Error('Public/private read permissions incorrect');
 console.log('PASS: real Auth login works; non-admin writes denied; public catalog readable; legacy credentials inaccessible');
}
