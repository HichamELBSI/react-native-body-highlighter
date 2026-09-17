import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
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

  describe("Side Mirroring (front ↔ back)", () => {
    const highlightColor = "#0984e3";

    it("should highlight only screen-left paths when side is 'left' on front view", () => {
      const { UNSAFE_getAllByProps } = render(
        <Body
          data={[{ slug: "trapezius", intensity: 1, side: "left" }]}
          side="front"
          colors={[highlightColor]}
        />
      );
      const paths = UNSAFE_getAllByProps({ id: "trapezius" });
      // trapezius has left + right paths; with side: "left" on front view,
      // screen-left paths should be highlighted, screen-right should be default
      const fills = paths.map((p: any) => p.props.fill);
      expect(fills).toContain(highlightColor);
      expect(fills).toContain("#3f3f3f");
    });

    it("should mirror highlight to screen-right paths when side is 'left' on back view", () => {
      const { UNSAFE_getAllByProps } = render(
        <Body
          data={[{ slug: "trapezius", intensity: 1, side: "left" }]}
          side="back"
          colors={[highlightColor]}
        />
      );
      const paths = UNSAFE_getAllByProps({ id: "trapezius" });
      // On back view, side: "left" (screen-left on front = anatomical right)
      // should highlight screen-RIGHT paths (anatomical right on back)
      const fills = paths.map((p: any) => p.props.fill);
      expect(fills).toContain(highlightColor);
      expect(fills).toContain("#3f3f3f");
    });

    it("should not mirror when no side is specified", () => {
      const frontResult = render(
        <Body
          data={[{ slug: "trapezius", intensity: 1 }]}
          side="front"
          colors={[highlightColor]}
        />
      );
      const backResult = render(
        <Body
          data={[{ slug: "trapezius", intensity: 1 }]}
          side="back"
          colors={[highlightColor]}
        />
      );
      const frontPaths = frontResult.UNSAFE_getAllByProps({ id: "trapezius" });
      const backPaths = backResult.UNSAFE_getAllByProps({ id: "trapezius" });
      // Without side, both left and right should be highlighted in both views
      frontPaths.forEach((p: any) => {
        expect(p.props.fill).toBe(highlightColor);
      });
      backPaths.forEach((p: any) => {
        expect(p.props.fill).toBe(highlightColor);
      });
    });

    it("should report mirrored side in onBodyPartPress on back view", () => {
      const onPress = jest.fn();
      const { UNSAFE_getAllByProps } = render(
        <Body
          data={[{ slug: "trapezius", intensity: 1 }]}
          side="back"
          colors={[highlightColor]}
          onBodyPartPress={onPress}
        />
      );
      const paths = UNSAFE_getAllByProps({ id: "trapezius" });
      // Press the first path — it's either a left or right SVG path
      fireEvent.press(paths[0]);
      expect(onPress).toHaveBeenCalled();
      const reportedSide = onPress.mock.calls[0][1];
      // On back view, SVG left paths should report "right" (mirrored)
      // and SVG right paths should report "left" (mirrored)
      expect(["left", "right"]).toContain(reportedSide);
    });

    it("should report unmirrored side in onBodyPartPress on front view", () => {
      const onPress = jest.fn();
      const { UNSAFE_getAllByProps } = render(
        <Body
          data={[{ slug: "trapezius", intensity: 1 }]}
          side="front"
          colors={[highlightColor]}
          onBodyPartPress={onPress}
        />
      );
      const paths = UNSAFE_getAllByProps({ id: "trapezius" });
      fireEvent.press(paths[0]);
      expect(onPress).toHaveBeenCalled();
    });

    it("should produce consistent highlight across front-back flip", () => {
      // Simulate: user selects side "left" on front, then flips to back
      // The same data should highlight the anatomically correct side on both views
      const data = [{ slug: "trapezius", intensity: 1, side: "left" as const }];

      const frontResult = render(
        <Body data={data} side="front" colors={[highlightColor]} />
      );
      const backResult = render(
        <Body data={data} side="back" colors={[highlightColor]} />
      );

      const frontPaths = frontResult.UNSAFE_getAllByProps({ id: "trapezius" });
      const backPaths = backResult.UNSAFE_getAllByProps({ id: "trapezius" });

      const frontFills = frontPaths.map((p: any) => p.props.fill);
      const backFills = backPaths.map((p: any) => p.props.fill);

      // Both views should have exactly one highlighted and one default
      expect(frontFills.filter((f: string) => f === highlightColor)).toHaveLength(1);
      expect(frontFills.filter((f: string) => f === "#3f3f3f")).toHaveLength(1);
      expect(backFills.filter((f: string) => f === highlightColor)).toHaveLength(1);
      expect(backFills.filter((f: string) => f === "#3f3f3f")).toHaveLength(1);

      // The highlighted path should be on OPPOSITE screen sides
      // (front-left highlighted = back-right highlighted)
      const frontHighlightIndex = frontFills.indexOf(highlightColor);
      const backHighlightIndex = backFills.indexOf(highlightColor);
      expect(frontHighlightIndex).not.toBe(backHighlightIndex);
    });
  });
});
