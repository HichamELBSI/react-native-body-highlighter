# react-native-body-highlighter

[![npm](https://img.shields.io/npm/v/react-native-body-highlighter.svg)](https://www.npmjs.com/package/react-native-body-highlighter) [![Downloads](https://img.shields.io/npm/dt/react-native-body-highlighter.svg)](https://www.npmjs.com/package/react-native-body-highlighter) [![Licence](https://img.shields.io/npm/l/react-native-body-highlighter.svg)](https://www.npmjs.com/package/react-native-body-highlighter)

> Simple body muscles highlighter for react-native.

<div style="text-align: center;">
<img src="./docs/screenshots/screenshot.jpeg" alt="body-highlighter" width="300"/>
</div>

## Installation

```bash
$ npm install react-native-body-highlighter --save
```

or use yarn

```bash
$ yarn add react-native-body-highlighter
```

## Usage

Note: If you don't use `Expo`, ensure to add [react-native-svg](https://github.com/react-native-community/react-native-svg) to your project before using this package.

The snippet below shows how the component can be used

```javascript
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Body from "react-native-body-highlighter";

const exercices = [
  {
    name: "Bench press",
    muscles: [
      { slug: "chest", intensity: 1 },
      { slug: "front-deltoids", intensity: 2 },
      { slug: "triceps", intensity: 2 }
    ]
  }
];

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Body scale={1} data={exercices[0].muscles} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
```

## Props

| Prop  | Required | Purpose                                    |
| ----- | -------- | ------------------------------------------ |
| data  | Yes      | (Array) Array of MuscleObject to highlight |
| scale | No       | (Float) Defaults to 1                      |

## Muscle object model

- #### MucleObject : `{ slug: MuscleName, intensity: IntensityNumber }`

- #### MuscleName : Muscle name to highlight (See the list of available muscles below)

- #### IntensityNumber : Color of highlight (0 = black, 1 = red, 2 = yellow)

## List of muscles

```Javascript
// Back
trapezius
upper-back
lower-back

// Chest
chest

// Arms
biceps
triceps
forearm
back-deltoids
front-deltoids

// Abs
abs
obliques

// Legs
adductor
hamstring
quadriceps
abductors
calves
gluteal

// Head
head
neck
```
