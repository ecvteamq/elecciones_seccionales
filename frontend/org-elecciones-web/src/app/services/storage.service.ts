import { Injectable, Inject } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as SecureStorage from 'secure-web-storage';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {}

  secureStorage = new SecureStorage(localStorage, {
    hash: (key:any) => {
      key = CryptoJS.SHA256(key, environment.secretKey);
      return key.toString();
    },
    encrypt: (data:any) => {
      data = CryptoJS.AES.encrypt(data, environment.secretKey);
      return data.toString();
    },
    decrypt: (data:any) => {
      data = CryptoJS.AES.decrypt(data, environment.secretKey);
      return data.toString(CryptoJS.enc.Utf8);
    }
  });
}
