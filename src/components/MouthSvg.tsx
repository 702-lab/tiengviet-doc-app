import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Ellipse, Line } from 'react-native-svg';

interface MouthProps {
  type: 'wide-open' | 'semi-open' | 'flat-smile' | 'rounded' | 'closed' | 'default';
  isDark?: boolean;
}

export const MouthSvg: React.FC<MouthProps> = ({ type, isDark = false }) => {
  const lipColor = '#FF758F'; // Màu môi hồng hào thân thiện
  const mouthBg = isDark ? '#16161a' : '#2F3E46'; // Nền trong khoang miệng
  const teethColor = '#FFFFFF';
  const tongueColor = '#FFA6C9';

  const renderMouthShape = () => {
    switch (type) {
      case 'closed':
        // Mím môi (b, m, p)
        return (
          <Svg width={100} height={60} viewBox="0 0 100 60">
            {/* Môi trên và dưới khép chặt */}
            <Path
              d="M 10 30 Q 50 25 90 30 Q 50 35 10 30 Z"
              fill={lipColor}
              stroke={isDark ? '#4A5568' : '#E2E8F0'}
              strokeWidth={1.5}
            />
            {/* Đường rãnh giữa hai môi */}
            <Line x1="12" y1="30" x2="88" y2="30" stroke={isDark ? '#1A202C' : '#8D99AE'} strokeWidth={2} />
          </Svg>
        );

      case 'wide-open':
        // Mở rộng miệng (a, ă, â)
        return (
          <Svg width={100} height={80} viewBox="0 0 100 80">
            {/* Khoang miệng mở lớn */}
            <Path
              d="M 15 30 C 15 15, 85 15, 85 30 C 85 65, 15 65, 15 30 Z"
              fill={mouthBg}
            />
            {/* Lưỡi ở đáy họng */}
            <Path
              d="M 25 50 Q 50 40 75 50 Q 50 68 25 50 Z"
              fill={tongueColor}
            />
            {/* Hàm răng trên */}
            <Path
              d="M 22 25 Q 50 32 78 25 L 75 20 Q 50 26 25 20 Z"
              fill={teethColor}
            />
            {/* Viền môi ngoài bao quanh */}
            <Path
              d="M 10 30 C 10 10, 90 10, 90 30 C 90 70, 10 70, 10 30 Z M 15 30 C 15 65, 85 65, 85 30 C 85 15, 15 15, 15 30 Z"
              fill={lipColor}
            />
          </Svg>
        );

      case 'rounded':
        // Môi chu tròn nhỏ (u, ô)
        return (
          <Svg width={100} height={70} viewBox="0 0 100 70">
            {/* Khoang miệng tròn */}
            <Ellipse cx={50} cy={35} rx={16} ry={16} fill={mouthBg} />
            {/* Viền môi tròn nhô ra */}
            <Path
              d="M 50 12 C 37 12, 28 22, 28 35 C 28 48, 37 58, 50 58 C 63 58, 72 48, 72 35 C 72 22, 63 12, 50 12 Z M 50 51 C 41 51, 34 44, 34 35 C 34 26, 41 19, 50 19 C 59 19, 66 26, 66 35 C 66 44, 59 51, 50 51 Z"
              fill={lipColor}
            />
          </Svg>
        );

      case 'flat-smile':
        // Khóe môi dẹt cười (i, y, e, ê)
        return (
          <Svg width={100} height={60} viewBox="0 0 100 60">
            {/* Khoang miệng dẹt ngang */}
            <Path
              d="M 12 30 Q 50 18 88 30 Q 50 48 12 30 Z"
              fill={mouthBg}
            />
            {/* Răng trên & dưới chạm nhẹ nhau */}
            <Line x1="18" y1="29" x2="82" y2="29" stroke={teethColor} strokeWidth={4} />
            {/* Viền môi cười dẹt */}
            <Path
              d="M 8 30 Q 50 12 92 30 Q 50 54 8 30 Z M 12 30 Q 50 48 88 30 Q 50 18 12 30 Z"
              fill={lipColor}
            />
          </Svg>
        );

      case 'semi-open':
      default:
        // Mở hé vừa phải (o, ơ, o, v.v.)
        return (
          <Svg width={100} height={70} viewBox="0 0 100 70">
            {/* Khoang miệng oval */}
            <Path
              d="M 20 35 C 20 22, 80 22, 80 35 C 80 58, 20 58, 20 35 Z"
              fill={mouthBg}
            />
            {/* Hàm răng trên hé lộ */}
            <Path
              d="M 28 28 Q 50 34 72 28 L 70 25 Q 50 30 30 25 Z"
              fill={teethColor}
            />
            {/* Lưỡi phía dưới */}
            <Path
              d="M 35 48 Q 50 44 65 48 Q 50 56 35 48 Z"
              fill={tongueColor}
            />
            {/* Viền môi */}
            <Path
              d="M 15 35 C 15 16, 85 16, 85 35 C 85 64, 15 64, 15 35 Z M 20 35 C 20 58, 80 58, 80 35 C 80 22, 20 22, 20 35 Z"
              fill={lipColor}
            />
          </Svg>
        );
    }
  };

  return (
    <View style={styles.centerContainer}>
      {renderMouthShape()}
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
