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
  const bitmap=await createImageBitmap(file).catch(()=>{throw new Error('Não foi possível abrir esta imagem. Escolha outro arquivo.');});
  const valid=bitmap.width>0&&bitmap.height>0&&bitmap.width<=12000&&bitmap.height<=12000;bitmap.close();
  if(!valid)throw new Error('Use uma imagem com até 12.000 pixels de largura e altura.');
}
