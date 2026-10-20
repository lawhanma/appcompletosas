import assert from 'node:assert/strict';
import {validateProfileImage,MAX_PROFILE_IMAGE_BYTES} from '../src/utils/profileMedia';
for(const type of ['image/jpeg','image/png','image/webp'])assert.doesNotThrow(()=>validateProfileImage({type,size:MAX_PROFILE_IMAGE_BYTES}));
for(const file of [{type:'image/svg+xml',size:100},{type:'text/html',size:100},{type:'image/png',size:0},{type:'image/jpeg',size:MAX_PROFILE_IMAGE_BYTES+1}])assert.throws(()=>validateProfileImage(file));
console.log('Profile media types and size validation passed');
