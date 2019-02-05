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
    colors: colorsIntensity
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

  renderBodySvg = data => (
    <Svg height="200" width="100">
      {this.mergedMuscles(data).map(muscle =>
        muscle.pointsArray.map(points => (
          <Polygon
            key={points}
            id={muscle.slug}
            fill={
              muscle.intensity
                ? this.props.colors[muscle.intensity]
                : muscle.color
            }
            points={points}
          />
        ))
      )}
    </Svg>
  );

  render() {
    const { scale } = this.props;

    return (
      <View
        style={{
          flexDirection: "row",
          transform: [{ scale }]
        }}
      >
        {this.renderBodySvg(bodyFront)}
        {this.renderBodySvg(bodyBack)}
      </View>
    );
  }
}

export default Body;
