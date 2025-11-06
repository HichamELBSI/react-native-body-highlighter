import React from "react";
import { render } from "@testing-library/react-native";
import Body from "../index";

describe("Body Component", () => {
  const mockData = [
    { slug: "chest", intensity: 1 },
    { slug: "biceps", intensity: 2 },
  ];

  it("should render the body component", () => {
    const { toJSON } = render(<Body data={mockData} />);
    expect(toJSON()).toBeTruthy();
  });

  describe("Per-Part Style Props", () => {
    it("should apply per-part fill style", () => {
      const dataWithStyles = [
        {
          slug: "chest",
          styles: {
            fill: "#ff0000",
          },
        },
      ];

      const { UNSAFE_getAllByProps } = render(<Body data={dataWithStyles} />);
      const paths = UNSAFE_getAllByProps({ id: "chest" });
      expect(paths.length).toBeGreaterThan(0);
      // All chest paths should have the custom fill color
      paths.forEach(path => {
        expect(path.props.fill).toBe("#ff0000");
      });
    });

    it("should apply per-part stroke style", () => {
      const dataWithStyles = [
        {
          slug: "chest",
          styles: {
            stroke: "#000000",
            strokeWidth: 2,
          },
        },
      ];

      const { UNSAFE_getAllByProps } = render(<Body data={dataWithStyles} />);
      const paths = UNSAFE_getAllByProps({ id: "chest" });
      paths.forEach(path => {
        expect(path.props.stroke).toBe("#000000");
        expect(path.props.strokeWidth).toBe(2);
      });
    });

    it("should prioritize per-part styles.fill over color prop", () => {
      const dataWithStyles = [
        {
          slug: "chest",
          color: "#00ff00",
          styles: {
            fill: "#ff0000",
          },
        },
      ];

      const { UNSAFE_getAllByProps } = render(<Body data={dataWithStyles} />);
      const paths = UNSAFE_getAllByProps({ id: "chest" });
      paths.forEach(path => {
        expect(path.props.fill).toBe("#ff0000");
      });
    });

    it("should prioritize per-part styles.fill over intensity-based color", () => {
      const dataWithStyles = [
        {
          slug: "chest",
          intensity: 2,
          styles: {
            fill: "#ff0000",
          },
        },
      ];

      const { UNSAFE_getAllByProps } = render(
        <Body data={dataWithStyles} colors={["#74b9ff", "#0984e3"]} />
      );
      const paths = UNSAFE_getAllByProps({ id: "chest" });
      paths.forEach(path => {
        expect(path.props.fill).toBe("#ff0000");
      });
    });
  });

  describe("Global Default Style Props", () => {
    it("should apply defaultFill when no per-part style is provided", () => {
      const simpleData = [{ slug: "chest" }];

      const { UNSAFE_getAllByProps } = render(
        <Body data={simpleData} defaultFill="#cccccc" />
      );
      const paths = UNSAFE_getAllByProps({ id: "chest" });
      paths.forEach(path => {
        expect(path.props.fill).toBe("#cccccc");
      });
    });

    it("should apply defaultStroke and defaultStrokeWidth globally", () => {
      const simpleData = [{ slug: "chest" }];

      const { UNSAFE_getAllByProps } = render(
        <Body
          data={simpleData}
          defaultStroke="#999999"
          defaultStrokeWidth={3}
        />
      );
      const paths = UNSAFE_getAllByProps({ id: "chest" });
      paths.forEach(path => {
        expect(path.props.stroke).toBe("#999999");
        expect(path.props.strokeWidth).toBe(3);
      });
    });

    it("should use default values when no style props provided", () => {
      const simpleData = [{ slug: "chest" }];

      const { UNSAFE_getAllByProps } = render(<Body data={simpleData} />);
      const paths = UNSAFE_getAllByProps({ id: "chest" });
      paths.forEach(path => {
        expect(path.props.fill).toBe("#3f3f3f"); // default fill
        expect(path.props.stroke).toBe("none"); // default stroke
        expect(path.props.strokeWidth).toBe(0); // default strokeWidth
      });
    });
  });

  describe("Backward Compatibility", () => {
    it("should still support color prop without styles", () => {
      const dataWithColor = [
        { slug: "chest", color: "#00ff00" },
      ];

      const { UNSAFE_getAllByProps } = render(<Body data={dataWithColor} />);
      const paths = UNSAFE_getAllByProps({ id: "chest" });
      paths.forEach(path => {
        expect(path.props.fill).toBe("#00ff00");
      });
    });

    it("should still support intensity-based colors", () => {
      const dataWithIntensity = [
        { slug: "chest", intensity: 2 },
      ];

      const { UNSAFE_getAllByProps } = render(
        <Body data={dataWithIntensity} colors={["#74b9ff", "#0984e3"]} />
      );
      const paths = UNSAFE_getAllByProps({ id: "chest" });
      paths.forEach(path => {
        expect(path.props.fill).toBe("#0984e3");
      });
    });

    it("should work with existing props without breaking", () => {
      const { toJSON } = render(
        <Body
          data={mockData}
          colors={["#74b9ff", "#0984e3"]}
          scale={1.5}
          side="front"
          gender="male"
          border="#dfdfdf"
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe("Mixed Usage", () => {
    it("should handle mixed styling approaches", () => {
      const mixedData = [
        {
          slug: "chest",
          styles: { fill: "#ff0000", stroke: "#000000" },
        },
        { slug: "biceps", color: "#00ff00" },
        { slug: "deltoids", intensity: 2 },
      ];

      const { toJSON } = render(
        <Body
          data={mixedData}
          colors={["#74b9ff", "#0984e3"]}
          defaultFill="#3f3f3f"
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});
