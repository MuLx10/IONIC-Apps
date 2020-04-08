import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory,
         CameraPhoto, CameraSource } from '@capacitor/core';
import { Platform } from '@ionic/angular';
const { Camera, Filesystem, Storage } = Plugins;

const { Device, Geolocation, SplashScreen, Toast } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: Photo[] = [];
  // private PHOTO_STORAGE: string = "photos";
  private platform: Platform;

  constructor(platform: Platform) {
     this.platform = platform;
  }
  public async addToGallery(){
    // Take a photo
    const capture = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImage = await this.savePhoto(capture);
    this.photos.unshift(savedImage);
    //console.log(this.photos);
    // Storage.set({
    //   key: this.PHOTO_STORAGE,
    //   value: JSON.stringify(this.photos.map(p => {
    //             // Don't save the base64 representation of the photo data,
    //             // since it's already saved on the Filesystem
    //             const photoCopy = { ...p };
    //             delete photoCopy.base64;
    //
    //             return photoCopy;
    //           }))
    // });
  }

  private async deletePhoto(idx){
    console.log(idx);
    const photo = this.photos[idx];

    await Filesystem.deleteFile({
      path: photo.filepath,
      directory:FilesystemDirectory.Data
    });

    this.photos.splice(idx, 1);
    // Storage.set({
    //   key: this.PHOTO_STORAGE,
    //   value: JSON.stringify(this.photos.map(p => {
    //             // Don't save the base64 representation of the photo data,
    //             // since it's already saved on the Filesystem
    //             const photoCopy = { ...p };
    //             delete photoCopy.base64;
    //             return photoCopy;
    //           }))
    // });
  }

  private async savePhoto(cameraPhoto: CameraPhoto){
    // Convert photo to base64 format, required by Filesystem API to save
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();
    const base64Data = await this.convertBlobToBase64(blob) as string;

    const fileName = new Date().getTime()+'.jpg';
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });
    // Get platform-specific photo filepaths
    return await this.getPhotoFile(cameraPhoto, fileName);
  }
  public async loadPhoto(){
    // Retrieve cached photo array data
    //const photos = await Storage.get({ key: this.PHOTO_STORAGE });
    //this.photos = JSON.parse(photos.value) || [];

    //console.log("loadPhoto"+this.photos);

    const files = await Filesystem.readdir({
      path:"",
      directory: FilesystemDirectory.Data
    });
    // console.log(files.files);

    // Easiest way to detect when running on the web:
    // “when the platform is NOT hybrid, do this”
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      for (let fileName of files.files) {
      //for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
            path:fileName,// photo.filepath,
            directory: FilesystemDirectory.Data
        });

        // Web platform only: Save the photo into the base64 field
        this.photos.unshift({
          filepath:fileName,
          base64:`data:image/jpeg;base64,${readFile.data}`
        });
        //photo.base64 = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  private async getPhotoFile(cameraPhoto, fileName) {
    if (this.platform.is('hybrid')) {
      // Get the new, complete filepath of the photo saved on filesystem
      const fileUri = await Filesystem.getUri({
        directory: FilesystemDirectory.Data,
        path: fileName
      });

      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/core-concepts/webview#file-protocol
      return {
        filepath: fileUri.uri,
        webviewPath: Capacitor.convertFileSrc(fileUri.uri),
      };
    }
    else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
  }
  private async readAsBase64(cameraPhoto: CameraPhoto) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(cameraPhoto.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}
interface Photo {
  filepath: string;
  webviewPath?: string;
  base64?: string;
}
