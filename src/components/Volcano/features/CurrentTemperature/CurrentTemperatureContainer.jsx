import { useEffect, useState } from "react";
import { getCharacteristic } from "../../../../services/BleCharacteristicCache";
import { currentTemperatureUuid } from "../../../../constants/uuids";
import { AddToQueue } from "../../../../services/bleQueueing";
import CurrentTemperature from "./CurrentTemperature";
import { MIN_CELSIUS_TEMP } from "../../../../constants/temperature";
import {
  convertCurrentTemperatureCharacteristicToCelcius,
  getDisplayTemperature,
} from "../../../../services/utils";

export default function CurrentTemperatureContainer(props) {
  const [currentTemperature, setCurrentTemperature] =
    useState(MIN_CELSIUS_TEMP);
  useEffect(() => {
    const characteristic = getCharacteristic(currentTemperatureUuid);
    const onCharacteristicChange = (event) => {
      const currentTemperature =
        convertCurrentTemperatureCharacteristicToCelcius(event.target.value);
      setCurrentTemperature(currentTemperature);
    };
    const BlePayload = async () => {
      characteristic.addEventListener(
        "characteristicvaluechanged",
        onCharacteristicChange
      );
      characteristic.startNotifications();
      const value = await characteristic.readValue();
      const normalizedValue =
        convertCurrentTemperatureCharacteristicToCelcius(value);
      setCurrentTemperature(normalizedValue);
      return "The value of temp read is " + normalizedValue;
    };
    AddToQueue(BlePayload);
    return () => {
      characteristic.removeEventListener(
        "characteristicvaluechanged",
        onCharacteristicChange
      );
    };
  }, []);

  return (
    <CurrentTemperature
      currentTemperature={getDisplayTemperature(currentTemperature, props.isF)}
    />
  );
}
