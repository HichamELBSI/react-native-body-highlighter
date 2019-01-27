import React from "react";
import { View } from "react-native";
import { Svg } from "react-native-svg";
import { innerJoin, assoc, differenceWith } from "ramda";

import bodyFront from "./assets/bodyFront";
import bodyBack from "./assets/bodyBack";

const { Polygon } = Svg;

const colorsIntensity = {
  1: "#c44569",
  2: "#f19066"
};

class Body extends React.Component {
  static defaultProps = {
    scale: 1
  };

  comparison = (a, b) => a.slug === b.slug;

  mergedMuscles = dataSource => {
    const innerData = innerJoin(
      (x, y) => x.slug === y.slug,
      dataSource,
      this.props.data
    );
    const coloredMuscles = innerData.map((d, index) =>
      assoc(
        "color",
        colorsIntensity[this.props.data.find(e => e.slug === d.slug).intensity],
        d
      )
    );
    const formattedMuscles = differenceWith(
      this.comparison,
      dataSource,
      this.props.data
    );
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
                ? colorsIntensity[muscle.intensity]
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
