import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Picker,
  Alert,
  Switch,
  Modal,
  TouchableHighlight,
} from 'react-native';
import LDClient from 'launchdarkly-react-native-client-sdk';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ldClient: null,
      flagKey: '',
      flagType: 'bool',
      isOffline: false,
      userKey: 'user key',
      featureFlagListenerKey: '',
      modalVisible: false,
      modalText: '',
      listeners: {},
    };
  }

  async componentDidMount() {
    try {
      let client = new LDClient();

      //This config object is shown as an example with the defaults, you do not need to specify all of these values in your application.
      let clientConfig = {
        mobileKey: 'mob-b0c4d988-e14a-4b9a-b958-8c73c0dccb9d',
        baseUri: 'https://app.launchdarkly.com',
        streamUri: 'https://clientstream.launchdarkly.com',
        eventsCapacity: 100,
        eventsFlushIntervalMillis: 30000,
        connectionTimeoutMillis: 10000,
        pollingIntervalMillis: 300000,
        backgroundPollingIntervalMillis: 3600000,
        useReport: false,
        stream: true,
        disableBackgroundUpdating: false,
        offline: false,
        debugMode: true,
      };

      let userConfig = {key: this.state.userKey};

      await client.configure(clientConfig, userConfig);
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ldClient: client});
    } catch (err) {
      console.error(err);
    }
  }







  async listen(key) {
    if (this.state.listeners.hasOwnProperty(key)) {
      return;
    }
    let listener = value => Alert.alert('Listener Callback', value);
    this.state.ldClient.registerFeatureFlagListener(key, listener);
    this.setState({listeners: {...this.state.listeners, ...{[key]: listener}}});
  }

  async removeListener(key) {
    this.state.ldClient.unregisterFeatureFlagListener(
      key,
      this.state.listeners[key],
    );
    let {[key]: omit, ...newListeners} = this.state.listeners;
    this.setState({listeners: newListeners});
  }
  render() {
    return (
      <View style={styles.container}>
        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <Text style={{fontWeight: 'bold'}}>
          LaunchDarkly React Native Example
        </Text>

        <View>
          <Text>Enter your flag name here.</Text>
          <TextInput
            style={styles.input}
            onChangeText={text => this.setState({featureFlagListenerKey: text})}
            value={this.state.featureFlagListenerKey}
          />

          <View style={styles.button}>
            <Button
              title="Listen to your flag!"
              onPress={() => this.listen(this.state.featureFlagListenerKey)}
            />
          </View>
          <View style={styles.button}>
          <Text>Once we're listening to a flag, update the flag in LaunchDarkly to see your changes update!</Text>
            <Button
              title="Stop listening to your flag."
              onPress={() =>
                this.removeListener(this.state.featureFlagListenerKey)
              }
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    padding: 100,
  },
  input: {
    height: 35,
    width: 300,
    borderColor: 'gray',
    borderWidth: 1,
  },
  closeModal: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
  button: {
    padding: 10,
  },
  buttons: {
    flexDirection: 'row',
  },
});
