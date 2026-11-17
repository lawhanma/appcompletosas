export const PROFILE_MEDIA_BUCKET='affiliate-profile-media';
export const MAX_PROFILE_IMAGE_BYTES=5*1024*1024;
export const PROFILE_IMAGE_TYPES=['image/jpeg','image/png','image/webp'];
export interface ProfileMediaInput {avatar?:File;banner?:File;removeAvatar?:boolean;removeBanner?:boolean}
export function validateProfileImage(file:Pick<File,'type'|'size'>) {
  if(!PROFILE_IMAGE_TYPES.includes(file.type)) throw new Error('Escolha uma imagem JPG, PNG ou WebP.');
  if(file.size<=0||file.size>MAX_PROFILE_IMAGE_BYTES)throw new Error('A imagem deve ter até 5 MB.');
}
export async function checkImageFile(file:File){
  validateProfileImage(file);
  if(typeof createImageBitmap==='function'){
    try {
      const bitmap=await createImageBitmap(file,{resizeWidth:512,resizeHeight:512,resizeQuality:'low'});
      const valid=bitmap.width>0&&bitmap.height>0;bitmap.close();
      if(!valid)throw new Error('Imagem inválida.');
      return;
    }catch{/* Use the browser image decoder when bitmap decoding is unsupported. */}
  }
  if(typeof Image==='undefined'||typeof URL.createObjectURL!=='function')throw new Error('Não foi possível abrir esta imagem neste navegador.');
  await new Promise<void>((resolve,reject)=>{
    const image=new Image(),url=URL.createObjectURL(file);
    const done=(error?:Error)=>{clearTimeout(timer);image.onload=null;image.onerror=null;URL.revokeObjectURL(url);error?reject(error):resolve();};
    const timer=setTimeout(()=>done(new Error('A imagem demorou para abrir. Escolha um arquivo menor.')),15000);
    image.onload=()=>done(image.naturalWidth>0&&image.naturalHeight>0&&image.naturalWidth*image.naturalHeight<=24000000?undefined:new Error('Escolha uma imagem menor, com até 24 megapixels.'));
    image.onerror=()=>done(new Error('Não foi possível abrir esta imagem. Escolha outro arquivo.'));
    image.src=url;
  });
}
