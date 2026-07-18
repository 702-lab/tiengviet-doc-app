import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

// Bản đồ hướng dẫn khẩu hình miệng cho các nguyên âm và phụ âm chính
const MOUTH_GUIDE: { [key: string]: string } = {
  'a': 'Mở miệng rộng tự nhiên, lưỡi hạ thấp dưới đáy miệng.',
  'ă': 'Miệng mở rộng trung bình, cơ miệng căng hơn âm A.',
  'â': 'Miệng mở hé nhỏ, hơi đẩy ra ngắn dứt khoát.',
  'e': 'Mở miệng rộng sang hai bên, hai khóe môi kéo nhẹ ra.',
  'ê': 'Mở miệng vừa phải sang hai bên, lưỡi nâng lên cao hơn âm E.',
  'i': 'Khóe môi kéo căng sang hai bên như đang cười, lưỡi nâng cao.',
  'y': 'Khóe môi kéo căng sang hai bên như đang cười, lưỡi nâng cao.',
  'o': 'Môi tròn căng và thu nhỏ lại, lưỡi hơi lùi về phía sau.',
  'ô': 'Môi tròn thu nhỏ hơn âm O, miệng hơi nhô ra phía trước.',
  'ơ': 'Môi mở hờ tự nhiên không tròn, hơi đẩy ra đều đặn.',
  'u': 'Môi tròn và chum nhỏ hết cỡ nhô ra ngoài, lưỡi nâng cao.',
  'ư': 'Hai răng hơi khép lại, môi mở dẹt ngang, lưỡi để tự nhiên.',
  'b': 'Hai môi mím chặt lại tích hơi, sau đó bật nhẹ hơi ra ngoài.',
  'c': 'Gốc lưỡi chạm vào vòm họng trên rồi hạ nhanh xuống tạo âm.',
  'ch': 'Thân lưỡi ép chặt vào vòm miệng trên rồi bật nhẹ hơi ra.',
  'd': 'Đầu lưỡi chạm răng trên rồi rụt lại, tạo luồng hơi ma sát.',
  'đ': 'Đầu lưỡi chạm vào lợi răng trên rồi bật mạnh ra ngoài.',
  'g': 'Gốc lưỡi nâng lên chạm vòm mềm họng rồi bật hạ xuống.',
  'h': 'Mở miệng tự nhiên, thở hơi nhẹ từ sâu trong cổ họng ra.',
  'k': 'Gốc lưỡi chạm vào vòm họng trên rồi hạ nhanh xuống tạo âm.',
  'kh': 'Gốc lưỡi hơi nâng lên tạo khe hẹp ở họng, đẩy luồng hơi ma sát.',
  'l': 'Đầu lưỡi cong lên chạm nướu răng trên rồi hạ xuống để hơi thoát ra hai bên.',
  'm': 'Mím môi lại, hơi đi lên qua đường mũi (âm mũi).',
  'n': 'Đầu lưỡi chạm nướu răng trên, hơi đi lên qua đường mũi.',
  'ng': 'Gốc lưỡi chạm vòm họng dưới, hơi đi lên qua đường mũi.',
  'ngh': 'Gốc lưỡi chạm vòm họng dưới, hơi đi lên qua đường mũi.',
  'nh': 'Mặt lưỡi áp sát vòm miệng trên, hơi đi lên qua đường mũi.',
  'ph': 'Răng trên chạm nhẹ vào môi dưới, đẩy luồng hơi thoát ra.',
  'qu': 'Môi tròn nhô ra trước phát âm CỜ rồi mở nhanh ra.',
  'r': 'Đầu lưỡi cong nhẹ chạm vòm miệng cứng, đẩy hơi rung nhẹ.',
  's': 'Đầu lưỡi cong hướng lên vòm miệng, đẩy luồng hơi ma sát mạnh.',
  't': 'Đầu lưỡi chạm răng trên tích hơi rồi bật nhanh ra.',
  'th': 'Đầu lưỡi chạm răng trên rồi bật mạnh hơi ra (luồng hơi mạnh hơn T).',
  'tr': 'Đầu lưỡi cong chạm nướu răng trên rồi bật mạnh hơi ra.',
  'v': 'Răng trên chạm nhẹ vào môi dưới, rung dây thanh tạo âm gió.',
  'x': 'Đầu lưỡi chạm răng dưới, đẩy luồng hơi ma sát nhẹ qua khe răng.',
};

// Bản đồ hướng dẫn thủ ngữ ngón tay (Finger spelling) chuẩn VSL
const SIGN_GUIDE: { [key: string]: string } = {
  'a': 'Nắm tay lại, ngón cái ép sát dọc theo bên cạnh các ngón khác.',
  'ă': 'Giống chữ A, nhưng tay chuyển động vẽ một hình vòng cung đi lên.',
  'â': 'Giống chữ A, nhưng tay chuyển động hướng đi lên phía trên.',
  'b': 'Mở thẳng 4 ngón tay dựng đứng sát nhau, ngón cái gập vuông góc trong lòng bàn tay.',
  'c': 'Khum bàn tay lại tạo thành hình chữ C hướng về phía trước.',
  'd': 'Dựng thẳng đứng ngón trỏ, các ngón còn lại chụm đầu cong chạm ngón cái.',
  'đ': 'Dựng thẳng ngón trỏ và vẫy lắc nhẹ cổ tay sang hai bên.',
  'e': 'Gập các ngón tay lại nửa chừng tạo độ khum nhẹ như móng vuốt hướng xuống.',
  'ê': 'Giống chữ E nhưng tay chuyển động vẽ một vòng cung đi lên.',
  'g': 'Ngón trỏ và ngón cái duỗi thẳng song song cách nhau 2cm hướng sang bên.',
  'h': 'Giơ ngón trỏ và ngón giữa duỗi thẳng song song nằm ngang hướng ra ngoài.',
  'i': 'Giơ ngón út thẳng đứng lên, các ngón khác nắm lại ép sát ngón cái.',
  'y': 'Giơ ngón út thẳng đứng lên, các ngón khác nắm lại ép sát ngón cái.',
  'k': 'Ngón trỏ duỗi đứng, ngón giữa duỗi nghiêng 45 độ, ngón cái chạm gốc ngón giữa.',
  'l': 'Giơ ngón trỏ và ngón cái duỗi thẳng tạo thành góc vuông hình chữ L.',
  'm': 'Nắm tay lại, giắt 3 ngón (trỏ, giữa, áp út) chọc xuống đè lên ngón cái.',
  'n': 'Nắm tay lại, giắt 2 ngón (trỏ, giữa) chọc xuống đè lên ngón cái.',
  'o': 'Khép các ngón tay và ngón cái chạm đầu nhau tạo thành vòng tròn chữ O.',
  'ô': 'Giống chữ O nhưng chuyển động tay đi lên tạo dấu mũ.',
  'ơ': 'Giống chữ O nhưng ngón cái hơi dịch ra tạo móc nhỏ.',
  'p': 'Ngón trỏ duỗi ngang, ngón giữa chỉ xuống đất, ngón cái chạm giữa ngón trỏ.',
  'q': 'Ngón trỏ và ngón cái khum nhẹ hướng xuống đất như hình móc câu.',
  'r': 'Bắt chéo ngón giữa đè lên ngón trỏ đứng thẳng, các ngón khác nắm lại.',
  's': 'Ngón trỏ gập nhẹ đè lên ngón cái đang chĩa ngang tạo hình chữ S.',
  't': 'Ngón trỏ dựng thẳng, ngón cái gập chạm vào đốt giữa ngón trỏ.',
  'u': 'Giơ ngón trỏ và ngón giữa đứng thẳng sát nhau, các ngón khác nắm lại.',
  'ư': 'Giống chữ U nhưng lắc nhẹ cổ tay sang bên.',
  'v': 'Giơ ngón trỏ và ngón giữa tạo thành hình chữ V đứng.',
  'x': 'Nắm tay lại, riêng ngón trỏ gập cong như hình móc câu.',
};

export const SignLanguage: React.FC = () => {
  const { activeWordParsed, activeStepIndex, tokens, activeTokenId, mode } = useReader();

  const activeToken = tokens.find(t => t.id === activeTokenId);
  const steps = activeToken?.spellingResult?.steps;
  const currentStep = steps && activeStepIndex !== -1 && activeStepIndex < steps.length 
    ? steps[activeStepIndex] 
    : null;

  if (!activeWordParsed || !currentStep) {
    return null;
  }

  // Lấy ký tự đang được đánh vần hiện tại để tra cứu
  const activeChar = currentStep.text.toLowerCase();
  
  // Lấy hướng dẫn tương ứng
  const mouthInstruction = MOUTH_GUIDE[activeChar] || MOUTH_GUIDE[activeChar[0]] || 'Mở miệng phát âm tự nhiên theo âm thanh.';
  const signInstruction = SIGN_GUIDE[activeChar] || SIGN_GUIDE[activeChar[0]] || '';

  // Không hiển thị nếu là bước phát âm từ cuối cùng hoặc đọc trơn (trừ khi trẻ khiếm thính cần học cấu trúc)
  if (currentStep.type === 'final' || mode === 'read') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trợ Giúp Trực Quan (Thiện Nguyện & Đặc Biệt)</Text>
      
      <View style={styles.contentRow}>
        {/* Hộp khẩu hình miệng */}
        <View style={styles.guideCard}>
          <View style={styles.badgeContainer}>
            <Text style={[styles.badge, { backgroundColor: '#E2F0D9', color: '#385723' }]}>KHẨU HÌNH MIỆNG</Text>
          </View>
          <Text style={styles.activeLetter}>{currentStep.text.toUpperCase()}</Text>
          <Text style={styles.instructionText}>{mouthInstruction}</Text>
        </View>

        {/* Hộp thủ ngữ ký hiệu chữ cái */}
        {signInstruction ? (
          <View style={styles.guideCard}>
            <View style={styles.badgeContainer}>
              <Text style={[styles.badge, { backgroundColor: '#FCE4D6', color: '#C65911' }]}>KÝ HIỆU THỦ NGỮ VSL</Text>
            </View>
            <View style={styles.signHandMock}>
              {/* Mô tả biểu trưng thủ ngữ vẽ dạng đơn giản */}
              <Text style={styles.handSymbol}>🤟</Text>
            </View>
            <Text style={styles.instructionText}>{signInstruction}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginVertical: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.muted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  guideCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  badgeContainer: {
    marginBottom: 8,
  },
  badge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  activeLetter: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.primary,
    marginVertical: 6,
  },
  signHandMock: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  handSymbol: {
    fontSize: 38,
  },
  instructionText: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
});
