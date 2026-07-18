import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PARTICLE_COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Red/Pink
  '#4D96FF', // Blue
  '#6BCB77', // Green
  '#FFB830', // Orange
  '#D96BFF', // Purple
];

interface Particle {
  id: number;
  color: string;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  rotate: Animated.Value;
  isStar: boolean;
}

export const Celebration: React.FC = () => {
  const particlesRef = useRef<Particle[]>([]);

  // Khởi tạo 25 hạt confetti/ngôi sao ngẫu nhiên
  if (particlesRef.current.length === 0) {
    particlesRef.current = Array.from({ length: 25 }).map((_, idx) => ({
      id: idx,
      color: PARTICLE_COLORS[idx % PARTICLE_COLORS.length],
      // Điểm khởi đầu ở giữa dưới màn hình (nơi phát ra)
      x: new Animated.Value(SCREEN_WIDTH / 2),
      y: new Animated.Value(SCREEN_HEIGHT * 0.7),
      scale: new Animated.Value(0),
      rotate: new Animated.Value(0),
      isStar: idx % 3 === 0, // 1/3 số hạt là ngôi sao, còn lại là mảnh giấy tròn
    }));
  }

  useEffect(() => {
    // Chạy đồng loạt hoạt ảnh của tất cả các hạt
    const animations = particlesRef.current.map((p) => {
      // Góc bắn hạt ngẫu nhiên (từ -45 độ đến -135 độ hướng lên trên)
      const angle = (Math.random() * 90 + 45) * (Math.PI / 180);
      const speed = Math.random() * 12 + 8; // Tốc độ di chuyển
      
      const targetX = SCREEN_WIDTH / 2 - Math.cos(angle) * (SCREEN_WIDTH * 0.6) * (Math.random() * 0.8 + 0.4);
      const targetY = SCREEN_HEIGHT * 0.7 - Math.sin(angle) * (SCREEN_HEIGHT * 0.7);

      return Animated.parallel([
        // Di chuyển trục X (drift ngang)
        Animated.timing(p.x, {
          toValue: targetX,
          duration: Math.random() * 800 + 1000,
          useNativeDriver: true,
        }),
        // Di chuyển trục Y (bay thẳng lên)
        Animated.timing(p.y, {
          toValue: targetY,
          duration: Math.random() * 800 + 1000,
          useNativeDriver: true,
        }),
        // Phóng to khi bay ra và thu nhỏ lại ở cuối hành trình
        Animated.sequence([
          Animated.timing(p.scale, {
            toValue: Math.random() * 1.5 + 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 0,
            duration: Math.random() * 400 + 800,
            useNativeDriver: true,
          }),
        ]),
        // Xoay tròn ngẫu nhiên
        Animated.timing(p.rotate, {
          toValue: Math.random() * 720 + 360,
          duration: Math.random() * 800 + 1000,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particlesRef.current.map((p) => {
        const spin = p.rotate.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                backgroundColor: p.isStar ? 'transparent' : p.color,
                borderRadius: p.isStar ? 0 : 6,
                width: p.isStar ? 0 : 12,
                height: p.isStar ? 0 : 12,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { scale: p.scale },
                  { rotate: spin },
                ],
              },
            ]}
          >
            {p.isStar && (
              <Animated.Text style={[styles.starText, { color: p.color }]}>
                ⭐
              </Animated.Text>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  starText: {
    fontSize: 22,
  },
});
