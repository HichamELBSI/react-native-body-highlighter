import React from "react";
import { View } from "react-native";
import { Svg } from "react-native-svg";
import { innerJoin, assoc, differenceWith } from "ramda";

import bodyFront from "./assets/bodyFront";
import bodyBack from "./assets/bodyBack";

const { Polygon } = Svg;

const colorsIntensity = ["#0984e3", "#74b9ff"];

class Body extends React.Component {
  static defaultProps = {
    scale: 1,
    colors: colorsIntensity,
    backOnly: false,
    frontOnly: false
  };

  comparison = (a, b) => a.slug === b.slug;

  mergedMuscles = dataSource => {
    const { colors, data } = this.props;
    const innerData = innerJoin(
      (x, y) => x.slug === y.slug,
      dataSource,
      this.props.data
    );
    const coloredMuscles = innerData.map(d =>
      assoc("color", colors[data.find(e => e.slug === d.slug).intensity - 1], d)
    );
    const formattedMuscles = differenceWith(this.comparison, dataSource, data);
    return [...formattedMuscles, ...coloredMuscles];
  };

  getColorToFill = muscle => {
    let color;
    if (muscle.intensity) color = this.props.colors[muscle.intensity];
    else color = muscle.color;

    return color;
  };

  handleMusclePress = muscle => {
    const { onMusclePress } = this.props;
    if (onMusclePress) onMusclePress(muscle);
  };

  renderBodySvg = data => (
    <Svg height="200" width="100">
      {this.mergedMuscles(data).map(muscle =>
        muscle.pointsArray.map(points => (
          <Polygon
            key={points}
            onPress={() => this.handleMusclePress(muscle)}
            id={muscle.slug}
            fill={this.getColorToFill(muscle)}
            points={points}
          />
        ))
      )}
    </Svg>
  );

  render() {
    const { scale, frontOnly, backOnly } = this.props;

    return (
      <View
        style={{
          flexDirection: "row",
          transform: [{ scale }]
        }}
      >
        {!backOnly && this.renderBodySvg(bodyFront)}
        {!frontOnly && this.renderBodySvg(bodyBack)}
      </View>
    );
  }
}

export default Body;
