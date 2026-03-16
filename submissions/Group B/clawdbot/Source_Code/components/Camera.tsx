import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Feather } from '@expo/vector-icons';

export default function CameraModal({ visible, onClose, onCapture }: any) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View className="flex-1 items-center justify-center p-6 bg-white">
          <Feather name="camera-off" size={48} color="#D4D4D4" />
          <Text className="text-center text-lg font-bold mt-4 mb-2">Camera Access Required</Text>
          <Text className="text-center text-neutral-500 mb-8">
            We need permission to scan your study materials.
          </Text>
          <TouchableOpacity 
            onPress={requestPermission} 
            className="bg-neutral-900 px-10 py-4 rounded-2xl"
          >
            <Text className="text-white font-bold">Allow Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="mt-6">
            <Text className="text-neutral-400 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false, 
        });
        if (photo) {
          onCapture(photo.uri);
          onClose();
        }
      } catch (error) {
        console.error("Failed to take picture:", error);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View className="flex-1 bg-black">
        <CameraView 
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject} 
          facing={facing}
        >
          <View className="flex-1 justify-between p-8">
            
            {/* Top Bar */}
            <View className="flex-row justify-between items-center mt-8">
              <TouchableOpacity 
                onPress={onClose} 
                className="w-12 h-12 items-center justify-center rounded-full bg-black/40"
              >
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View className="flex-row justify-around items-center mb-10">
              <TouchableOpacity 
                onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
                className="w-12 h-12 items-center justify-center rounded-full bg-black/40"
              >
                <Feather name="rotate-ccw" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={takePicture}
                activeOpacity={0.7}
                className="w-20 h-20 bg-white rounded-full items-center justify-center border-[6px] border-white/30"
              >
                <View className="w-14 h-14 bg-white rounded-full border-2 border-neutral-900" />
              </TouchableOpacity>

              <View className="w-12" /> 
            </View>

          </View>
        </CameraView>
      </View>
    </Modal>
  );
}