import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Button,
  Image,
  PermissionsAndroid, Picker,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import MapView, {Marker} from 'react-native-maps';

let arrayCityDrive = {
  cars: [
    {
      latitude: 59.878976,
      longitude: 30.285504,
      pin_img: 'https://youdrive.today/static/resources/car_pointer/x-trail',
      color: 'white',
      model: 'Nissan Qashqai',
      img: 'https://citydrive.ru/static/cars/v3/poolstart/msk/Qashqai_white.png',
      transmission: 'automatic',
      fuel: 70,
      discount: 0,
      is_parther: false,
    },
  ],
  success: true,
};

const generateMarkersFromApi = (carsCityDrive, carsDelimobil, selectedValue) => {
  const result = [];
  if (Array.isArray(carsCityDrive)) {
    carsCityDrive.map((car, index) => {
      let icon = require('./Images/cityDrive.png');
      const newMarker = {
        coordinate: {
          latitude: car.latitude,
          longitude: car.longitude,
        },
        title: car.model,
        description: 'Топливо: ' + car.fuel,
        icon: icon,
        key: `foo${index++}`,
      };
      const regex = new RegExp(selectedValue,'i');
      if (selectedValue == 'Все') {
        result.push(newMarker);
      } else {
        if (regex.test(car.model)) {
          result.push(newMarker);
        }
      }
    });
  }

  carsDelimobil.map((car, index) => {
    let icon = require('./Images/delimobil.png');
    const newMarker = {
      coordinate: {
        latitude: car.latitude,
        longitude: car.longitude,
      },
      title: car.model,
      description: 'Делимобиль',
      icon: icon,
      key: `fo1o${index++}`,
    };
    const regex = new RegExp(selectedValue,'i');
    if (selectedValue == 'Все') {
      result.push(newMarker);
    } else {
      if (regex.test(car.model)) {
        result.push(newMarker);
      }
    }
  });

  return result;
};

const App = () => {
  let [carsCityDrive, setCarsCityDrive] = useState(arrayCityDrive.cars);
  let [carsDelimobil, setCarsDelimobil] = useState(arrayCityDrive.cars);
  let [isLoading, setIsLoading] = useState(false);
  let [markers, setMarkers] = useState([]);
  let [isCityDriveServiceEnabled, setIsCityDriveServiceEnabled] = useState(true);
  let [isDelimobilServiceEnabled, setIsDelimobilServiceEnabled] = useState(true);
  const [selectedValue, setSelectedValue] = useState('Все');
  // let markers = [];

  const [region, setRegion] = useState({
    latitude: 59.950764,
    longitude: 30.577787,
    latitudeDelta: 0.009,
    longitudeDelta: 0.009,
  });
  const getCarsCityDrive = () => {
    fetch('https://citydrive.ru/info')
      .then(response => response.json())
      .then(jsonData => {
        setCarsCityDrive(jsonData.cars);
        setMarkers(generateMarkersFromApi(carsCityDrive, carsDelimobil, selectedValue));
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getCarsDelimobil = () => {
    fetch('https://api.delimobil.ru/api/cars?regionId=2')
      .then(response => response.json())
      .then(jsonData => {
        let cars = jsonData.geojson.features.map((item, index) => {
          return {
            latitude: item.geometry.coordinates[1],
            longitude: item.geometry.coordinates[0],
            model: item.properties.model,
            type: 2,
            fuel: 'Нет данных',
          };
        });
        setCarsDelimobil(cars);
        setMarkers(generateMarkersFromApi(carsCityDrive, carsDelimobil, selectedValue));
      })
      .catch(error => {
        // handle your errors here
        console.error(error);
      });
  };

  const toggleCityDriveSwitch = () => {
    setIsCityDriveServiceEnabled(oldValue => !oldValue);
  };

  const toggleDelimobilSwitch = () => {
    setIsDelimobilServiceEnabled(oldValue => !oldValue);
  };

  const getCars = () => {
    setMarkers([]);
    setIsLoading(true);
    isCityDriveServiceEnabled ? getCarsCityDrive() : setCarsCityDrive([]);
    isDelimobilServiceEnabled ? getCarsDelimobil() : setCarsDelimobil([]);
    setTimeout(() => {
      setIsLoading(false);
      if (!isCityDriveServiceEnabled && !isDelimobilServiceEnabled) {
        setMarkers(generateMarkersFromApi(carsCityDrive, carsDelimobil, selectedValue));
      }
    }, 5000);
  };

  const _map = useRef(null);
  const [mapWidth, setMapWidth] = useState('99%');
  // Update map style to force a re-render to make sure the geolocation button appears
  const updateMapStyle = () => {
    setMapWidth('100%');
  };

  // Request geolocation in Android since it's not done automatically
  const requestGeoLocationPermission = () => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
  };
  useEffect(() => {
    return () => console.log(1);
  }, []);
  const styles = StyleSheet.create({
    map: {
      width: '100%',
      height: '100%',
    },
    button: {
      width: 80,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginHorizontal: 10,
    },
    buttonContainer: {
      position: 'absolute',
      flexDirection: 'row',
      backgroundColor: 'red',
      bottom: 40,
      alignSelf: 'center',
    },
    bubble: {
      backgroundColor: 'rgba(255,255,255,0.7)',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 20,
    },
    loader: {
      position: 'absolute',
      top: '50%',
      bottom: 0,
      right: 0,
      left: 0,
    },
    switches: {
      position: 'absolute',
      left: 0,
      top: 10,

      paddingLeft: 10,
    },
    switchRow: {
      flexDirection: 'row',
      paddingBottom: 10,
    },
    serviceLogo: {
      width: 30,
      height: 30,
    },
  });
  return (
    <View>
      <MapView
        ref={_map}
        style={[styles.map, {width: mapWidth}]}
        onMapReady={() => {
          requestGeoLocationPermission();
          updateMapStyle();
        }}
        region={region}
        onRegionChangeComplete={region => setRegion(region)}
        showsCompass={true}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsScale={true}
        zoomEnabled={true}
        toolbarEnabled={true}
        zoomControlEnabled={true}>
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            image={marker.icon}
          />
        ))}
      </MapView>
      <View style={styles.switches}>
        <View style={styles.switchRow}>
          <Image
            style={styles.serviceLogo}
            source={require('./Images/cdlogo50x50.png')}
          />
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isCityDriveServiceEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleCityDriveSwitch}
            value={isCityDriveServiceEnabled}
          />
        </View>
        <View style={styles.switchRow}>
          <Image
            style={styles.serviceLogo}
            source={require('./Images/246x0w.png')}
          />
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isDelimobilServiceEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleDelimobilSwitch}
            value={isDelimobilServiceEnabled}
          />
        </View>
        <Picker
            selectedValue={selectedValue}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
        >
          <Picker.Item label="Все" value="Все" />
          <Picker.Item label="Nissan Qashqai" value="qashqai" />
          <Picker.Item label="X-trail" value="X-Trail" />
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#00ff00" />
        ) : (
          <Button title="Обновить" color="#f194ff" onPress={() => getCars()} />
        )}
      </View>
    </View>
  );
};

export default App;
