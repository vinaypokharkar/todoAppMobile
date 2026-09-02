/**
 * @format
 */

import 'react-native-gesture-handler'; // MUST be the very first import in the entry file
import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
