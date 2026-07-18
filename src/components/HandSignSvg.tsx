import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface HandSignProps {
  type: 'fist' | 'flat' | 'c-shape' | 'point' | 'pinky' | 'circle' | 'v-sign' | 'default';
  isDark?: boolean;
}

export const HandSignSvg: React.FC<HandSignProps> = ({ type, isDark = false }) => {
  const skinColor = '#FCD5CE'; // Màu da tay pastel mềm mại
  const strokeColor = isDark ? '#F4F5F6' : '#2F3E46'; // Màu viền tay
  const strokeWidth = 2.5;

  const renderHandShape = () => {
    switch (type) {
      case 'flat':
        // Xòe thẳng bàn tay (b)
        return (
          <Svg width={80} height={80} viewBox="0 0 80 80">
            {/* Cổ tay và lòng bàn tay */}
            <Path
              d="M 28 65 L 28 42 C 28 42, 28 20, 34 20 L 52 20 C 58 20, 58 42, 58 42 L 58 65 Z"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Các kẽ ngón tay khép đứng */}
            <Path d="M 40 20 L 40 45" stroke={strokeColor} strokeWidth={2} />
            <Path d="M 46 20 L 46 45" stroke={strokeColor} strokeWidth={2} />
            <Path d="M 52 22 L 52 45" stroke={strokeColor} strokeWidth={2} />
            {/* Ngón cái gập chéo vào lòng */}
            <Path
              d="M 28 45 Q 38 48 45 42 Q 38 38 28 42"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'c-shape':
        // Khum tay hình chữ C (c)
        return (
          <Svg width={80} height={80} viewBox="0 0 80 80">
            {/* Vẽ đường cong khum tạo chữ C */}
            <Path
              d="M 58 20 C 35 20, 22 30, 22 45 C 22 60, 35 70, 58 70 C 58 70, 62 60, 52 60 C 38 60, 34 52, 34 45 C 34 38, 38 30, 52 30 C 62 30, 58 20, 58 20 Z"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'point':
        // Dựng đứng ngón trỏ chỉ lên (d, đ)
        return (
          <Svg width={80} height={80} viewBox="0 0 80 80">
            {/* Nắm đấm base */}
            <Rect x={30} y={38} width={28} height={28} rx={6} fill={skinColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Ngón trỏ dựng thẳng đứng */}
            <Path
              d="M 33 42 L 33 16 C 33 12, 39 12, 39 16 L 39 42"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Các nếp ngón tay gập */}
            <Path d="M 42 45 Q 46 47 50 45" stroke={strokeColor} strokeWidth={1.5} />
            <Path d="M 42 51 Q 46 53 50 51" stroke={strokeColor} strokeWidth={1.5} />
            <Path d="M 42 57 Q 46 59 50 57" stroke={strokeColor} strokeWidth={1.5} />
            {/* Ngón cái khum chạm các ngón gập */}
            <Path
              d="M 30 52 Q 22 52 26 44 Q 30 40 33 45"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'pinky':
        // Giơ ngón út (i, y)
        return (
          <Svg width={80} height={80} viewBox="0 0 80 80">
            {/* Nắm tay base */}
            <Rect x={24} y={38} width={28} height={28} rx={6} fill={skinColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Ngón út dựng đứng */}
            <Path
              d="M 52 40 L 52 18 C 52 14, 57 14, 57 18 L 57 40"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Ngón cái vắt ngang */}
            <Path
              d="M 24 50 Q 38 48 40 45"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </Svg>
        );

      case 'circle':
        // Tạo khoanh tay tròn chữ O (o, ô, ơ)
        return (
          <Svg width={80} height={80} viewBox="0 0 80 80">
            {/* Vòng tròn ngón trỏ và ngón cái chạm nhau */}
            <Path
              d="M 32 60 C 20 50, 20 30, 35 20 C 50 10, 65 25, 62 42 C 58 60, 42 62, 32 60 Z"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 1.5}
            />
            {/* Lòng bàn tay lấp đầy */}
            <Circle cx={48} cy={42} r={14} fill={skinColor} />
            {/* Các ngón khum gập nhẹ */}
            <Path d="M 54 28 Q 62 25 58 35" stroke={strokeColor} strokeWidth={1.5} />
            <Path d="M 50 34 Q 58 32 54 41" stroke={strokeColor} strokeWidth={1.5} />
          </Svg>
        );

      case 'v-sign':
        // Biểu tượng V (v)
        return (
          <Svg width={80} height={80} viewBox="0 0 80 80">
            {/* Nắm đấm base */}
            <Rect x={28} y={38} width={28} height={28} rx={6} fill={skinColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Ngón trỏ chỉ hướng 11h */}
            <Path
              d="M 33 40 L 22 15 C 20 12, 26 9, 28 12 L 39 40"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Ngón giữa chỉ hướng 1h */}
            <Path
              d="M 45 40 L 56 15 C 58 12, 64 9, 66 12 L 51 40"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'fist':
        // Nắm đấm (a, s)
        return (
          <Svg width={80} height={80} viewBox="0 0 80 80">
            <Rect x={26} y={32} width={30} height={32} rx={8} fill={skinColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Ngón cái gập dọc ép sát bên cạnh */}
            <Path
              d="M 26 42 Q 18 42 20 54 Q 22 60 28 58"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Rãnh các ngón tay nắm */}
            <Path d="M 34 32 L 34 45" stroke={strokeColor} strokeWidth={1.5} />
            <Path d="M 42 32 L 42 45" stroke={strokeColor} strokeWidth={1.5} />
            <Path d="M 50 32 L 50 45" stroke={strokeColor} strokeWidth={1.5} />
          </Svg>
        );

      case 'default':
      default:
        // Cổ tay vẫy chào mặc định
        return (
          <Svg width={80} height={80} viewBox="0 0 80 80">
            <Path
              d="M 30 65 C 25 50, 15 35, 28 25 C 40 15, 45 32, 50 32 C 55 32, 60 15, 68 25 C 76 35, 66 50, 60 65 Z"
              fill={skinColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          </Svg>
        );
    }
  };

  return (
    <View style={styles.centerContainer}>
      {renderHandShape()}
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});
