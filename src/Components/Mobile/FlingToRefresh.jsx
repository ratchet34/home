import React from "react";
import PropTypes from "prop-types";
import { StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const FlingToRefresh = ({ onRefresh, children }) => {
  const flingDown = Gesture.Fling()
    .direction(Directions.DOWN)
    .onStart((e) => {
      console.log("Fling started", e);
    })
    .onEnd(() => {
      console.log("Refreshing...");
      setTimeout(() => onRefresh(), 1000);
      // }
    });

  return (
    <GestureDetector gesture={flingDown}>
      <Animated.View style={styles.container}>{children}</Animated.View>
    </GestureDetector>
  );
};

FlingToRefresh.propTypes = {
  onRefresh: PropTypes.func, // Function to trigger when scrolled to the top
  children: PropTypes.node, // Children components to be wrapped
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
});

export default FlingToRefresh;
