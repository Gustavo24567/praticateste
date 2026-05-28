// components/PieChartCustom.jsx
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";

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
  data.forEach((item, index) => {
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

    slices.push({ path: d, color: item.color, name: item.name, value: item.value });
    startAngle = endAngle;
  });

  // Posição para legenda
  const legendX = width + 10;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
      <Svg width={width} height={height}>
        {slices.map((slice, idx) => (
          <Path key={idx} d={slice.path} fill={slice.color} stroke="#fff" strokeWidth="2" />
        ))}
      </Svg>
      <View style={{ marginLeft: 10 }}>
        {data.map((item, idx) => (
          <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
            <View style={{ width: 16, height: 16, backgroundColor: item.color, marginRight: 8 }} />
            <Text style={{ fontSize: 12 }}>{item.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}