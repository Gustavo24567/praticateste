import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function PieChartCustom({ data, width = 300, height = 300 }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = 0;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  const getCoordinates = (angle) => {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  };

  const slices = [];
  for (const item of data) {
    const angle = (item.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;
    const start = getCoordinates(startAngle);
    const end = getCoordinates(endAngle);
    const d = [
      `M ${centerX} ${centerY}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
    slices.push({ path: d, color: item.color });
    startAngle = endAngle;
  }

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={width} height={height}>
        {slices.map((slice, idx) => (
          <Path key={idx} d={slice.path} fill={slice.color} stroke="#fff" strokeWidth="2" />
        ))}
      </Svg>
    </View>
  );
}