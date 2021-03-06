
//The last four to control the side menu

import { App, MenuController, NavParams, ToastController, LoadingController } from 'ionic-angular';

import { Platform, AlertController, NavController } from 'ionic-angular';
import { NFC, Ndef, IBeacon, BLE } from 'ionic-native';
import {InAppBrowser, ThemeableBrowser, LocalNotifications} from 'ionic-native';
import {LoginPage}from '../../login-page/login-page';
import { Component, NgZone } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

declare var cordova:any;

@Component({
  selector: 'home',
  templateUrl: 'home.html'
})

export class HomePage {

  //private nav:NavController = null;//added
  //private nav:NavController = null;//added
  data:any;
  public tag:any;
  ListenerAdded:number;
  green:number;
  blue:number;
  exit:number;



  /* static get parameters() {
   return [[Platform], [NavController]];
   }*/


  constructor( private platform: Platform, private navCtrl: NavController, private alertCtrl: AlertController, private zone: NgZone, public http: Http, public menu: MenuController , public app: App) {

    //this.menu.swipeEnable(false);//side menu disable
    this.platform = platform;
    this.navCtrl = navCtrl;
    //this.beaconCount = 0
    this.tag = {};
    this.ListenerAdded = 0;
    this.blue = 0;
    this.green = 0;
	this.exit = 0;


  }


  ionViewDidLoad(){

    this.http.get('http://utehs.herokuapp.com/getCodes').map(res => res.json()).subscribe(data => {
        this.data=data;
        console.log(this.data);
      },
      err => {
        console.log("Oops!");
      }
    );
	
	//Uncomment this to run Beacons without having to press the button.
	//remove from the home.html page as well to remove button.
	//Currently commented out for demo resons.
	//this.bluetooth();
  }



  loginPage(){
    // let nav = this.app.getRootNav();
    //nav.setRoot(LoginPage);
    this.navCtrl.push(LoginPage);
  }

  /* activityPage(){
   this.navCtrl.push(ActivityPage);
   }*/

  launch_themeable(arg){
    let options = {
      statusbar: {
        color: '#ffffffff'
      },
      toolbar: {
        height: 44,
        color: '#2B547E'
      },
      title: {
        color: '#f0f0f0ff',
        showPageTitle: true
      },
      backButton: {
        image: 'ic_action_previous_item',
        imagePressed: 'ic_action_previous_item',
        align: 'left',
        event: 'backPressed'
      },

      backButtonCanClose: true
    };

    let browser = new ThemeableBrowser(arg, '_blank', options);


  }


  scan() {
    this.platform.ready().then(() => {
      cordova.plugins.barcodeScanner.scan((result) => {

        var counter=0;

        for(counter; counter<this.data.length; counter++){
          if(this.data[counter].code==result.text){
            this.launch_themeable(this.data[counter].resource);
            break;
          }
        }
        if(counter==this.data.length){
          alert("There is no resource for the given scan item.");
        }


        /*
         //A simple if statement that calls launch_themeable() to display web pages.

         if(result.text=="Lab Coat Guidelines"){

         this.launch_themeable('https://docs.google.com/gview?embedded=true&url=ehs.utoronto.ca/wp-content/uploads/2016/02/Lab-Coat-Guidelines.pdf');

         }else if(result.text=="Chemical Spills"){

         this.launch_themeable('https://ehs.utoronto.ca/report-an-incident/emergency-procedures/chemical-spill-procedures/');

         }else if(result.text=="Fume Hoods User Guidelines"){

         this.launch_themeable('https://docs.google.com/gview?embedded=true&url=ehs.utoronto.ca/wp-content/uploads/2016/12/Fume-Hoods-05-User-Guidelines-Updated.pdf');

         }else if(result.text=="Machine Safety Guidelines"){

         this.launch_themeable('https://docs.google.com/gview?embedded=true&url=ehs.utoronto.ca/wp-content/uploads/2015/10/Machine-Safety-Guidelines-2015.pdf');
         }else{

         alert("Scan Results"+ ': ' +result.text);
         }
         */


      }, (error) => {

        alert("Attention!"+ ': ' +error);


      });
    });
  }

  nfcPage() {
    this.platform.ready().then(() => {
      this.checkNFC();
    });
  }

  //Add a variable so can only added lisenter once
  checkNFC() {
    NFC.enabled()
    //Success
      .then(() => {
        console.log(this.ListenerAdded);
        if(this.ListenerAdded == 0){
          alert("NFC Enabled");
          this.addListenNFC();
        }
        else{
          console.log("NFC already on");
        }


      })
      //failure
      .catch(() => {

        //confirm alert doesn't work after merge
        /* 		let confirm = this.alertCtrl.create({
         title: 'NFC is currently disabled',
         message: 'Please enable NFC',
         buttons: [
         {
         text: 'Cancel'
         },
         {
         text: 'Go to Settings',
         handler: () => { */

        //use basic alert for now
        alert("Please enable NFC");
        NFC.showSettings();;
        /* 				}
         }
         ]
         });
         confirm.present(); */

      });
  }

  addListenNFC() {
    this.ListenerAdded = 1;
    NFC.addNdefListener().subscribe(nfcData => {
      this.parse(nfcData);
    });
  }


  parse(nfcData){
    let payload = nfcData.tag.ndefMessage[0]["payload"];
    let string_value = this.bin2string(payload);
    string_value = "http://" + string_value.slice(1, );
	//alert("Receved NFC tag: " + string_value);
    this.launch_themeable(string_value);
  }

  beacon(){
    this.platform.ready().then(() => {
      this.bluetooth();
    });

  }

  bluetooth(){
	//alert("Beacon button pressed");
	this.blue = 0;
	this.green = 0;
	this.exit = 0;
    BLE.isEnabled()
      .then( () => {
        //alert(this.beaconCount);
        //alert("hello");
        //if(this.beaconCount%2 == 0){ //Enable monitoring

        this.detect();


        // }
        //else{ //disable monitoring
        //  this.disable();
        //}


        //this.beaconCount++;
      })
      .catch( () => {
        alert("Disabled");
        BLE.showBluetoothSettings();
      });



  }

  detect(){
    // Request permission to use location on iOS
    IBeacon.requestAlwaysAuthorization();
    // create a new delegate and register it with the native layer
    let delegate = IBeacon.Delegate();

    // Subscribe to some of the delegate's event handlers
    delegate.didStartMonitoringForRegion()
      .subscribe(
        data => {console.log('didStartMonitoringForRegion: ', data);}
        //error => console.error();
      );

    delegate.didEnterRegion()
      .subscribe(
        data => {
          console.log('didEnterRegion: ', data);
          let page = data.region.identifier;
          //alert("ENTER REGION " + page);
          //will need some lookup table for the different beacons
          if(page == "LabGoggles"){
            if(this.green == 0){
              //alert(page);
              //this.launch_themeable("https://ehs.utoronto.ca/");
			  alert("This area contains lasers. Please put on the Safety Goggles");
			  LocalNotifications.schedule({
				 id:1,
				 text: 'Entering Beacon Zone',
			  });
            }

          }
          if(page == "LabCoat" && !this.blue){ //Think there may be a bug if themable browser gets launched twice
            //this.launch_themeable("https://ehs.utoronto.ca/resources/");
			alert("This area is unsafe. Please return to the EHS demo.");
			LocalNotifications.schedule({
				 id: 2,
				 text: 'Entering Beacon Zone',
			  });
          }

        }
      );


    delegate.didExitRegion()
      .subscribe(
        data => {
          console.log('didExitRegion: ', data);
          let page = data.region.identifier;
          //alert("EXIT REGION " + page);
          //will need some lookup table for the different beacons
          if(page == "LabGoggles" && !this.exit){
            //maybe add a variable here so only opens once every day
            //this.launch_themeable("https://ehs.utoronto.ca/");
            //console.log("Exit Beacon range");
			alert("Please remember to remove the goggles");
            this.green = 1;
			this.exit = 1;
          }
          if(page == "LabCoat"){ //Think there may be a bug if themable browser gets launched twice
            this.blue = 1;
            //this.launch_themeable("https://ehs.utoronto.ca/resources/");
          }

        }
      );


    let greenBeacon = IBeacon.BeaconRegion('LabGoggles','b9407f30-f5f8-466e-aff9-25556b57fe6e');
    let blueBeacon = IBeacon.BeaconRegion('LabCoat','b9407f30-f5f8-466e-aff9-25556b57fe6d');

    IBeacon.startMonitoringForRegion(blueBeacon)
      .then(
        (data) => {console.log('startMonitoringForRegion: ' + data);
        }
      );

    IBeacon.startMonitoringForRegion(greenBeacon)
      .then(
        (data) => {console.log('startMonitoringForRegion: ' + data);
        }
      );

  }
  disableBeacon(){
    let blueBeacon = IBeacon.BeaconRegion('LabGoggles','b9407f30-f5f8-466e-aff9-25556b57fe6e');
    let greenBeacon = IBeacon.BeaconRegion('LabCoat','b9407f30-f5f8-466e-aff9-25556b57fe6d');
    IBeacon.stopMonitoringForRegion(greenBeacon);
    IBeacon.stopMonitoringForRegion(blueBeacon);
  }

  bin2string(array){
    let result = "";
    for(let i = 0; i < array.length; ++i){
      result+= (String.fromCharCode(array[i]));
    }
    return result;
  }

  nfcWrite(){
    let message = Ndef.textRecord('Hello world');
    NFC.write([message])
      .then( ()=> {
        alert("success");
      })
      .catch( () =>{
        alert("failure");
      });
  }

}
