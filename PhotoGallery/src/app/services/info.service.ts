import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
const { Device, Geolocation, SplashScreen, Toast } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  public info = { };
  constructor() { }

  public async Info(){
    // Info
    const info = await Device.getInfo();
    // console.log(info);
    const battery = await Device.getBatteryInfo();
    // console.log(battery);
    const coordinates = await Geolocation.getCurrentPosition();
    // console.log('Current', coordinates);
    SplashScreen.hide();

    await Toast.show({
      text: 'Some Basic Info!'
    });

    // Show the splash for two seconds and then auto hide:
    await SplashScreen.show({
      showDuration: 10000,
      autoHide: true
    });

    this.info = {
      os:info.osVersion,
      model:info.model,
      platform:info.platform,
      battery: battery.batteryLevel,
      //location: {
        latitude: coordinates.coords.latitude,
        longitude:  coordinates.coords.longitude
      //}
    };

    // Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
    //   console.log('keyboard will show with height', info.keyboardHeight);
    // });
    //
    // Keyboard.addListener('keyboardDidShow', (info: KeyboardInfo) => {
    //   console.log('keyboard did show with height', info.keyboardHeight);
    // });
    //
    // Keyboard.addListener('keyboardWillHide', () => {
    //   console.log('keyboard will hide');
    // });
    //
    // Keyboard.addListener('keyboardDidHide', () => {
    //   console.log('keyboard did hide');
    // });
    //
    // // window events
    //
    // window.addEventListener('keyboardWillShow', (e) => {
    //   console.log('keyboard will show with height', (<any>e).keyboardHeight);
    // });
    //
    // window.addEventListener('keyboardDidShow', (e) => {
    //   console.log("keyboard did show with height", (<any>e).keyboardHeight);
    // });
    //
    // window.addEventListener('keyboardWillHide', () => {
    //   console.log('keyboard will hide');
    // });
    //
    // window.addEventListener('keyboardDidHide', () => {
    //   console.log('keyboard did hide');
    // });
    //
    // // API
    //
    // Keyboard.setAccessoryBarVisible({isVisible: false});
    //
    // Keyboard.show();
  }
}
