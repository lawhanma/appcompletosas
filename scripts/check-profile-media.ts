import assert from 'node:assert/strict';
import {validateProfileImage,MAX_PROFILE_IMAGE_BYTES,checkImageFile} from '../src/utils/profileMedia';
for(const type of ['image/jpeg','image/png','image/webp'])assert.doesNotThrow(()=>validateProfileImage({type,size:MAX_PROFILE_IMAGE_BYTES}));
for(const file of [{type:'image/svg+xml',size:100},{type:'text/html',size:100},{type:'image/png',size:0},{type:'image/jpeg',size:MAX_PROFILE_IMAGE_BYTES+1}])assert.throws(()=>validateProfileImage(file));
console.log('Profile media types and size validation passed');

const originalBitmap=globalThis.createImageBitmap,originalImage=globalThis.Image;
const createURL=URL.createObjectURL,revokeURL=URL.revokeObjectURL;
let revoked=0;
URL.createObjectURL=()=> 'blob:fixture';URL.revokeObjectURL=()=>{revoked++;};
class MobileImage {naturalWidth=400;naturalHeight=400;onload:(()=>void)|null=null;onerror:(()=>void)|null=null;set src(_value:string){queueMicrotask(()=>this.onload?.());}}
try{
 globalThis.createImageBitmap=undefined;
 globalThis.Image=MobileImage as unknown as typeof Image;
 await checkImageFile(new File(['fixture'],'photo.jpg',{type:'image/jpeg'}));
 assert.equal(revoked,1);
 globalThis.createImageBitmap=(async()=>{throw new Error('Unsupported decoder');}) as typeof createImageBitmap;
 await checkImageFile(new File(['fixture'],'photo.jpg',{type:'image/jpeg'}));
 assert.equal(revoked,2);
 console.log('Mobile image fallback and object URL cleanup passed');
}finally{globalThis.createImageBitmap=originalBitmap;globalThis.Image=originalImage;URL.createObjectURL=createURL;URL.revokeObjectURL=revokeURL;}
