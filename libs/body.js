import React from "react";
import {
  View,
  TouchableWithoutFeedback,
  Modal,
  TouchableOpacity,
  Text,
  StyleSheet,
  YellowBox
} from "react-native";
import Svg, { Polygon, Path } from "react-native-svg";
import { innerJoin, assoc, differenceWith } from "ramda";

import bodyFront from "./assets/bodyFront";
import bodyBack from "./assets/bodyBack";

const colorsIntensity = ["#0984e3", "#74b9ff"];

class Body extends React.Component {
  static defaultProps = {
    scale: 1,
    colors: colorsIntensity,
    backOnly: false,
    frontOnly: false,
    zoomOnPress: false
  };

  state = {
    openInModal: false
  };

  comparison = (a, b) => a.slug === b.slug;

  componentDidUpdate() {
    const { onMusclePress, zoomOnPress } = this.props;

    if (onMusclePress && zoomOnPress) {
      console.warn(
        "props 'onMusclePress' is disable if props 'zoomOnPress' is set to true"
      );
    }
  }

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
    const { onMusclePress, zoomOnPress } = this.props;
    const { openInModal } = this.state;

    if (onMusclePress && !zoomOnPress) onMusclePress(muscle);

    if (zoomOnPress && !openInModal) this.toggleZoom();
  };

  toggleZoom = () =>
    this.setState(state => ({ openInModal: !state.openInModal }));

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
    const { scale, frontOnly, backOnly, zoomOnPress } = this.props;
    const { openInModal } = this.state;

    return (
      <TouchableWithoutFeedback
        onPress={zoomOnPress ? this.toggleZoom : undefined}
      >
        <View>
          <View
            style={{
              flexDirection: "row",
              transform: [{ scale }]
            }}
          >
            {!backOnly && this.renderBodySvg(bodyFront)}
            {!frontOnly && this.renderBodySvg(bodyBack)}
          </View>
          <Modal
            hardwareAccelerated
            presentationStyle="fullScreen"
            animationType="none"
            transparent={false}
            visible={openInModal}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeModal}
                onPress={this.toggleZoom}
              >
                <Svg height="24" width="24">
                  <Path
                    d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"
                    fill="black"
                  />
                </Svg>
              </TouchableOpacity>
              <View style={styles.modalContent}>
                {!backOnly && this.renderBodySvg(bodyFront)}
                {!frontOnly && this.renderBodySvg(bodyBack)}
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    transform: [{ scale: 2 }],
    flexDirection: "row"
  },
  closeModal: {
    position: "absolute",
    top: 30,
    right: 10
  }
});

export default Body;
