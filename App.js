import React from 'react';
import { StyleSheet, Text, View,
         Button, TextInput, Picker,
         Alert, Switch, Platform } from 'react-native';
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
      listeners: {}
    };
  }

  async componentDidMount() {
    try {
      let client = new LDClient();

      let clientConfig =
          { "mobileKey": "YOUR_MOBILE_KEY",
            "baseUri": "https://app.launchdarkly.com",
            "streamUri": "https://clientstream.launchdarkly.com",
            "eventsUri": "https://mobile.launchdarkly.com",
            "eventsCapacity": 100,
            "eventsFlushIntervalMillis": 30000,
            "connectionTimeoutMillis": 10000,
            "pollingIntervalMillis": 300000,
            "backgroundPollingIntervalMillis": 3600000,
            "useReport": false,
            "stream": true,
            "disableBackgroundUpdating": false,
            "offline": false,
            "debugMode": true
          };

      let userConfig = { "key": this.state.userKey };

      await client.configure(clientConfig, userConfig);
      this.setState({ldClient: client});
    } catch(err) {
      console.error(err);
    }
  }

  async evalFlag() {
    let res;
    let client = this.state.ldClient;
    if ( this.state.flagType === "bool" ) {
      res = await client.boolVariation(this.state.flagKey, false);
    } else if ( this.state.flagType === "string" ) {
      res = await client.stringVariation(this.state.flagKey, "");
    } else if ( this.state.flagType === "int" ) {
      res = await client.intVariation(this.state.flagKey, 0);
    } else if ( this.state.flagType === "float" ) {
      res = await client.floatVariation(this.state.flagKey, 0.0);
    } else if ( this.state.flagType === "json" ) {
      let obj = await client.jsonVariation(this.state.flagKey, {});
      res = JSON.stringify(obj);
    }

    Alert.alert('LD Server Response', String(res));
  }

  async track() {
    this.state.ldClient.track(this.state.flagKey, false);
  }

  async identify(user) {
    try {
      await this.state.ldClient.identify(user);
      Alert.alert('Identify', 'success');
    } catch(err) {
      Alert.alert('Identify', 'fail');
    }
  }

  async listen(key) {
    if (this.state.listeners.hasOwnProperty(key))
      return;
    let listener = value => Alert.alert('Listener Callback', value);
    this.state.ldClient.registerFeatureFlagListener(key, listener);
    this.setState({listeners: {...this.state.listeners, ...{[key]: listener}}})
  }

  async removeListener(key) {
    this.state.ldClient.unregisterFeatureFlagListener(key, this.state.listeners[key]);
    let {[key]: omit, ...newListeners} = this.state.listeners;
    this.setState({listeners: newListeners});
  }

  async flush() {
    this.state.ldClient.flush();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{fontWeight: 'bold'}}>LaunchDarkly React Native Example</Text>
        <View>
          <Picker
            selectedValue={this.state.flagType}
            style={{ height: 50, width: 200 }}
            onValueChange={(itemValue, itemIndex) => this.setState({flagType: itemValue})}>
            <Picker.Item label="Boolean" value="bool" />
            <Picker.Item label="String" value="string" />
            <Picker.Item label="Integer" value="int" />
            <Picker.Item label="Float" value="float" />
            <Picker.Item label="JSON" value="json" />
          </Picker>
          <Text>Feature Key:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => this.setState({flagKey: text})}
            value={this.state.flagKey}
          />
          <View style={styles.button}>
            <Button
              title="Evaluate Flag"
              onPress={() => this.evalFlag()}
            />
          </View>
        </View>
        <View>
          <View style={styles.button}>
            <Button
              title="Track"
              onPress={() => this.track()}
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Flush"
              onPress={() => this.flush()}
            />
          </View>
          <Text>Offline</Text>
          <Switch
            value={this.state.isOffline}
            onValueChange={(value) => {
              if (value) {
                this.state.ldClient.setOffline();
              } else {
                this.state.ldClient.setOnline();
              }
              this.setState({isOffline: value});
            }}
          />
        </View>
        <View>
          <Text>User Key:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => this.setState({userKey: text})}
            value={this.state.userKey}
          />
          <View style={styles.button}>
            <Button
              title="Identify"
              onPress={() => this.identify({key: this.state.userKey, firstName: 'John', lastName: 'Smith', email: 'john.smith@smith.net', isAnonymous: false, privateAttributeNames: ['random'], customAttributes: {'random': 'random'}})}
            />
          </View>
        </View>
        <View>
          <Text>Feature Flag Listener Key:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => this.setState({featureFlagListenerKey: text})}
            value={this.state.featureFlagListenerKey}
          />
          <View style={styles.button}>
            <Button
              title="Listen"
              onPress={() => this.listen(this.state.featureFlagListenerKey)}
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Remove"
              onPress={() => this.removeListener(this.state.featureFlagListenerKey)}
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
  input: {
    height: 35,
    width: 300,
    borderColor: 'gray',
    borderWidth: 1
  },
  button: {
    padding: 10
  }
});
