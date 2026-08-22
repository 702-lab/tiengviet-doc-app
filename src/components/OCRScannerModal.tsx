import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { recognizeTextFromImage } from '../services/ocrService';
import { COLORS } from '../theme/colors';

interface OCRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyText: (extractedText: string) => void;
  isDark?: boolean;
}

export const OCRScannerModal: React.FC<OCRScannerModalProps> = ({
  visible,
  onClose,
  onApplyText,
  isDark = false
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);

  const handlePickImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền camera để chụp trang sách giáo khoa.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh.');
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
            base64: true
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
            base64: true
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        await processImage(asset.uri, asset.base64 || undefined);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', `Không thể mở ${useCamera ? 'camera' : 'thư viện'}: ${err?.message || err}`);
    }
  };

  const processImage = async (uri: string, base64?: string) => {
    setIsProcessing(true);
    try {
      const ocrRes = await recognizeTextFromImage(uri, base64);
      setExtractedText(ocrRes.text);
      setConfidence(ocrRes.confidence);
    } catch (err: any) {
      Alert.alert('Lỗi nhận diện', err?.message || 'Không thể nhận diện văn bản từ hình ảnh.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!extractedText.trim()) {
      Alert.alert('Chưa có nội dung', 'Vui lòng quét hoặc nhập văn bản trước khi áp dụng.');
      return;
    }
    onApplyText(extractedText.trim());
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setExtractedText('');
    setConfidence(null);
    setIsProcessing(false);
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          { 
            backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
            borderColor: isDark ? COLORS.borderDark : COLORS.border
          }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: isDark ? COLORS.textDark : COLORS.text }]}>
                📷 Quét Sách Giáo Khoa (AI OCR)
              </Text>
              <Text style={[styles.subtitle, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}>
                Chụp ảnh trang sách để nhận diện chữ tiếng Việt tự động
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleCloseModal} 
              // @ts-ignore
              onClick={handleCloseModal}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Camera / Picker Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                onPress={() => handlePickImage(true)}
                // @ts-ignore
                onClick={() => handlePickImage(true)}
                disabled={isProcessing}
              >
                <Text style={styles.actionBtnText}>📸 Chụp ảnh mới</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.secondary }]}
                onPress={() => handlePickImage(false)}
                // @ts-ignore
                onClick={() => handlePickImage(false)}
                disabled={isProcessing}
              >
                <Text style={styles.actionBtnText}>🖼️ Chọn từ thư viện</Text>
              </TouchableOpacity>
            </View>

            {/* Image Preview & Scanner Loading */}
            {selectedImage && (
              <View style={[
                styles.imagePreviewBox,
                { borderColor: isDark ? COLORS.borderDark : COLORS.border }
              ]}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} resizeMode="contain" />
                {isProcessing && (
                  <View style={styles.processingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.processingText}>Đang phân tích chữ tiếng Việt bằng AI...</Text>
                  </View>
                )}
              </View>
            )}

            {/* Extracted Text Preview and Edit Area */}
            {extractedText.length > 0 && !isProcessing && (
              <View style={styles.resultBox}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
                    📝 Văn bản đã nhận diện:
                  </Text>
                  {confidence !== null && (
                    <View style={styles.confidenceBadge}>
                      <Text style={styles.confidenceText}>
                        Độ chính xác: {Math.round(confidence * 100)}%
                      </Text>
                    </View>
                  )}
                </View>

                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? COLORS.bgDark : COLORS.bgSoft,
                      borderColor: isDark ? COLORS.borderDark : COLORS.border,
                      color: isDark ? COLORS.textDark : COLORS.text
                    }
                  ]}
                  value={extractedText}
                  onChangeText={setExtractedText}
                  multiline
                  numberOfLines={4}
                  placeholder="Văn bản nhận diện sẽ hiển thị ở đây..."
                  placeholderTextColor={isDark ? COLORS.mutedDark : COLORS.muted}
                />
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[
            styles.footer,
            { borderTopColor: isDark ? COLORS.borderDark : COLORS.border }
          ]}>
            <TouchableOpacity
              style={[styles.footerCancelBtn, { borderColor: isDark ? COLORS.borderDark : COLORS.border }]}
              onPress={handleCloseModal}
              // @ts-ignore
              onClick={handleCloseModal}
            >
              <Text style={[styles.footerCancelText, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}>
                Đóng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.footerApplyBtn,
                { 
                  backgroundColor: extractedText.trim() ? COLORS.primary : COLORS.muted,
                  opacity: extractedText.trim() ? 1 : 0.6
                }
              ]}
              onPress={handleConfirm}
              // @ts-ignore
              onClick={handleConfirm}
              disabled={!extractedText.trim() || isProcessing}
            >
              <Text style={styles.footerApplyText}>
                ĐƯA VÀO BÀI ĐỌC 🚀
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
      }
    })
  },
  modalContainer: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10
      },
      android: {
        elevation: 8
      }
    })
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14
  },
  title: {
    fontSize: 18,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500'
  },
  closeBtn: {
    padding: 6
  },
  closeBtnText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '700'
  },
  content: {
    paddingHorizontal: 20
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },
  imagePreviewBox: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginVertical: 10,
    position: 'relative',
    backgroundColor: '#000000'
  },
  imagePreview: {
    width: '100%',
    height: '100%'
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  resultBox: {
    marginVertical: 10
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  confidenceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  confidenceText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700'
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 90
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1.5,
    gap: 12
  },
  footerCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerCancelText: {
    fontSize: 14,
    fontWeight: '600'
  },
  footerApplyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerApplyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
