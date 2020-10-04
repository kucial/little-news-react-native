import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableNativeFeedback,
  Linking,
  ImageBackground,
} from 'react-native';

function Article({featuredTitle, featuredText, url, image}) {
  return (
    <View style={styles.container}>
      <TouchableNativeFeedback
        useForground
        onPress={() => {
          Linking.openURL(url);
        }}>
        <View style={styles.card}>
          <ImageBackground source={image} style={styles.cover}>
            <Text style={styles.title}>{featuredTitle}</Text>
          </ImageBackground>
          <Text style={styles.desc}>{featuredText}</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

export default Article;

const styles = StyleSheet.create({
  container: {
    marginLeft: 12,
    marginRight: 12,
    marginBottom: 12,
  },
  card: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: 150,
    paddingVertical: 12,
    flex: 1,
    resizeMode: 'cover',
    // justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    color: 'white',
    marginHorizontal: 8,
    textShadowColor: 'rgba(0, 0, 0, .3)',
    textShadowRadius: 2,
    textShadowOffset: {
      width: 1,
      height: 1,
    },
  },
  desc: {
    padding: 8,
  },
});
